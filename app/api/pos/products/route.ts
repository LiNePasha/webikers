/**
 * POS Products API
 * 
 * Fetches all products from vendor's POS system
 * Used for add products modal in bundle page
 */

import { NextResponse } from 'next/server'
import type { POSAPIResponse } from '@/types'

const VENDOR_ID = 22 // Ibrahim Shkman store
const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const vendorId = searchParams.get('vendor_id') || VENDOR_ID

  try {
    // Fetch from POS API
    const response = await fetch(
      `${WP_API_URL}/cashier/v1/store/${vendorId}/pos-initial?all`,
      {
        headers: {
          'Accept': 'application/json',
        },
        // Cache for 5 minutes (products don't change that often)
        next: { revalidate: 300 }
      }
    )

    if (!response.ok) {
      throw new Error(`POS API returned ${response.status}`)
    }

    const data: POSAPIResponse = await response.json()

    // Filter out draft/private products and out of stock items
    const availableProducts = data.products.filter(product => 
      product.status === 'publish' && 
      product.in_stock
    )

    return NextResponse.json({
      success: true,
      products: availableProducts,
      categories: data.categories,
      total: availableProducts.length,
      metadata: data.metadata
    })

  } catch (error: any) {
    console.error('❌ Error fetching POS products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في تحميل المنتجات',
        message: error.message
      },
      { status: 500 }
    )
  }
}
