import { useState, useEffect, useCallback, useRef } from 'react'
import { Product, ProductFilters, PaginatedResponse, Category, VendorStore } from '@/types'
import { apiCache } from '@/lib/utils/cache'

// API Response types with error handling
interface APIResponse<T> {
  data?: T
  error?: string
  pagination?: any
}

// Global flag for categories to prevent multiple requests
let categoriesFetchState: 'idle' | 'fetching' | 'done' = 'idle'

// Global flag for individual products to prevent multiple requests
const productFetchStates = new Map<string, 'idle' | 'fetching' | 'done'>()

// Custom hook for products
export function useProducts(initialFilters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0
  })
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)
  
  // Use refs to prevent infinite loops
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchProducts = useCallback(async (newFilters?: ProductFilters) => {
    const currentFilters = newFilters || filters
    const filterKey = JSON.stringify(currentFilters)
    
    console.log('🚀 Starting fetchProducts with filters:', filterKey)
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    // Generate cache key
    const cacheKey = apiCache.generateKey('products', currentFilters)
    
    // Check cache first
    const cachedData = apiCache.get<APIResponse<Product[]> & { pagination?: any }>(cacheKey)
    if (cachedData) {
      console.log('📦 Using cached products data')
      setProducts(cachedData.data || [])
      setPagination(cachedData.pagination || {
        page: 1,
        per_page: 12,
        total: 0,
        total_pages: 0
      })
      setLoading(false)
      setError(null)
      return
    }
    
    console.log('⏳ Setting loading to true')
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      console.log('🔍 Fetching products with params:', params.toString())

      const response = await fetch(`/api/products?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: APIResponse<Product[]> & { pagination?: any } = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      console.log('📍 Setting products and pagination')

      // Cache the response
      apiCache.set(cacheKey, data, 2 * 60 * 1000) // Cache for 2 minutes

      setProducts(data.data || [])
      
      setPagination(data.pagination || {
        page: 1,
        per_page: 12,
        total: 0,
        total_pages: 0
      })
      
      console.log('✅ Products fetched successfully:', data.data?.length || 0)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('🚫 Request aborted')
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
      setError(errorMessage)
      console.error('❌ Error fetching products:', err)
    } finally {
      console.log('📍 Finally block reached')
      console.log('🔄 Setting loading to false')
      setLoading(false)
    }
  }, [filters])

  // Effect for filter changes only
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(filters)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters.page, filters.per_page, filters.category, filters.search, filters.min_price, filters.max_price, filters.in_stock, filters.on_sale, filters.featured, filters.sort])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  return {
    products,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    refetch: fetchProducts
  }
}

// Custom hook for single product
export function useProduct(id: string | number) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      // Generate cache key based on whether it's ID or slug
      const isNumericId = /^\d+$/.test(String(id))
      const cacheKey = isNumericId ? `product_id_${id}` : `product_slug_${id}`
      
      // Check if already fetching this product
      const currentState = productFetchStates.get(cacheKey) || 'idle'
      if (currentState === 'fetching') {
        console.log('🚫 Product already being fetched:', id)
        return
      }
      
      // Check cache first
      const cachedData = apiCache.get<APIResponse<Product>>(cacheKey)
      if (cachedData && cachedData.data) {
        console.log('📦 Using cached product data for:', id, isNumericId ? '(ID)' : '(Slug)')
        setProduct(cachedData.data)
        setLoading(false)
        productFetchStates.set(cacheKey, 'done')
        return
      }

      // If cache is empty and not currently fetching, start fetching
      if (currentState === 'idle') {
        productFetchStates.set(cacheKey, 'fetching')
        setLoading(true)
        setError(null)

        try {
          console.log('🔍 Fetching product:', id, isNumericId ? '(ID)' : '(Slug)')

        const response = await fetch(`/api/products/${id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        // Cache the response
        apiCache.set(cacheKey, data, 3 * 60 * 1000) // Cache for 3 minutes

        setProduct(data.data)
        console.log('✅ Product fetched successfully:', data.data?.name)
        productFetchStates.set(cacheKey, 'done')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product'
        setError(errorMessage)
        console.error('❌ Error fetching product:', err)
        productFetchStates.set(cacheKey, 'idle') // Reset on error
      } finally {
        setLoading(false)
      }
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}

// Custom hook for categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If already fetching or done, don't fetch again
    if (categoriesFetchState === 'fetching') {
      return
    }
    
    const fetchCategories = async () => {
      const cacheKey = 'categories'
      
      // Check cache first
      const cachedData = apiCache.get<APIResponse<Category[]>>(cacheKey)
      if (cachedData && cachedData.data) {
        console.log('📦 Using cached categories data')
        setCategories(cachedData.data)
        setLoading(false)
        categoriesFetchState = 'done'
        return
      }

      // If cache is empty and not currently fetching, start fetching
      if (categoriesFetchState === 'idle') {
        categoriesFetchState = 'fetching'
        console.log('🚀 Fetching categories...')
        
        setLoading(true)
        setError(null)

        try {
          console.log('🔍 Fetching categories')

          const response = await fetch('/api/categories')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        // Cache the response
        apiCache.set(cacheKey, data, 5 * 60 * 1000) // Cache for 5 minutes
        
        setCategories(data.data || [])
        console.log('✅ Categories fetched successfully:', data.data?.length || 0)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
        setError(errorMessage)
        console.error('❌ Error fetching categories:', err)
        categoriesFetchState = 'idle' // Reset on error
      } finally {
        setLoading(false)
        categoriesFetchState = 'done'
      }
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

// Custom hook for vendors
export function useVendors() {
  const [vendors, setVendors] = useState<VendorStore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVendors = async () => {
      const cacheKey = 'vendors'
      
      // Check cache first
      const cachedData = apiCache.get<APIResponse<VendorStore[]>>(cacheKey)
      if (cachedData && cachedData.data) {
        console.log('📦 Using cached vendors data')
        setVendors(cachedData.data)
        setLoading(false)
        return
      }

      console.log('🚀 Fetching vendors...')
      setLoading(true)
      setError(null)

      try {
        console.log('🔍 Fetching vendors')

        const response = await fetch('/api/vendors')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        // Cache the response
        apiCache.set(cacheKey, data, 5 * 60 * 1000) // Cache for 5 minutes

        setVendors(data.data || [])
        console.log('✅ Vendors fetched successfully:', data.data?.length || 0)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vendors'
        setError(errorMessage)
        console.error('❌ Error fetching vendors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [])

  return { vendors, loading, error }
}

// Custom hook for search with debounce
export function useProductSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([])
      return
    }

    const performSearch = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          search: debouncedQuery,
          per_page: '20'
        })

        console.log('🔍 Searching products with query:', debouncedQuery)

        const response = await fetch(`/api/products?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: APIResponse<Product[]> & { pagination?: any } = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        setSearchResults(data.data || [])
        console.log('✅ Search completed:', data.data?.length || 0, 'results')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed'
        setError(errorMessage)
        console.error('❌ Error searching products:', err)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  return {
    query,
    setQuery,
    searchResults,
    loading,
    error,
    clearSearch: () => {
      setQuery('')
      setSearchResults([])
    }
  }
}