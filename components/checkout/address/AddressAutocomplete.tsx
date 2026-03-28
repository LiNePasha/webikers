'use client'

import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import type { EgyptCity, EgyptDistrict } from '@/types'

interface AddressAutocompleteProps {
  type: 'city' | 'district'
  value?: string
  label: string
  placeholder: string
  cityId?: string // Required for district autocomplete
  onSelect: (id: string, nameAr: string, nameEn: string) => void
  error?: string
  required?: boolean
}

export default function AddressAutocomplete({
  type,
  value,
  label,
  placeholder,
  cityId,
  onSelect,
  error,
  required = true,
}: AddressAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [allItems, setAllItems] = useState<(EgyptCity | EgyptDistrict)[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedName, setSelectedName] = useState(value || '')
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Load all items on mount
  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true)
      
      try {
        let url = ''
        if (type === 'city') {
          url = '/api/egypt/cities'
        } else if (type === 'district' && cityId) {
          url = `/api/egypt/districts/${cityId}`
        } else {
          return
        }
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          setAllItems(data.data)
        }
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAllItems()
  }, [type, cityId])
  
  // Filter items based on search query
  const filteredItems = allItems.filter(item => {
    const nameAr = item.nameAr || (item as any).name || ''
    const nameEn = item.nameEn || (item as any).name || ''
    const searchLower = searchQuery.toLowerCase()
    
    return nameAr.includes(searchQuery) || 
           nameEn.toLowerCase().includes(searchLower)
  })
  
  const handleSelect = (item: EgyptCity | EgyptDistrict) => {
    const displayNameAr = item.nameAr || (item as any).name || item.nameEn || ''
    const displayNameEn = item.nameEn || (item as any).name || item.nameAr || ''
    onSelect(item.id, displayNameAr, displayNameEn)
    setSelectedName(displayNameAr)
    setSearchQuery('')
    setIsOpen(false)
  }
  
  return (
    <div ref={wrapperRef} className="relative">
      {/* Label */}
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="mr-1 text-red-500">*</span>}
      </label>
      
      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 rounded-lg border text-right
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${selectedName ? 'text-gray-900' : 'text-gray-400'}
          hover:border-brand-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent
          transition-all flex items-center justify-between
        `}
      >
        <span>{selectedName || placeholder}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute w-full mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-xl z-[100]">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                autoFocus
              />
              <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            </div>
          </div>
          
          {/* Items List */}
          <div className="overflow-y-auto max-h-60">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin border-brand-500 border-t-transparent" />
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const displayNameAr = item.nameAr || (item as any).name || item.nameEn || ''
                const displayNameEn = item.nameEn || (item as any).name || item.nameAr || ''
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`
                      w-full px-4 py-3 text-right hover:bg-brand-50 transition-colors
                      flex items-center gap-3 border-b border-gray-100 last:border-b-0
                      ${selectedName === displayNameAr ? 'bg-brand-50 text-brand-700' : 'text-gray-900'}
                    `}
                  >
                    <MapPinIcon className="flex-shrink-0 w-5 h-5 text-brand-500" />
                    <div className="flex-1">
                      <p className="font-medium">{displayNameAr}</p>
                      <p className="text-sm text-gray-500">{displayNameEn}</p>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="p-4 text-sm text-center text-gray-500">
                {searchQuery ? 'لا توجد نتائج' : 'لا توجد بيانات'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
