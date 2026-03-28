import { NextResponse } from 'next/server'

const BOSTA_API_URL = process.env.BOSTA_API_URL || 'https://app.bosta.co/api/v2'
const BOSTA_API_KEY = process.env.BOSTA_API_KEY || ''
const DEFAULT_PICKUP_CITY = process.env.BOSTA_BUSINESS_CITY || 'Cairo'

/**
 * POST /api/checkout/shipping-cost
 * 
 * Calculate shipping cost using Bosta pricing calculator
 * 
 * Body:
 * - dropOffCity: string (required) - City name in English
 * - cartTotal: number (optional) - For COD calculation
 * - size: 'Normal' | 'Light Bulky' | 'Heavy Bulky' (optional, default: Normal)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dropOffCity, cartTotal = 0, size = 'Normal' } = body

    if (!dropOffCity) {
      return NextResponse.json(
        {
          success: false,
          error: 'مدينة التوصيل مطلوبة'
        },
        { status: 400 }
      )
    }

    // Build query parameters according to Bosta API docs
    // Required: pickupCity, dropOffCity, size, type
    // Optional: cod (COD amount)
    const queryParams = new URLSearchParams({
      pickupCity: DEFAULT_PICKUP_CITY, // e.g., "Cairo"
      dropOffCity: dropOffCity, // e.g., "Alexandria"
      size: size, // "Normal", "Light Bulky", or "Heavy Bulky"
      type: 'SEND', // SEND, CASH_COLLECTION, CUSTOMER_RETURN_PICKUP, EXCHANGE, SIGN_AND_RETURN
    })
    
    // Only add COD if there's a cart total
    if (cartTotal > 0) {
      queryParams.append('cod', cartTotal.toString())
    }

    console.log('🚚 Bosta Pricing Request:', {
      url: `${BOSTA_API_URL}/pricing/shipment/calculator?${queryParams}`,
      params: Object.fromEntries(queryParams)
    })

    const response = await fetch(
      `${BOSTA_API_URL}/pricing/shipment/calculator?${queryParams}`,
      {
        headers: {
          'Authorization': BOSTA_API_KEY,
        },
        cache: 'no-store' // Don't cache pricing
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { rawError: errorText }
      }
      
      console.error('❌ Bosta pricing API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      
      throw new Error(`Bosta API returned ${response.status}: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    
    console.log('✅ Bosta Pricing Response:', data)

    if (!data.success) {
      console.error('❌ Bosta returned unsuccessful:', data)
      throw new Error('Bosta API returned unsuccessful response')
    }

    // Extract pricing info
    const pricing = data.data

    return NextResponse.json({
      success: true,
      data: {
        shippingFee: pricing.priceAfterVat || 0,
        shippingFeeBeforeVat: pricing.priceBeforeVat || 0,
        vat: pricing.vatAmount || 0,
        vatPercentage: pricing.vat || 0.14,
        currency: pricing.currency || 'EGP',
        estimatedDays: '2-4', // Bosta standard delivery
        method: {
          id: 'bosta_standard',
          title: 'توصيل بوسطة',
          cost: pricing.priceAfterVat || 0,
          provider: 'Bosta',
          estimatedDays: '2-4'
        },
        breakdown: {
          shippingFee: pricing.shippingFee || 0,
          materialFee: pricing.bostaMaterialFee?.amount || 0,
          transitFee: pricing.transit?.cost || 0,
          subtotal: pricing.priceBeforeVat || 0,
          vat: pricing.vatAmount || 0,
          total: pricing.priceAfterVat || 0
        }
      }
    })

  } catch (error) {
    console.error('Shipping cost calculation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في حساب تكلفة الشحن',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع'
      },
      { status: 500 }
    )
  }
}
