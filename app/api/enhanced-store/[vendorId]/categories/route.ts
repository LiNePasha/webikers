import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ vendorId: string }> }) {
  try {
    const { vendorId } = await params
    const searchParams = request.nextUrl.searchParams

    const queryString = new URLSearchParams({
      page: searchParams.get('page') || '1',
      per_page: searchParams.get('per_page') || '100',
    }).toString()

    const url = `https://api.spare2app.com/wp-json/spare2app/v2/store/${vendorId}/categories${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      throw new Error(`Upstream API returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('[/api/enhanced-store/[vendorId]/categories] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch enhanced store categories', message: error.message }, { status: 500 })
  }
}
