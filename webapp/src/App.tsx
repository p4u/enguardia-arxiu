import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { EpisodesProvider } from '@/contexts/EpisodesContext'
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext'
import { AppRouter } from '@/components/AppRouter'
import { theme } from '@/theme'

function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
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
