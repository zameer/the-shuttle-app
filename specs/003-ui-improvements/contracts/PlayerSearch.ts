// PlayerSearch.ts
// Contract for player search functionality (US1)
// Used by: PlayerSelectCombobox component
// Feature: Admin can search players by name OR mobile number

export interface PlayerSearchQuery {
  searchTerm: string;
  limit?: number; // default: 10
  searchMode?: 'name' | 'mobile' | 'both'; // default: 'both'
}

export interface PlayerSearchResult {
  phone_number: string; // Primary key; player identifier
  name: string; // Player full name
  address?: string; // Optional player address
}

export interface PlayerSearchResponse {
  results: PlayerSearchResult[];
  totalCount: number;
  query: PlayerSearchQuery;
  executedAt: string; // ISO 8601 timestamp
}

// Error cases
export interface PlayerSearchError {
  code: 'INVALID_SEARCH_TERM' | 'DATABASE_ERROR' | 'UNAUTHORIZED';
  message: string;
}

// React Query Hook signature
export interface UsePlayerSearchOptions {
  debounceMs?: number; // default: 300
  enabled?: boolean; // default: true
}

// Expected Hook Usage:
// const { data, isLoading, error } = usePlayerSearch(searchTerm, options);
