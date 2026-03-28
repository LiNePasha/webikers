import { NextResponse } from 'next/server'

const BOSTA_API_URL = process.env.BOSTA_API_URL || 'https://app.bosta.co/api/v2'
const BOSTA_API_KEY = process.env.BOSTA_API_KEY || ''

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const pickupCity = searchParams.get('pickupCity') || 'Cairo'
    const dropOffCity = searchParams.get('dropOffCity')
    const cod = searchParams.get('cod') || '0'
    const type = searchParams.get('type') || 'SEND'
    const size = searchParams.get('size') || 'Normal'

    if (!dropOffCity) {
      return NextResponse.json(
        {
          success: false,
          error: 'dropOffCity is required'
        },
        { status: 400 }
      )
    }

    // Build query string
    const queryParams = new URLSearchParams({
      pickupCity,
      dropOffCity,
      cod,
      type,
      size
    })

    const response = await fetch(
      `${BOSTA_API_URL}/pricing/shipment/calculator?${queryParams}`,
      {
        headers: {
          'Authorization': BOSTA_API_KEY,
        },
        // Don't cache pricing - it might change
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Bosta pricing API error:', errorData)
      throw new Error(`Bosta API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error('Bosta API returned unsuccessful response')
    }

    // Extract important pricing info
    const pricing = data.data

    return NextResponse.json({
      success: true,
      data: {
        shippingFee: pricing.shippingFee || 0,
        priceBeforeVat: pricing.priceBeforeVat || 0,
        priceAfterVat: pricing.priceAfterVat || 0,
        vat: pricing.vat || 0,
        vatAmount: (pricing.priceAfterVat || 0) - (pricing.priceBeforeVat || 0),
        currency: pricing.currency || 'EGP',
        bostaMaterialFee: pricing.bostaMaterialFee?.amount || 0,
        size: pricing.size?.name || size,
        transit: {
          cost: pricing.transit?.cost || 0,
          originSector: pricing.transit?.originSectorId,
          destinationSector: pricing.transit?.destinationSectorId
        },
        breakdown: {
          shippingFee: pricing.shippingFee || 0,
          materialFee: pricing.bostaMaterialFee?.amount || 0,
          transitFee: pricing.transit?.cost || 0,
          subtotal: pricing.priceBeforeVat || 0,
          vat: (pricing.priceAfterVat || 0) - (pricing.priceBeforeVat || 0),
          total: pricing.priceAfterVat || 0
        }
      }
    })

  } catch (error) {
    console.error('Bosta pricing calculator error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate shipping price',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
