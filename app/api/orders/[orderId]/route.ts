import { NextRequest, NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

/**
 * Get Order Details
 * GET /api/orders/[orderId]
 * 
 * Fetch order details from WooCommerce
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
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing order ID' },
        { status: 400 }
      );
    }

    console.log(`📦 Fetching order details for order ${orderId}`);

    // Fetch order from WooCommerce
    const response = await WooCommerce.get(`orders/${orderId}`);
    const order = response.data;

    console.log(`✅ Order ${orderId} fetched successfully`);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.number,
        status: order.status,
        total: parseFloat(order.total),
        currency: order.currency,
        dateCreated: order.date_created,
        paymentMethod: order.payment_method,
        paymentMethodTitle: order.payment_method_title,
        transactionId: order.transaction_id,
        billing: order.billing,
        shipping: order.shipping,
        lineItems: order.line_items,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
