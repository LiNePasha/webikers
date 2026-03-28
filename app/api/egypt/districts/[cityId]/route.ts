import { NextResponse } from 'next/server'

const BOSTA_API_URL = process.env.BOSTA_API_URL || 'https://app.bosta.co/api/v2'
const BOSTA_API_KEY = process.env.BOSTA_API_KEY || ''

/**
 * GET /api/egypt/districts/[cityId]
 * 
 * Get all zones (districts) for a specific city from Bosta or search by query
 * 
 * Query params:
 * - q: search query (optional)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    // Fetch zones from Bosta
    const response = await fetch(`${BOSTA_API_URL}/cities/${cityId}/zones`, {
      headers: {
        'Authorization': BOSTA_API_KEY,
      },
      cache: 'force-cache',
      next: { revalidate: 86400 } // Cache for 24 hours
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'المدينة غير موجودة',
            message: `City ID "${cityId}" not found in Bosta`,
          },
          { status: 404 }
        )
      }
      throw new Error(`Bosta API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error('Bosta API returned unsuccessful response')
    }

    // Transform to our format (zones = districts)
    let zones = data.data.map((zone: any) => ({
      id: zone._id,
      name: zone.nameAr,
      nameEn: zone.name,
      pickupAvailable: zone.pickupAvailability,
      dropOffAvailable: zone.dropOffAvailability
    }))

    // Filter by search if provided
    if (query && query.trim().length > 0) {
      const searchLower = query.toLowerCase()
      zones = zones.filter((zone: any) => 
        zone.name.toLowerCase().includes(searchLower) ||
        zone.nameEn.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: zones,
      count: zones.length,
      source: 'bosta',
      cityId
    })

  } catch (error) {
    console.error('Bosta zones API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب المناطق من بوسطة',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع',
      },
      { status: 500 }
    )
  }
}
