// WooCommerce API client for Ibrahim Shkman
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios'
import { Product, Category, VendorStore, Store, StoreFilters, ProductFilters, PaginatedResponse } from '@/types'

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>()

// Response cache with timestamps
const responseCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 10 * 1000 // 10 seconds cache to prevent duplicate requests in strict mode

// Clear cache on errors or when needed
export function clearAPICache() {
  responseCache.clear()
  console.log('🧹 API cache cleared')
}

// Generate request key for deduplication
function generateRequestKey(config: AxiosRequestConfig): string {
  const { url, method, params } = config
  // Only use the params we care about (exclude consumer_key/secret)
  const relevantParams = { ...params }
  delete relevantParams?.consumer_key
  delete relevantParams?.consumer_secret
  return `${method}:${url}:${JSON.stringify(relevantParams || {})}`
}

export class WooCommerceAPI {
  private client: AxiosInstance
  private baseURL: string
  private consumerKey: string
  private consumerSecret: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL || 'https://api.spare2app.com/wp-json/wc/v3'
    this.consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY || ''
    this.consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || ''

    this.client = axios.create({
      baseURL: 'https://api.spare2app.com/wp-json', // Base for both WC and WCFM APIs
      timeout: 30000,
      params: {
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
      },
    })

    // Request interceptor for logging only
    this.client.interceptors.request.use(
      (config) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
          if (config.params?.parent) {
            console.log(`   └─ parent: ${config.params.parent}`)
          }
        }
        return config
      },
      (error) => {
        console.error('❌ API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor for cleanup and error handling
    this.client.interceptors.response.use(
      (response) => {
        const requestKey = generateRequestKey(response.config)
        pendingRequests.delete(requestKey)
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        }
        return response
      },
      (error) => {
        const requestKey = generateRequestKey(error.config)
        pendingRequests.delete(requestKey)
        
        console.error('❌ API Response Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // Deduplicated GET request
  private async deduplicatedGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const requestKey = generateRequestKey({ ...config, url, method: 'get' })
    
    // Check cache first
    const cached = responseCache.get(requestKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📦 Using cached response: ${url}`)
      }
      return Promise.resolve(cached.data)
    }
    
    // If request is already pending, return the existing promise
    if (pendingRequests.has(requestKey)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏸️ Waiting for pending request: ${url}`)
      }
      return pendingRequests.get(requestKey)!
    }
    
    // Create new request promise
    const requestPromise = this.client.get<T>(url, config)
      .then((response) => {
        // Cache the successful response
        responseCache.set(requestKey, {
          data: response,
          timestamp: Date.now()
        })
        return response
      })
      .catch((error) => {
        // Don't cache errors - clear any existing cache for this request
        responseCache.delete(requestKey)
        throw error
      })
      .finally(() => {
        // Clean up after request completes (success or error)
        pendingRequests.delete(requestKey)
      })
    
    // Store the promise
    pendingRequests.set(requestKey, requestPromise)
    
    return requestPromise
  }

  // Test API connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test basic WooCommerce API access with minimal endpoint
      const response = await this.deduplicatedGet('/wc/v3/system_status/tools', {
        params: { per_page: 1 }
      })
      
      return {
        success: true,
        message: 'اتصال API نجح بنجاح'
      }
    } catch (error: any) {
      console.error('API Connection Test Failed:', error)
      
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'خطأ 401: اعد المحاولة لاحقا'
        }
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'خطأ 403: مفاتيح API لا تملك الصلاحيات المطلوبة'
        }
      }
      
      return {
        success: false,
        message: `خطأ في الاتصال: ${error.response?.data?.message || error.message}`
      }
    }
  }

  // Products endpoints
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = this.buildProductParams(filters)
    
    try {
      const response: AxiosResponse<Product[]> = await this.client.get('/wc/v3/products', { params })
      
      return {
        data: response.data,
        pagination: {
          page: parseInt(response.headers['x-wp-page'] || '1'),
          per_page: parseInt(response.headers['x-wp-per-page'] || '10'),
          total: parseInt(response.headers['x-wp-total'] || '0'),
          total_pages: parseInt(response.headers['x-wp-totalpages'] || '1'),
        }
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
      
      // Log detailed error for developers
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
      }
      
      // Return user-friendly error messages
      if (error.response?.status === 401) {
        throw new Error('لا يمكن تحميل المنتجات حالياً. يرجى المحاولة مرة أخرى لاحقاً.')
      }
      
      if (error.response?.status === 403) {
        throw new Error('غير مسموح بالوصول للمنتجات في الوقت الحالي.')
      }
      
      if (error.response?.status === 404) {
        throw new Error('لم يتم العثور على المنتجات المطلوبة.')
      }
      
      // Generic user-friendly message
      throw new Error('حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.')
    }
  }

  // Get diverse products (fair distribution across vendors)
  async getDiverseProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = this.buildProductParams(filters)
    
    try {
      const response: AxiosResponse<any> = await this.client.get('/spare2app/v1/products/diverse', { params })
      
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {
          page: parseInt(params.page || '1'),
          per_page: parseInt(params.per_page || '12'),
          total: 0,
          total_pages: 0,
        }
      }
    } catch (error: any) {
      console.error('Error fetching diverse products:', error)
      
      // Log detailed error for developers
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
      }
      
      // Return user-friendly error messages
      if (error.response?.status === 401) {
        throw new Error('لا يمكن تحميل المنتجات حالياً. يرجى المحاولة مرة أخرى لاحقاً.')
      }
      
      if (error.response?.status === 403) {
        throw new Error('غير مسموح بالوصول للمنتجات في الوقت الحالي.')
      }
      
      if (error.response?.status === 404) {
        throw new Error('لم يتم العثور على المنتجات المطلوبة.')
      }
      
      // Generic user-friendly message
      throw new Error('حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.')
    }
  }

  async getProduct(id: number | string): Promise<Product> {
    try {
      const response: AxiosResponse<Product> = await this.client.get(`/wc/v3/products/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      throw new Error(`Failed to fetch product ${id}`)
    }
  }

  async getProductBySlug(slug: string): Promise<Product> {
    try {
      // Search for product by slug
      const response: AxiosResponse<Product[]> = await this.client.get('/wc/v3/products', {
        params: {
          slug: slug,
          per_page: 1
        }
      })
      
      if (!response.data || response.data.length === 0) {
        throw new Error(`Product with slug "${slug}" not found`)
      }
      
      return response.data[0]
    } catch (error) {
      console.error(`Error fetching product by slug ${slug}:`, error)
      throw new Error(`Failed to fetch product by slug ${slug}`)
    }
  }

  // Get product variations for variable products
  async getProductVariations(productId: number): Promise<import('@/types').ProductVariation[]> {
    try {
      const response = await this.deduplicatedGet<import('@/types').ProductVariation[]>(
        `/wc/v3/products/${productId}/variations`,
        {
          params: {
            per_page: 100 // Get all variations
          }
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching variations for product ${productId}:`, error)
      throw new Error(`Failed to fetch product variations`)
    }
  }

  // Get single variation
  async getProductVariation(productId: number, variationId: number): Promise<import('@/types').ProductVariation> {
    try {
      const response = await this.deduplicatedGet<import('@/types').ProductVariation>(
        `/wc/v3/products/${productId}/variations/${variationId}`
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching variation ${variationId}:`, error)
      throw new Error(`Failed to fetch product variation`)
    }
  }

  async searchProducts(query: string, filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = {
      ...this.buildProductParams(filters),
      search: query,
    }

    try {
      const response: AxiosResponse<Product[]> = await this.client.get('/wc/v3/products', { params })
      
      return {
        data: response.data,
        pagination: {
          page: parseInt(response.headers['x-wp-page'] || '1'),
          per_page: parseInt(response.headers['x-wp-per-page'] || '10'),
          total: parseInt(response.headers['x-wp-total'] || '0'),
          total_pages: parseInt(response.headers['x-wp-totalpages'] || '1'),
        }
      }
    } catch (error) {
      console.error('Error searching products:', error)
      throw new Error('Failed to search products')
    }
  }

  // Categories endpoints
  async getCategories(params: { parent?: number; per_page?: number; page?: number } = {}): Promise<Category[]> {
    try {
      // Log stack trace to see who called this
      const stack = new Error().stack
      const caller = stack?.split('\n')[2]?.trim() || 'Unknown'
      
      // Build params object properly
      const queryParams: any = {
        per_page: params.per_page || 100,
      }
      
      // Add parent if provided
      if (params.parent !== undefined) {
        queryParams.parent = params.parent
      }
      
      // Add page if provided
      if (params.page) {
        queryParams.page = params.page
      }
      
      console.log('🔍 getCategories called with params:', params)
      console.log('📞 Called from:', caller)
      console.log('🔍 Query params being sent:', queryParams)
      
      // Use deduplication for categories to prevent duplicate requests
      const response: AxiosResponse<Category[]> = await this.deduplicatedGet('/wc/v3/products/categories', {
        params: queryParams
      })
      
      console.log('✅ Categories returned:', response.data.length, 'items')
      if (params.parent !== undefined) {
        console.log('📊 Parent filter check:', response.data.filter(c => c.parent !== params.parent).length, 'items with wrong parent')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      
      // Log detailed error for developers
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed Categories API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
      }
      
      // Return user-friendly error messages
      if (error.response?.status === 401) {
        throw new Error('لا يمكن تحميل فئات المنتجات حالياً.')
      }
      
      // Generic user-friendly message
      throw new Error('حدث خطأ أثناء تحميل فئات المنتجات.')
    }
  }

  // Vendors - extracted from products
  async getVendors(): Promise<VendorStore[]> {
    try {
      // Get products with store information
      const response: AxiosResponse<Product[]> = await this.client.get('/wc/v3/products', {
        params: { per_page: 50 }
      })

      // Extract unique vendors from products
      const vendorMap = new Map<number, VendorStore>()
      
      response.data.forEach((product: Product) => {
        if (product.store && product.store.vendor_id) {
          vendorMap.set(product.store.vendor_id, product.store)
        }
      })

      return Array.from(vendorMap.values())
    } catch (error) {
      console.error('Error fetching vendors:', error)
      throw new Error('Failed to fetch vendors')
    }
  }

  // Helper methods
  private buildProductParams(filters: ProductFilters): Record<string, any> {
    const params: Record<string, any> = {
      per_page: filters.per_page || 12,
      page: filters.page || 1,
    }

    if (filters.category) {
      params.category = Array.isArray(filters.category) 
        ? filters.category.join(',')
        : filters.category
    }

    if (filters.search) {
      params.search = filters.search
    }

    if (filters.min_price || filters.max_price) {
      params.min_price = filters.min_price || 0
      params.max_price = filters.max_price || 999999
    }

    if (filters.in_stock) {
      params.stock_status = 'instock'
    }

    if (filters.on_sale) {
      params.on_sale = true
    }

    if (filters.featured) {
      params.featured = true
    }

    if (filters.sort) {
      params.orderby = this.mapSortOption(filters.sort)
      params.order = filters.sort.includes('desc') ? 'desc' : 'asc'
    }

    return params
  }

  private mapSortOption(sort: string): string {
    const sortMap: Record<string, string> = {
      'popularity': 'popularity',
      'rating': 'rating',
      'date': 'date',
      'price': 'price',
      'price-desc': 'price',
      'title': 'title',
      'title-desc': 'title',
    }

    return sortMap[sort] || 'date'
  }

  // Utility methods
  getImageUrl(product: Product, size: 'thumbnail' | 'single' | 'gallery' = 'single'): string {
    if (!product.images || product.images.length === 0) {
      return '/images/placeholder-motorcycle.jpg'
    }

    const image = product.images[0]
    
    switch (size) {
      case 'thumbnail':
        return image.woocommerce_thumbnail || image.thumbnail || image.src
      case 'gallery':
        return image.woocommerce_gallery_thumbnail || image.src
      default:
        return image.woocommerce_single || image.src
    }
  }

  formatPrice(price: string | number, currency: string = 'EGP'): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  // ======== ENHANCED STORES API METHODS ========
  
  async getStores(filters: any = {}): Promise<PaginatedResponse<any>> {
    const params = this.buildStoreParams(filters)

    try {
      console.log('🚀 API Request: GET /wcfmmp/v1/store-vendors', params)
      
      // WCFM Marketplace API stores endpoint with deduplication
      const response: AxiosResponse<any[]> = await this.deduplicatedGet('/wcfmmp/v1/store-vendors', { params })
      
      console.log('✅ API Response: 200 /wcfmmp/v1/store-vendors')
      
      return {
        data: response.data || [],
        pagination: {
          page: parseInt(String(params.page)) || 1,
          per_page: parseInt(String(params.per_page)) || 20,
          total: parseInt(response.headers['x-wp-total'] || '0'),
          total_pages: parseInt(response.headers['x-wp-totalpages'] || '1')
        }
      }
    } catch (error) {
      console.error('❌ API Response Error:', error)
      throw error
    }
  }

  // Enhanced Store API using V2 Endpoints
  async getEnhancedStore(vendorId: string): Promise<any> {
    try {
      console.log('🚀 Enhanced API Request: GET /spare2app/v2/store/' + vendorId)
      
      const response: AxiosResponse<any> = await this.deduplicatedGet(`/spare2app/v2/store/${vendorId}`)
      
      console.log('✅ Enhanced API Response: Found store details')
      return response.data
    } catch (error) {
      console.error('❌ Enhanced API Error:', error)
      throw error
    }
  }

  async getEnhancedStoreCategories(vendorId: string): Promise<any[]> {
    try {
      console.log('🚀 Enhanced API Request: GET /spare2app/v2/store/' + vendorId + '/categories')

      // If running in browser, proxy via internal API to avoid exposing keys
      if (typeof window !== 'undefined') {
        const res = await fetch(`/api/enhanced-store/${vendorId}/categories`)
        if (!res.ok) throw new Error(`Proxy error: ${res.status}`)
        const data = await res.json()
        console.log('✅ Enhanced API (proxied) Response: Found', data?.categories?.length || 0, 'categories')
        return data?.categories || []
      }

      const response: AxiosResponse<any> = await this.deduplicatedGet(`/spare2app/v2/store/${vendorId}/categories`)

      console.log('✅ Enhanced API Response: Found', response.data?.categories?.length || 0, 'categories')
      return response.data?.categories || []
    } catch (error) {
      console.error('❌ Enhanced API Categories Error:', error)
      throw error
    }
  }

  async getEnhancedStoreProducts(vendorId: string, filters: any = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams()
      
      // Add filters to query params
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.min_price) queryParams.append('min_price', filters.min_price)
      if (filters.max_price) queryParams.append('max_price', filters.max_price)
      if (filters.in_stock !== undefined) queryParams.append('in_stock', filters.in_stock)
      if (filters.on_sale !== undefined) queryParams.append('on_sale', filters.on_sale)
      if (filters.featured !== undefined) queryParams.append('featured', filters.featured)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.sort) queryParams.append('sort', filters.sort)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.per_page) queryParams.append('per_page', filters.per_page)
      
      const queryString = queryParams.toString()
      const url = `/spare2app/v2/store/${vendorId}/products${queryString ? '?' + queryString : ''}`
      
      console.log('🚀 Enhanced API Request:', {
        vendorId,
        filters,
        fullUrl: `https://api.spare2app.com/wp-json${url}`,
        queryParams: queryString
      })
      
      // If running in browser, proxy via internal API to avoid exposing keys
      if (typeof window !== 'undefined') {
        const proxyUrl = `/api/enhanced-store/${vendorId}/products${queryString ? ('?' + queryString) : ''}`
        const res = await fetch(proxyUrl)
        if (!res.ok) throw new Error(`Proxy error: ${res.status}`)
        const data = await res.json()
        console.log('✅ Enhanced API (proxied) Response:', {
          productsCount: data?.products?.length || 0,
          totalProducts: data?.pagination?.total || 0,
          categoryFilter: filters.category,
          filtersApplied: data?.filters_applied
        })
        return data
      }

      const response: AxiosResponse<any> = await this.client.get(url)

      console.log('✅ Enhanced API Response:', {
        productsCount: response.data?.products?.length || 0,
        totalProducts: response.data?.pagination?.total || 0,
        categoryFilter: filters.category,
        filtersApplied: response.data?.filters_applied
      })

      return response.data
    } catch (error) {
      console.error('❌ Enhanced API Products Error:', error)
      throw error
    }
  }

  async getEnhancedCategoryDetails(vendorId: string, categoryId: string): Promise<any> {
    try {
      console.log('🚀 Enhanced API Request: GET /spare2app/v2/store/' + vendorId + '/category/' + categoryId)
      
      const response: AxiosResponse<any> = await this.deduplicatedGet(`/spare2app/v2/store/${vendorId}/category/${categoryId}`)
      
      console.log('✅ Enhanced API Response: Found category details')
      return response.data
    } catch (error) {
      console.error('❌ Enhanced API Category Details Error:', error)
      throw error
    }
  }

  // Helper method to get vendor ID by slug
  async getVendorIdBySlug(slug: string): Promise<string> {
    try {
      // First try to find vendor by slug from our enhanced store if there's an endpoint for it
      // Otherwise fall back to the existing method
      const allStoresResponse = await this.getStores({ per_page: 100 })
      
      if (!allStoresResponse.data || allStoresResponse.data.length === 0) {
        throw new Error(`No stores found`)
      }
      
      const store = allStoresResponse.data.find((vendor: any) => {
        const generatedSlug = vendor.vendor_display_name?.toLowerCase().replace(/\s+/g, '-')
        return generatedSlug === slug || vendor.vendor_id === slug
      })
      
      if (!store) {
        throw new Error(`Store with slug "${slug}" not found`)
      }
      
      return String(store.vendor_id)
    } catch (error) {
      console.error('Error getting vendor ID by slug:', error)
      throw error
    }
  }

  async getStore(slug: string): Promise<any> {
    try {
      console.log('🚀 API Request: GET /wcfmmp/v1/store-vendors by slug:', slug)
      
      // First get all stores to find vendor_id by slug
      const allStoresResponse: AxiosResponse<any[]> = await this.client.get('/wcfmmp/v1/store-vendors')
      
      if (!allStoresResponse.data || allStoresResponse.data.length === 0) {
        throw new Error(`No stores found`)
      }
      
      console.log('🔍 Looking for slug:', slug)
      console.log('🔍 Available stores:', allStoresResponse.data.map(vendor => ({
        id: vendor.vendor_id,
        display_name: vendor.vendor_display_name,
        generated_slug: vendor.vendor_display_name?.toLowerCase().replace(/\s+/g, '-')
      })))
      
      // Find store by matching slug generated from vendor_display_name
      const store = allStoresResponse.data.find((vendor: any) => {
        const generatedSlug = vendor.vendor_display_name?.toLowerCase().replace(/\s+/g, '-')
        return generatedSlug === slug || vendor.vendor_id === slug
      })
      
      if (!store) {
        throw new Error(`Store with slug "${slug}" not found`)
      }
      
      // Now get the specific store details using vendor_id
      console.log('🚀 API Request: GET /wcfmmp/v1/store-vendors/' + store.vendor_id)
      const storeDetailsResponse: AxiosResponse<any> = await this.client.get(`/wcfmmp/v1/store-vendors/${store.vendor_id}`)
      
      console.log('✅ API Response: Found store details by vendor_id')
      return storeDetailsResponse.data || store
    } catch (error) {
      console.error('❌ API Response Error:', error)
      throw error
    }
  }

  async getStoreProducts(vendorId: string, filters: any = {}): Promise<PaginatedResponse<any>> {
    try {
      console.log('🚀 API Request: GET /wcfmmp/v1/store-vendors/' + vendorId + '/products', 'with filters:', filters)
      
      // Build query parameters
      const queryParams: any = { ...filters }
      
      // Handle category filtering
      if (filters.category) {
        queryParams.category = filters.category
      }
      
      // WCFM Marketplace API for store products using vendor_id
      const response: AxiosResponse<any[]> = await this.client.get(`/wcfmmp/v1/store-vendors/${vendorId}/products`, {
        params: queryParams
      })
      
      console.log('✅ API Response: 200 /wcfmmp/v1/store-vendors/' + vendorId + '/products', 'returned:', response.data?.length, 'products')
      
      // If WCFM doesn't support category filtering, filter client-side
      let filteredData = response.data || []
      if (filters.category && filteredData.length > 0) {
        const categoryId = parseInt(filters.category)
        filteredData = filteredData.filter((product: any) => 
          product.categories && product.categories.some((cat: any) => cat.id === categoryId)
        )
        console.log('📋 Client-side filtered by category:', categoryId, 'results:', filteredData.length)
      }
      
      const currentPage = filters.page || 1
      const perPage = filters.per_page || 24
      const resultCount = filteredData.length
      const hasMore = resultCount === perPage
      
      return {
        data: filteredData,
        pagination: {
          page: currentPage,
          per_page: perPage,
          total: resultCount, // Show actual count for this page
          total_pages: hasMore ? 999 : currentPage, // Use 999 as "unknown" when has more, current page when last
          has_more: hasMore
        }
      }
    } catch (error) {
      console.error('❌ API Response Error:', error)
      throw error
    }
  }

  async getStoreCategories(vendorId: string): Promise<any[]> {
    try {
      console.log('🚀 API Request: GET store categories for vendor:', vendorId)
      
      // Get all products for this store to extract categories
      const response: AxiosResponse<any[]> = await this.client.get(`/wcfmmp/v1/store-vendors/${vendorId}/products`, {
        params: { per_page: 100 } // Get more products to capture all categories
      })
      
      if (!response.data || response.data.length === 0) {
        return []
      }
      
      // Extract unique categories from products with enhanced data
      const categoriesMap = new Map<number, any>()
      const categoryStats = new Map<number, {
        minPrice: number,
        maxPrice: number,
        avgPrice: number,
        products: any[]
      }>()
      
      response.data.forEach((product: any) => {
        if (product.categories && Array.isArray(product.categories)) {
          const productPrice = parseFloat(product.price || '0')
          
          product.categories.forEach((category: any) => {
            if (category.id && !categoriesMap.has(category.id)) {
              // Get category details from WooCommerce if available
              categoriesMap.set(category.id, {
                id: category.id,
                name: category.name,
                slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
                parent: category.parent || 0,
                description: category.description || '',
                image: category.image || null,
                count: 1,
                // Enhanced data
                created_at: category.date_created || null,
                updated_at: category.date_modified || null
              })
              
              // Initialize stats
              categoryStats.set(category.id, {
                minPrice: productPrice > 0 ? productPrice : Infinity,
                maxPrice: productPrice,
                avgPrice: productPrice,
                products: [product]
              })
            } else if (category.id) {
              // Update count and stats for existing category
              const existing = categoriesMap.get(category.id)
              if (existing) {
                existing.count += 1
              }
              
              const stats = categoryStats.get(category.id)
              if (stats && productPrice > 0) {
                stats.products.push(product)
                stats.minPrice = Math.min(stats.minPrice, productPrice)
                stats.maxPrice = Math.max(stats.maxPrice, productPrice)
                
                // Calculate average
                const validPrices = stats.products
                  .map(p => parseFloat(p.price || '0'))
                  .filter(p => p > 0)
                
                if (validPrices.length > 0) {
                  stats.avgPrice = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
                }
              }
            }
          })
        }
      })
      
      // Merge stats with categories
      const categories = Array.from(categoriesMap.values()).map(category => {
        const stats = categoryStats.get(category.id)
        
        return {
          ...category,
          price_range: stats ? {
            min: stats.minPrice === Infinity ? 0 : Math.floor(stats.minPrice),
            max: Math.ceil(stats.maxPrice),
            avg: Math.round(stats.avgPrice)
          } : { min: 0, max: 0, avg: 0 },
          // Additional useful data
          has_products: category.count > 0,
          last_updated: new Date().toISOString()
        }
      })
      
      // Sort by count (most popular first) then by name
      categories.sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count
        }
        return a.name.localeCompare(b.name, 'ar')
      })
      
      console.log('✅ API Response: Found', categories.length, 'enhanced categories for store', vendorId)
      return categories
      
    } catch (error) {
      console.error('❌ API Response Error getting store categories:', error)
      throw error
    }
  }

  private buildStoreParams(filters: any): any {
    const params: any = {
      page: filters.page || 1,
      per_page: filters.per_page || 20,
    }

    if (filters.search) {
      params.search = filters.search
    }

    if (filters.status) {
      params.status = filters.status
    }

    if (filters.sort) {
      params.orderby = this.mapStoreSortOption(filters.sort)
      params.order = filters.sort.includes('desc') ? 'desc' : 'asc'
    }

    return params
  }

  private mapStoreSortOption(sort: string): string {
    const sortMap: Record<string, string> = {
      'name': 'title',
      'rating': 'rating',
      'products_count': 'product_count',
      'joined_date': 'registered',
      'last_active': 'last_active',
    }

    return sortMap[sort] || 'title'
  }
}

// Export singleton instance
export const wooCommerceAPI = new WooCommerceAPI()
export default wooCommerceAPI