import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import { ProductFilters, ProductSortOptions } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const filters: ProductFilters = {
      page: parseInt(searchParams.get('page') || '1'),
      per_page: parseInt(searchParams.get('per_page') || '12'),
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      in_stock: searchParams.get('in_stock') === 'true',
      on_sale: searchParams.get('on_sale') === 'true',
      featured: searchParams.get('featured') === 'true',
      sort: (searchParams.get('sort') as ProductSortOptions) || 'date',
    }

    // Check if any filters are applied (excluding page, per_page, sort)
    const hasFilters = !!(
      filters.category ||
      filters.search ||
      filters.min_price ||
      filters.max_price ||
      filters.in_stock ||
      filters.on_sale ||
      filters.featured
    )

    console.log('🔍 API Route: Fetching products with filters:', filters)
    console.log('📊 Has active filters:', hasFilters)

    // Use diverse endpoint for default view, standard API for filtered views
    const response = hasFilters 
      ? await wooCommerceAPI.getProducts(filters)
      : await wooCommerceAPI.getDiverseProducts(filters)
    
    console.log('✅ API Route: Successfully fetched', response.data.length, 'products using', hasFilters ? 'standard' : 'diverse', 'endpoint')

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('❌ API Route Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        pagination: {
          page: 1,
          per_page: 12,
          total: 0,
          total_pages: 0
        }
      },
      { status: 500 }
    )
  }
}