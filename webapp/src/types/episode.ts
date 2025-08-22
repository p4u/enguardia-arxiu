export interface Episode {
  id: string
  title: string
  description: string
  duration: string
  date: string
  parsedDate: string
  link: string
  audioUrl: string
  image: string
  filename: string
  jsonFile: string
  fileSize?: number
  available: boolean
  tags?: string[]
  category?: string
}

export interface Stats {
  totalEpisodes: number
  totalDuration: string
  totalSeconds: number
  dateRange: DateRange
  categories: string[]
  audioFormats: string[]
  totalFileSize: number
  availableCount: number
  lastUpdated: string
}

export interface DateRange {
  earliest: string
  latest: string
}

export interface Config {
  title: string
  description: string
  language: string
  audioBaseUrl: string
  supportsModes: string[]
  version: string
  buildTime: string
  theme: Theme
}

export interface Theme {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundUrl?: string
}

export interface WebappData {
  episodes: Episode[]
  stats: Stats
  config: Config
}

export interface SearchFilters {
  query: string
  category?: string
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  availableOnly?: boolean
  favouritesOnly?: boolean
  listenedOnly?: boolean
  hideFavourites?: boolean
  hideListened?: boolean
}

export interface AudioPlayerState {
  currentEpisode: Episode | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
}

export interface PlaylistItem {
  episode: Episode
  addedAt: string
}
