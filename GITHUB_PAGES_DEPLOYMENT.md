# GitHub Pages Deployment Guide

This guide explains how to deploy the En Guàrdia webapp to GitHub Pages using the new `gh-pages-build` command.

## Overview

The GitHub Pages deployment creates a fully static website that:
- ✅ **Audio**: Streams from remote 3Cat servers (no size constraints)
- ✅ **Images**: Uses local files for fast loading
- ✅ **Data**: Static JSON files generated at build time
- ✅ **SPA Routing**: Proper client-side routing support
- ✅ **No Runtime Dependencies**: Everything is static

## Quick Start (Recommended: GitHub Actions)

### Option 1: Automated GitHub Actions Deployment (Recommended)

Simply push to the `main` branch and GitHub Actions will automatically:
- Scrape episodes (lazy mode - no MP3 downloads)
- Generate tags database
- Generate webapp data with remote MP3 URLs + local images
- Build optimized Vite production bundle
- Deploy directly to GitHub Pages

**Setup:**
1. Ensure your repository has GitHub Actions enabled
2. The workflow file `.github/workflows/deploy.yml` is already configured
3. Go to your repository Settings > Pages > Source and select "GitHub Actions"
4. Push any changes to `main` branch to trigger automatic deployment

### Option 2: Manual Build and Deploy

```bash
make gh-pages-build
```

This single command will:
- Scrape episodes (lazy mode - no MP3 downloads)
- Generate tags database
- Generate webapp data with remote MP3 URLs + local images
- Build optimized Vite production bundle
- Copy all assets to `gh-pages-web/` directory
- Add GitHub Pages specific files (`.nojekyll`, `404.html`)

Then deploy manually:

```bash
cd gh-pages-web
git init
git add .
git commit -m "Initial GitHub Pages build"
git remote add origin <your-repo-url>
git branch -M gh-pages
git push -u origin gh-pages
```

**Note**: The `gh-pages-web/` directory has its own `.gitignore` file that ensures all necessary deployment files are included while excluding only development artifacts.

### 3. Configure GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select `gh-pages` branch
5. Select `/ (root)` folder
6. Save

Your site will be available at: `https://<username>.github.io/<repository-name>/`

## Build Structure

The `gh-pages-web/` directory contains:

```
gh-pages-web/
├── index.html              # Main SPA entry point
├── 404.html               # SPA routing fallback
├── .nojekyll              # Bypass Jekyll processing
├── assets/                # Vite-generated JS/CSS bundles
│   ├── index-*.js         # Main application bundle
│   ├── vendor-*.js        # React/Chakra UI libraries
│   ├── ui-*.js           # UI components bundle
│   └── router-*.js       # React Router bundle
├── data/                  # Static JSON data
│   ├── episodes.json      # Complete episode data
│   ├── episodes-list.json # Episode list only
│   ├── stats.json         # Statistics
│   └── config.json        # App configuration
└── images/               # Local episode images
    ├── episode1.jpg
    ├── episode2.png
    └── ...
```

## Technical Details

### Audio Streaming Strategy

- **Remote URLs**: All MP3 files stream directly from 3Cat servers
- **No Size Limits**: Bypasses GitHub's 100MB file limit
- **Always Available**: Uses original broadcast URLs
- **No Bandwidth Cost**: Served by 3Cat infrastructure

### Image Optimization

- **Local Storage**: Images stored in repository for fast loading
- **Optimized Paths**: Uses `./images/filename.ext` relative paths
- **Fallback Support**: Falls back to remote URLs if local images missing
- **Size Efficient**: Only episode thumbnails, not full-size images

### SPA Routing Support

- **404.html**: Redirects all unknown routes to index.html
- **Client-side Routing**: React Router handles navigation
- **Deep Linking**: Direct URLs to episodes work correctly
- **History API**: Proper browser back/forward support

### Build Optimization

- **Code Splitting**: Separate bundles for vendor, UI, and router code
- **Tree Shaking**: Unused code eliminated
- **Minification**: All assets compressed
- **Gzip Compression**: Further size reduction

## Makefile Commands

### Core Commands

- `make gh-pages-build` - Complete GitHub Pages build (recommended)
- `make generate-data-ghpages` - Generate data with hybrid mode
- `make build-webapp-ghpages` - Build webapp for GitHub Pages

### Development Commands

- `make scrape-lazy` - Scrape episodes without MP3 downloads
- `make generate-tags` - Generate tags database
- `make dev-webapp` - Start development server

## Updating the Deployment

To update your GitHub Pages site:

```bash
# 1. Rebuild with latest data
make gh-pages-build

# 2. Update the deployment
cd gh-pages-web
git add .
git commit -m "Update with latest episodes"
git push
```

## Troubleshooting

### Build Issues

**Problem**: Build fails with "No webapp data found"
**Solution**: Run `make generate-data-ghpages` first

**Problem**: Images not showing
**Solution**: Check that image files exist in `capitols/` directory

**Problem**: Audio not playing
**Solution**: Verify 3Cat URLs are accessible (they should be)

### Deployment Issues

**Problem**: 404 errors on direct URLs
**Solution**: Ensure `404.html` is present and GitHub Pages is configured correctly

**Problem**: Site not updating
**Solution**: Check GitHub Actions tab for deployment status

**Problem**: CSS/JS not loading
**Solution**: Verify `.nojekyll` file is present to bypass Jekyll processing

## Performance Considerations

### Loading Speed
- **First Load**: ~500KB total (gzipped)
- **Images**: Load on-demand as user scrolls
- **Data**: Loaded once at startup (~2MB JSON)
- **Audio**: Streams on-demand

### Caching Strategy
- **Static Assets**: Cached by filename hash
- **Images**: Browser cached with standard headers
- **Data**: Refreshed on each deployment

### Mobile Optimization
- **Responsive Design**: Works on all screen sizes
- **Touch Friendly**: Large tap targets for mobile
- **Bandwidth Aware**: Images optimized for mobile

## Security & Privacy

- **No Server**: Fully static, no server-side processing
- **No Analytics**: No tracking by default
- **HTTPS**: Served over HTTPS by GitHub Pages
- **CORS**: No cross-origin issues

## Limitations

- **No Real-time Updates**: Data updated only on rebuild
- **No User Accounts**: Fully anonymous usage
- **No Comments**: Static site, no dynamic features
- **GitHub Limits**: 1GB repository size limit (should be fine with images only)

## Advanced Configuration

### Custom Domain

To use a custom domain:

1. Add `CNAME` file to `gh-pages-web/`:
   ```bash
   echo "your-domain.com" > gh-pages-web/CNAME
   ```

2. Configure DNS:
   ```
   CNAME your-domain.com username.github.io
   ```

### Analytics

To add analytics, modify `webapp/index.html` before building:

```html
<!-- Add before closing </head> tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Support

For issues with:
- **Build Process**: Check Makefile and Go code
- **Frontend Issues**: Check React/Vite configuration
- **Deployment**: Check GitHub Pages documentation
- **Audio Streaming**: Verify 3Cat API accessibility
