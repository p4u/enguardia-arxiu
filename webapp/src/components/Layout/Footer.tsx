import {
  Box,
  Container,
  Text,
  HStack,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEpisodes } from '@/contexts/EpisodesContext'

export function Footer() {
  const { config, stats } = useEpisodes()
  const bg = useColorModeValue('gray.100', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      as="footer"
      w="full"
      bg={bg}
      borderTop="1px"
      borderColor={borderColor}
      py={8}
      mt="auto"
    >
      <Container maxW="container.xl">
        <HStack justify="space-between" align="center" wrap="wrap" spacing={4}>
          <Text fontSize="sm" color="gray.600">
            © 2025 En Guàrdia Scraper v{config.version}
          </Text>
          
          <HStack spacing={4} fontSize="sm" color="gray.600">
            <Text>{stats.totalEpisodes} episodis</Text>
            <Text>•</Text>
            <Text>{stats.totalDuration} d'àudio</Text>
            <Text>•</Text>
            <Link href="https://www.3cat.cat/3cat/en-guardia/" isExternal>
              3Cat Original
            </Link>
          </HStack>
        </HStack>
      </Container>
    </Box>
  )
}
