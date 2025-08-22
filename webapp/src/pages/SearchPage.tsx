import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Badge,
  SimpleGrid,
  Select,
  Wrap,
  WrapItem,
  Heading,
  Divider,
  InputGroup,
  InputLeftElement,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  Collapse,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaTags, FaTimes } from 'react-icons/fa';
import { useEpisodes } from '../contexts/EpisodesContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { EpisodeCard } from '../components/EpisodeCard';
import { useDebounce } from '../hooks/useDebounce';

interface TagGroup {
  name: string;
  tags: string[];
  color: string;
}

export function SearchPage() {
  const { episodes, isLoading, error } = useEpisodes();
  const { currentEpisode, play, isBuffering } = useAudioPlayer();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // UI state
  const { isOpen: isFiltersOpen, onToggle: onToggleFilters } = useDisclosure();
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
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
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
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
      
      return true;
    });
    
    // Sort episodes
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.parsedDate).getTime() - new Date(b.parsedDate).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ca');
          break;
        case 'duration':
          // Simple duration comparison (assumes HH:MM:SS or MM:SS format)
          const aDuration = a.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
          const bDuration = b.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
          comparison = aDuration - bDuration;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [episodes, debouncedSearchTerm, selectedTags, sortBy, sortOrder]);
  
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
    setSearchTerm('');
    setSelectedTags([]);
  };
  
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.500" />
          <Text>Carregant episodis...</Text>
        </VStack>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Error carregant els episodis: {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2}>Cerca i Filtra Episodis</Heading>
          <Text color="gray.600">
            Troba episodis per títol, descripció o etiquetes
          </Text>
        </Box>
        
        {/* Search Bar */}
        <InputGroup size="lg">
          <InputLeftElement>
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Cerca per títol, descripció o etiquetes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
            borderRadius="full"
            _focus={{
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)'
            }}
          />
          {searchTerm && (
            <IconButton
              aria-label="Clear search"
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              position="absolute"
              right={2}
              top="50%"
              transform="translateY(-50%)"
              onClick={() => setSearchTerm('')}
            />
          )}
        </InputGroup>
        
        {/* Filters Toggle and Results Count */}
        <HStack justify="space-between" wrap="wrap">
          <Button
            leftIcon={<Icon as={FaFilter} />}
            onClick={onToggleFilters}
            variant="outline"
            size="sm"
          >
            {isFiltersOpen ? 'Amagar Filtres' : 'Mostrar Filtres'}
          </Button>
          
          <HStack spacing={2} wrap="wrap">
            <Text fontSize="sm" color="gray.600">
              {filteredEpisodes.length} de {episodes.length} episodis
            </Text>
            {(selectedTags.length > 0 || searchTerm) && (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Netejar filtres
              </Button>
            )}
          </HStack>
        </HStack>
        
        {/* Advanced Filters */}
        <Collapse in={isFiltersOpen}>
          <Box bg="gray.50" p={6} borderRadius="xl" border="1px" borderColor="gray.200">
            <VStack spacing={6} align="stretch">
              {/* Sort Options */}
              <HStack spacing={4} wrap="wrap">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Ordenar per:</Text>
                  <HStack>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      size="sm"
                      bg="white"
                      maxW="150px"
                    >
                      <option value="date">Data</option>
                      <option value="title">Títol</option>
                      <option value="duration">Durada</option>
                    </Select>
                    <Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      size="sm"
                      bg="white"
                      maxW="150px"
                    >
                      <option value="desc">Descendent</option>
                      <option value="asc">Ascendent</option>
                    </Select>
                  </HStack>
                </Box>
              </HStack>
              
              <Divider />
              
              {/* Tag Groups */}
              <Box>
                <HStack mb={4}>
                  <Icon as={FaTags} color="blue.500" />
                  <Text fontSize="lg" fontWeight="medium">
                    Etiquetes ({selectedTags.length} seleccionades)
                  </Text>
                </HStack>
                
                <Accordion allowMultiple defaultIndex={[0]}>
                  {tagGroups.map((group) => (
                    <AccordionItem key={group.name} border="1px" borderColor="gray.200" borderRadius="md" mb={2}>
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
                                // Make badges more touch-friendly on mobile
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
          <Box bg="blue.50" p={4} borderRadius="lg" border="1px" borderColor="blue.200">
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
            </Wrap>
          </Box>
        )}
        
        {/* Results */}
        {filteredEpisodes.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500" mb={2}>
              No s'han trobat episodis
            </Text>
            <Text color="gray.400">
              Prova a modificar els criteris de cerca
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredEpisodes.map((episode, index) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                index={index}
                onPlay={play}
                isCurrentlyPlaying={currentEpisode?.id === episode.id}
                isLoading={isBuffering}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}
