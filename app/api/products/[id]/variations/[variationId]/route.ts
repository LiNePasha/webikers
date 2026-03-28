import { NextRequest, NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

/**
 * Get Product Variation
 * GET /api/products/[id]/variations/[variationId]
 * 
 * Fetch specific variation details from WooCommerce
 */

// Initialize WooCommerce API
const WooCommerce = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WP_API_URL?.replace('/wp-json', '') || '',
  consumerKey: process.env.WC_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || '',
  version: 'wc/v3',
  queryStringAuth: true
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variationId: string }> }
) {
  try {
    const { id, variationId } = await params;

    if (!id || !variationId) {
      return NextResponse.json(
        { success: false, error: 'Missing product or variation ID' },
        { status: 400 }
      );
    }

    console.log(`📦 Fetching variation ${variationId} for product ${id}`);

    // Fetch variation from WooCommerce
    const response = await WooCommerce.get(
      `products/${id}/variations/${variationId}`
    );
    
    const variation = response.data;

    console.log(`✅ Variation ${variationId} fetched successfully`);
    console.log('📊 Variation attributes:', variation.attributes);

    return NextResponse.json({
      success: true,
      id: variation.id,
      price: variation.price,
      regular_price: variation.regular_price,
      sale_price: variation.sale_price,
      stock_status: variation.stock_status,
      stock_quantity: variation.stock_quantity,
      attributes: variation.attributes,
      image: variation.image,
      description: variation.description,
    });
  } catch (error) {
    console.error('❌ Error fetching variation:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch variation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
