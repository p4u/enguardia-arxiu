import { useLocalStorage } from './useLocalStorage';

export interface SearchFilters {
  searchTerm: string;
  selectedTags: string[];
  sortBy: 'date' | 'title' | 'duration';
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_FILTERS: SearchFilters = {
  searchTerm: '',
  selectedTags: [],
  sortBy: 'date',
  sortOrder: 'desc',
};

const STORAGE_KEY = 'enguardia-search-filters';

/**
 * Custom hook to manage search filters with localStorage persistence
 */
export function usePersistedSearchFilters() {
  const [filters, setFilters] = useLocalStorage<SearchFilters>(STORAGE_KEY, DEFAULT_FILTERS);

  // Individual setters for each filter
  const setSearchTerm = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const setSelectedTags = (selectedTags: string[] | ((prev: string[]) => string[])) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: typeof selectedTags === 'function' ? selectedTags(prev.selectedTags) : selectedTags
    }));
  };

  const setSortBy = (sortBy: 'date' | 'title' | 'duration') => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const setSortOrder = (sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortOrder }));
  };

  // Helper to toggle a tag
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    // Current filter values
    searchTerm: filters.searchTerm,
    selectedTags: filters.selectedTags,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    
    // Setters
    setSearchTerm,
    setSelectedTags,
    setSortBy,
    setSortOrder,
    
    // Helpers
    toggleTag,
    clearFilters,
  };
}
