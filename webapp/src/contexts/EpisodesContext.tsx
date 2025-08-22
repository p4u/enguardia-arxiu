import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { WebappData, Episode, Stats, Config, SearchFilters } from '@/types/episode'
import { loadWebappData, searchEpisodes, filterEpisodesByCategory, sortEpisodes } from '@/utils/dataLoader'

interface EpisodesContextType {
  // Data
  episodes: Episode[]
  stats: Stats
  config: Config
  
  // Filtered/searched episodes
  filteredEpisodes: Episode[]
  
  // Loading state
  isLoading: boolean
  error: string | null
  
  // Search and filters
  searchFilters: SearchFilters
  setSearchFilters: (filters: SearchFilters) => void
  
  // Sorting
  sortBy: 'title' | 'date' | 'duration'
  setSortBy: (sortBy: 'title' | 'date' | 'duration') => void
  
  // Actions
  refreshData: () => Promise<void>
  getEpisodeById: (id: string) => Episode | undefined
}

const EpisodesContext = createContext<EpisodesContextType | undefined>(undefined)

interface EpisodesProviderProps {
  children: ReactNode
}

export function EpisodesProvider({ children }: EpisodesProviderProps) {
  const [webappData, setWebappData] = useState<WebappData>({
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
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    category: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    tags: undefined,
    availableOnly: false,
  })
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'duration'>('title')

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await loadWebappData()
      setWebappData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Failed to load webapp data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters and search
  const filteredEpisodes = (() => {
    let result = webappData.episodes

    // Apply search
    if (searchFilters.query) {
      result = searchEpisodes(result, searchFilters.query)
    }

    // Apply category filter
    if (searchFilters.category) {
      result = filterEpisodesByCategory(result, searchFilters.category)
    }

    // Apply available only filter
    if (searchFilters.availableOnly) {
      result = result.filter(episode => episode.available)
    }

    // Apply date filters
    if (searchFilters.dateFrom) {
      const fromDate = new Date(searchFilters.dateFrom)
      result = result.filter(episode => new Date(episode.parsedDate) >= fromDate)
    }

    if (searchFilters.dateTo) {
      const toDate = new Date(searchFilters.dateTo)
      result = result.filter(episode => new Date(episode.parsedDate) <= toDate)
    }

    // Apply tag filters
    if (searchFilters.tags && searchFilters.tags.length > 0) {
      result = result.filter(episode =>
        episode.tags?.some(tag => searchFilters.tags!.includes(tag))
      )
    }

    // Apply sorting
    result = sortEpisodes(result, sortBy)

    return result
  })()

  const getEpisodeById = (id: string): Episode | undefined => {
    return webappData.episodes.find(episode => episode.id === id)
  }

  const refreshData = async () => {
    await loadData()
  }

  const value: EpisodesContextType = {
    episodes: webappData.episodes,
    stats: webappData.stats,
    config: webappData.config,
    filteredEpisodes,
    isLoading,
    error,
    searchFilters,
    setSearchFilters,
    sortBy,
    setSortBy,
    refreshData,
    getEpisodeById,
  }

  return (
    <EpisodesContext.Provider value={value}>
      {children}
    </EpisodesContext.Provider>
  )
}

export function useEpisodes() {
  const context = useContext(EpisodesContext)
  if (context === undefined) {
    throw new Error('useEpisodes must be used within an EpisodesProvider')
  }
  return context
}
