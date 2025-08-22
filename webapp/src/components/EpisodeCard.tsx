import {
  Card,
  CardBody,
  Badge,
  Button,
  HStack,
  VStack,
  Heading,
  Text,
  Box,
  Icon,
  Image,
  Tooltip,
} from '@chakra-ui/react'
import { FaPlay, FaCalendarAlt, FaClock, FaHeart, FaShare, FaCheck } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { memo } from 'react'
import type { Episode } from '@/types/episode'
import { useUserPreferences } from '@/contexts/UserPreferencesContext'

interface EpisodeCardProps {
  episode: Episode
  index: number
  onPlay: (episode: Episode) => void
  isCurrentlyPlaying: boolean
  isLoading: boolean
}

export const EpisodeCard = memo(function EpisodeCard({
  episode,
  index,
  onPlay,
  isCurrentlyPlaying,
  isLoading,
}: EpisodeCardProps) {
  const { isFavourite, isListened, toggleFavourite, toggleListened } = useUserPreferences()
  
  const isFav = isFavourite(episode.id)
  const isListen = isListened(episode.id)
  
  console.log('EpisodeCard: Rendering card for:', {
    episodeId: episode.id,
    title: episode.title,
    index,
    hasImage: !!episode.image,
    available: episode.available,
    isFavourite: isFav,
    isListened: isListen
  })

  const handleFavouriteClick = () => {
    toggleFavourite(episode.id)
  }

  const handleListenedClick = () => {
    toggleListened(episode.id)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        variant="outline" 
        _hover={{ 
          shadow: 'xl',
          transform: 'translateY(-2px)',
          borderColor: 'primary.200'
        }}
        transition="all 0.2s"
        bg="white"
        borderRadius="2xl"
        overflow="hidden"
      >
        {/* Episode Image */}
        {episode.image && (
          <Box position="relative" overflow="hidden">
            <Image
              src={episode.image}
              alt={episode.title}
              w="full"
              h="200px"
              objectFit="cover"
              fallback={
                <Box
                  w="full"
                  h="200px"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="gray.500" fontSize="sm">
                    Imatge no disponible
                  </Text>
                </Box>
              }
            />
            {/* Gradient overlay for better text readability */}
            <Box
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              h="50%"
              bgGradient="linear(to-t, blackAlpha.600, transparent)"
            />
          </Box>
        )}

        <CardBody p={6}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Heading size="md" mb={2} noOfLines={2} color="gray.800">
                {episode.title}
              </Heading>
              <Tooltip
                label={episode.description}
                placement="top"
                hasArrow
                bg="gray.700"
                color="white"
                fontSize="sm"
                p={3}
                borderRadius="md"
                maxW="300px"
                textAlign="left"
              >
                <Text 
                  fontSize="sm" 
                  color="gray.600" 
                  noOfLines={3} 
                  lineHeight="1.5"
                  cursor="help"
                  _hover={{ color: "gray.800" }}
                  transition="color 0.2s"
                >
                  {episode.description}
                </Text>
              </Tooltip>
            </Box>
            

            {/* Tags Section */}
            {episode.tags && episode.tags.length > 0 && (
              <Box>
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium">
                  Etiquetes:
                </Text>
                <HStack spacing={1} wrap="wrap">
                  {episode.tags.slice(0, 6).map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                      textTransform="none"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {episode.tags.length > 6 && (
                    <Badge
                      size="sm"
                      colorScheme="gray"
                      variant="subtle"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                    >
                      +{episode.tags.length - 6}
                    </Badge>
                  )}
                </HStack>
              </Box>
            )}
            
            <HStack justify="space-between" fontSize="sm" color="gray.500">
              <HStack spacing={1}>
                <Icon as={FaCalendarAlt} />
                <Text>{new Date(episode.parsedDate).toLocaleDateString('ca')}</Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FaClock} />
                <Text>{episode.duration}</Text>
              </HStack>
            </HStack>
            
            <HStack spacing={2}>
              <Button
                leftIcon={<FaPlay />}
                colorScheme="primary"
                size="sm"
                onClick={() => onPlay(episode)}
                isDisabled={!episode.available}
                isLoading={isLoading}
                loadingText="Reproduint"
                flex={1}
                borderRadius="full"
                _hover={{
                  transform: 'scale(1.02)',
                }}
                transition="all 0.2s"
              >
                {isCurrentlyPlaying ? 'Reproduint' : 'Reproduir'}
              </Button>
              <Tooltip
                label={isFav ? 'Eliminar dels favorits' : 'Afegir als favorits'}
                placement="top"
                hasArrow
              >
                <Button
                  size="sm"
                  variant={isFav ? 'solid' : 'ghost'}
                  colorScheme={isFav ? 'red' : 'gray'}
                  borderRadius="full"
                  onClick={handleFavouriteClick}
                  _hover={{ 
                    bg: isFav ? 'red.600' : 'red.50',
                    color: isFav ? 'white' : 'red.500',
                    transform: 'scale(1.1)'
                  }}
                  transition="all 0.2s"
                >
                  <Icon as={FaHeart} color={isFav ? 'white' : 'red.400'} />
                </Button>
              </Tooltip>
              <Tooltip
                label={isListen ? 'Marcar com no escoltat' : 'Marcar com escoltat'}
                placement="top"
                hasArrow
              >
                <Button
                  size="sm"
                  variant={isListen ? 'solid' : 'ghost'}
                  colorScheme={isListen ? 'green' : 'gray'}
                  borderRadius="full"
                  onClick={handleListenedClick}
                  _hover={{ 
                    bg: isListen ? 'green.600' : 'green.50',
                    color: isListen ? 'white' : 'green.500',
                    transform: 'scale(1.1)'
                  }}
                  transition="all 0.2s"
                >
                  <Icon as={FaCheck} color={isListen ? 'white' : 'green.400'} />
                </Button>
              </Tooltip>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  )
})
