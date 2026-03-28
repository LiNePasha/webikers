import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Category } from '@/types'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface CategoriesState {
  // Categories data
  mainCategories: Category[] // children of 365
  otherCategories: Category[] // all other categories (excluding 365 and its children)
  allCategories: Category[]
  
  // Loading states
  isLoading: boolean
  otherCategoriesLoading: boolean
  lastFetch: number | null
  lastOtherFetch: number | null
  
  // Actions
  fetchMainCategories: () => Promise<void>
  fetchOtherCategories: () => Promise<void>
  getSubCategories: (parentId: number) => Category[]
  clearCache: () => void
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      // Initial state
      mainCategories: [],
      otherCategories: [],
      allCategories: [],
      isLoading: false,
      otherCategoriesLoading: false,
      lastFetch: null,
      lastOtherFetch: null,

      // Fetch main categories (children of 365)
      fetchMainCategories: async () => {
        const state = get()
        
        console.log('🎯 fetchMainCategories called', {
          hasCategories: state.mainCategories.length > 0,
          lastFetch: state.lastFetch,
          cacheAge: state.lastFetch ? Date.now() - state.lastFetch : null,
          isLoading: state.isLoading
        })
        
        // Check cache validity
        if (
          state.mainCategories.length > 0 &&
          state.lastFetch &&
          Date.now() - state.lastFetch < CACHE_DURATION
        ) {
          console.log('📦 Using cached main categories (', state.mainCategories.length, 'items)')
          return
        }

        // If cache expired but still have old data, clear it
        if (state.lastFetch && Date.now() - state.lastFetch >= CACHE_DURATION) {
          console.log('🧹 Cache expired, clearing old data...')
          set({ mainCategories: [], lastFetch: null })
        }

        // Prevent duplicate fetches
        if (state.isLoading) {
          console.log('⏳ Already fetching categories, skipping...')
          return
        }

        try {
          set({ isLoading: true })
          console.log('🔄 Fetching main categories from API...')
          
          const categories = await wooCommerceAPI.getCategories({
            parent: 365,
            per_page: 100,
          })

          set({
            mainCategories: categories,
            allCategories: categories,
            lastFetch: Date.now(),
            isLoading: false,
          })

          console.log('✅ Categories fetched:', categories.length)
        } catch (error) {
          console.error('❌ Error fetching categories:', error)
          set({ isLoading: false })
        }
      },

      // Fetch other categories (excluding 365 and its children)
      fetchOtherCategories: async () => {
        const state = get()
        
        // Check cache validity
        if (
          state.otherCategories.length > 0 &&
          state.lastOtherFetch &&
          Date.now() - state.lastOtherFetch < CACHE_DURATION
        ) {
          console.log('📦 Using cached other categories (', state.otherCategories.length, 'items)')
          return
        }

        // Prevent duplicate fetches
        if (state.otherCategoriesLoading) {
          console.log('⏳ Already fetching other categories, skipping...')
          return
        }

        try {
          set({ otherCategoriesLoading: true })
          console.log('🔄 Fetching other categories from API...')
          
          // Get ALL categories (no parent filter)
          const allCategories = await wooCommerceAPI.getCategories({
            per_page: 100,
          })

          // Build set of ALL IDs to exclude (365 + all descendants)
          const excludeIds = new Set<number>([365]) // Start with 365
          
          // Helper function to find all descendants recursively
          const findDescendants = (parentId: number) => {
            allCategories.forEach(cat => {
              if (cat.parent === parentId && !excludeIds.has(cat.id)) {
                excludeIds.add(cat.id)
                console.log(`🚫 Excluding: ${cat.name} (ID: ${cat.id}, parent: ${parentId})`)
                findDescendants(cat.id) // Recursive: find children of this category
              }
            })
          }
          
          // Find all descendants starting from 365
          console.log('🔍 Finding all descendants of category 365...')
          findDescendants(365)
          
          console.log('🚫 Total excluded category IDs:', Array.from(excludeIds))
          
          // Filter: exclude 365 and ALL its descendants
          const otherCats = allCategories.filter(cat => 
            !excludeIds.has(cat.id) &&  // ← ليس من شجرة 365
            cat.count > 0                // ← فيه منتجات
          )

          set({
            otherCategories: otherCats,
            lastOtherFetch: Date.now(),
            otherCategoriesLoading: false,
          })

          console.log('✅ Other categories fetched:', otherCats.length)
          console.log('✅ Excluded total:', excludeIds.size, 'categories from tree of 365')
          console.log('📋 Other categories:', otherCats.map(c => `${c.name} (${c.id})`))
        } catch (error) {
          console.error('❌ Error fetching other categories:', error)
          set({ otherCategoriesLoading: false })
        }
      },

      // Get subcategories for a parent category
      getSubCategories: (parentId: number) => {
        const state = get()
        return state.allCategories.filter((cat) => cat.parent === parentId)
      },

      // Clear cache (for manual refresh)
      clearCache: () => {
        set({
          mainCategories: [],
          otherCategories: [],
          allCategories: [],
          lastFetch: null,
          lastOtherFetch: null,
        })
      },
    }),
    {
      name: 'categories-storage',
      partialize: (state) => ({
        mainCategories: state.mainCategories,
        otherCategories: state.otherCategories,
        allCategories: state.allCategories,
        lastFetch: state.lastFetch,
        lastOtherFetch: state.lastOtherFetch,
      }),
    }
  )
)
