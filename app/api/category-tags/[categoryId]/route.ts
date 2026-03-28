import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    
    // Call the real WordPress API endpoint
    const response = await fetch(
      `https://api.spare2app.com/wp-json/spare2app/v2/category/${categoryId}/tags`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )
    
    if (!response.ok) {
      throw new Error(`WordPress API returned ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log(`📋 Category Tags API called for category ${categoryId}`)
    console.log(`✅ Returning ${data.total_tags} tags for ${data.category_name}`)
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching category tags:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch category tags',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

