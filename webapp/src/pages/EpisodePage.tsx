import { Box, Text } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { useEpisodes } from '@/contexts/EpisodesContext'

export function EpisodePage() {
  const { id } = useParams<{ id: string }>()
  const { getEpisodeById } = useEpisodes()
  
  const episode = id ? getEpisodeById(id) : null

  if (!episode) {
    return (
      <Box textAlign="center" py={20}>
        <Text fontSize="lg" color="gray.500">
          Episodi no trobat
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        {episode.title}
      </Text>
      <Text color="gray.600">
        {episode.description}
      </Text>
    </Box>
  )
}
