package main

import (
	"flag"
	"log"
	"os"

	"github.com/p4u/enguardia-arxiu/internal/collector"
	"github.com/p4u/enguardia-arxiu/internal/constants"
	"github.com/p4u/enguardia-arxiu/internal/generator"
	"github.com/p4u/enguardia-arxiu/internal/storage"
)

func main() {
	action := flag.String("action", "scrape", "scrape, generate, or tags")
	dataDir := flag.String("dataDir", constants.DefaultDataDir, "data directory")
	outputDir := flag.String("output", "data", "output directory for webapp JSON files")
	lazy := flag.Bool("lazy", false, "lazy mode: don't download MP3 files, use remote links")
	maxPages := flag.Int("maxPages", 0, "maximum pages to scrape (0 = all pages)")
	flag.Parse()

	if err := os.MkdirAll(*dataDir, constants.DirPermissions); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	switch *action {
	case "scrape":
		scrapeEpisodes(*dataDir, *lazy, *maxPages)
	case "generate":
		generateWebappData(*dataDir, *outputDir, *lazy)
	case "tags":
		generateTags(*dataDir)
	default:
		log.Fatal("Invalid action. Use: scrape, generate, or tags")
	}
}

func scrapeEpisodes(dataDir string, lazy bool, maxPages int) {
	if lazy {
		log.Println("Starting scraping process in LAZY mode (no MP3 downloads)...")
	} else {
		log.Println("Starting scraping process...")
	}

	c := collector.NewCollector()
	episodes, err := c.ScrapeEpisodesWithLimit(maxPages)
	if err != nil {
		log.Fatalf("Failed to scrape episodes: %v", err)
	}

	log.Printf("Found %d episodes", len(episodes))

	storage := storage.NewStorage(dataDir)
	successCount := 0
	skipCount := 0
	errorCount := 0

	for i, episode := range episodes {
		log.Printf("[%d/%d] Processing: %s", i+1, len(episodes), episode.Title)

		// Save episode metadata (with existence check)
		if err := storage.SaveEpisode(episode); err != nil {
			log.Printf("Failed to save episode metadata %s: %v", episode.Title, err)
			errorCount++
			continue
		}

		// Download audio and images only if not in lazy mode
		if !lazy {
			audioSuccess := true
			imageSuccess := true

			// Download audio
			if err := storage.DownloadAudio(episode); err != nil {
				log.Printf("Failed to download audio for %s: %v", episode.Title, err)
				audioSuccess = false
			}

			// Download image if available
			if episode.Image != "" && episode.ImageFilename != "" {
				if err := storage.DownloadImage(episode); err != nil {
					log.Printf("Failed to download image for %s: %v", episode.Title, err)
					imageSuccess = false
				}
			}

			if audioSuccess && imageSuccess {
				successCount++
			} else {
				errorCount++
			}
		} else {
			log.Printf("Skipping audio and image downloads for %s (lazy mode)", episode.Title)
			skipCount++
		}
	}

	if lazy {
		log.Printf("Scraping completed in LAZY mode! Total: %d, Metadata saved: %d, Audio downloads skipped: %d, Errors: %d",
			len(episodes), len(episodes)-errorCount, skipCount, errorCount)
	} else {
		log.Printf("Scraping completed! Total: %d, Success: %d, Skipped: %d, Errors: %d",
			len(episodes), successCount, skipCount, errorCount)
	}
}

func generateWebappData(dataDir, outputDir string, lazy bool) {
	log.Println("Generating webapp data files...")

	gen := generator.NewGenerator(dataDir)
	if err := gen.GenerateWebappData(outputDir, lazy); err != nil {
		log.Fatalf("Failed to generate webapp data: %v", err)
	}

	log.Println("Webapp data generation completed successfully!")
}

func generateTags(dataDir string) {
	log.Println("Generating tags.json file...")

	tagSystem := generator.NewTagSystem(dataDir)
	outputPath := "tags.json"

	if err := tagSystem.GenerateTagsFile(outputPath); err != nil {
		log.Fatalf("Failed to generate tags file: %v", err)
	}

	log.Printf("Tags file generated successfully: %s", outputPath)
}
