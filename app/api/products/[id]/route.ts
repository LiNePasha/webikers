import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface ProductParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: ProductParams
) {
  try {
    const resolvedParams = await params
    const productId = resolvedParams.id
    
    console.log('🔍 API Route: Fetching product with ID/Slug:', productId)

    let product: any
    
    // Check if it's a numeric ID or a slug
    if (/^\d+$/.test(productId)) {
      // It's a numeric ID
      product = await wooCommerceAPI.getProduct(productId)
    } else {
      // It's a slug
      product = await wooCommerceAPI.getProductBySlug(productId)
    }
    
    // Verify product belongs to our vendor
    const expectedVendorId = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
    const productVendorId = product.meta_data?.find(
      (meta: any) => meta.key === '_wcfm_product_author'
    )?.value || product.store?.vendor_id?.toString()

    if (productVendorId !== expectedVendorId) {
      console.log('❌ Product does not belong to our vendor')
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    console.log('✅ API Route: Successfully fetched product:', product.name)

    return NextResponse.json({ data: product }, { status: 200 })
  } catch (error) {
    console.error('❌ API Route Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}