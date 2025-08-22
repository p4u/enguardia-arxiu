import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Button,
  HStack,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useColorModeValue,
  Icon,
  Flex,
  IconButton,
  Wrap,
  WrapItem,
  Divider,
  Collapse,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { FaPlay, FaCalendarAlt, FaClock, FaHeart, FaShare, FaFilter, FaTags, FaTimes, FaCheck, FaEyeSlash } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useEpisodes } from '@/contexts/EpisodesContext'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import { useUserPreferences } from '@/contexts/UserPreferencesContext'
import { EpisodeCard } from '@/components/EpisodeCard'
import { useDebounce } from '@/hooks/useDebounce'
import type { Episode } from '@/types/episode'

interface TagGroup {
  name: string;
  tags: string[];
  color: string;
}

export function HomePage() {
  const episodesContext = useEpisodes()
  const { episodes, isLoading, error } = episodesContext
  const { play, currentEpisode, isPlaying } = useAudioPlayer()
  const { favourites, listened } = useUserPreferences()
  
  console.log('HomePage: Full useEpisodes context:', episodesContext)
  console.log('HomePage: Rendering with:', {
    episodesCount: episodes.length,
    isLoading,
    error,
    hasEpisodes: episodes.length > 0,
    favouritesCount: favourites.size,
    listenedCount: listened.size
  })
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy] = useState<'date'>('date') // Only date sorting allowed
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc') // Default to most recent first
  const [currentPage, setCurrentPage] = useState(1)
  const episodesPerPage = 24 // 8 rows x 3 columns on desktop

  // New filter states
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false)
  const [showListenedOnly, setShowListenedOnly] = useState(false)
  const [hideFavourites, setHideFavourites] = useState(false)
  const [hideListened, setHideListened] = useState(false)

  // UI state
  const { isOpen: isFiltersOpen, onToggle: onToggleFilters } = useDisclosure()
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Color mode values
  const searchBoxBg = useColorModeValue('white', 'gray.800')
  const searchBoxBorder = useColorModeValue('gray.100', 'gray.600')
  const inputBg = useColorModeValue('gray.50', 'gray.700')
  const inputBorder = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const filtersBg = useColorModeValue('gray.50', 'gray.700')
  const filtersBorder = useColorModeValue('gray.200', 'gray.600')
  const selectedTagsBg = useColorModeValue('blue.50', 'blue.900')
  const selectedTagsBorder = useColorModeValue('blue.200', 'blue.700')
  const accordionBorder = useColorModeValue('gray.200', 'gray.600')

  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Group tags by category for better organization
  const tagGroups = useMemo((): TagGroup[] => {
    const allTags = new Set<string>();
    episodes.forEach(episode => {
      if (episode.tags) {
        episode.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    const tagArray = Array.from(allTags).sort();
    
    // Group tags by common themes
    const groups: TagGroup[] = [
      {
        name: 'Períodes Històrics',
        tags: tagArray.filter(tag => 
          tag.includes('segle') || 
          tag.includes('edat-') || 
          tag.includes('antiguitat') || 
          tag.includes('contemporani') ||
          tag.includes('prehistoria')
        ),
        color: 'blue'
      },
      {
        name: 'Temàtiques',
        tags: tagArray.filter(tag => 
          ['cultura', 'guerra', 'politica', 'economia', 'religio', 'ciencia', 'art', 'arquitectura', 'musica', 'literatura', 'medicina', 'tecnologia'].some(theme => tag.includes(theme))
        ),
        color: 'purple'
      },
      {
        name: 'Geografies',
        tags: tagArray.filter(tag => 
          ['catalunya', 'espanya', 'europa', 'mediterrania', 'america', 'africa', 'asia'].some(geo => tag.includes(geo)) ||
          ['barcelona', 'girona', 'lleida', 'tarragona', 'valencia', 'mallorca', 'menorca'].some(city => tag.includes(city))
        ),
        color: 'green'
      },
      {
        name: 'Civilitzacions i Pobles',
        tags: tagArray.filter(tag => 
          ['romans', 'grecs', 'arabs', 'catalans', 'espanyols', 'francesos', 'ibers', 'visigots', 'jueus', 'cristians'].some(people => tag.includes(people))
        ),
        color: 'orange'
      },
      {
        name: 'Esdeveniments',
        tags: tagArray.filter(tag => 
          tag.includes('guerra-') || 
          tag.includes('batalla-') || 
          tag.includes('setge-') ||
          tag.includes('revolucio') ||
          tag.includes('creuades') ||
          tag.includes('descobriments')
        ),
        color: 'teal'
      }
    ];
    
    // Add remaining tags to a general group
    const usedTags = new Set(groups.flatMap(g => g.tags));
    const remainingTags = tagArray.filter(tag => !usedTags.has(tag));
    
    if (remainingTags.length > 0) {
      groups.push({
        name: 'Altres',
        tags: remainingTags,
        color: 'gray'
      });
    }
    
    return groups.filter(group => group.tags.length > 0);
  }, [episodes]);

  // Filter and sort episodes
  const filteredEpisodes = useMemo(() => {
    let filtered = episodes.filter(episode => {
      // Text search
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesTitle = episode.title.toLowerCase().includes(searchLower);
        const matchesDescription = episode.description.toLowerCase().includes(searchLower);
        const matchesTags = episode.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false;
        }
      }
      
      // Tag filter - episode must have ALL selected tags
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag => 
          episode.tags?.includes(tag)
        );
        if (!hasAllTags) return false;
      }

      // Favourite/Listened filters
      const isFav = favourites.has(episode.id)
      const isListen = listened.has(episode.id)

      // Show only favourites
      if (showFavouritesOnly && !isFav) {
        return false;
      }

      // Show only listened
      if (showListenedOnly && !isListen) {
        return false;
      }

      // Hide favourites
      if (hideFavourites && isFav) {
        return false;
      }

      // Hide listened
      if (hideListened && isListen) {
        return false;
      }
      
      return true;
    });
    
    // Sort episodes by date only
    filtered.sort((a, b) => {
      const comparison = new Date(a.parsedDate).getTime() - new Date(b.parsedDate).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [episodes, debouncedSearchQuery, selectedTags, sortBy, sortOrder, favourites, listened, showFavouritesOnly, showListenedOnly, hideFavourites, hideListened]);

  // Pagination logic
  const { paginatedEpisodes, totalPages, startIndex, endIndex } = useMemo(() => {
    console.log('HomePage: Computing pagination with:', {
      filteredEpisodesCount: filteredEpisodes.length,
      currentPage,
      episodesPerPage
    })
    
    const start = (currentPage - 1) * episodesPerPage
    const end = start + episodesPerPage
    const paginated = filteredEpisodes.slice(start, end)
    const total = Math.ceil(filteredEpisodes.length / episodesPerPage)
    
    console.log('HomePage: Pagination result:', {
      paginatedCount: paginated.length,
      totalPages: total,
      startIndex: start + 1,
      endIndex: Math.min(end, filteredEpisodes.length),
      first3Titles: paginated.slice(0, 3).map(e => e.title)
    })
    
    return {
      paginatedEpisodes: paginated,
      totalPages: total,
      startIndex: start + 1,
      endIndex: Math.min(end, filteredEpisodes.length)
    }
  }, [filteredEpisodes, currentPage, episodesPerPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedTags, showFavouritesOnly, showListenedOnly, hideFavourites, hideListened])

  const handlePlayEpisode = useCallback((episode: Episode) => {
    play(episode)
  }, [play])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, totalPages, goToPage])

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  // Get most popular tags for quick access
  const popularTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    episodes.forEach(episode => {
      episode.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [episodes]);

  if (isLoading) {
    return (
      <VStack spacing={4} py={20}>
        <Spinner size="xl" color="primary.500" />
        <Text>Carregant episodis...</Text>
      </VStack>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error carregant les dades: {error}
      </Alert>
    )
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Box 
          bg={searchBoxBg} 
          p={8} 
          borderRadius="2xl" 
          shadow="xl"
          border="1px"
          borderColor={searchBoxBorder}
          _hover={{ shadow: '2xl' }}
          transition="all 0.3s"
        >
          <VStack spacing={6}>
            {/* Search Bar */}
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" h="full">
                <SearchIcon color="primary.400" />
              </InputLeftElement>
              <Input
                placeholder="Cerca episodis per títol, descripció o etiquetes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="full"
                border="2px"
                borderColor={inputBorder}
                _hover={{ borderColor: 'primary.300' }}
                _focus={{ 
                  borderColor: 'primary.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)'
                }}
                bg={inputBg}
                fontSize="md"
                h="14"
              />
              {searchQuery && (
                <IconButton
                  aria-label="Clear search"
                  icon={<FaTimes />}
                  size="sm"
                  variant="ghost"
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={() => setSearchQuery('')}
                />
              )}
            </InputGroup>
            
            {/* Sort Options - Only Date Order */}
            <HStack spacing={4} w="full" flexWrap="wrap" justify="center">
              <Box>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  borderRadius="full"
                  border="2px"
                  borderColor={inputBorder}
                  _hover={{ borderColor: 'accent.300' }}
                  _focus={{ 
                    borderColor: 'accent.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)'
                  }}
                  bg={inputBg}
                  h="12"
                  minW="200px"
                >
                  <option value="desc">Més recents primer</option>
                  <option value="asc">Més antics primer</option>
                </Select>
              </Box>
            </HStack>
            
            {/* Popular Tags - Always Visible */}
            <VStack spacing={4} w="full">
              <HStack spacing={2} wrap="wrap" justify="center">
                <Icon as={FaTags} color="blue.500" />
                <Text fontSize="md" color={textColor} fontWeight="medium">
                  Etiquetes populars:
                </Text>
              </HStack>
              <Wrap spacing={2} justify="center">
                {popularTags.map((tag) => (
                  <WrapItem key={tag}>
                    <Badge
                      as="button"
                      colorScheme={selectedTags.includes(tag) ? 'blue' : 'gray'}
                      variant={selectedTags.includes(tag) ? 'solid' : 'outline'}
                      cursor="pointer"
                      onClick={() => handleTagToggle(tag)}
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="sm"
                      textTransform="none"
                      _hover={{
                        transform: 'scale(1.05)',
                      }}
                      transition="all 0.2s"
                      minH="32px"
                    >
                      {tag}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>

            {/* Advanced Filters Toggle */}
            <Button
              leftIcon={<Icon as={FaFilter} />}
              onClick={onToggleFilters}
              variant="outline"
              size="sm"
              colorScheme="blue"
            >
              {isFiltersOpen ? 'Amagar Filtres Avançats' : 'Mostrar Tots els Filtres'}
            </Button>
          </VStack>
        </Box>
      </motion.div>

      {/* Advanced Filters */}
      <Collapse in={isFiltersOpen}>
        <Box bg={filtersBg} p={6} borderRadius="xl" border="1px" borderColor={filtersBorder}>
          <VStack spacing={6} align="stretch">
            {/* Favourite and Listened Filters */}
            <Box>
              <HStack mb={4}>
                <Icon as={FaHeart} color="red.500" />
                <Text fontSize="lg" fontWeight="medium">
                  Filtres de Favorits i Escoltats
                </Text>
              </HStack>
              
              <Wrap spacing={3}>
                <WrapItem>
                  <Button
                    leftIcon={<Icon as={FaHeart} />}
                    size="sm"
                    variant={showFavouritesOnly ? 'solid' : 'outline'}
                    colorScheme="red"
                    onClick={() => {
                      setShowFavouritesOnly(!showFavouritesOnly)
                      if (!showFavouritesOnly) setHideFavourites(false) // Can't hide and show only at same time
                    }}
                    borderRadius="full"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    Només Favorits ({favourites.size})
                  </Button>
                </WrapItem>
                
                <WrapItem>
                  <Button
                    leftIcon={<Icon as={FaCheck} />}
                    size="sm"
                    variant={showListenedOnly ? 'solid' : 'outline'}
                    colorScheme="green"
                    onClick={() => {
                      setShowListenedOnly(!showListenedOnly)
                      if (!showListenedOnly) setHideListened(false) // Can't hide and show only at same time
                    }}
                    borderRadius="full"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    Només Escoltats ({listened.size})
                  </Button>
                </WrapItem>
                
                <WrapItem>
                  <Button
                    leftIcon={<Icon as={FaEyeSlash} />}
                    size="sm"
                    variant={hideFavourites ? 'solid' : 'outline'}
                    colorScheme="gray"
                    onClick={() => {
                      setHideFavourites(!hideFavourites)
                      if (!hideFavourites) setShowFavouritesOnly(false) // Can't hide and show only at same time
                    }}
                    borderRadius="full"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    Amagar Favorits
                  </Button>
                </WrapItem>
                
                <WrapItem>
                  <Button
                    leftIcon={<Icon as={FaEyeSlash} />}
                    size="sm"
                    variant={hideListened ? 'solid' : 'outline'}
                    colorScheme="gray"
                    onClick={() => {
                      setHideListened(!hideListened)
                      if (!hideListened) setShowListenedOnly(false) // Can't hide and show only at same time
                    }}
                    borderRadius="full"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    Amagar Escoltats
                  </Button>
                </WrapItem>
              </Wrap>
            </Box>

            <Divider />

            {/* Tag Groups */}
            <Box>
              <HStack mb={4}>
                <Icon as={FaTags} color="blue.500" />
                <Text fontSize="lg" fontWeight="medium">
                  Totes les Etiquetes ({selectedTags.length} seleccionades)
                </Text>
              </HStack>
              
              <Accordion allowMultiple defaultIndex={[0, 1]}>
                {tagGroups.map((group, index) => (
                  <AccordionItem key={group.name} border="1px" borderColor={accordionBorder} borderRadius="md" mb={2}>
                    <AccordionButton _expanded={{ bg: `${group.color}.50` }}>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="medium" color={`${group.color}.600`}>
                          {group.name} ({group.tags.length})
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Wrap spacing={2}>
                        {group.tags.map(tag => (
                          <WrapItem key={tag}>
                            <Badge
                              as="button"
                              colorScheme={selectedTags.includes(tag) ? group.color : 'gray'}
                              variant={selectedTags.includes(tag) ? 'solid' : 'outline'}
                              cursor="pointer"
                              onClick={() => handleTagToggle(tag)}
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize={isMobile ? 'sm' : 'xs'}
                              textTransform="none"
                              _hover={{
                                transform: 'scale(1.05)',
                              }}
                              transition="all 0.2s"
                              minH={isMobile ? '32px' : '24px'}
                              minW={isMobile ? '60px' : 'auto'}
                            >
                              {tag}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Box>
          </VStack>
        </Box>
      </Collapse>

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <Box bg={selectedTagsBg} p={4} borderRadius="lg" border="1px" borderColor={selectedTagsBorder}>
          <Text fontSize="sm" fontWeight="medium" mb={2}>Filtres actius:</Text>
          <Wrap spacing={2}>
            {selectedTags.map(tag => (
              <WrapItem key={tag}>
                <Badge
                  colorScheme="blue"
                  variant="solid"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                  cursor="pointer"
                  onClick={() => handleTagToggle(tag)}
                  _hover={{ opacity: 0.8 }}
                >
                  {tag} ×
                </Badge>
              </WrapItem>
            ))}
            <WrapItem>
              <Button size="xs" variant="ghost" onClick={clearFilters}>
                Netejar tots
              </Button>
            </WrapItem>
          </Wrap>
        </Box>
      )}

      {/* Results Info */}
      {filteredEpisodes.length > 0 && (
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Text fontSize="sm" color={mutedTextColor}>
            Mostrant {startIndex}-{endIndex} de {filteredEpisodes.length} episodis
          </Text>
          <Text fontSize="sm" color={mutedTextColor}>
            Pàgina {currentPage} de {totalPages}
          </Text>
        </Flex>
      )}

      {/* Episodes Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {(() => {
          console.log('HomePage: Rendering episodes grid with:', {
            paginatedEpisodesCount: paginatedEpisodes.length,
            episodes: paginatedEpisodes.map(e => ({ id: e.id, title: e.title }))
          })
          
          return paginatedEpisodes.map((episode, index) => {
            console.log(`HomePage: Rendering episode ${index + 1}:`, {
              id: episode.id,
              title: episode.title,
              available: episode.available
            })
            
            return (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                index={index}
                onPlay={handlePlayEpisode}
                isCurrentlyPlaying={currentEpisode?.id === episode.id && isPlaying}
                isLoading={currentEpisode?.id === episode.id && isPlaying}
              />
            )
          })
        })()}
      </SimpleGrid>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex justify="center" align="center" gap={4} wrap="wrap">
            <IconButton
              aria-label="Pàgina anterior"
              icon={<ChevronLeftIcon />}
              onClick={goToPreviousPage}
              isDisabled={currentPage === 1}
              variant="outline"
              colorScheme="primary"
              borderRadius="full"
              _hover={{ transform: 'scale(1.05)' }}
              transition="all 0.2s"
            />
            
            <HStack spacing={2}>
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => goToPage(1)}
                    borderRadius="full"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    1
                  </Button>
                  {currentPage > 4 && <Text color="gray.500">...</Text>}
                </>
              )}
              
              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? 'solid' : 'outline'}
                    colorScheme={currentPage === pageNum ? 'primary' : 'gray'}
                    onClick={() => goToPage(pageNum)}
                    borderRadius="full"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    {pageNum}
                  </Button>
                )
              })}
              
              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <Text color="gray.500">...</Text>}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => goToPage(totalPages)}
                    borderRadius="full"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </HStack>
            
            <IconButton
              aria-label="Pàgina següent"
              icon={<ChevronRightIcon />}
              onClick={goToNextPage}
              isDisabled={currentPage === totalPages}
              variant="outline"
              colorScheme="primary"
              borderRadius="full"
              _hover={{ transform: 'scale(1.05)' }}
              transition="all 0.2s"
            />
          </Flex>
        </motion.div>
      )}

      {filteredEpisodes.length === 0 && (
        <Box textAlign="center" py={20}>
          <Text fontSize="lg" color="gray.500" mb={2}>
            No s'han trobat episodis amb els criteris de cerca actuals.
          </Text>
          <Text color="gray.400">
            Prova a modificar els criteris de cerca o etiquetes.
          </Text>
        </Box>
      )}
    </VStack>
  )
}
