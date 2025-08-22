package generator

import "time"

// WebappData represents the consolidated data structure for the webapp
type WebappData struct {
	Episodes []Episode `json:"episodes"`
	Stats    Stats     `json:"stats"`
	Config   Config    `json:"config"`
}

// Episode represents an episode with webapp-specific fields
type Episode struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Duration    string    `json:"duration"`
	Date        string    `json:"date"`
	ParsedDate  time.Time `json:"parsedDate"`
	Link        string    `json:"link"`
	AudioURL    string    `json:"audioUrl"`
	Image       string    `json:"image"`
	Filename    string    `json:"filename"`
	JSONFile    string    `json:"jsonFile"`
	FileSize    int64     `json:"fileSize,omitempty"`
	Available   bool      `json:"available"`
	Tags        []string  `json:"tags,omitempty"`
	Category    string    `json:"category,omitempty"`
}

// Stats represents statistics about the episode collection
type Stats struct {
	TotalEpisodes  int       `json:"totalEpisodes"`
	TotalDuration  string    `json:"totalDuration"`
	TotalSeconds   int       `json:"totalSeconds"`
	DateRange      DateRange `json:"dateRange"`
	Categories     []string  `json:"categories"`
	AudioFormats   []string  `json:"audioFormats"`
	TotalFileSize  int64     `json:"totalFileSize"`
	AvailableCount int       `json:"availableCount"`
	LastUpdated    time.Time `json:"lastUpdated"`
}

// DateRange represents the date range of episodes
type DateRange struct {
	Earliest string `json:"earliest"`
	Latest   string `json:"latest"`
}

// Config represents webapp configuration
type Config struct {
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	Language      string   `json:"language"`
	AudioBaseURL  string   `json:"audioBaseUrl"`
	SupportsModes []string `json:"supportsModes"`
	Version       string   `json:"version"`
	BuildTime     string   `json:"buildTime"`
	Theme         Theme    `json:"theme"`
}

// Theme represents UI theme configuration
type Theme struct {
	PrimaryColor   string `json:"primaryColor"`
	SecondaryColor string `json:"secondaryColor"`
	AccentColor    string `json:"accentColor"`
	BackgroundURL  string `json:"backgroundUrl,omitempty"`
}
