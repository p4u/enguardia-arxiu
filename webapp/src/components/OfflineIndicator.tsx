import { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Icon,
  useColorModeValue,
  Slide
} from '@chakra-ui/react'
import { MdWifiOff, MdWifi } from 'react-icons/md'

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  const bgColor = useColorModeValue('orange.100', 'orange.900')
  const textColor = useColorModeValue('orange.800', 'orange.100')

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show offline message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <Slide direction="top" in={showOfflineMessage} style={{ zIndex: 1001 }}>
      <Box
        bg={bgColor}
        color={textColor}
        p={3}
        textAlign="center"
        borderBottom="1px solid"
        borderColor="orange.200"
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
          <Icon as={isOnline ? MdWifi : MdWifiOff} />
          <Text fontSize="sm" fontWeight="medium">
            {isOnline 
              ? "Connexió restaurada" 
              : "Sense connexió a internet - Funcionant en mode fora de línia"
            }
          </Text>
        </Box>
      </Box>
    </Slide>
  )
}
