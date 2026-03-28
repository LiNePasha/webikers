import { NextRequest, NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

/**
 * Update Order After Kashier Payment
 * POST /api/kashier/update-order
 * 
 * Called from success page to update order status after payment
 */

// Initialize WooCommerce API
const WooCommerce = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WP_API_URL?.replace('/wp-json', '') || '',
  consumerKey: process.env.WC_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || '',
  version: 'wc/v3',
  queryStringAuth: true
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, transactionId, paymentMethod, cardNumber } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing order ID' },
        { status: 400 }
      );
    }

    console.log(`📝 Updating order ${orderId} to status: ${status}`);

    // Update order status
    await WooCommerce.put(`orders/${orderId}`, {
      status: status || 'processing',
      set_paid: status === 'processing', // Mark as paid if processing
    });

    // Add order note
    const orderNote = transactionId
      ? `✅ تم الدفع بنجاح عبر Kashier\nرقم المعاملة: ${transactionId}${
          paymentMethod ? `\nطريقة الدفع: ${paymentMethod}` : ''
        }${cardNumber ? `\nآخر 4 أرقام: ${cardNumber}` : ''}`
      : 'تم تحديث حالة الطلب';

    await WooCommerce.post(`orders/${orderId}/notes`, {
      note: orderNote,
      customer_note: false,
    });

    // Update payment metadata
    if (transactionId) {
      await WooCommerce.put(`orders/${orderId}`, {
        meta_data: [
          {
            key: '_kashier_transaction_id',
            value: transactionId,
          },
          {
            key: '_kashier_payment_method',
            value: paymentMethod || 'kashier',
          },
          {
            key: '_payment_status',
            value: 'completed',
          },
          {
            key: '_kashier_payment_pending',
            value: 'no',
          },
        ],
      });
    }

    console.log(`✅ Order ${orderId} updated successfully`);

    return NextResponse.json({
      success: true,
      orderId,
      status,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating order:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
