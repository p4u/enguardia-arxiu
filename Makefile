# En Guàrdia Web - Static Site Generator
# Clean architecture: Go generates data, Vite builds static site

# Variables
WEBAPP_DIR := webapp
DATA_DIR := capitols
WEBAPP_DATA_DIR := data
GHPAGES_DIR := gh-pages-web

.PHONY: help scrape scrape-lazy generate-data generate-data-ghpages build-webapp build-webapp-ghpages
.PHONY: dev-webapp build-all gh-pages-build generate-tags clean clean-all

# Default target
help:
	@echo "En Guàrdia Web - Core Functionalities"
	@echo ""
	@echo "🎯 CORE FUNCTIONALITIES:"
	@echo "  gh-pages-build - Build GitHub Pages static site (remote MP3s + local images)"
	@echo "  dev-webapp     - Build and start dev webapp for testing"
	@echo "  build-all      - Build local full site with all MP3 files"
	@echo ""
	@echo "📦 Supporting Commands:"
	@echo "  scrape         - Scrape episodes from 3Cat (with MP3 downloads)"
	@echo "  scrape-lazy    - Scrape episodes from 3Cat (no MP3 downloads)"
	@echo "  generate-tags  - Generate tags.json with episode categorization"
	@echo "  generate-data  - Generate JSON files for webapp (local mode)"
	@echo "  generate-data-ghpages - Generate JSON files for GitHub Pages (hybrid mode)"
	@echo "  build-webapp   - Build static website"
	@echo ""
	@echo "🧹 Maintenance:"
	@echo "  clean         - Clean build artifacts"
	@echo "  clean-all     - Deep clean all generated files"

# Data generation (Go)
scrape:
	@echo "Scraping episodes from 3Cat (with MP3 downloads)..."
	go run ./cmd/scraper -action=scrape -dataDir=$(DATA_DIR)

scrape-lazy:
	@echo "Scraping episodes from 3Cat (lazy mode - no MP3 downloads)..."
	go run ./cmd/scraper -action=scrape -dataDir=$(DATA_DIR) -lazy

generate-data:
	@echo "Generating webapp data files..."
	go run ./cmd/scraper -action=generate -dataDir=$(DATA_DIR) -output=$(WEBAPP_DATA_DIR)

# Website building (Vite)
build-webapp:
	@echo "Building static website..."
	@if [ ! -d "$(WEBAPP_DIR)" ]; then \
		echo "ERROR: Webapp directory not found. Create it first."; \
		exit 1; \
	fi
	@if [ ! -f "$(WEBAPP_DATA_DIR)/episodes.json" ]; then \
		echo "No webapp data found. Running generate-data first..."; \
		$(MAKE) generate-data; \
	fi
	cd $(WEBAPP_DIR) && pnpm install && pnpm build
	@echo "Static website built in $(WEBAPP_DIR)/dist/"

dev-webapp:
	@echo "Starting Vite development server..."
	@if [ ! -d "$(WEBAPP_DIR)" ]; then \
		echo "ERROR: Webapp directory not found. Create it first."; \
		exit 1; \
	fi
	@if [ ! -f "$(WEBAPP_DATA_DIR)/episodes.json" ]; then \
		echo "No webapp data found. Running generate-data first..."; \
		$(MAKE) generate-data; \
	fi
	@echo "Copying data files to webapp public directory..."
	@mkdir -p $(WEBAPP_DIR)/public/data
	@cp -r $(WEBAPP_DATA_DIR)/* $(WEBAPP_DIR)/public/data/
	cd $(WEBAPP_DIR) && pnpm run dev

# Complete workflows
build-all: scrape generate-tags generate-data build-webapp
	@echo "Complete build finished!"
	@echo "Static website ready in $(WEBAPP_DIR)/dist/"
	@echo "You can now serve the files with any web server"

# Generate tags
generate-tags:
	@echo "Generating tags.json file..."
	go run ./cmd/scraper -action=tags -dataDir=$(DATA_DIR)

# Cleanup
clean:
	@echo "Cleaning build artifacts..."
	@if [ -d "$(WEBAPP_DIR)" ]; then \
		cd $(WEBAPP_DIR) && rm -rf dist node_modules public/data; \
	fi
	rm -rf $(WEBAPP_DATA_DIR)
	rm -rf $(GHPAGES_DIR)

clean-all: clean
	@echo "Deep cleaning all generated files..."
	rm -rf $(DATA_DIR)/*
	go clean -cache
	@echo "Cleanup complete!"

# GitHub Pages deployment
generate-data-ghpages:
	@echo "Generating webapp data files for GitHub Pages (hybrid mode)..."
	@echo "Using remote MP3 URLs but local images for optimal GitHub Pages deployment"
	go run ./cmd/scraper -action=generate -dataDir=$(DATA_DIR) -output=$(WEBAPP_DATA_DIR) -lazy

build-webapp-ghpages:
	@echo "Building webapp for GitHub Pages deployment..."
	@if [ ! -d "$(WEBAPP_DIR)" ]; then \
		echo "ERROR: Webapp directory not found. Create it first."; \
		exit 1; \
	fi
	@if [ ! -f "$(WEBAPP_DATA_DIR)/episodes.json" ]; then \
		echo "No webapp data found. Running generate-data-ghpages first..."; \
		$(MAKE) generate-data-ghpages; \
	fi
	@echo "Copying data files to webapp public directory..."
	@mkdir -p $(WEBAPP_DIR)/public/data
	@cp -r $(WEBAPP_DATA_DIR)/* $(WEBAPP_DIR)/public/data/
	@echo "Copying local images to webapp public directory..."
	@if [ -d "$(DATA_DIR)" ]; then \
		mkdir -p $(WEBAPP_DIR)/public/images; \
		find $(DATA_DIR) -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" | \
		while read img; do \
			if [ -f "$$img" ]; then \
				cp "$$img" $(WEBAPP_DIR)/public/images/; \
			fi; \
		done; \
	fi
	cd $(WEBAPP_DIR) && pnpm install && pnpm build --base="/enguardia-arxiu/"
	@echo "GitHub Pages webapp built in $(WEBAPP_DIR)/dist/"

gh-pages-build: scrape-lazy generate-tags generate-data-ghpages build-webapp-ghpages
	@echo "Building complete GitHub Pages deployment..."
	@echo "Cleaning previous build..."
	@rm -rf $(GHPAGES_DIR)
	@echo "Creating GitHub Pages directory structure..."
	@mkdir -p $(GHPAGES_DIR)
	@echo "Copying webapp build files..."
	@cp -r $(WEBAPP_DIR)/dist/* $(GHPAGES_DIR)/
	@echo "Ensuring data directory is properly copied..."
	@if [ -d "$(WEBAPP_DIR)/dist/data" ]; then \
		cp -r $(WEBAPP_DIR)/dist/data $(GHPAGES_DIR)/; \
	fi
	@echo "Copying local images..."
	@if [ -d "$(DATA_DIR)" ]; then \
		mkdir -p $(GHPAGES_DIR)/images; \
		find $(DATA_DIR) -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" | \
		while read img; do \
			if [ -f "$$img" ]; then \
				cp "$$img" $(GHPAGES_DIR)/images/; \
			fi; \
		done; \
	fi
	@echo "Adding GitHub Pages specific files..."
	@echo "" > $(GHPAGES_DIR)/.nojekyll
	@echo "<!DOCTYPE html>" > $(GHPAGES_DIR)/404.html
	@echo "<html lang=\"ca\">" >> $(GHPAGES_DIR)/404.html
	@echo "<head>" >> $(GHPAGES_DIR)/404.html
	@echo "  <meta charset=\"UTF-8\">" >> $(GHPAGES_DIR)/404.html
	@echo "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" >> $(GHPAGES_DIR)/404.html
	@echo "  <title>En Guàrdia - Història de Catalunya</title>" >> $(GHPAGES_DIR)/404.html
	@echo "  <script>" >> $(GHPAGES_DIR)/404.html
	@echo "    // SPA fallback - redirect to index.html with path info" >> $(GHPAGES_DIR)/404.html
	@echo "    sessionStorage.redirect = location.href;" >> $(GHPAGES_DIR)/404.html
	@echo "  </script>" >> $(GHPAGES_DIR)/404.html
	@echo "  <meta http-equiv=\"refresh\" content=\"0;URL='/'\">" >> $(GHPAGES_DIR)/404.html
	@echo "</head>" >> $(GHPAGES_DIR)/404.html
	@echo "<body>" >> $(GHPAGES_DIR)/404.html
	@echo "  <p>Redirecting...</p>" >> $(GHPAGES_DIR)/404.html
	@echo "</body>" >> $(GHPAGES_DIR)/404.html
	@echo "</html>" >> $(GHPAGES_DIR)/404.html
	@echo ""
	@echo "✅ GitHub Pages build complete!"
	@echo "📁 Static files ready in: $(GHPAGES_DIR)/"
	@echo "🎵 Audio: Remote streaming from 3Cat servers"
	@echo "🖼️  Images: Local files for fast loading"
	@echo "📊 Data: Static JSON files"
	@echo ""
	@echo "Next steps:"
	@echo "1. cd $(GHPAGES_DIR)"
	@echo "2. git init && git add . && git commit -m 'Initial GitHub Pages build'"
	@echo "3. git remote add origin <your-repo-url>"
	@echo "4. git branch -M gh-pages"
	@echo "5. git push -u origin gh-pages"
