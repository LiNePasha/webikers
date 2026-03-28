import { NextResponse } from 'next/server'

const BOSTA_API_URL = process.env.BOSTA_API_URL || 'https://app.bosta.co/api/v2'
const BOSTA_API_KEY = process.env.BOSTA_API_KEY || ''

export async function GET() {
  try {
    const response = await fetch(`${BOSTA_API_URL}/cities`, {
      headers: {
        'Authorization': BOSTA_API_KEY,
      },
      cache: 'force-cache', // Cache the cities list
      next: { revalidate: 86400 } // Revalidate once per day
    })

    if (!response.ok) {
      throw new Error(`Bosta API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error('Bosta API returned unsuccessful response')
    }

    // Transform to our format
    const cities = data.data.list.map((city: any) => ({
      id: city._id,
      name: city.nameAr, // Arabic name
      nameEn: city.name,
      code: city.code,
      hub: city.hub?.name,
      sector: city.sector,
      pickupAvailable: city.pickupAvailability,
      dropOffAvailable: city.dropOffAvailability
    }))

    return NextResponse.json({
      success: true,
      data: cities,
      count: cities.length
    })

  } catch (error) {
    console.error('Bosta cities API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cities from Bosta',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
