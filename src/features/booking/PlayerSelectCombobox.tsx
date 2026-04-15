import { useState, useRef, useEffect } from 'react'
import { usePlayerSearch, useCreatePlayer } from '@/features/players/usePlayers'
import type { PlayerSearchMode } from '@/features/players/usePlayers'
import { Loader2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (phoneNumber: string) => void
  error?: string
  searchMode?: PlayerSearchMode  // US1: Support name, mobile, or both (default: both)
}

export default function PlayerSelectCombobox({ value, onChange, error, searchMode = 'both' }: Props) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // US1: Enhanced search with support for name, mobile, or both
  const { data: players = [], isLoading } = usePlayerSearch(searchTerm, { searchMode })
  const { mutateAsync: createPlayer, isPending: isCreating } = useCreatePlayer()

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (phoneNumber: string) => {
    setSearchTerm(phoneNumber)
    onChange(phoneNumber)
    setIsOpen(false)
  }

  const handleCreate = async () => {
    if (!searchTerm || searchTerm.length < 5) {
      alert('Please enter a valid phone number format first.')
      return
    }
    
    // Strip spaces/hyphens standardizing the format
    const cleanedNumber = searchTerm.replace(/[\s-]/g, '')
    
    try {
      await createPlayer({ phone_number: cleanedNumber, name: newName, address: newAddress })
      handleSelect(cleanedNumber)
      setNewName('')
      setNewAddress('')
    } catch (e: any) {
      alert('Failed to create player: ' + e.message)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* US1: Enhanced label to reflect dual search capability */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Player {searchMode === 'name' ? 'Name' : searchMode === 'mobile' ? 'Phone Number' : 'Name or Phone Number'}
      </label>
      <input
        type="text"
        placeholder={
          searchMode === 'name' 
            ? 'e.g. John Smith' 
            : searchMode === 'mobile'
            ? 'e.g. 0771234567'
            : 'Search by name or phone (e.g. John or 0771234567)'
        }
        value={searchTerm}
        className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${error ? 'border-red-500' : 'border-gray-300'}`}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          onChange(e.target.value)
          setIsOpen(true)
        }}
        onClick={() => setIsOpen(true)}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {isOpen && searchTerm.length >= 3 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading && (
            <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching...
            </div>
          )}
          
          {!isLoading && players.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 uppercase">Existing Players</div>
              {players.map(p => (
                <div 
                  key={p.phone_number}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelect(p.phone_number)}
                >
                  {/* US1: Display both name and phone number for better identification */}
                  <div className="font-medium text-gray-900">
                    {p.name ? `${p.name}` : 'Unknown Player'}
                  </div>
                  <div className="text-xs text-gray-500">{p.phone_number}</div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && players.length === 0 && searchTerm.length >= 3 && (
            <div className="p-3 text-sm text-gray-500 text-center">
              No players found. Try different search terms or create a new player below.
            </div>
          )}

          {!isLoading && !players.some(p => p.phone_number === searchTerm.replace(/[\s-]/g, '')) && (
            <div className="border-t p-3 bg-gray-50 flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">New Player Info</span>
              <input 
                type="text" 
                placeholder="Name (Optional)" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
              <input 
                type="text" 
                placeholder="Address (Optional)" 
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 rounded text-sm font-medium transition-colors"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>+ Save New Player: <b className="tracking-wider">{searchTerm}</b></span>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
