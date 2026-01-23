'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { PlaceSearchParams } from '@/types/restaurant';

export type SortOption = 'distance' | 'name' | 'rating';

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  searchParams: PlaceSearchParams | null;
  setSearchParams: (params: PlaceSearchParams | null) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [searchParams, setSearchParams] = useState<PlaceSearchParams | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  const clearSearch = () => {
    setQuery('');
    setSearchParams(null);
  };

  return (
    <SearchContext.Provider value={{ query, setQuery, searchParams, setSearchParams, sortBy, setSortBy, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}

export function useSearchContextOptional() {
  return useContext(SearchContext);
}
