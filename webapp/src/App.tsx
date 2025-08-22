import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { EpisodesProvider } from '@/contexts/EpisodesContext'
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext'
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext'
import { AppRouter } from '@/components/AppRouter'
import { theme } from '@/theme'

function App() {
  // Get the base path from the environment or default to root
  const basename = import.meta.env.BASE_URL || '/'
  
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter basename={basename}>
        <UserPreferencesProvider>
          <EpisodesProvider>
            <AudioPlayerProvider>
              <AppRouter />
            </AudioPlayerProvider>
          </EpisodesProvider>
        </UserPreferencesProvider>
      </BrowserRouter>
    </ChakraProvider>
  )
}

export default App
