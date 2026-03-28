import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ vendorId: string }> }) {
  try {
    const { vendorId } = await params
    const searchParams = request.nextUrl.searchParams

    const qs = new URLSearchParams()
    for (const [k, v] of searchParams.entries()) {
      qs.append(k, v)
    }

    const url = `https://api.spare2app.com/wp-json/spare2app/v2/store/${vendorId}/products${qs.toString() ? `?${qs.toString()}` : ''}`

    const response = await fetch(url, {
      next: { revalidate: 30 }
    })

    if (!response.ok) {
      throw new Error(`Upstream API returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('[/api/enhanced-store/[vendorId]/products] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch enhanced store products', message: error.message }, { status: 500 })
  }
}
