import { useState, useRef, useEffect } from 'react'
import { usePlayerSearch, useCreatePlayer } from '@/features/players/usePlayers'
import { Loader2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (phoneNumber: string) => void
  error?: string
}

export default function PlayerSelectCombobox({ value, onChange, error }: Props) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { data: players = [], isLoading } = usePlayerSearch(searchTerm)
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
      <label className="block text-sm font-medium text-gray-700 mb-1">Player Phone Number</label>
      <input
        type="text"
        placeholder="e.g. 0771234567"
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
                  <span className="font-medium text-gray-900">{p.phone_number}</span>
                  {p.name && <span className="ml-2 text-gray-500">({p.name})</span>}
                </div>
              ))}
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
