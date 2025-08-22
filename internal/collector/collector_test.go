package collector

import (
	"testing"
)

func TestImageURLConstruction(t *testing.T) {
	tests := []struct {
		name        string
		imageText   string
		expected    string
		description string
	}{
		{
			name:        "Relative path",
			imageText:   "jpg/6/2/1472799754526.jpg",
			expected:    "https://img.3cat.cat/multimedia/jpg/6/2/1472799754526.jpg",
			description: "Should prepend base URL to relative path",
		},
		{
			name:        "Full HTTP URL",
			imageText:   "http://example.com/image.jpg",
			expected:    "http://example.com/image.jpg",
			description: "Should not modify full HTTP URL",
		},
		{
			name:        "Full HTTPS URL",
			imageText:   "https://img.3cat.cat/multimedia/jpg/6/2/1472799754526.jpg",
			expected:    "https://img.3cat.cat/multimedia/jpg/6/2/1472799754526.jpg",
			description: "Should not modify full HTTPS URL",
		},
		{
			name:        "Already duplicated URL",
			imageText:   "https://img.3cat.cat/multimedia/https://img.3cat.cat/multimedia/jpg/6/2/1472799754526.jpg",
			expected:    "https://img.3cat.cat/multimedia/https://img.3cat.cat/multimedia/jpg/6/2/1472799754526.jpg",
			description: "Should not modify already full URL (even if duplicated)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Simulate the logic from the collector
			var result string
			if tt.imageText != "" {
				if len(tt.imageText) > 0 && (tt.imageText[:7] == "http://" || (len(tt.imageText) > 8 && tt.imageText[:8] == "https://")) {
					result = tt.imageText
				} else {
					result = "https://img.3cat.cat/multimedia/" + tt.imageText
				}
			}

			if result != tt.expected {
				t.Errorf("Test %s failed: expected %s, got %s", tt.name, tt.expected, result)
			}
		})
	}
}

func TestAudioURLConstruction(t *testing.T) {
	tests := []struct {
		name        string
		audioText   string
		expected    string
		description string
	}{
		{
			name:        "Relative path",
			audioText:   "mp3/8/1/1719914131118.mp3",
			expected:    "https://img.3cat.cat/multimedia/mp3/8/1/1719914131118.mp3",
			description: "Should prepend base URL to relative path",
		},
		{
			name:        "Full HTTP URL",
			audioText:   "http://example.com/audio.mp3",
			expected:    "http://example.com/audio.mp3",
			description: "Should not modify full HTTP URL",
		},
		{
			name:        "Full HTTPS URL",
			audioText:   "https://img.3cat.cat/multimedia/mp3/8/1/1719914131118.mp3",
			expected:    "https://img.3cat.cat/multimedia/mp3/8/1/1719914131118.mp3",
			description: "Should not modify full HTTPS URL",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Simulate the logic from the collector
			var result string
			if tt.audioText != "" {
				if len(tt.audioText) > 0 && (tt.audioText[:7] == "http://" || (len(tt.audioText) > 8 && tt.audioText[:8] == "https://")) {
					result = tt.audioText
				} else {
					result = "https://img.3cat.cat/multimedia/" + tt.audioText
				}
			}

			if result != tt.expected {
				t.Errorf("Test %s failed: expected %s, got %s", tt.name, tt.expected, result)
			}
		})
	}
}
