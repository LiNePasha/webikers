import { NextResponse } from 'next/server'
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'
import type { CreateOrderRequest, CreateOrderResponse } from '@/types'
import { createOrderRequestSchema } from '@/lib/utils/validation'
import { requireAuth } from '@/lib/auth/server'
import { cookies } from 'next/headers'

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL?.replace('/wp-json/wc/v3', '') || '',
  consumerKey: process.env.WC_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || '',
  version: 'wc/v3',
})

/**
 * POST /api/checkout/create-order
 * 
 * Create WooCommerce order with payment proof (if Instapay)
 * NO Bosta shipment creation - just WooCommerce order
 */
export async function POST(request: Request) {
  try {
    // Check if user is logged in (optional - guest checkout allowed)
    let userId: number | null = null
    
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('jwt_token')?.value
      
      if (token) {
        // Get user info from JWT
        const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8000/wp-json'
        const userRes = await fetch(`${API_URL}/custom/v1/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        
        if (userRes.ok) {
          const userData = await userRes.json()
          userId = userData.user?.id || null
          console.log('✅ Logged in user detected:', userId)
        }
      }
    } catch (authError) {
      // Guest checkout - continue without user ID
      console.log('ℹ️ Guest checkout (no authentication)')
    }

    // Parse and validate request body
    const body: CreateOrderRequest = await request.json()
    
    console.log('📥 Received order data:', JSON.stringify(body, null, 2))
    
    const validation = createOrderRequestSchema.safeParse(body)
    if (!validation.success) {
      console.error('❌ Validation failed:', JSON.stringify(validation.error.issues, null, 2))
      
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات الطلب غير صحيحة',
          message: 'بيانات الطلب غير صحيحة، يرجى مراجعة البيانات والمحاولة مرة أخرى',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const orderData = validation.data
    
    // Debug: Log vendor ID
    console.log('🔍 DEBUG - Vendor ID received:', orderData.vendorId)
    console.log('🔍 DEBUG - Line items:', JSON.stringify(orderData.lineItems, null, 2))

    // Prepare WooCommerce order data
    const wcOrderData: any = {
      payment_method: orderData.paymentMethod,
      payment_method_title: orderData.paymentMethodTitle,
      set_paid: false, // Will be set manually after payment verification
      
      // CRITICAL: Link order to logged-in user
      ...(userId ? { customer_id: userId } : {}),
      
      // Billing address
      billing: {
        first_name: orderData.billingAddress.firstName,
        last_name: orderData.billingAddress.lastName,
        address_1: orderData.billingAddress.address,
        city: orderData.billingAddress.city,
        postcode: '',
        country: 'EG',
        email: orderData.billingAddress.email || `${orderData.billingAddress.phone}@guest.com`, // Use phone as email for guests
        phone: orderData.billingAddress.phone,
      },
      
      // Shipping address
      shipping: {
        first_name: orderData.shippingAddress.firstName,
        last_name: orderData.shippingAddress.lastName,
        address_1: orderData.shippingAddress.address,
        address_2: [
          orderData.shippingAddress.building ? `عمارة ${orderData.shippingAddress.building}` : '',
          orderData.shippingAddress.floor ? `الدور ${orderData.shippingAddress.floor}` : '',
          orderData.shippingAddress.apartment ? `شقة ${orderData.shippingAddress.apartment}` : '',
          orderData.shippingAddress.landmark || '',
        ].filter(Boolean).join(', '),
        city: orderData.shippingAddress.cityName || orderData.shippingAddress.city,
        state: orderData.shippingAddress.districtName || orderData.shippingAddress.district,
        postcode: '',
        country: 'EG',
      },
      
      // Line items (products)
      line_items: orderData.lineItems,
      
      // Shipping lines
      shipping_lines: orderData.shippingLines,
      
      // Customer note
      customer_note: orderData.customerNote || '',
      
      // Meta data
      meta_data: [
        ...(orderData.metaData || []),
        {
          key: '_shipping_city_id',
          value: orderData.shippingAddress.city,
        },
        {
          key: '_shipping_city_name',
          value: orderData.shippingAddress.cityName || orderData.shippingAddress.city,
        },
        {
          key: '_shipping_district_id',
          value: orderData.shippingAddress.district,
        },
        {
          key: '_shipping_district_name',
          value: orderData.shippingAddress.districtName || orderData.shippingAddress.district,
        },
        {
          key: '_shipping_phone',
          value: orderData.shippingAddress.phone,
        },
        // WCFM vendor assignment - CRITICAL for commission calculation
        ...(orderData.vendorId ? [
          {
            key: '_vendor_id',
            value: orderData.vendorId.toString(),
          },
          {
            key: '_wcfm_vendor',
            value: orderData.vendorId.toString(),
          },
          {
            key: 'wcfm_marketplace_vendor',
            value: orderData.vendorId.toString(),
          },
        ] : []),
      ],
    }

    // Add payment proof if Instapay
    if (orderData.paymentMethod === 'instapay' && orderData.paymentProof) {
      wcOrderData.meta_data.push(
        {
          key: '_instapay_payment_proof',
          value: orderData.paymentProof.imageUrl,
        },
        {
          key: '_instapay_payment_proof_public_id',
          value: orderData.paymentProof.publicId,
        },
        {
          key: '_instapay_payment_amount',
          value: orderData.paymentProof.amount.toString(),
        },
        {
          key: '_instapay_uploaded_at',
          value: orderData.paymentProof.uploadedAt,
        }
      )
      
      // Set status to on-hold for manual verification
      wcOrderData.status = 'on-hold'
    }

    // Create order in WooCommerce
    console.log('Creating WooCommerce order with data:', JSON.stringify(wcOrderData, null, 2))
    
    const { data: order } = await api.post('orders', wcOrderData)
    
    if (!order || !order.id) {
      throw new Error('Failed to create order in WooCommerce')
    }
    
    console.log('WooCommerce order created successfully:', order.id)

    // CRITICAL: Update order meta_data after creation (some plugins may override on creation)
    try {
      console.log('🔧 Updating order meta_data with shipping info')
      
      await api.put(`orders/${order.id}`, {
        meta_data: [
          ...(order.meta_data || []),
          {
            key: '_shipping_city_id',
            value: orderData.shippingAddress.city,
          },
          {
            key: '_shipping_city_name',
            value: orderData.shippingAddress.cityName || orderData.shippingAddress.city,
          },
          {
            key: '_shipping_district_id',
            value: orderData.shippingAddress.district,
          },
          {
            key: '_shipping_district_name',
            value: orderData.shippingAddress.districtName || orderData.shippingAddress.district,
          },
          {
            key: '_shipping_phone',
            value: orderData.shippingAddress.phone,
          },
        ]
      })
      
      console.log('✅ Order meta_data updated successfully')
    } catch (metaUpdateError) {
      console.error('⚠️ Failed to update order meta_data:', metaUpdateError)
      // Continue - not critical for order creation
    }

    // CRITICAL: Update line items with store_id after order creation
    // WooCommerce REST API doesn't accept store_id in POST, we must update after
    if (orderData.vendorId && order.line_items) {
      try {
        console.log('🔧 Updating line items with store_id:', orderData.vendorId)
        
        const updatedLineItems = order.line_items.map((item: any) => ({
          id: item.id,
          meta_data: [
            ...(item.meta_data || []),
            {
              key: 'store_id',
              value: orderData.vendorId?.toString() || ''
            },
            {
              key: '_vendor_id', 
              value: orderData.vendorId?.toString() || ''
            }
          ]
        }))
        
        // Update the order with store_id in line items
        await api.put(`orders/${order.id}`, {
          line_items: updatedLineItems
        })
        
        console.log('✅ Line items updated with store_id')
      } catch (updateError) {
        console.error('⚠️ Failed to update line items with store_id:', updateError)
        // Continue - order is created, this is enhancement
      }
    }

    // Prepare response
    const response: CreateOrderResponse = {
      success: true,
      orderId: order.id, // Add orderId at root level for easy access
      order: {
        id: order.id,
        orderNumber: order.number,
        status: order.status,
        total: parseFloat(order.total),
        currency: order.currency,
        dateCreated: order.date_created,
        paymentUrl: order.payment_url || undefined,
      },
      message: 'تم إنشاء الطلب بنجاح',
    }

    // If Instapay, add note about verification
    if (orderData.paymentMethod === 'instapay') {
      response.message = 'تم إنشاء الطلب بنجاح. سيتم مراجعة إثبات الدفع والتأكيد خلال 24 ساعة'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Create order API error:', error)
    
    // Log detailed error for WooCommerce API errors
    if (error && typeof error === 'object' && 'response' in error) {
      const wcError = error as any
      console.error('❌ WooCommerce API Response:', {
        status: wcError.response?.status,
        statusText: wcError.response?.statusText,
        data: wcError.response?.data,
        body: wcError.response?.body,
      })
      
      // Return detailed WooCommerce error
      return NextResponse.json(
        {
          success: false,
          error: 'فشل في إنشاء الطلب',
          message: wcError.response?.data?.message || wcError.message || 'خطأ في الاتصال بالمتجر',
          details: wcError.response?.data || undefined,
        },
        { status: wcError.response?.status || 500 }
      )
    }
    
    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في إنشاء الطلب',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع',
        details: error && typeof error === 'object' ? JSON.stringify(error) : undefined,
      },
      { status: 500 }
    )
  }
}
