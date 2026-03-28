import { NextRequest, NextResponse } from 'next/server';
import { parseKashierCallback } from '@/lib/kashier/hash';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

/**
 * Kashier Webhook Handler
 * POST /api/kashier/webhook
 * 
 * Receives payment confirmation from Kashier and updates WooCommerce order
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
    // Get the full URL with query string
    const url = new URL(request.url);
    const queryString = url.search.slice(1); // Remove the leading '?'

    console.log('Kashier webhook received:', queryString);

    // Parse and validate the callback
    const paymentData = parseKashierCallback(queryString);

    // Verify signature
    if (!paymentData.isValid) {
      console.error('Invalid Kashier signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Extract payment information
    const {
      orderId,
      amount,
      currency,
      status,
      paymentMethod,
      transactionId,
      cardNumber
    } = paymentData;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order ID' },
        { status: 400 }
      );
    }

    console.log(`Processing payment for order ${orderId}:`, {
      status,
      amount,
      currency,
      paymentMethod,
      transactionId
    });

    // Check if this is a temporary order ID (needs to create WooCommerce order)
    const isTempOrder = orderId?.startsWith('TEMP-');
    let finalOrderId = orderId;
    let wooOrder: any = null;

    if (isTempOrder && status?.toLowerCase() === 'success') {
      // Payment succeeded for temp order - create real WooCommerce order
      console.log('💳 Payment successful for temp order, creating WooCommerce order...');
      
      try {
        // Create the WooCommerce order
        const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethod: 'kashier',
            paymentMethodTitle: 'Kashier Payment Gateway',
            status: 'processing', // Mark as paid
            transactionId,
            kashierOrderId: orderId, // Store temp ID for reference
          }),
        });

        const orderData = await orderResponse.json();
        
        if (orderData.success && orderData.order) {
          finalOrderId = orderData.order.id.toString();
          wooOrder = orderData.order;
          console.log(`✅ Created WooCommerce order #${finalOrderId}`);
        } else {
          console.error('Failed to create WooCommerce order:', orderData.error);
          // Still process the webhook to acknowledge payment
          return NextResponse.json({
            success: true,
            warning: 'Payment received but order creation failed',
            kashierOrderId: orderId,
            transactionId
          });
        }
      } catch (createError) {
        console.error('Error creating WooCommerce order:', createError);
        return NextResponse.json({
          success: true,
          warning: 'Payment received but order creation failed',
          kashierOrderId: orderId,
          transactionId
        });
      }
    }

    // Determine WooCommerce order status based on Kashier status
    let orderStatus: 'processing' | 'failed' | 'on-hold' = 'on-hold';
    let orderNote = '';

    switch (status?.toLowerCase()) {
      case 'success':
      case 'successful':
        orderStatus = 'processing';
        orderNote = `الدفع تم بنجاح عبر كاشير.\nطريقة الدفع: ${paymentMethod}\nرقم المعاملة: ${transactionId}`;
        if (cardNumber) {
          orderNote += `\nآخر 4 أرقام من البطاقة: ${cardNumber}`;
        }
        break;

      case 'failure':
      case 'failed':
        orderStatus = 'failed';
        orderNote = `فشل الدفع عبر كاشير.\nطريقة الدفع: ${paymentMethod}`;
        break;

      case 'pending':
        orderStatus = 'on-hold';
        orderNote = `الدفع قيد الانتظار عبر كاشير.\nطريقة الدفع: ${paymentMethod}\nرقم المعاملة: ${transactionId}`;
        break;

      default:
        orderStatus = 'on-hold';
        orderNote = `تحديث من كاشير - الحالة: ${status}`;
    }

    // Update WooCommerce order
    try {
      // Update order status
      await WooCommerce.put(`orders/${orderId}`, {
        status: orderStatus,
      });

      // Add order note with payment details
      await WooCommerce.post(`orders/${orderId}/notes`, {
        note: orderNote,
        customer_note: false
      });

      // If successful, add transaction ID to order meta
      if (status?.toLowerCase() === 'success' && transactionId) {
        await WooCommerce.put(`orders/${orderId}`, {
          meta_data: [
            {
              key: '_kashier_transaction_id',
              value: transactionId
            },
            {
              key: '_kashier_payment_method',
              value: paymentMethod
            },
            {
              key: '_payment_method',
              value: 'kashier'
            },
            {
              key: '_payment_method_title',
              value: 'Kashier Payment Gateway'
            }
          ]
        });
      }

      console.log(`Order ${orderId} updated successfully to status: ${orderStatus}`);

      return NextResponse.json({
        success: true,
        orderId,
        status: orderStatus,
        message: 'Order updated successfully'
      });

    } catch (wcError) {
      console.error('WooCommerce API error:', wcError);
      
      // Even if WC update fails, acknowledge receipt to Kashier
      return NextResponse.json({
        success: true,
        warning: 'Payment received but order update failed',
        orderId
      });
    }

  } catch (error) {
    console.error('Error processing Kashier webhook:', error);
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing/verification)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const queryString = url.search.slice(1);

  if (!queryString) {
    return NextResponse.json({
      message: 'Kashier webhook endpoint',
      status: 'active'
    });
  }

  try {
    const paymentData = parseKashierCallback(queryString);
    
    return NextResponse.json({
      message: 'Webhook test',
      isValid: paymentData.isValid,
      data: paymentData
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Webhook test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}
