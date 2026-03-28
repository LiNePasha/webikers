import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const { slug } = resolvedParams
    
    console.log('🔍 API Route: Fetching categories for store:', slug)
    
    // First get the store to find vendor_id
    const store = await wooCommerceAPI.getStore(slug)
    
    if (!store || !store.vendor_id) {
      console.error('❌ API Route: Store not found:', slug)
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }
    
    console.log('🔍 API Route: Fetching categories for Vendor ID:', store.vendor_id)
    
    // Get categories for this store
    const categories = await wooCommerceAPI.getStoreCategories(store.vendor_id)
    
    console.log('✅ API Route: Successfully fetched', categories.length, 'categories for store')
    
    return NextResponse.json({
      categories,
      total: categories.length
    })
    
  } catch (error: any) {
    console.error('❌ API Route Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch store categories',
        details: error.message 
      },
      { status: 500 }
    )
  }
}