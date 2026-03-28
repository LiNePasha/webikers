import { NextResponse } from 'next/server'

const BOSTA_API_URL = process.env.BOSTA_API_URL || 'https://app.bosta.co/api/v2'
const BOSTA_API_KEY = process.env.BOSTA_API_KEY || ''

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params

    const response = await fetch(`${BOSTA_API_URL}/cities/${cityId}/districts`, {
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
    const districts = data.data.map((district: any) => ({
      id: district.districtId,
      name: district.districtOtherName || district.districtName, // Arabic name
      nameEn: district.districtName,
      zoneId: district.zoneId,
      zoneName: district.zoneOtherName || district.zoneName,
      pickupAvailable: district.pickupAvailability,
      dropOffAvailable: district.dropOffAvailability
    }))

    return NextResponse.json({
      success: true,
      data: districts,
      count: districts.length
    })

  } catch (error) {
    console.error('Bosta districts API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch districts from Bosta',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
