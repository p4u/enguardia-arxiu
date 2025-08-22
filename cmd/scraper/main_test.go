package main

import (
	"flag"
	"testing"
)

func TestFlagDefaults(t *testing.T) {
	// Create a new flag set for isolated testing
	fs := flag.NewFlagSet("test", flag.ContinueOnError)

	// Define flags with same defaults as main
	action := fs.String("action", "scrape", "scrape, generate, or serve")
	dataDir := fs.String("dataDir", "capitols", "data directory")
	outputDir := fs.String("output", "data", "output directory for webapp JSON files")
	lazy := fs.Bool("lazy", false, "lazy mode: don't download MP3 files, use remote links")
	maxPages := fs.Int("maxPages", 0, "maximum pages to scrape (0 = all pages)")
	port := fs.String("port", "8080", "port for HTTP server (serve action)")
	staticDir := fs.String("staticDir", "webapp/dist", "directory containing static files to serve")

	// Parse empty args (should use defaults)
	err := fs.Parse([]string{})
	if err != nil {
		t.Fatalf("Failed to parse flags: %v", err)
	}

	// Test default values
	if *lazy != false {
		t.Errorf("Expected lazy flag default to be false, got %v", *lazy)
	}

	if *action != "scrape" {
		t.Errorf("Expected action default to be 'scrape', got %v", *action)
	}

	if *dataDir != "capitols" {
		t.Errorf("Expected dataDir default to be 'capitols', got %v", *dataDir)
	}

	if *outputDir != "data" {
		t.Errorf("Expected outputDir default to be 'data', got %v", *outputDir)
	}

	if *maxPages != 0 {
		t.Errorf("Expected maxPages default to be 0, got %v", *maxPages)
	}

	if *port != "8080" {
		t.Errorf("Expected port default to be '8080', got %v", *port)
	}

	if *staticDir != "webapp/dist" {
		t.Errorf("Expected staticDir default to be 'webapp/dist', got %v", *staticDir)
	}
}

func TestLazyFlagEnabled(t *testing.T) {
	// Create a new flag set for isolated testing
	fs := flag.NewFlagSet("test", flag.ContinueOnError)

	// Set up flags
	lazy := fs.Bool("lazy", false, "lazy mode: don't download MP3 files, use remote links")

	// Parse args with lazy flag
	err := fs.Parse([]string{"-lazy"})
	if err != nil {
		t.Fatalf("Failed to parse flags: %v", err)
	}

	if *lazy != true {
		t.Errorf("Expected lazy flag to be true when -lazy is passed, got %v", *lazy)
	}
}

func TestMaxPagesFlag(t *testing.T) {
	// Create a new flag set for isolated testing
	fs := flag.NewFlagSet("test", flag.ContinueOnError)

	// Set up flags
	maxPages := fs.Int("maxPages", 0, "maximum pages to scrape (0 = all pages)")

	// Parse args with maxPages flag
	err := fs.Parse([]string{"-maxPages", "5"})
	if err != nil {
		t.Fatalf("Failed to parse flags: %v", err)
	}

	if *maxPages != 5 {
		t.Errorf("Expected maxPages to be 5 when -maxPages 5 is passed, got %v", *maxPages)
	}
}
