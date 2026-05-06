import { NextRequest, NextResponse } from 'next/server'

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.spare2app.com/wp-json'

interface WPVideoItem {
  id: number
  date?: string
  slug?: string
  link?: string
  title?: { rendered?: string }
  excerpt?: { rendered?: string }
  content?: { rendered?: string }
  acf?: Record<string, any> | any[]
  featured_media?: number
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>
  }
}

function stripHtml(input?: string): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '').trim()
}

function normalizeAcf(acf: WPVideoItem['acf']): Record<string, any> {
  if (!acf) return {}
  if (Array.isArray(acf)) return {}
  if (typeof acf === 'object') return acf as Record<string, any>
  return {}
}

function extractUrlFromText(input?: string): string {
  if (!input) return ''

  const iframeSrc = input.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1]
  if (iframeSrc) return iframeSrc

  const directUrl = input.match(/https?:\/\/[^\s"'<>]+/i)?.[0]
  return directUrl || ''
}

function extractYouTubeId(url: string): string {
  if (!url) return ''
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/)
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/)
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/)
  return watchMatch?.[1] || shortMatch?.[1] || shortsMatch?.[1] || embedMatch?.[1] || ''
}

function extractVideoUrl(item: WPVideoItem): string {
  const acf = normalizeAcf(item?.acf)

  const candidates = [
    acf.video_url,
    acf.youtube_url,
    acf.embed_url,
    acf.video_link,
    acf.link,
    acf.url,
    acf.youtube,
    acf.video,
    extractUrlFromText(item?.content?.rendered),
    extractUrlFromText(item?.excerpt?.rendered),
  ]

  const valid = candidates.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const withVideoId = valid.find((value) => Boolean(extractYouTubeId(value)))

  return withVideoId || valid[0] || ''
}

function toYoutubeEmbed(url: string): string {
  if (!url) return ''

  const id = extractYouTubeId(url)

  if (!id) return url
  return `https://www.youtube.com/embed/${id}`
}

function getYoutubeThumb(url: string): string {
  if (!url) return ''

  const id = extractYouTubeId(url)

  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const perPage = Number(searchParams.get('per_page') || '12')
    const page = Number(searchParams.get('page') || '1')

    const apiUrl = new URL(`${WP_API_URL}/wp/v2/webikers_video`)
    apiUrl.searchParams.set('per_page', String(Math.max(1, Math.min(100, perPage))))
    apiUrl.searchParams.set('page', String(Math.max(1, page)))
    apiUrl.searchParams.set('_embed', '1')

    const response = await fetch(apiUrl.toString(), {
      next: { revalidate: 300 },
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const body = await response.text()
      return NextResponse.json(
        {
          source: 'wordpress',
          error: `WP API responded with ${response.status}`,
          hint: 'تأكد إن post type متسجل بـ show_in_rest=true و rest_base=webikers_video',
          raw: body,
          items: [],
        },
        { status: response.status }
      )
    }

    const data = (await response.json()) as WPVideoItem[]

    const items = (Array.isArray(data) ? data : []).map((item) => {
      const videoUrl = extractVideoUrl(item)
      const thumbnail = item?._embedded?.['wp:featuredmedia']?.[0]?.source_url || getYoutubeThumb(videoUrl)
      const acf = normalizeAcf(item.acf)

      return {
        id: item.id,
        title: item?.title?.rendered || 'فيديو بدون عنوان',
        slug: item.slug ? decodeURIComponent(item.slug) : '',
        date: item.date || '',
        link: item.link || '',
        excerpt: stripHtml(item?.excerpt?.rendered),
        description: stripHtml(item?.content?.rendered),
        videoUrl,
        embedUrl: toYoutubeEmbed(videoUrl),
        thumbnail,
        acf,
      }
    })

    return NextResponse.json({
      source: 'wordpress',
      endpoint: `${WP_API_URL}/wp/v2/webikers_video`,
      total: items.length,
      items,
    })
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        items: [],
      },
      { status: 500 }
    )
  }
}
