import { Box, Container, VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { GlobalAudioPlayer } from '../AudioPlayer/GlobalAudioPlayer'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box minH="100vh" bg="gray.50">
      <VStack spacing={0} minH="100vh">
        <Header />
        
        <Box flex="1" w="full">
          <Container maxW="container.xl" py={8}>
            {children}
          </Container>
        </Box>
        
        <Footer />
        
        {/* Global audio player - always visible at bottom */}
        <GlobalAudioPlayer />
      </VStack>
    </Box>
  )
}
