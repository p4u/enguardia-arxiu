import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { EpisodesProvider } from '@/contexts/EpisodesContext'
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext'
import { AppRouter } from '@/components/AppRouter'
import { theme } from '@/theme'

function App() {
  // Get the base path from the environment or default to root
  const basename = import.meta.env.BASE_URL || '/'
  
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter basename={basename}>
        <EpisodesProvider>
          <AudioPlayerProvider>
            <AppRouter />
          </AudioPlayerProvider>
        </EpisodesProvider>
      </BrowserRouter>
    </ChakraProvider>
  )
}

export default App
