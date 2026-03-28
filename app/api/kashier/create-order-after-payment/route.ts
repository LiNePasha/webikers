import { NextRequest, NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

/**
 * Create WooCommerce Order After Successful Kashier Payment
 * POST /api/kashier/create-order-after-payment
 * 
 * Called from success page with pendingOrder data from sessionStorage
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

    const {
      tempOrderId,
      kashierTransactionId,
      kashierPaymentMethod,
      kashierCardNumber,
      pendingOrderData
    } = body;

    if (!tempOrderId || !kashierTransactionId || !pendingOrderData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    console.log('🛒 Creating WooCommerce order after payment:', {
      tempOrderId,
      kashierTransactionId,
      vendorId: pendingOrderData.vendorId
    });

    // Prepare WooCommerce order data
    const orderData: any = {
      payment_method: 'kashier',
      payment_method_title: 'Kashier Payment Gateway',
      set_paid: true, // Mark as paid since payment already succeeded
      status: 'processing',
      customer_id: pendingOrderData.customerId || 0,
      
      // Billing address
      billing: {
        first_name: pendingOrderData.billingAddress.firstName || pendingOrderData.shippingAddress.firstName,
        last_name: pendingOrderData.billingAddress.lastName || pendingOrderData.shippingAddress.lastName || '',
        address_1: pendingOrderData.billingAddress.address || pendingOrderData.shippingAddress.address,
        address_2: pendingOrderData.billingAddress.address2 || '',
        city: pendingOrderData.billingAddress.cityName || pendingOrderData.shippingAddress.cityName,
        state: pendingOrderData.billingAddress.districtName || pendingOrderData.shippingAddress.districtName,
        postcode: '',
        country: 'EG',
        email: pendingOrderData.billingAddress.email || `${pendingOrderData.billingAddress.phone || pendingOrderData.shippingAddress.phone}@guest.com`,
        phone: pendingOrderData.billingAddress.phone || pendingOrderData.shippingAddress.phone,
      },

      // Shipping address
      shipping: {
        first_name: pendingOrderData.shippingAddress.firstName,
        last_name: pendingOrderData.shippingAddress.lastName || '',
        address_1: pendingOrderData.shippingAddress.address,
        address_2: pendingOrderData.shippingAddress.address2 || '',
        city: pendingOrderData.shippingAddress.cityName,
        state: pendingOrderData.shippingAddress.districtName,
        postcode: '',
        country: 'EG',
      },

      // Line items
      line_items: pendingOrderData.lineItems.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        variation_id: item.variation_id || 0,
      })),

      // Shipping lines
      shipping_lines: pendingOrderData.shippingLines,

      // Customer note
      customer_note: pendingOrderData.customerNote || '',

      // Meta data
      meta_data: [
        {
          key: '_kashier_transaction_id',
          value: kashierTransactionId
        },
        {
          key: '_kashier_temp_order_id',
          value: tempOrderId
        },
        {
          key: '_kashier_payment_method',
          value: kashierPaymentMethod || 'kashier'
        },
        {
          key: '_shipping_city_id',
          value: pendingOrderData.shippingAddress.city
        },
        {
          key: '_shipping_city_name',
          value: pendingOrderData.shippingAddress.cityName
        },
        {
          key: '_shipping_district_id',
          value: pendingOrderData.shippingAddress.district
        },
        {
          key: '_shipping_district_name',
          value: pendingOrderData.shippingAddress.districtName
        },
        {
          key: '_shipping_phone',
          value: pendingOrderData.shippingAddress.phone
        },
        {
          key: '_vendor_id',
          value: pendingOrderData.vendorId?.toString() || ''
        },
        {
          key: '_wcfm_vendor',
          value: pendingOrderData.vendorId?.toString() || ''
        },
        {
          key: 'wcfm_marketplace_vendor',
          value: pendingOrderData.vendorId?.toString() || ''
        },
        {
          key: '_order_total_weight',
          value: pendingOrderData.totalWeight?.toString() || '0'
        }
      ]
    };

    // Add card number if available
    if (kashierCardNumber) {
      orderData.meta_data.push({
        key: '_kashier_card_number',
        value: kashierCardNumber
      });
    }

    console.log('📦 Creating WooCommerce order with data:', {
      customerId: orderData.customer_id,
      lineItems: orderData.line_items.length,
      total: pendingOrderData.grandTotal
    });

    // Create order in WooCommerce
    const response = await WooCommerce.post('orders', orderData);

    console.log('✅ WooCommerce order created:', response.data.id);

    // Update order meta_data after creation to ensure they persist
    try {
      console.log('🔧 Updating order meta_data with shipping info');
      
      await WooCommerce.put(`orders/${response.data.id}`, {
        meta_data: [
          ...(response.data.meta_data || []),
          {
            key: '_shipping_city_id',
            value: pendingOrderData.shippingAddress.city,
          },
          {
            key: '_shipping_city_name',
            value: pendingOrderData.shippingAddress.cityName,
          },
          {
            key: '_shipping_district_id',
            value: pendingOrderData.shippingAddress.district,
          },
          {
            key: '_shipping_district_name',
            value: pendingOrderData.shippingAddress.districtName,
          },
          {
            key: '_shipping_phone',
            value: pendingOrderData.shippingAddress.phone,
          },
        ]
      });
      
      console.log('✅ Order meta_data updated successfully');
    } catch (metaUpdateError) {
      console.error('⚠️ Failed to update order meta_data:', metaUpdateError);
    }

    // Update line items with store_id
    if (pendingOrderData.vendorId && response.data.line_items) {
      try {
        console.log('🔧 Updating line items with store_id:', pendingOrderData.vendorId);
        
        const updatedLineItems = response.data.line_items.map((item: any) => ({
          id: item.id,
          meta_data: [
            ...(item.meta_data || []),
            {
              key: 'store_id',
              value: pendingOrderData.vendorId?.toString() || ''
            },
            {
              key: '_vendor_id',
              value: pendingOrderData.vendorId?.toString() || ''
            }
          ]
        }));
        
        await WooCommerce.put(`orders/${response.data.id}`, {
          line_items: updatedLineItems
        });
        
        console.log('✅ Line items updated with store_id');
      } catch (updateError) {
        console.error('⚠️ Failed to update line items:', updateError);
      }
    }

    // Add order note
    await WooCommerce.post(`orders/${response.data.id}/notes`, {
      note: `الدفع تم بنجاح عبر كاشير.\nرقم المعاملة: ${kashierTransactionId}\nطريقة الدفع: ${kashierPaymentMethod || 'Kashier'}${kashierCardNumber ? `\nآخر 4 أرقام من البطاقة: ${kashierCardNumber}` : ''}`,
      customer_note: false
    });

    return NextResponse.json({
      success: true,
      order: {
        id: response.data.id,
        number: response.data.number,
        status: response.data.status,
        total: response.data.total,
      }
    });

  } catch (error: any) {
    console.error('Error creating order after payment:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: error.response?.data?.message || error.message
      },
      { status: 500 }
    );
  }
}
