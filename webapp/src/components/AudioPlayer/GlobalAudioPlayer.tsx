import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Avatar,
  Progress,
} from '@chakra-ui/react'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaHeart } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import { formatDuration } from '@/utils/dataLoader'

export function GlobalAudioPlayer() {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    seek,
    setVolume,
  } = useAudioPlayer()


  if (!currentEpisode) {
    return null
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const handleSeek = (value: number) => {
    seek(value)
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value / 100)
  }

  const getVolumeIcon = () => {
    if (volume === 0) return FaVolumeMute
    if (volume < 0.5) return FaVolumeDown
    return FaVolumeUp
  }

  const VolumeIcon = getVolumeIcon()
  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bgGradient="linear(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)"
          backdropFilter="blur(20px)"
          borderTop="1px"
          borderColor="rgba(255,255,255,0.2)"
          shadow="2xl"
          zIndex={1000}
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            bgGradient: 'linear(90deg, primary.500, secondary.500, accent.500)',
          }}
        >
          {/* Progress Bar */}
          <Progress
            value={progress}
            size="xs"
            colorScheme="primary"
            bg="transparent"
            position="absolute"
            top={0}
            left={0}
            right={0}
          />
          
          <VStack spacing={3} p={4} maxW="container.xl" mx="auto">
            {/* Main Controls */}
            <HStack spacing={6} w="full" align="center">
              {/* Episode Avatar & Info */}
              <HStack spacing={4} flex="1" minW={0}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar
                    size="md"
                    name={currentEpisode.title}
                    bg="primary.500"
                    color="white"
                    fontWeight="bold"
                  />
                </motion.div>
                <VStack align="start" spacing={0} flex="1" minW={0}>
                  <Text fontSize="sm" fontWeight="bold" noOfLines={1} color="gray.800">
                    {currentEpisode.title}
                  </Text>
                  <Text fontSize="xs" color="gray.600" noOfLines={1}>
                    En Guàrdia - Història de Catalunya
                  </Text>
                </VStack>
              </HStack>

              {/* Play Controls */}
              <HStack spacing={4}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconButton
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    icon={isPlaying ? <FaPause /> : <FaPlay />}
                    onClick={handlePlayPause}
                    colorScheme="primary"
                    size="lg"
                    borderRadius="full"
                    shadow="lg"
                    _hover={{
                      shadow: 'xl',
                      transform: 'scale(1.05)',
                    }}
                    transition="all 0.2s"
                  />
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconButton
                    aria-label="Add to favorites"
                    icon={<FaHeart />}
                    variant="ghost"
                    colorScheme="primary"
                    size="sm"
                    borderRadius="full"
                  />
                </motion.div>
              </HStack>

              {/* Time & Progress */}
              <VStack spacing={1} minW="200px" display={{ base: 'none', md: 'flex' }}>
                <HStack spacing={2} w="full">
                  <Text fontSize="xs" color="gray.600" minW="12" textAlign="right">
                    {formatDuration(Math.floor(currentTime))}
                  </Text>
                  <Slider
                    value={currentTime}
                    max={duration || 100}
                    onChange={handleSeek}
                    colorScheme="primary"
                    size="sm"
                    flex="1"
                  >
                    <SliderTrack bg="gray.200" borderRadius="full">
                      <SliderFilledTrack borderRadius="full" />
                    </SliderTrack>
                    <SliderThumb 
                      boxSize={3}
                      _focus={{ boxShadow: '0 0 0 3px rgba(211,47,47,0.3)' }}
                    />
                  </Slider>
                  <Text fontSize="xs" color="gray.600" minW="12">
                    {formatDuration(Math.floor(duration))}
                  </Text>
                </HStack>
              </VStack>

              {/* Volume Control */}
              <HStack spacing={2} minW="120px" display={{ base: 'none', lg: 'flex' }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconButton
                    aria-label="Volume"
                    icon={<VolumeIcon />}
                    variant="ghost"
                    size="sm"
                    color="gray.600"
                    onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                  />
                </motion.div>
                <Slider
                  value={volume * 100}
                  onChange={handleVolumeChange}
                  colorScheme="primary"
                  size="sm"
                  maxW="80px"
                >
                  <SliderTrack bg="gray.200" borderRadius="full">
                    <SliderFilledTrack borderRadius="full" />
                  </SliderTrack>
                  <SliderThumb 
                    boxSize={2.5}
                    _focus={{ boxShadow: '0 0 0 3px rgba(211,47,47,0.3)' }}
                  />
                </Slider>
              </HStack>
            </HStack>

            {/* Mobile Progress Bar */}
            <Box w="full" display={{ base: 'block', md: 'none' }}>
              <HStack spacing={2} w="full" mb={1}>
                <Text fontSize="xs" color="gray.600">
                  {formatDuration(Math.floor(currentTime))}
                </Text>
                <Text fontSize="xs" color="gray.600" ml="auto">
                  {formatDuration(Math.floor(duration))}
                </Text>
              </HStack>
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={handleSeek}
                colorScheme="primary"
                size="sm"
              >
                <SliderTrack bg="gray.200" borderRadius="full">
                  <SliderFilledTrack borderRadius="full" />
                </SliderTrack>
                <SliderThumb 
                  boxSize={3}
                  _focus={{ boxShadow: '0 0 0 3px rgba(211,47,47,0.3)' }}
                />
              </Slider>
            </Box>
          </VStack>
        </Box>
      </motion.div>
    </AnimatePresence>
  )
}
