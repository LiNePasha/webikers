'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { safeFetch } from '@/lib/utils/safeFetch'

interface Tag {
  id: number
  name: string
  slug: string
  description: string
  count: number
}

interface StoreTagsData {
  vendor_id: number
  category_id?: number
  category_name?: string
  category_slug?: string
  tags: Tag[]
  total_tags: number
  total_products: number
}

interface StoreTagsFilterProps {
  vendorId: number
  categoryId?: number
  storeSlug: string
  categorySlug?: string
  selectedTag?: string | null
}

export default function StoreTagsFilter({ 
  vendorId,
  categoryId,
  storeSlug,
  categorySlug,
  selectedTag 
}: StoreTagsFilterProps) {
  const [tagsData, setTagsData] = useState<StoreTagsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSticky, setIsSticky] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchTags = async () => {
      // Validate required params
      if (!vendorId || !categoryId) {
        console.log('⏳ Missing required params:', { vendorId, categoryId })
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      
      console.log('🏷️ Fetching tags for:', { vendorId, categoryId })
      
      const { data, error: fetchError } = await safeFetch<StoreTagsData>(
        `/api/store-category-tags/${vendorId}/${categoryId}`
      )
      
      if (fetchError || !data) {
        console.error('❌ Error fetching store tags:', fetchError)
        setError(fetchError || 'حدث خطأ في تحميل الوسوم')
        setLoading(false)
        return
      }
      
      console.log('✅ Tags fetched:', data)
      setTagsData(data)
      setLoading(false)
    }

    fetchTags()
  }, [vendorId, categoryId])

  // Sticky behavior on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsSticky(scrollPosition > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  // Build tag URL - MUST be before any return statements
  const getTagUrl = (tagSlug: string) => {
    if (categorySlug) {
      return `/category/${categorySlug}/tag/${tagSlug}`
    }
    return `/tag/${tagSlug}`
  }

  // Build clear filter URL - MUST be before any return statements
  const getClearUrl = () => {
    if (categorySlug) {
      return `/category/${categorySlug}`
    }
    return `/`
  }

  if (loading) {
    return (
      <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-brand-500 animate-spin" />
          <span>جاري تحميل الوسوم...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-3xl">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
          >
            🔄 إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  if (!tagsData || tagsData.tags.length === 0) {
    return null // Don't show anything if no tags
  }

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-sm transition-all duration-300 ${
          isSticky 
            ? 'fixed top-0 left-0 right-0 z-[100] shadow-md rounded-none' 
            : 'mb-6'
        }`}
      >
        <div className={`${isSticky ? 'container mx-auto' : ''}`}>
          <div className="py-3">
            <div className="flex items-center gap-3">
              {/* Icon & Title */}
              <div className="flex items-center flex-shrink-0 gap-2">
                <svg 
                  className="w-5 h-5 text-brand-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" 
                  />
                </svg>
              </div>

              {/* Horizontal Scrollable Tags */}
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-hide scroll-smooth">
                  {tagsData.tags.slice(0, 8).map((tag) => {
                    // Decode tag slug from API (it comes URL encoded)
                    const decodedTagSlug = decodeURIComponent(tag.slug)
                    const normalizedSelected = selectedTag?.trim().toLowerCase()
                    const normalizedTagSlug = decodedTagSlug?.trim().toLowerCase()
                    const isSelected = normalizedSelected === normalizedTagSlug
                    
                    return (
                      <Link
                        key={tag.id}
                        href={getTagUrl(tag.slug)}
                        className={`
                          flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium
                          transition-all duration-200 hover:scale-105 active:scale-95
                          ${isSelected 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                        title={tag.description || tag.name}
                      >
                        <span>{tag.name}</span>
                        <span className="mr-1 text-xs opacity-75">({tag.count})</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* View All & Clear Buttons */}
              <div className="flex items-center flex-shrink-0 gap-2">
                {tagsData.tags.length > 8 && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-1 flex-shrink-0"
                  >
                    <span>عرض الكل</span>
                  </button>
                )}
                
                {selectedTag && (
                  <Link
                    href={getClearUrl()}
                    className="p-2 text-red-600 transition-colors rounded-full hover:bg-red-50"
                    title="مسح التصفية"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 flex flex-col w-full h-full max-w-md overflow-hidden bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 text-white bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h2 className="text-2xl font-bold">جميع الوسوم</h2>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 transition-colors rounded-full hover:bg-white/20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-white/90">
                  {tagsData.total_tags} وسم متاح {categorySlug && `في ${tagsData.category_name}`}
                </p>
              </div>

              {/* Tags Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {tagsData.tags.map((tag) => {
                    // Decode tag slug from API (it comes URL encoded)
                    const decodedTagSlug = decodeURIComponent(tag.slug)
                    const normalizedSelected = selectedTag?.trim().toLowerCase()
                    const normalizedTagSlug = decodedTagSlug?.trim().toLowerCase()
                    const isSelected = normalizedSelected === normalizedTagSlug
                    
                    return (
                      <Link
                        key={tag.id}
                        href={getTagUrl(tag.slug)}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`
                          relative p-4 rounded-xl text-right font-medium
                          transition-all duration-200 border-2 block
                          hover:scale-102 active:scale-98
                          ${isSelected 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg' 
                            : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:shadow-md'
                          }
                        `}
                        title={tag.description || tag.name}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold leading-tight">
                            {tag.name}
                          </span>
                          <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                            {tag.count} منتج
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 left-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              {selectedTag && (
                <div className="p-4 border-t bg-gray-50">
                  <Link
                    href={getClearUrl()}
                    onClick={() => setIsSidebarOpen(false)}
                    className="block w-full py-3 font-semibold text-center text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    مسح التصفية
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
