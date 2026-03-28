import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      per_page: parseInt(searchParams.get('per_page') || '20'),
      sort: searchParams.get('sort') || 'name',
      status: searchParams.get('status') || 'active',
    }
    
    console.log('🔍 API Route: Fetching stores with filters:', filters)

    const result = await wooCommerceAPI.getStores(filters)
    
    console.log('✅ API Route: Successfully fetched', result.data?.length || 0, 'stores')

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('❌ API Route Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch stores',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}