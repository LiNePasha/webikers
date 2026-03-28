import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface VendorCategory {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  image: string
  count: number
  product_count?: number
}

interface VendorCategoriesState {
  // Categories data
  categories: VendorCategory[]
  
  // Loading state
  isLoading: boolean
  lastFetch: number | null
  
  // Actions
  fetchVendorCategories: (vendorId: string) => Promise<void>
  clearCache: () => void
}

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export const useVendorCategoriesStore = create<VendorCategoriesState>()(
  persist(
    (set, get) => ({
      // Initial state
      categories: [],
      isLoading: false,
      lastFetch: null,

      // Fetch vendor categories
      fetchVendorCategories: async (vendorId: string) => {
        const state = get()
        
        // Check cache validity
        if (
          state.categories.length > 0 &&
          state.lastFetch &&
          Date.now() - state.lastFetch < CACHE_DURATION
        ) {
          console.log('📦 Using cached vendor categories (', state.categories.length, 'items)')
          return
        }

        // Prevent duplicate fetches
        if (state.isLoading) {
          console.log('⏳ Already fetching vendor categories, skipping...')
          return
        }

        try {
          set({ isLoading: true })
          console.log('🔄 Fetching vendor categories from API for vendor:', vendorId)
          
          const categories = await wooCommerceAPI.getEnhancedStoreCategories(vendorId)

          set({
            categories: categories,
            lastFetch: Date.now(),
            isLoading: false,
          })

          console.log('✅ Vendor categories fetched:', categories.length)
        } catch (error) {
          console.error('❌ Error fetching vendor categories:', error)
          set({ isLoading: false })
        }
      },

      // Clear cache (for manual refresh)
      clearCache: () => {
        set({
          categories: [],
          lastFetch: null,
        })
      },
    }),
    {
      name: 'vendor-categories-storage',
      partialize: (state) => ({
        categories: state.categories,
        lastFetch: state.lastFetch,
      }),
    }
  )
)
