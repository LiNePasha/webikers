import { NextResponse } from 'next/server'
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'
import type { SavedAddress } from '@/types'
import { savedAddressSchema } from '@/lib/utils/validation'
import { requireAuth } from '@/lib/auth/server'

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL?.replace('/wp-json/wc/v3', '') || '',
  consumerKey: process.env.WC_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || '',
  version: 'wc/v3',
})

/**
 * GET /api/checkout/addresses
 * 
 * Get shipping and billing addresses from WooCommerce customer
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const user = await requireAuth()
    const customerId = user.id

    // Get customer data from WooCommerce
    const { data: customer } = await api.get(`customers/${customerId}`)
    
    // Return shipping and billing addresses
    const addresses: SavedAddress[] = []
    
    // Add shipping address if exists
    if (customer.shipping?.address_1) {
      addresses.push({
        id: 'shipping',
        type: 'shipping',
        firstName: customer.shipping.first_name || '',
        lastName: customer.shipping.last_name || '',
        phone: customer.billing?.phone || '', // Phone usually in billing
        city: customer.shipping.city || '',
        cityName: customer.shipping.city || '',
        district: customer.shipping.state || '',
        districtName: customer.shipping.state || '',
        address: customer.shipping.address_1 || '',
        building: customer.shipping.address_2 || '',
        isDefault: true,
      })
    }
    
    // Add billing address if exists and different from shipping
    if (customer.billing?.address_1) {
      addresses.push({
        id: 'billing',
        type: 'billing',
        firstName: customer.billing.first_name || '',
        lastName: customer.billing.last_name || '',
        phone: customer.billing.phone || '',
        email: customer.billing.email || customer.email || '',
        city: customer.billing.city || '',
        cityName: customer.billing.city || '',
        district: customer.billing.state || '',
        districtName: customer.billing.state || '',
        address: customer.billing.address_1 || '',
        building: customer.billing.address_2 || '',
        isDefault: false,
      })
    }

    return NextResponse.json({
      success: true,
      data: addresses,
      count: addresses.length,
    })
  } catch (error) {
    console.error('Get addresses API error:', error)
    
    // Check if it's authentication error
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب العناوين المحفوظة',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/checkout/addresses
 * 
 * Save/update shipping or billing address in WooCommerce customer
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await requireAuth()
    const customerId = user.id

    // Parse and validate request body
    const body = await request.json()
    const validation = savedAddressSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات العنوان غير صحيحة',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const addressData = validation.data
    
    // Prepare address for WooCommerce format
    const wcAddress = {
      first_name: addressData.firstName,
      last_name: addressData.lastName,
      address_1: addressData.address,
      address_2: addressData.building || '',
      city: addressData.cityName || addressData.city,
      state: addressData.districtName || addressData.district,
      postcode: '',
      country: 'EG',
    }
    
    // Update based on type
    const updateData: any = {}
    
    if (addressData.type === 'shipping') {
      updateData.shipping = wcAddress
    } else {
      updateData.billing = {
        ...wcAddress,
        phone: addressData.phone,
        email: user.email || '',
      }
    }

    // Update customer in WooCommerce
    const { data: updatedCustomer } = await api.put(`customers/${customerId}`, updateData)

    return NextResponse.json({
      success: true,
      data: {
        id: addressData.type,
        ...addressData,
      },
      message: 'تم حفظ العنوان بنجاح',
    })
  } catch (error) {
    console.error('Save address API error:', error)
    
    // Check if it's authentication error
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في حفظ العنوان',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع',
      },
      { status: 500 }
    )
  }
}
