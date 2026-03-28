import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string; categoryId: string; tagSlug: string }> }
) {
  try {
    const { vendorId, categoryId, tagSlug } = await params
    const searchParams = request.nextUrl.searchParams
    
    // Build query string with filters
    const queryString = new URLSearchParams({
      page: searchParams.get('page') || '1',
      per_page: searchParams.get('per_page') || '12',
      sort: searchParams.get('sort') || 'date',
    }).toString()
    
    // Call the WordPress API endpoint
    const response = await fetch(
      `https://api.spare2app.com/wp-json/spare2app/v2/store/${vendorId}/category/${categoryId}/tag/${encodeURIComponent(tagSlug)}/products?${queryString}`,
      {
        next: { revalidate: 60 } // Cache for 1 minute
      }
    )
    
    if (!response.ok) {
      throw new Error(`WordPress API returned ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log(`🏷️ Store Category Tag Products API called for store ${vendorId}, category ${categoryId}, tag ${tagSlug}`)
    console.log(`✅ Returning ${data.products?.length || 0} products`)
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching store category tag products:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch store category tag products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
