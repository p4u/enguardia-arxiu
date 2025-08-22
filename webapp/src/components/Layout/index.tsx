import { Box, Container, VStack, useColorModeValue } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { GlobalAudioPlayer } from '../AudioPlayer/GlobalAudioPlayer'
import { OfflineIndicator } from '../OfflineIndicator'
import { PWAInstallPrompt } from '../PWAInstallPrompt'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  
  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Offline indicator */}
      <OfflineIndicator />
      
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
      
      {/* PWA install prompt */}
      <PWAInstallPrompt />
    </Box>
  )
}
