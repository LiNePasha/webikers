import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string; categoryId: string }> }
) {
  try {
    const { vendorId, categoryId } = await params
    
    // Call the WordPress API endpoint
    const response = await fetch(
      `https://api.spare2app.com/wp-json/spare2app/v2/store/${vendorId}/category/${categoryId}/tags`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )
    
    if (!response.ok) {
      throw new Error(`WordPress API returned ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log(`📋 Store Category Tags API called for store ${vendorId}, category ${categoryId}`)
    console.log(`✅ Returning ${data.total_tags} tags for ${data.category_name}`)
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching store category tags:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch store category tags',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
