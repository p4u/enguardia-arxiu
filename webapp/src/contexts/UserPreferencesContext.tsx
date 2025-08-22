import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface UserPreferences {
  favourites: Set<string>
  listened: Set<string>
}

interface UserPreferencesContextType {
  favourites: Set<string>
  listened: Set<string>
  toggleFavourite: (episodeId: string) => void
  toggleListened: (episodeId: string) => void
  isFavourite: (episodeId: string) => boolean
  isListened: (episodeId: string) => boolean
  clearAllFavourites: () => void
  clearAllListened: () => void
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

const STORAGE_KEYS = {
  FAVOURITES: 'enguardia-favourites',
  LISTENED: 'enguardia-listened'
}

interface UserPreferencesProviderProps {
  children: ReactNode
}

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    favourites: new Set<string>(),
    listened: new Set<string>()
  })

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedFavourites = localStorage.getItem(STORAGE_KEYS.FAVOURITES)
      const savedListened = localStorage.getItem(STORAGE_KEYS.LISTENED)

      const favourites = savedFavourites ? new Set<string>(JSON.parse(savedFavourites) as string[]) : new Set<string>()
      const listened = savedListened ? new Set<string>(JSON.parse(savedListened) as string[]) : new Set<string>()

      setPreferences({ favourites, listened })
      
      console.log('UserPreferences: Loaded from localStorage:', {
        favouritesCount: favourites.size,
        listenedCount: listened.size
      })
    } catch (error) {
      console.error('UserPreferences: Error loading from localStorage:', error)
      // Reset to empty sets if there's an error
      setPreferences({
        favourites: new Set<string>(),
        listened: new Set<string>()
      })
    }
  }, [])

  // Save to localStorage whenever preferences change
  const saveToStorage = (newPreferences: UserPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify([...newPreferences.favourites]))
      localStorage.setItem(STORAGE_KEYS.LISTENED, JSON.stringify([...newPreferences.listened]))
      
      console.log('UserPreferences: Saved to localStorage:', {
        favouritesCount: newPreferences.favourites.size,
        listenedCount: newPreferences.listened.size
      })
    } catch (error) {
      console.error('UserPreferences: Error saving to localStorage:', error)
    }
  }

  const toggleFavourite = (episodeId: string) => {
    setPreferences(prev => {
      const newFavourites = new Set(prev.favourites)
      
      if (newFavourites.has(episodeId)) {
        newFavourites.delete(episodeId)
        console.log('UserPreferences: Removed from favourites:', episodeId)
      } else {
        newFavourites.add(episodeId)
        console.log('UserPreferences: Added to favourites:', episodeId)
      }
      
      const newPreferences = { ...prev, favourites: newFavourites }
      saveToStorage(newPreferences)
      return newPreferences
    })
  }

  const toggleListened = (episodeId: string) => {
    setPreferences(prev => {
      const newListened = new Set(prev.listened)
      
      if (newListened.has(episodeId)) {
        newListened.delete(episodeId)
        console.log('UserPreferences: Removed from listened:', episodeId)
      } else {
        newListened.add(episodeId)
        console.log('UserPreferences: Added to listened:', episodeId)
      }
      
      const newPreferences = { ...prev, listened: newListened }
      saveToStorage(newPreferences)
      return newPreferences
    })
  }

  const isFavourite = (episodeId: string): boolean => {
    return preferences.favourites.has(episodeId)
  }

  const isListened = (episodeId: string): boolean => {
    return preferences.listened.has(episodeId)
  }

  const clearAllFavourites = () => {
    setPreferences(prev => {
      const newPreferences = { ...prev, favourites: new Set<string>() }
      saveToStorage(newPreferences)
      console.log('UserPreferences: Cleared all favourites')
      return newPreferences
    })
  }

  const clearAllListened = () => {
    setPreferences(prev => {
      const newPreferences = { ...prev, listened: new Set<string>() }
      saveToStorage(newPreferences)
      console.log('UserPreferences: Cleared all listened')
      return newPreferences
    })
  }

  const value: UserPreferencesContextType = {
    favourites: preferences.favourites,
    listened: preferences.listened,
    toggleFavourite,
    toggleListened,
    isFavourite,
    isListened,
    clearAllFavourites,
    clearAllListened
  }

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}
