import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Route: Fetching vendors')

    const vendors = await wooCommerceAPI.getVendors()
    
    console.log('✅ API Route: Successfully fetched', vendors.length, 'vendors')

    return NextResponse.json({ data: vendors }, { status: 200 })
  } catch (error) {
    console.error('❌ API Route Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch vendors',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      },
      { status: 500 }
    )
  }
}