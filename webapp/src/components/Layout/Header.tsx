import {
  Box,
  Container,
  Heading,
  HStack,
  IconButton,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from 'react-router-dom'

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      as="header"
      w="full"
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Container maxW="container.xl" py={4}>
        <HStack justify="space-between" align="center">
          <RouterLink to="/">
            <Heading size="lg" color="primary.500">
              🎙️ En Guàrdia
            </Heading>
          </RouterLink>
          
          <HStack spacing={4}>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
            />
          </HStack>
        </HStack>
      </Container>
    </Box>
  )
}
