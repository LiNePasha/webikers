import { NextResponse } from 'next/server'

const BOSTA_API_URL = process.env.BOSTA_API_URL || 'https://app.bosta.co/api/v2'
const BOSTA_API_KEY = process.env.BOSTA_API_KEY || ''

/**
 * GET /api/egypt/cities
 * 
 * Get all Egyptian cities from Bosta or search by query
 * 
 * Query params:
 * - q: search query (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    const response = await fetch(`${BOSTA_API_URL}/cities`, {
      headers: {
        'Authorization': BOSTA_API_KEY,
      },
      cache: 'force-cache',
      next: { revalidate: 86400 } // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error(`Bosta API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error('Bosta API returned unsuccessful response')
    }

    // Transform to our format
    let cities = data.data.list.map((city: any) => ({
      id: city._id,
      name: city.nameAr,
      nameEn: city.name,
      code: city.code,
      sector: city.sector,
      hub: city.hub?.name,
      pickupAvailable: city.pickupAvailability,
      dropOffAvailable: city.dropOffAvailability
    }))

    // Filter by search if provided
    if (query && query.trim().length > 0) {
      const searchLower = query.toLowerCase()
      cities = cities.filter((city: any) => 
        city.name.toLowerCase().includes(searchLower) ||
        city.nameEn.toLowerCase().includes(searchLower) ||
        city.code.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: cities,
      count: cities.length,
      source: 'bosta'
    })

  } catch (error) {
    console.error('Bosta cities API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب المدن من بوسطة',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع'
      },
      { status: 500 }
    )
  }
}
