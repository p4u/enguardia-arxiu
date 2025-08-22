import type { WebappData, Episode, Stats, Config } from '@/types/episode'

// This will be replaced at build time with the actual data
// Vite will inline the JSON files during the build process
export async function loadWebappData(): Promise<WebappData> {
  try {
    // Get the base URL from Vite's environment (respects --base flag)
    const baseUrl = import.meta.env.BASE_URL
    
    // In development, load from the data directory
    // In production, these will be inlined by Vite
    const [episodesResponse, statsResponse, configResponse] = await Promise.all([
      fetch(`${baseUrl}data/episodes-list.json`),
      fetch(`${baseUrl}data/stats.json`),
      fetch(`${baseUrl}data/config.json`),
    ])

    if (!episodesResponse.ok || !statsResponse.ok || !configResponse.ok) {
      throw new Error('Failed to load data files')
    }

    const [episodes, stats, config] = await Promise.all([
      episodesResponse.json() as Promise<Episode[]>,
      statsResponse.json() as Promise<Stats>,
      configResponse.json() as Promise<Config>,
    ])

    console.log('Data loaded successfully:', {
      episodesCount: episodes.length,
      baseUrl,
      statsTotal: stats.totalEpisodes,
      configTitle: config.title
    })

    return {
      episodes,
      stats,
      config,
    }
  } catch (error) {
    console.error('Failed to load webapp data:', error)
    
    // Fallback to empty data structure
    return {
      episodes: [],
      stats: {
        totalEpisodes: 0,
        totalDuration: '0:00',
        totalSeconds: 0,
        dateRange: { earliest: '', latest: '' },
        categories: [],
        audioFormats: ['mp3'],
        totalFileSize: 0,
        availableCount: 0,
        lastUpdated: new Date().toISOString(),
      },
      config: {
        title: 'En Guàrdia - Història de Catalunya',
        description: 'Programa d\'història de Catalunya Ràdio',
        language: 'ca',
        audioBaseUrl: '/audio',
        supportsModes: ['streaming'],
        version: '2.0.0',
        buildTime: new Date().toISOString(),
        theme: {
          primaryColor: '#d32f2f',
          secondaryColor: '#1976d2',
          accentColor: '#ff9800',
        },
      },
    }
  }
}

// Utility functions for working with episodes
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function parseDuration(duration: string): number {
  // Parse duration like "00:53:19" or "53:19" or "Durada: 54 min"
  const trimmed = duration.trim()
  
  // Handle "Durada: XX min" format
  if (trimmed.includes('min')) {
    const match = trimmed.match(/(\d+)\s*min/)
    if (match) {
      return parseInt(match[1]) * 60
    }
  }

  // Handle HH:MM:SS or MM:SS format
  const parts = trimmed.split(':')
  if (parts.length === 3) {
    // HH:MM:SS
    const [h, m, s] = parts.map(p => parseInt(p) || 0)
    return h * 3600 + m * 60 + s
  } else if (parts.length === 2) {
    // MM:SS
    const [m, s] = parts.map(p => parseInt(p) || 0)
    return m * 60 + s
  }

  return 0
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getAudioUrl(episode: Episode, config: Config): string {
  // If it's a streaming mode or the episode has a remote URL, use that
  if (config.supportsModes.includes('streaming') && episode.audioUrl) {
    return episode.audioUrl
  }
  
  // Otherwise, use local file
  if (config.supportsModes.includes('local') && episode.filename) {
    return `${config.audioBaseUrl}/${episode.filename}`
  }
  
  // Fallback to remote URL
  return episode.audioUrl || ''
}

export function searchEpisodes(episodes: Episode[], query: string): Episode[] {
  if (!query.trim()) return episodes
  
  const searchTerm = query.toLowerCase().trim()
  
  return episodes.filter(episode => {
    const titleMatch = episode.title.toLowerCase().includes(searchTerm)
    const descriptionMatch = episode.description.toLowerCase().includes(searchTerm)
    const categoryMatch = episode.category?.toLowerCase().includes(searchTerm)
    const tagsMatch = episode.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    
    return titleMatch || descriptionMatch || categoryMatch || tagsMatch
  })
}

export function filterEpisodesByCategory(episodes: Episode[], category: string): Episode[] {
  if (!category) return episodes
  return episodes.filter(episode => episode.category === category)
}

export function sortEpisodes(episodes: Episode[], sortBy: 'title' | 'date' | 'duration'): Episode[] {
  return [...episodes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title, 'ca')
      case 'date':
        return new Date(b.parsedDate).getTime() - new Date(a.parsedDate).getTime()
      case 'duration':
        return parseDuration(b.duration) - parseDuration(a.duration)
      default:
        return 0
    }
  })
}
