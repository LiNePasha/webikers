import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface StoreParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: StoreParams
) {
  try {
    const resolvedParams = await params
    const storeSlug = resolvedParams.slug
    
    console.log('🔍 API Route: Fetching store with slug:', storeSlug)

    const store = await wooCommerceAPI.getStore(storeSlug)
    
    console.log('✅ API Route: Successfully fetched store:', store.store_name || store.name)

    return NextResponse.json({ data: store }, { status: 200 })
  } catch (error) {
    console.error('❌ API Route Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch store',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}