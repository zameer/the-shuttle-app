import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useState, useEffect } from 'react'

export interface Player {
  phone_number: string
  name: string | null
  address: string | null
}

// Search mode types for dual-field search (US1)
export type PlayerSearchMode = 'name' | 'mobile' | 'both'

interface UsePlayerSearchOptions {
  debounceMs?: number
  searchMode?: PlayerSearchMode
}

/**
 * Enhanced player search hook supporting name, mobile, or both search modes (US1)
 * 
 * @param query - Search term (minimum 3 characters)
 * @param options - Configuration options including debounce and search mode
 * @returns Query result with Player[] array
 * 
 * @example
 * // Search by both name and mobile (default)
 * const { data } = usePlayerSearch(searchTerm)
 * 
 * @example
 * // Search by name only
 * const { data } = usePlayerSearch(searchTerm, { searchMode: 'name' })
 * 
 * @example
 * // Search by mobile only
 * const { data } = usePlayerSearch(searchTerm, { searchMode: 'mobile' })
 */
export function usePlayerSearch(query: string, options: UsePlayerSearchOptions = {}) {
  const { debounceMs = 300, searchMode = 'both' } = options
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce search query (300ms default)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [query, debounceMs])

  return useQuery({
    queryKey: ['players', debouncedQuery, searchMode],
    queryFn: async (): Promise<Player[]> => {
      if (!debouncedQuery || debouncedQuery.length < 3) return []
      
      try {
        let finalQuery = supabase
          .from('players')
          .select('*')
          .limit(10)

        // Apply search filters based on search mode (US1: dual search)
        if (searchMode === 'name') {
          // Search by name only (case-insensitive partial match)
          finalQuery = finalQuery.ilike('name', `%${debouncedQuery}%`)
        } else if (searchMode === 'mobile') {
          // Search by mobile number (case-insensitive partial match)
          finalQuery = finalQuery.ilike('phone_number', `%${debouncedQuery}%`)
        } else {
          // 'both' mode: Search by name OR mobile (client-side OR logic)
          // Fetch all players matching either name or phone, then filter client-side
          const { data: byName, error: nameError } = await supabase
            .from('players')
            .select('*')
            .ilike('name', `%${debouncedQuery}%`)
            .limit(10)

          const { data: byPhone, error: phoneError } = await supabase
            .from('players')
            .select('*')
            .ilike('phone_number', `%${debouncedQuery}%`)
            .limit(10)

          if (nameError || phoneError) {
            throw new Error(nameError?.message || phoneError?.message)
          }

          // Merge results and remove duplicates (by phone_number)
          const mergedResults = [...(byName || []), ...(byPhone || [])]
          const uniqueResults = Array.from(
            new Map(mergedResults.map(player => [player.phone_number, player])).values()
          )
          return uniqueResults
        }

        // For single search modes, execute the query
        if (searchMode !== 'both') {
          const { data, error } = await finalQuery
          if (error) throw new Error(error.message)
          return (data as Player[]) || []
        }

        return []
      } catch (error) {
        console.error('Player search error:', error)
        throw error
      }
    },
    enabled: debouncedQuery.length >= 3
  })
}

export function useCreatePlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ phone_number, name, address }: { phone_number: string, name?: string, address?: string }) => {
      const { data, error } = await supabase
        .from('players')
        .insert([{ phone_number, name: name || null, address: address || null }])
        .select()
        .single()
        
      if (error) throw new Error(error.message)
      return data as Player
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
    }
  })
}
