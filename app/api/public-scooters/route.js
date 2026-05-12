import { NextResponse } from 'next/server'

const TYPE_TO_ENDPOINT = {
  new: 'new_scooter',
  used: 'used_scooter',
}

function resolveWpApiBase() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_WP_API_URL ||
    process.env.WP_API_URL ||
    ''
  )
}

function buildWpPostsBase(apiBase) {
  const normalizedBase = String(apiBase || '').trim()
  if (!normalizedBase) return ''

  return normalizedBase.includes('/wp-json')
    ? `${normalizedBase.replace(/\/+$/, '')}/wp/v2`
    : `${normalizedBase.replace(/\/+$/, '')}/wp-json/wp/v2`
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const type = searchParams.get('type') === 'used' ? 'used' : 'new'
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('per_page') || 12)
  const search = searchParams.get('search') || ''
  const orderBy = searchParams.get('orderBy') || 'date'
  const order = searchParams.get('order') || 'desc'

  const endpoint = TYPE_TO_ENDPOINT[type]
  const apiBase = resolveWpApiBase()
  const wpPostsBase = buildWpPostsBase(apiBase)

  if (!wpPostsBase) {
    return NextResponse.json(
      {
        error: 'Missing API base URL',
        message:
          'عرّف أحد المتغيرات التالية في ملف البيئة: NEXT_PUBLIC_WP_API_URL أو NEXT_PUBLIC_API_BASE_URL',
        items: [],
        total: 0,
        total_pages: 1,
        page,
      },
      { status: 500 },
    )
  }

  const url = new URL(`${wpPostsBase}/${endpoint}`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('status', 'publish')
  url.searchParams.set('orderby', orderBy)
  url.searchParams.set('order', order)
  url.searchParams.set('_fields', 'id,date,title,content,acf,featured_media,slug,status')

  if (search.trim()) {
    url.searchParams.set('search', search.trim())
  }

  try {
    const wpRes = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    const total = Number(wpRes.headers.get('X-WP-Total') || 0)
    const totalPages = Number(wpRes.headers.get('X-WP-TotalPages') || 1)

    if (!wpRes.ok) {
      let details = ''
      try {
        details = await wpRes.text()
      } catch {
        details = ''
      }

      return NextResponse.json(
        {
          error: 'Failed to fetch scooters from WordPress',
          message: `تعذر تحميل البيانات (${wpRes.status}).`,
          details,
          items: [],
          total: 0,
          total_pages: 1,
          page,
        },
        { status: wpRes.status },
      )
    }

    const items = await wpRes.json()

    return NextResponse.json(
      {
        items: Array.isArray(items) ? items : [],
        total,
        total_pages: totalPages,
        page,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unexpected server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        items: [],
        total: 0,
        total_pages: 1,
        page,
      },
      { status: 500 },
    )
  }
}
