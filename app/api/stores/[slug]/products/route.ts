import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface StoreProductsParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: StoreProductsParams
) {
  try {
    const resolvedParams = await params
    const storeSlug = resolvedParams.slug
    const { searchParams } = new URL(request.url)
    
    // First, get the store to find its vendor_id
    const store = await wooCommerceAPI.getStore(storeSlug)
    const vendorId = store.vendor_id
    
    if (!vendorId) {
      throw new Error('Vendor ID not found for store: ' + storeSlug)
    }
    
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      per_page: parseInt(searchParams.get('per_page') || '12'),
      sort: searchParams.get('sort') || 'date',
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
    }
    
    console.log('🔍 API Route: Fetching products for store:', storeSlug, 'Vendor ID:', vendorId)

    const result = await wooCommerceAPI.getStoreProducts(vendorId, filters)
    
    console.log('✅ API Route: Successfully fetched', result.data?.length || 0, 'products for store')

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('❌ API Route Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch store products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}