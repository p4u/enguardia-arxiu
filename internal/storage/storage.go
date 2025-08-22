package storage

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/p4u/enguardia-web/internal/collector"
	"github.com/p4u/enguardia-web/internal/constants"
)

type Storage struct {
	dataDir string
}

func NewStorage(dataDir string) *Storage {
	return &Storage{dataDir: dataDir}
}

func (s *Storage) SaveEpisode(episode collector.Episode) error {
	jsonPath := filepath.Join(s.dataDir, episode.JSONFile)

	// Check if JSON file already exists and has content
	if info, err := os.Stat(jsonPath); err == nil && info.Size() > 0 {
		log.Printf("Metadata already exists: %s", jsonPath)
		return nil
	}

	data, err := json.MarshalIndent(episode, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal episode: %w", err)
	}

	if err := os.WriteFile(jsonPath, data, constants.FilePermissions); err != nil {
		return fmt.Errorf("failed to write JSON file: %w", err)
	}

	log.Printf("Metadata saved: %s", jsonPath)
	return nil
}

func (s *Storage) DownloadAudio(episode collector.Episode) error {
	if episode.AudioURL == "" {
		return fmt.Errorf("no audio URL available for episode: %s", episode.Title)
	}

	// Skip if this is a failed audio URL
	if strings.Contains(episode.AudioURL, "failed-audio") {
		log.Printf("Skipping failed audio URL for episode: %s", episode.Title)
		return nil
	}

	audioPath := filepath.Join(s.dataDir, episode.Filename)

	// Check if file already exists and has reasonable content
	if info, err := os.Stat(audioPath); err == nil {
		if info.Size() > constants.MinAudioFileSize {
			log.Printf("Audio already exists (%d bytes): %s", info.Size(), audioPath)
			return nil
		} else {
			log.Printf("Audio file too small (%d bytes), re-downloading: %s", info.Size(), audioPath)
			// Remove the incomplete file
			if err := os.Remove(audioPath); err != nil {
				log.Printf("Failed to remove incomplete audio file: %v", err)
			}
		}
	}

	log.Printf("Downloading audio from %s to %s", episode.AudioURL, audioPath)

	// Create HTTP client with redirect handling and longer timeout
	client := &http.Client{
		Timeout: constants.DownloadTimeout,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			req.URL.Opaque = req.URL.Path
			return nil
		},
	}

	resp, err := client.Get(episode.AudioURL)
	if err != nil {
		return fmt.Errorf("failed to download audio: %w", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.Printf("Failed to close response body: %v", err)
		}
	}()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	// Create temporary file first to avoid partial downloads
	tempPath := audioPath + constants.TempSuffix
	file, err := os.Create(tempPath)
	if err != nil {
		return fmt.Errorf("failed to create temp file: %w", err)
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Printf("Failed to close temp file: %v", err)
		}
	}()

	// Copy the content
	size, err := io.Copy(file, resp.Body)
	if err != nil {
		if removeErr := os.Remove(tempPath); removeErr != nil {
			log.Printf("Failed to remove temp file after copy error: %v", removeErr)
		}
		return fmt.Errorf("failed to copy content: %w", err)
	}

	// Close the file before renaming
	if err := file.Close(); err != nil {
		log.Printf("Failed to close file before rename: %v", err)
	}

	// Check if download was successful (reasonable file size)
	if size < constants.MinDownloadSize {
		if removeErr := os.Remove(tempPath); removeErr != nil {
			log.Printf("Failed to remove small temp file: %v", removeErr)
		}
		return fmt.Errorf("downloaded file too small (%d bytes), probably an error", size)
	}

	// Rename temp file to final name
	if err := os.Rename(tempPath, audioPath); err != nil {
		if removeErr := os.Remove(tempPath); removeErr != nil {
			log.Printf("Failed to remove temp file after rename error: %v", removeErr)
		}
		return fmt.Errorf("failed to rename temp file: %w", err)
	}

	log.Printf("Download successful: %s (%d bytes)", audioPath, size)
	return nil
}

func (s *Storage) DownloadImage(episode collector.Episode) error {
	if episode.Image == "" || episode.ImageFilename == "" {
		log.Printf("No image URL or filename for episode: %s", episode.Title)
		return nil
	}

	// Skip if this is a failed image URL
	if strings.Contains(episode.Image, "failed-image") {
		log.Printf("Skipping failed image URL for episode: %s", episode.Title)
		return nil
	}

	imagePath := filepath.Join(s.dataDir, episode.ImageFilename)

	// Check if file already exists and has reasonable content
	if info, err := os.Stat(imagePath); err == nil {
		if info.Size() > constants.MinImageFileSize {
			log.Printf("Image already exists (%d bytes): %s", info.Size(), imagePath)
			return nil
		} else {
			log.Printf("Image file too small (%d bytes), re-downloading: %s", info.Size(), imagePath)
			// Remove the incomplete file
			if err := os.Remove(imagePath); err != nil {
				log.Printf("Failed to remove incomplete image file: %v", err)
			}
		}
	}

	log.Printf("Downloading image from %s to %s", episode.Image, imagePath)

	// Create HTTP client with redirect handling and timeout
	client := &http.Client{
		Timeout: constants.HTTPTimeout,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			req.URL.Opaque = req.URL.Path
			return nil
		},
	}

	resp, err := client.Get(episode.Image)
	if err != nil {
		return fmt.Errorf("failed to download image: %w", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.Printf("Failed to close response body: %v", err)
		}
	}()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	// Create temporary file first to avoid partial downloads
	tempPath := imagePath + constants.TempSuffix
	file, err := os.Create(tempPath)
	if err != nil {
		return fmt.Errorf("failed to create temp file: %w", err)
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Printf("Failed to close temp file: %v", err)
		}
	}()

	// Copy the content
	size, err := io.Copy(file, resp.Body)
	if err != nil {
		if removeErr := os.Remove(tempPath); removeErr != nil {
			log.Printf("Failed to remove temp file after copy error: %v", removeErr)
		}
		return fmt.Errorf("failed to copy content: %w", err)
	}

	// Close the file before renaming
	if err := file.Close(); err != nil {
		log.Printf("Failed to close file before rename: %v", err)
	}

	// Check if download was successful (reasonable file size)
	if size < constants.MinImageFileSize {
		if removeErr := os.Remove(tempPath); removeErr != nil {
			log.Printf("Failed to remove small temp file: %v", removeErr)
		}
		return fmt.Errorf("downloaded image file too small (%d bytes), probably an error", size)
	}

	// Rename temp file to final name
	if err := os.Rename(tempPath, imagePath); err != nil {
		if removeErr := os.Remove(tempPath); removeErr != nil {
			log.Printf("Failed to remove temp file after rename error: %v", removeErr)
		}
		return fmt.Errorf("failed to rename temp file: %w", err)
	}

	log.Printf("Image download successful: %s (%d bytes)", imagePath, size)
	return nil
}

func (s *Storage) LoadEpisodes() ([]collector.Episode, error) {
	var episodes []collector.Episode

	err := filepath.Walk(s.dataDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() || !strings.HasSuffix(path, constants.JSONExtension) {
			return nil
		}

		data, err := os.ReadFile(path)
		if err != nil {
			log.Printf("Failed to read %s: %v", path, err)
			return nil
		}

		var episode collector.Episode
		if err := json.Unmarshal(data, &episode); err != nil {
			log.Printf("Failed to unmarshal %s: %v", path, err)
			return nil
		}

		episodes = append(episodes, episode)
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to walk directory: %w", err)
	}

	// Sort episodes by chapter number
	sort.Slice(episodes, func(i, j int) bool {
		numI, errI := s.getEpisodeNumber(episodes[i])
		numJ, errJ := s.getEpisodeNumber(episodes[j])
		if errI != nil {
			return false
		}
		if errJ != nil {
			return true
		}
		return numI < numJ
	})

	return episodes, nil
}

func (s *Storage) getEpisodeNumber(episode collector.Episode) (int, error) {
	// Try to extract number from title
	var num int
	_, err := fmt.Sscanf(episode.Title, "%d", &num)
	if num > 0 && err == nil {
		return num, nil
	}

	// Try to extract from description
	re := regexp.MustCompile(constants.ChapterPattern)
	matches := re.FindStringSubmatch(episode.Description)
	if len(matches) >= 2 {
		num, err = strconv.Atoi(matches[1])
		if err == nil {
			return num, nil
		}
	}

	// Try to extract any number from title
	re = regexp.MustCompile(constants.EpisodeNumPattern)
	matches = re.FindStringSubmatch(episode.Title)
	if len(matches) >= 2 {
		num, err = strconv.Atoi(matches[1])
		if err == nil {
			return num, nil
		}
	}

	return 0, fmt.Errorf("cannot extract episode number")
}
