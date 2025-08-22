# En Guàrdia Arxiu

Repositori per generar un arxiu web estàtic del podcast "En Guàrdia" de 3Cat. Inclou un scraper en Go per extreure episodis i una aplicació web React per navegar-los.

## Pàgina web desplegada

La web està disponible a: **https://www.dabax.net/enguardia-arxiu**

## Comandes principals

```bash
# Construir la web per GitHub Pages
make gh-pages-build

# Desenvolupament local
make dev-webapp

# Construir web completa amb MP3 locals
make build-all

# Extreure episodis de 3Cat
make scrape

# Extreure episodis sense descarregar MP3
make scrape-lazy

# Generar etiquetes dels episodis
make generate-tags

# Netejar fitxers generats
make clean
```

## Estructura

- `cmd/scraper/` - Aplicació principal en Go
- `internal/` - Lògica del scraper i servidor
- `webapp/` - Aplicació web React
- `capitols/` - Episodis descarregats
- `gh-pages-web/` - Build per GitHub Pages

## Tecnologies

- **Backend**: Go
- **Frontend**: React amb Vite i Chakra UI
- **Desplegament**: GitHub Pages amb GitHub Actions
