import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from URL
    const searchParams = request.nextUrl.searchParams
    const parent = searchParams.get('parent')
    const perPage = searchParams.get('per_page')
    const page = searchParams.get('page')
    
    // Log the full request URL and headers
    console.log('🌐 API Route: Full URL:', request.url)
    console.log('🔍 API Route: Referer:', request.headers.get('referer'))
    console.log('🔍 API Route: Fetching categories with params:', {
      parent: parent ? Number(parent) : undefined,
      per_page: perPage ? Number(perPage) : undefined,
      page: page ? Number(page) : undefined
    })

    // Build params object
    const params: { parent?: number; per_page?: number; page?: number } = {}
    if (parent) params.parent = Number(parent)
    if (perPage) params.per_page = Number(perPage)
    if (page) params.page = Number(page)

    const categories = await wooCommerceAPI.getCategories(params)
    
    console.log('✅ API Route: Successfully fetched', categories.length, 'categories')

    return NextResponse.json({ data: categories }, { status: 200 })
  } catch (error) {
    console.error('❌ API Route Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      },
      { status: 500 }
    )
  }
}