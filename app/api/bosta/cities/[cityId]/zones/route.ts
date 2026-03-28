import { NextResponse } from 'next/server'

const BOSTA_API_URL = process.env.BOSTA_API_URL || 'https://app.bosta.co/api/v2'
const BOSTA_API_KEY = process.env.BOSTA_API_KEY || ''

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params

    const response = await fetch(`${BOSTA_API_URL}/cities/${cityId}/zones`, {
      headers: {
        'Authorization': BOSTA_API_KEY,
      },
      cache: 'force-cache',
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
    const zones = data.data.map((zone: any) => ({
      id: zone._id,
      name: zone.nameAr, // Arabic name
      nameEn: zone.name,
      pickupAvailable: zone.pickupAvailability,
      dropOffAvailable: zone.dropOffAvailability
    }))

    return NextResponse.json({
      success: true,
      data: zones,
      count: zones.length
    })

  } catch (error) {
    console.error('Bosta zones API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch zones from Bosta',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
