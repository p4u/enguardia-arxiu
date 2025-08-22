package collector

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode"

	"github.com/p4u/enguardia-arxiu/internal/constants"
)

type Episode struct {
	Title         string `json:"title"`
	Description   string `json:"description"`
	Duration      string `json:"duration"`
	Date          string `json:"date"`
	Link          string `json:"link"`
	AudioURL      string `json:"audio_url"`
	Image         string `json:"image"`
	Filename      string `json:"filename"`
	ImageFilename string `json:"image_filename,omitempty"`
	JSONFile      string `json:"-"`
}

type Collector struct {
	client *http.Client
}

func NewCollector() *Collector {
	return &Collector{
		client: &http.Client{
			Timeout: constants.HTTPTimeout,
		},
	}
}

func (c *Collector) ScrapeEpisodes() ([]Episode, error) {
	return c.ScrapeEpisodesWithLimit(0)
}

func (c *Collector) ScrapeEpisodesWithLimit(maxPages int) ([]Episode, error) {
	if maxPages > 0 {
		log.Printf("Starting API-based scraping for En Guàrdia episodes (max %d pages)", maxPages)
	} else {
		log.Println("Starting API-based scraping for all En Guàrdia episodes")
	}

	var allEpisodes []Episode
	pageNum := 1

	for {
		// Construct API URL with correct parameters for En Guàrdia program
		apiURL := fmt.Sprintf("%s%s?_format=json&ordre=-data_publicacio&origen=llistat&programaradio_id=%s&tipus_audio=%s&pagina=%d&sdom=img&version=%s&cache=%s&https=true&master=yes",
			constants.CCMAAPIBaseURL, constants.AudiosAPIEndpoint, constants.ProgramRadioID, constants.AudioType, pageNum, constants.APIVersion, constants.CacheSeconds)

		log.Printf("Fetching page %d from API: %s", pageNum, apiURL)

		// Make request to API
		resp, err := c.client.Get(apiURL)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch API data for page %d: %w", pageNum, err)
		}

		if resp.StatusCode != http.StatusOK {
			if err := resp.Body.Close(); err != nil {
				log.Printf("Failed to close response body: %v", err)
			}
			return nil, fmt.Errorf("API returned status %d for page %d", resp.StatusCode, pageNum)
		}

		// Parse JSON response
		var listResp CCMAListResponse
		if err := json.NewDecoder(resp.Body).Decode(&listResp); err != nil {
			if closeErr := resp.Body.Close(); closeErr != nil {
				log.Printf("Failed to close response body: %v", closeErr)
			}
			return nil, fmt.Errorf("failed to parse API response for page %d: %w", pageNum, err)
		}
		if err := resp.Body.Close(); err != nil {
			log.Printf("Failed to close response body: %v", err)
		}

		// Check if response is valid
		if listResp.Resposta.Status != constants.APIStatusOK {
			return nil, fmt.Errorf("API returned status: %s for page %d", listResp.Resposta.Status, pageNum)
		}

		// Log pagination info on first page
		if pageNum == 1 {
			log.Printf("API pagination info - Current page: %d, Total pages: %d, Total items: %d",
				listResp.Resposta.Paginacio.PaginaActual,
				listResp.Resposta.Paginacio.TotalPagines,
				listResp.Resposta.Paginacio.TotalItems)
		}

		// Process episodes from this page
		pageEpisodes := 0
		for _, item := range listResp.Resposta.Items.Item {
			// Create episode from API data
			episode := Episode{
				Title:       c.cleanTitle(item.Titol),
				Description: c.cleanDescription(item.Entradeta),
				Duration:    item.Durada,
				Date:        item.DataPublicacio,
				Link:        fmt.Sprintf("%s%s/%d/", constants.BaseURL, constants.EpisodeURLPattern, item.ID),
			}

			// Create safe filename
			episode.Filename = c.createSafeFilename(episode.Title) + constants.MP3Extension
			episode.JSONFile = c.createSafeFilename(episode.Title) + constants.JSONExtension

			// Extract image URL if available
			if len(item.Imatges) > 0 && item.Imatges[0].Text != "" {
				imageText := item.Imatges[0].Text
				// Check if the image text is already a full URL
				if strings.HasPrefix(imageText, "http://") || strings.HasPrefix(imageText, "https://") {
					episode.Image = imageText
				} else if strings.HasPrefix(imageText, "/") {
					// It's an absolute path, prepend only the domain
					episode.Image = fmt.Sprintf("https://img.3cat.cat%s", imageText)
				} else {
					// It's a relative path, prepend the full base URL
					episode.Image = fmt.Sprintf("%s/%s", constants.CCMAMediaBaseURL, imageText)
				}

				// Generate image filename based on the image URL extension
				imageExt := constants.JPGExtension // default to jpg
				if strings.Contains(strings.ToLower(episode.Image), ".png") {
					imageExt = constants.PNGExtension
				}
				episode.ImageFilename = c.createSafeFilename(episode.Title) + imageExt
			}

			// Extract audio URL if available in the API response
			if len(item.Audios) > 0 && item.Audios[0].Text != "" {
				audioText := item.Audios[0].Text
				// Check if the audio text is already a full URL
				if strings.HasPrefix(audioText, "http://") || strings.HasPrefix(audioText, "https://") {
					episode.AudioURL = audioText
				} else {
					// It's a relative path, prepend the base URL
					episode.AudioURL = fmt.Sprintf("%s/%s", constants.CCMAMediaBaseURL, audioText)
				}
			} else {
				// Fallback: try to extract audio URL using the individual episode API
				audioURL, err := c.extractAudioURL(fmt.Sprintf("%d", item.ID))
				if err != nil {
					log.Printf("Failed to extract audio URL for episode %s (%d): %v", episode.Title, item.ID, err)
					episode.AudioURL = fmt.Sprintf("%s-%d%s", constants.FallbackAudioURL, item.ID, constants.MP3Extension)
				} else {
					episode.AudioURL = audioURL
				}
			}

			allEpisodes = append(allEpisodes, episode)
			pageEpisodes++
		}

		log.Printf("Page %d: processed %d episodes (total so far: %d)", pageNum, pageEpisodes, len(allEpisodes))

		// Check if we've reached the last page
		if pageNum >= listResp.Resposta.Paginacio.TotalPagines {
			log.Printf("Reached last page (%d), stopping", listResp.Resposta.Paginacio.TotalPagines)
			break
		}

		// Check if we've reached the maximum pages limit
		if maxPages > 0 && pageNum >= maxPages {
			log.Printf("Reached maximum pages limit (%d), stopping", maxPages)
			break
		}

		// Check if this page had no episodes (safety check)
		if pageEpisodes == 0 {
			log.Printf("Page %d had no episodes, stopping", pageNum)
			break
		}

		// Move to next page
		pageNum++

		// Add delay between API requests to be respectful
		time.Sleep(constants.APIRequestDelay)
	}

	log.Printf("API-based scraping completed: found %d total episodes across %d pages", len(allEpisodes), pageNum)
	return allEpisodes, nil
}

// cleanTitle removes HTML tags and cleans up the title text
func (c *Collector) cleanTitle(title string) string {
	// Remove HTML tags using regex
	htmlTagRegex := regexp.MustCompile(constants.HTMLTagPattern)
	cleaned := htmlTagRegex.ReplaceAllString(title, "")

	// Decode HTML entities
	for entity, replacement := range constants.HTMLEntities {
		cleaned = strings.ReplaceAll(cleaned, entity, replacement)
	}

	// Remove extra whitespace and normalize
	cleaned = regexp.MustCompile(constants.WhitespacePattern).ReplaceAllString(cleaned, " ")
	cleaned = strings.TrimSpace(cleaned)

	// Remove duration info if present
	durationRegex := regexp.MustCompile(constants.DurationPattern)
	cleaned = durationRegex.ReplaceAllString(cleaned, "")

	return cleaned
}

// cleanDescription removes HTML tags and cleans up description text
func (c *Collector) cleanDescription(description string) string {
	// Remove HTML tags using regex
	htmlTagRegex := regexp.MustCompile(constants.HTMLTagPattern)
	cleaned := htmlTagRegex.ReplaceAllString(description, "")

	// Decode HTML entities
	for entity, replacement := range constants.HTMLEntities {
		cleaned = strings.ReplaceAll(cleaned, entity, replacement)
	}

	// Remove extra whitespace and normalize
	cleaned = regexp.MustCompile(constants.WhitespacePattern).ReplaceAllString(cleaned, " ")
	cleaned = strings.TrimSpace(cleaned)

	// Remove trailing suffixes if present
	for _, suffix := range constants.TextSuffixes {
		cleaned = strings.TrimSuffix(cleaned, suffix)
	}
	cleaned = strings.TrimSpace(cleaned)

	return cleaned
}

// createSafeFilename creates a safe filename with proper length limits and character filtering
func (c *Collector) createSafeFilename(title string) string {
	// Start with the title
	filename := title

	// Convert to lowercase
	filename = strings.ToLower(filename)

	// Replace problematic characters
	for _, char := range constants.ProblematicChars {
		filename = strings.ReplaceAll(filename, char, "-")
	}

	// Keep only safe characters: letters, numbers, spaces, hyphens, underscores
	var result strings.Builder
	for _, r := range filename {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == ' ' || r == '-' || r == '_' || r == '.' {
			result.WriteRune(r)
		} else {
			result.WriteRune('-')
		}
	}
	filename = result.String()

	// Replace multiple spaces/hyphens with single hyphen
	filename = regexp.MustCompile(constants.FilenamePattern).ReplaceAllString(filename, "-")

	// Trim hyphens from start and end
	filename = strings.Trim(filename, "-")

	// Limit length to prevent "file name too long" errors
	if len(filename) > constants.MaxFilenameLen {
		// Try to cut at word boundary
		words := strings.Split(filename, "-")
		var truncated strings.Builder
		currentLength := 0

		for _, word := range words {
			if currentLength+len(word)+1 > constants.MaxFilenameLen {
				break
			}
			if truncated.Len() > 0 {
				truncated.WriteString("-")
				currentLength++
			}
			truncated.WriteString(word)
			currentLength += len(word)
		}

		filename = truncated.String()

		// If still too long, just truncate
		if len(filename) > constants.MaxFilenameLen {
			filename = filename[:constants.MaxFilenameLen]
		}
	}

	// Ensure we have a valid filename
	if filename == "" || filename == "-" {
		filename = "episode-" + fmt.Sprintf("%d", time.Now().Unix())
	}

	return filename
}

// CCMAAudioResponse represents the actual response from CCMA API for single episode
type CCMAAudioResponse struct {
	Resposta struct {
		Status string `json:"status"`
		Item   struct {
			Durada    string `json:"durada"`
			Entradeta string `json:"entradeta"`
			Titol     string `json:"titol"`
			Audios    []struct {
				Text   string `json:"text"`
				Format string `json:"format"`
				Durada string `json:"durada"`
			} `json:"audios"`
			DataPublicacio string `json:"data_publicacio"`
		} `json:"item"`
	} `json:"resposta"`
}

// CCMAListResponse represents the response from CCMA API for episode listing
type CCMAListResponse struct {
	Resposta struct {
		Status string `json:"status"`
		Items  struct {
			Num  int `json:"num"`
			Item []struct {
				ID             int    `json:"id"`
				Titol          string `json:"titol"`
				Entradeta      string `json:"entradeta"`
				DataPublicacio string `json:"data_publicacio"`
				Durada         string `json:"durada"`
				Imatges        []struct {
					Text string `json:"text"`
					Mida string `json:"mida"`
					Alt  string `json:"alt"`
				} `json:"imatges"`
				Audios []struct {
					Text   string `json:"text"`
					Format string `json:"format"`
					Durada string `json:"durada"`
				} `json:"audios"`
			} `json:"item"`
		} `json:"items"`
		Paginacio struct {
			TotalItems   int `json:"total_items"`
			ItemsPagina  int `json:"items_pagina"`
			PaginaActual int `json:"pagina_actual"`
			TotalPagines int `json:"total_pagines"`
		} `json:"paginacio"`
	} `json:"resposta"`
}

// extractAudioURL fetches the real audio URL from CCMA API
func (c *Collector) extractAudioURL(episodeID string) (string, error) {
	// Construct CCMA API URL
	apiURL := fmt.Sprintf("%s%s?_format=json&id=%s&origen=item&pagina=1&sdom=img&version=%s&cache=%s&https=true&master=yes",
		constants.CCMAAPIBaseURL, constants.AudiosAPIEndpoint, episodeID, constants.APIVersion, constants.CacheSeconds)

	// Make request to CCMA API
	resp, err := c.client.Get(apiURL)
	if err != nil {
		return "", fmt.Errorf("failed to fetch API data: %w", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.Printf("Failed to close response body: %v", err)
		}
	}()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	// Parse JSON response
	var audioResp CCMAAudioResponse
	if err := json.NewDecoder(resp.Body).Decode(&audioResp); err != nil {
		return "", fmt.Errorf("failed to parse API response: %w", err)
	}

	// Check if response is valid
	if audioResp.Resposta.Status != constants.APIStatusOK {
		return "", fmt.Errorf("API returned status: %s", audioResp.Resposta.Status)
	}

	// Extract audio file URL from the audios array
	if len(audioResp.Resposta.Item.Audios) == 0 {
		return "", fmt.Errorf("no audio files found in API response")
	}

	// Get the first audio file (usually MP3)
	audioFile := audioResp.Resposta.Item.Audios[0]
	if audioFile.Text == "" {
		return "", fmt.Errorf("audio file path is empty")
	}

	// Construct full URL - the API returns relative path like "mp3/8/1/1719914131118.mp3"
	fullAudioURL := fmt.Sprintf("%s/%s", constants.CCMAMediaBaseURL, audioFile.Text)

	log.Printf("Successfully extracted audio URL for episode %s: %s", episodeID, fullAudioURL)
	return fullAudioURL, nil
}
