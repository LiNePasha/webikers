import { NextResponse } from 'next/server'
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'
import { requireAuth } from '@/lib/auth/server'

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL?.replace('/wp-json/wc/v3', '') || '',
  consumerKey: process.env.WC_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || '',
  version: 'wc/v3',
})

/**
 * DELETE /api/checkout/addresses/[id]
 * 
 * Delete a saved address (clear shipping or billing)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: addressType } = await params // 'shipping' or 'billing'
    
    // Check authentication
    const user = await requireAuth()
    const customerId = user.id

    if (addressType !== 'shipping' && addressType !== 'billing') {
      return NextResponse.json(
        { success: false, error: 'نوع العنوان غير صحيح' },
        { status: 400 }
      )
    }

    // Clear the address fields
    const emptyAddress = {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'EG',
      phone: '',
    }

    const updateData: any = {}
    if (addressType === 'shipping') {
      updateData.shipping = emptyAddress
    } else {
      updateData.billing = { ...emptyAddress, email: '' }
    }

    // Update customer in WooCommerce
    await api.put(`customers/${customerId}`, updateData)

    return NextResponse.json({
      success: true,
      message: 'تم حذف العنوان بنجاح',
    })
  } catch (error) {
    console.error('Delete address API error:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في حذف العنوان',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/checkout/addresses/[id]
 * 
 * Update a saved address (shipping or billing)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: addressType } = await params // 'shipping' or 'billing'
    
    // Check authentication
    const user = await requireAuth()
    const customerId = user.id

    if (addressType !== 'shipping' && addressType !== 'billing') {
      return NextResponse.json(
        { success: false, error: 'نوع العنوان غير صحيح' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Map our address format to WooCommerce format
    const wcAddress: any = {
      first_name: body.firstName || '',
      last_name: body.lastName || '',
      address_1: body.address || '',
      address_2: [body.building, body.floor, body.apartment].filter(Boolean).join(', ') || '',
      city: body.cityName || body.city || '',
      state: body.districtName || body.district || '',
      postcode: '',
      country: 'EG',
      phone: body.phone || '',
    }

    if (addressType === 'billing') {
      wcAddress.email = body.email || user.email || ''
    }

    const updateData: any = {}
    if (addressType === 'shipping') {
      updateData.shipping = wcAddress
    } else {
      updateData.billing = wcAddress
    }

    // Update customer in WooCommerce
    const { data: updatedCustomer } = await api.put(`customers/${customerId}`, updateData)

    // Return updated address
    const updatedAddress = addressType === 'shipping' 
      ? updatedCustomer.shipping 
      : updatedCustomer.billing

    return NextResponse.json({
      success: true,
      data: {
        id: addressType,
        type: addressType,
        firstName: updatedAddress.first_name,
        lastName: updatedAddress.last_name,
        phone: updatedAddress.phone,
        email: updatedAddress.email,
        city: updatedAddress.city,
        cityName: updatedAddress.city,
        district: updatedAddress.state,
        districtName: updatedAddress.state,
        address: updatedAddress.address_1,
        building: body.building || '',
        floor: body.floor || '',
        apartment: body.apartment || '',
        landmark: body.landmark || '',
      },
      message: 'تم تحديث العنوان بنجاح',
    })
  } catch (error) {
    console.error('Update address API error:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في تحديث العنوان',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع',
      },
      { status: 500 }
    )
  }
}
