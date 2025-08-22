package constants

import "time"

// API URLs and endpoints
const (
	// Base URLs
	BaseURL          = "https://www.3cat.cat"
	CCMAAPIBaseURL   = "https://api.3cat.cat"
	CCMAMediaBaseURL = "https://img.3cat.cat/multimedia"
	FallbackAudioURL = "https://example.com/failed-audio"

	// API endpoints and parameters
	AudiosAPIEndpoint = "/audios"
	ProgramRadioID    = "944" // En Guàrdia program ID
	AudioType         = "CRTAPROG"
	APIVersion        = "2.0"
	CacheSeconds      = "180"

	// Episode URL patterns
	EpisodeURLPattern = "/3cat/en-guardia/audio"
)

// File extensions and formats
const (
	MP3Extension  = ".mp3"
	JSONExtension = ".json"
	JPGExtension  = ".jpg"
	PNGExtension  = ".png"
	TempSuffix    = ".tmp"
)

// File size limits and thresholds
const (
	MinAudioFileSize = 1024 * 1024 // 1MB minimum for valid audio files
	MinImageFileSize = 1024 * 5    // 5KB minimum for valid image files
	MinDownloadSize  = 1024 * 100  // 100KB minimum for successful downloads
	MaxFilenameLen   = 120         // Maximum filename length
)

// HTTP timeouts and limits
const (
	HTTPTimeout     = 30 * time.Second  // Standard HTTP timeout
	DownloadTimeout = 300 * time.Second // 5 minutes for large audio files
	APIRequestDelay = 1 * time.Second   // Delay between API requests
)

// File permissions
const (
	FilePermissions = 0644 // Standard file permissions
	DirPermissions  = 0755 // Standard directory permissions
)

// Default configuration values
const (
	DefaultDataDir = "capitols"
	DefaultPort    = "8080"
)

// HTML entities for cleaning
var HTMLEntities = map[string]string{
	"&amp;":  "&",
	"&lt;":   "<",
	"&gt;":   ">",
	"&quot;": "\"",
	"&#x27;": "'",
	"&apos;": "'",
}

// Text patterns for cleaning
const (
	HTMLTagPattern    = `<[^>]*>`
	WhitespacePattern = `\s+`
	FilenamePattern   = `[\s\-_]+`
	DurationPattern   = `\s*Durada:\s*\d+\s*min.*$`
	EpisodeNumPattern = `(\d+)`
	ChapterPattern    = `Capítol (\d+)`
)

// Text suffixes to remove
var TextSuffixes = []string{
	"… Més",
	"...Més",
}

// Problematic filename characters to replace
var ProblematicChars = []string{
	"/", "\\", ":", "*", "?", "\"", "<", ">", "|",
}

// API response status
const (
	APIStatusOK = "OK"
)

// Default filename prefix
const (
	DefaultFilenamePrefix = "episode-"
)

// Magic strings and keywords
const (
	FailedAudioKeyword = "failed-audio"
	JSONIndent         = "  "
	HyphenSeparator    = "-"
	EmptyString        = ""
)
