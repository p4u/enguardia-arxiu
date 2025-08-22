import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import type { Episode, AudioPlayerState } from '@/types/episode'
import { useEpisodes } from './EpisodesContext'
import { getAudioUrl } from '@/utils/dataLoader'

interface AudioPlayerContextType extends AudioPlayerState {
  // Actions
  play: (episode?: Episode) => void
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setPlaybackRate: (rate: number) => void
  
  // Playlist
  playlist: Episode[]
  currentIndex: number
  playNext: () => void
  playPrevious: () => void
  addToPlaylist: (episode: Episode) => void
  removeFromPlaylist: (episodeId: string) => void
  clearPlaylist: () => void
  
  // State
  isBuffering: boolean
  error: string | null
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

interface AudioPlayerProviderProps {
  children: ReactNode
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const { config } = useEpisodes()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    currentEpisode: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
  })
  
  const [playlist, setPlaylist] = useState<Episode[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    // Audio event listeners
    const handleLoadStart = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({ ...prev, duration: audio.duration }))
    }
    
    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }))
    }
    
    const handlePlay = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: true }))
    }
    
    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }))
    }
    
    const handleEnded = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))
      playNext()
    }
    
    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement
      setError(`Audio error: ${target.error?.message || 'Unknown error'}`)
      setIsBuffering(false)
      setPlayerState(prev => ({ ...prev, isPlaying: false }))
    }
    
    const handleVolumeChange = () => {
      setPlayerState(prev => ({
        ...prev,
        volume: audio.volume,
        isMuted: audio.muted,
      }))
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('volumechange', handleVolumeChange)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('volumechange', handleVolumeChange)
      audio.pause()
      audio.src = ''
    }
  }, [])

  const play = (episode?: Episode) => {
    const audio = audioRef.current
    if (!audio) return

    if (episode && episode !== playerState.currentEpisode) {
      // Load new episode
      const audioUrl = getAudioUrl(episode, config)
      if (!audioUrl) {
        setError('No audio URL available for this episode')
        return
      }

      audio.src = audioUrl
      setPlayerState(prev => ({ ...prev, currentEpisode: episode, currentTime: 0 }))
      setError(null)
      
      // Add to playlist if not already there
      if (!playlist.find(ep => ep.id === episode.id)) {
        setPlaylist(prev => [...prev, episode])
        setCurrentIndex(playlist.length)
      } else {
        setCurrentIndex(playlist.findIndex(ep => ep.id === episode.id))
      }
    }

    audio.play().catch(err => {
      setError(`Failed to play audio: ${err.message}`)
    })
  }

  const pause = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
    }
  }

  const stop = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  const seek = (time: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = time
    }
  }

  const setVolume = (volume: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume))
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (audio) {
      audio.muted = !audio.muted
    }
  }

  const setPlaybackRate = (rate: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = rate
      setPlayerState(prev => ({ ...prev, playbackRate: rate }))
    }
  }

  const playNext = () => {
    if (currentIndex < playlist.length - 1) {
      const nextEpisode = playlist[currentIndex + 1]
      play(nextEpisode)
    }
  }

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevEpisode = playlist[currentIndex - 1]
      play(prevEpisode)
    }
  }

  const addToPlaylist = (episode: Episode) => {
    if (!playlist.find(ep => ep.id === episode.id)) {
      setPlaylist(prev => [...prev, episode])
    }
  }

  const removeFromPlaylist = (episodeId: string) => {
    const index = playlist.findIndex(ep => ep.id === episodeId)
    if (index !== -1) {
      setPlaylist(prev => prev.filter(ep => ep.id !== episodeId))
      if (index < currentIndex) {
        setCurrentIndex(prev => prev - 1)
      } else if (index === currentIndex && playerState.currentEpisode?.id === episodeId) {
        // Currently playing episode was removed
        stop()
        setPlayerState(prev => ({ ...prev, currentEpisode: null }))
      }
    }
  }

  const clearPlaylist = () => {
    setPlaylist([])
    setCurrentIndex(0)
    stop()
    setPlayerState(prev => ({ ...prev, currentEpisode: null }))
  }

  const value: AudioPlayerContextType = {
    ...playerState,
    playlist,
    currentIndex,
    isBuffering,
    error,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    playNext,
    playPrevious,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
  }

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
  }
  return context
}
