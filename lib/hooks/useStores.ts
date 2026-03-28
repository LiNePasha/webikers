import { useState, useEffect, useCallback, useRef } from 'react'
import { Store, StoreFilters, Product, ProductFilters } from '@/types'
import { apiCache } from '@/lib/utils/cache'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

// API Response types
interface APIResponse<T> {
  data?: T
  error?: string
  pagination?: any
}

// Global fetch tracking with timestamp to detect duplicate calls
const globalFetchTracking = new Map<string, { state: 'idle' | 'fetching' | 'done', timestamp: number }>()

// Helper to check if a fetch is in progress (within last 500ms)
function isFetchInProgress(key: string): boolean {
  const tracking = globalFetchTracking.get(key)
  if (!tracking) return false
  if (tracking.state !== 'fetching') return false
  
  // If fetching for more than 10 seconds, consider it stale
  const now = Date.now()
  if (now - tracking.timestamp > 10000) {
    globalFetchTracking.set(key, { state: 'idle', timestamp: now })
    return false
  }
  
  return true
}

// Helper to set fetch state
function setFetchState(key: string, state: 'idle' | 'fetching' | 'done') {
  globalFetchTracking.set(key, { state, timestamp: Date.now() })
}

// Global flags to prevent multiple requests
let storesFetchState: 'idle' | 'fetching' | 'done' = 'idle'
const storeFetchStates = new Map<string, 'idle' | 'fetching' | 'done'>()

// Custom hook for stores list
export function useStores(initialFilters: StoreFilters = {}) {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  })
  const [filters, setFilters] = useState<StoreFilters>(initialFilters)

  const fetchStores = useCallback(async (newFilters?: StoreFilters) => {
    const currentFilters = newFilters || filters
    const filterKey = JSON.stringify(currentFilters)
    
    // Check if already fetching
    if (storesFetchState === 'fetching') {
      console.log('🚫 Stores already being fetched')
      return
    }
    
    // Generate cache key
    const cacheKey = apiCache.generateKey('stores', currentFilters)
    
    // Check cache first
    const cachedData = apiCache.get<APIResponse<Store[]> & { pagination?: any }>(cacheKey)
    if (cachedData) {
      console.log('📦 Using cached stores data')
      setStores(cachedData.data || [])
      setPagination(cachedData.pagination || {
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0
      })
      setLoading(false)
      setError(null)
      storesFetchState = 'done'
      return
    }

    if (storesFetchState === 'idle') {
      storesFetchState = 'fetching'
      console.log('🚀 Starting fetchStores with filters:', filterKey)
      
      setLoading(true)
      setError(null)

      try {
        // Build query params
        const queryParams = new URLSearchParams()
        
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value))
          }
        })
        
        console.log('🔍 Fetching stores with params:', queryParams.toString())

        const response = await fetch(`/api/stores?${queryParams}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        // Cache the response
        apiCache.set(cacheKey, data, 5 * 60 * 1000) // Cache for 5 minutes
        
        setStores(data.data || [])
        setPagination(data.pagination || {
          page: 1,
          per_page: 20,
          total: 0,
          total_pages: 0
        })
        
        console.log('✅ Stores fetched successfully:', data.data?.length || 0)
        storesFetchState = 'done'
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stores'
        setError(errorMessage)
        console.error('❌ Error fetching stores:', err)
        storesFetchState = 'idle' // Reset on error
      } finally {
        setLoading(false)
      }
    }
  }, [filters])

  // Effect for filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      storesFetchState = 'idle' // Reset state for new filters
      fetchStores(filters)
    }, 300) // Debounce

    return () => clearTimeout(timeoutId)
  }, [filters, fetchStores])

  const updateFilters = useCallback((newFilters: Partial<StoreFilters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }))
  }, [])

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.total_pages) {
      updateFilters({ page: pagination.page + 1 })
    }
  }, [pagination, updateFilters])

  return {
    stores,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    loadMore,
    refetch: () => {
      storesFetchState = 'idle'
      fetchStores()
    }
  }
}

// Custom hook for single store
export function useStore(slug: string) {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!slug || !mountedRef.current) {
      setLoading(false)
      return
    }

    // Prevent multiple fetches for same slug
    if (hasFetchedRef.current) {
      return
    }

    const fetchStore = async () => {
      const cacheKey = `store_slug_${slug}`
      
      // Check if already fetching globally
      if (isFetchInProgress(cacheKey)) {
        return
      }
      
      // Check cache first
      const cachedData = apiCache.get<APIResponse<Store>>(cacheKey)
      if (cachedData && cachedData.data) {
        if (mountedRef.current) {
          setStore(cachedData.data)
          setLoading(false)
          hasFetchedRef.current = true
        }
        return
      }

      // Mark as fetching
      setFetchState(cacheKey, 'fetching')
      if (mountedRef.current) {
        setLoading(true)
        setError(null)
      }

      try {
        // First get vendor ID from slug
        const vendorId = await wooCommerceAPI.getVendorIdBySlug(slug)
        if (!vendorId) {
          throw new Error('Store not found')
        }

        // Use Enhanced API to get store data
        const storeData = await wooCommerceAPI.getEnhancedStore(vendorId)

        // Cache the response
        apiCache.set(cacheKey, { data: storeData }, 5 * 60 * 1000) // Cache for 5 minutes

        if (mountedRef.current) {
          setStore(storeData)
          hasFetchedRef.current = true
        }
        setFetchState(cacheKey, 'done')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch store'
        if (mountedRef.current) {
          setError(errorMessage)
        }
        setFetchState(cacheKey, 'idle') // Reset on error
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchStore()
  }, [slug])

  return { store, loading, error }
}

// Custom hook for store products
export function useStoreProducts(vendorId: string, initialFilters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0,
    has_more: false
  })
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)

  const fetchStoreProducts = useCallback(async (newFilters?: ProductFilters) => {
    if (!vendorId || vendorId === '') {
      console.log('🚫 No vendor ID provided, skipping API call')
      return
    }
    
    const currentFilters = newFilters || filters
    const filterKey = JSON.stringify({ vendorId, ...currentFilters })
    
    // Generate cache key
    const cacheKey = apiCache.generateKey('store-products', { vendor: vendorId, ...currentFilters })
    
    // Check cache first - if data exists and loading is false, don't refetch
    const cachedData = apiCache.get<APIResponse<Product[]> & { pagination?: any }>(cacheKey)
    if (cachedData && !loading) {
      console.log('📦 Using cached store products data for vendor:', vendorId)
      setProducts(cachedData.data || [])
      setPagination(cachedData.pagination || {
        page: 1,
        per_page: 12,
        total: 0,
        total_pages: 0,
        has_more: false
      })
      setLoading(false)
      setError(null)
      return
    }

    // Prevent duplicate calls
    if (loading) {
      console.log('🚫 Already loading products, skipping duplicate call')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Fetching store products:', {
        vendorId,
        filters: currentFilters,
        categoryFilter: currentFilters.category,
        hasCategory: !!currentFilters.category
      })

      // Use Enhanced API to get products with category filter
      const data = await wooCommerceAPI.getEnhancedStoreProducts(vendorId, currentFilters)

      // Cache the response
      apiCache.set(cacheKey, data, 3 * 60 * 1000) // Cache for 3 minutes
      
      setProducts(data.products || [])
      setPagination(data.pagination || {
        page: 1,
        per_page: 12,
        total: 0,
        total_pages: 0,
        has_more: false
      })
      
      console.log('✅ Store products fetched:', {
        productsCount: data.products?.length || 0,
        totalProducts: data.pagination?.total || 0,
        categoryFilter: currentFilters.category,
        filtersApplied: data.filters_applied
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch store products'
      setError(errorMessage)
      console.error('❌ Error fetching store products:', err)
    } finally {
      setLoading(false)
    }
  }, [vendorId, loading]) // Remove filters from dependency

  // Effect for filter changes with proper dependency management
  useEffect(() => {
    if (!vendorId || vendorId === '') return
    
    const timeoutId = setTimeout(() => {
      fetchStoreProducts(filters)
    }, 300) // Debounce

    return () => clearTimeout(timeoutId)
  }, [vendorId, JSON.stringify(filters)]) // Use stringified filters to avoid function dependency

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }))
  }, [])

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.total_pages) {
      updateFilters({ page: pagination.page + 1 })
    }
  }, [pagination, updateFilters])

  return {
    products,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    loadMore,
    refetch: () => fetchStoreProducts()
  }
}

// Custom hook for store categories
export function useStoreCategories(storeSlug: string) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!storeSlug || !mountedRef.current) {
      setLoading(false)
      return
    }

    // Prevent multiple fetches for same slug
    if (hasFetchedRef.current) {
      return
    }

    const fetchStoreCategories = async () => {
      const cacheKey = apiCache.generateKey('store-categories', { store: storeSlug })
      
      // Check if already fetching globally
      if (isFetchInProgress(cacheKey)) {
        return
      }
      
      // Check cache first
      const cachedData = apiCache.get<any[]>(cacheKey)
      if (cachedData) {
        if (mountedRef.current) {
          setCategories(cachedData)
          setLoading(false)
          hasFetchedRef.current = true
        }
        return
      }

      // Mark as fetching
      setFetchState(cacheKey, 'fetching')
      if (mountedRef.current) {
        setLoading(true)
        setError(null)
      }

      try {
        // First get vendor ID from store slug
        const vendorId = await wooCommerceAPI.getVendorIdBySlug(storeSlug)
        if (!vendorId) {
          throw new Error('Store not found')
        }

        // Use Enhanced API to get categories
        const categoriesData = await wooCommerceAPI.getEnhancedStoreCategories(vendorId)
        
        // Cache the result (5 minutes)
        apiCache.set(cacheKey, categoriesData, 5 * 60 * 1000)
        
        if (mountedRef.current) {
          setCategories(categoriesData)
          hasFetchedRef.current = true
        }
        setFetchState(cacheKey, 'done')
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل فئات المتجر')
        }
        setFetchState(cacheKey, 'idle') // Reset on error
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchStoreCategories()
  }, [storeSlug])

  return {
    categories,
    loading,
    error,
    refetch: () => {
      const cacheKey = apiCache.generateKey('store-categories', { store: storeSlug })
      setFetchState(cacheKey, 'idle')
      apiCache.delete(cacheKey)
      hasFetchedRef.current = false
    }
  }
}

// Custom hook for single category details
export function useStoreCategory(storeSlug: string, categorySlug: string) {
  const [category, setCategory] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!storeSlug || !categorySlug || !mountedRef.current) {
      setLoading(false)
      return
    }

    // Prevent multiple fetches for same slug combination
    if (hasFetchedRef.current) {
      return
    }

    const fetchStoreCategory = async () => {
      const cacheKey = apiCache.generateKey('store-category', { store: storeSlug, category: categorySlug })
      
      // Check if already fetching globally
      if (isFetchInProgress(cacheKey)) {
        return
      }
      
      // Check cache first
      const cachedData = apiCache.get<any>(cacheKey)
      if (cachedData) {
        if (mountedRef.current) {
          setCategory(cachedData)
          setLoading(false)
          hasFetchedRef.current = true
        }
        return
      }

      // Mark as fetching
      setFetchState(cacheKey, 'fetching')
      if (mountedRef.current) {
        setLoading(true)
        setError(null)
      }

      try {
        // First get vendor ID from store slug
        const vendorId = await wooCommerceAPI.getVendorIdBySlug(storeSlug)
        if (!vendorId) {
          throw new Error('Store not found')
        }

        // Get store categories first to find category ID
        const categories = await wooCommerceAPI.getEnhancedStoreCategories(vendorId)
        const categoryData = categories.find(cat => 
          cat.slug === categorySlug || 
          cat.name.toLowerCase().replace(/\s+/g, '-') === categorySlug
        )

        if (!categoryData) {
          throw new Error('Category not found')
        }

        // Cache the result (5 minutes)
        apiCache.set(cacheKey, categoryData, 5 * 60 * 1000)
        
        if (mountedRef.current) {
          setCategory(categoryData)
          hasFetchedRef.current = true
        }
        setFetchState(cacheKey, 'done')
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل تفاصيل الفئة')
        }
        setFetchState(cacheKey, 'idle') // Reset on error
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchStoreCategory()
  }, [storeSlug, categorySlug])

  return {
    category,
    loading,
    error,
    refetch: () => {
      const cacheKey = apiCache.generateKey('store-category', { store: storeSlug, category: categorySlug })
      setFetchState(cacheKey, 'idle')
      apiCache.delete(cacheKey)
      hasFetchedRef.current = false
    }
  }
}