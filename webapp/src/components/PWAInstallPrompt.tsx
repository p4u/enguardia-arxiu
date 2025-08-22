import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react'
import { MdInstallMobile, MdClose } from 'react-icons/md'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }
      
      // Check for iOS standalone mode
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }
    }

    checkIfInstalled()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  const handleDismiss = () => {
    setIsInstallable(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed or dismissed
  if (isInstalled || !isInstallable) return null
  
  // Check if user has dismissed the prompt
  if (localStorage.getItem('pwa-install-dismissed') === 'true') return null

  return (
    <>
      <Box
        position="fixed"
        bottom="20px"
        left="20px"
        right="20px"
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        shadow="lg"
        zIndex={1000}
        maxW="400px"
        mx="auto"
      >
        <VStack spacing={3} align="stretch">
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <VStack spacing={2} align="flex-start" flex={1}>
              <Box display="flex" alignItems="center" gap={2}>
                <Icon as={MdInstallMobile} color="red.500" boxSize={5} />
                <Text fontWeight="bold" fontSize="sm">
                  Instal·la l'aplicació
                </Text>
              </Box>
              <Text fontSize="xs" color="gray.600">
                Afegeix En Guàrdia Arxiu a la pantalla d'inici per a un accés ràpid i una experiència millorada.
              </Text>
            </VStack>
            <Button
              size="xs"
              variant="ghost"
              onClick={handleDismiss}
              ml={2}
            >
              <Icon as={MdClose} />
            </Button>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              size="sm"
              colorScheme="red"
              onClick={handleInstallClick}
              flex={1}
            >
              Instal·la
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpen}
              flex={1}
            >
              Més info
            </Button>
          </Box>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Instal·la En Guàrdia Arxiu</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Instal·la l'aplicació En Guàrdia Arxiu per gaudir d'una experiència millorada:
              </Text>
              <VStack spacing={2} align="flex-start" pl={4}>
                <Text fontSize="sm">• Accés ràpid des de la pantalla d'inici</Text>
                <Text fontSize="sm">• Funciona sense connexió a internet</Text>
                <Text fontSize="sm">• Experiència d'aplicació nativa</Text>
                <Text fontSize="sm">• Menys consum de bateria</Text>
                <Text fontSize="sm">• Notificacions push (properament)</Text>
              </VStack>
              <Text fontSize="sm" color="gray.600">
                L'aplicació s'instal·larà al teu dispositiu i poràs accedir-hi com qualsevol altra aplicació.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel·la
            </Button>
            <Button colorScheme="red" onClick={() => { handleInstallClick(); onClose(); }}>
              Instal·la ara
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
