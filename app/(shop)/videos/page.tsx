import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'فيديوهات WeBikers',
  description: 'شاهد فيديوهات WeBikers التعليمية والعروض مباشرة من WordPress CPT',
  keywords: 'فيديوهات, WeBikers, سكوتر, صيانة, قطع غيار',
}

interface VideoItem {
  id: number
  title: string
  slug: string
  date: string
  link: string
  excerpt: string
  description: string
  videoUrl: string
  embedUrl: string
  thumbnail: string
  acf: Record<string, any>
  videoType: 'youtube' | 'tiktok' | 'unknown'
}

interface VideosApiResponse {
  source: string
  endpoint?: string
  error?: string
  hint?: string
  total?: number
  items: VideoItem[]
}

function stripHtml(input?: string): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '').trim()
}

function extractUrlFromText(input?: string): string {
  if (!input) return ''
  const iframeSrc = input.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1]
  if (iframeSrc) return iframeSrc
  return input.match(/https?:\/\/[^\s"'<>]+/i)?.[0] || ''
}

function extractYouTubeId(url: string): string {
  if (!url) return ''
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/)
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/)
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/)
  return watchMatch?.[1] || shortMatch?.[1] || shortsMatch?.[1] || embedMatch?.[1] || ''
}

function toYoutubeEmbed(url: string): string {
  if (!url) return ''
  const id = extractYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : url
}

function getYoutubeThumb(url: string): string {
  if (!url) return ''
  const id = extractYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

function extractTikTokId(url: string): string {
  if (!url) return ''
  const fullMatch = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/)
  const embedMatch = url.match(/tiktok\.com\/embed\/v2\/(\d+)/)
  return fullMatch?.[1] || embedMatch?.[1] || ''
}

function isTikTokUrl(url: string): boolean {
  if (!url) return false
  return /tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/.test(url)
}

function toTikTokEmbed(url: string): string {
  if (!url) return ''
  const id = extractTikTokId(url)
  return id ? `https://www.tiktok.com/embed/v2/${id}` : ''
}

async function resolveTikTokUrl(url: string): Promise<string> {
  if (!isTikTokUrl(url)) return url

  const isShortTikTok = /(?:^https?:\/\/)?(?:vt|vm)\.tiktok\.com\//i.test(url)
  if (!isShortTikTok) return url

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
      next: { revalidate: 300 },
    })

    return response.url || url
  } catch {
    return url
  }
}

async function getVideos(): Promise<VideosApiResponse> {
  const wpApiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.spare2app.com/wp-json'

  const endpoint = `${wpApiUrl}/wp/v2/webikers_video?per_page=24&_embed=1`

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 300 },
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      await response.text()
      return {
        source: 'wordpress',
        endpoint,
        error: `WP API responded with ${response.status}`,
        hint: 'تأكد إن post type متسجل بـ show_in_rest=true و rest_base=webikers_video',
        items: [],
      }
    }

    const json = await response.json()
    const items: VideoItem[] = Array.isArray(json)
      ? await Promise.all(
          json.map(async (item: any) => {
          const acf = item?.acf && !Array.isArray(item.acf) ? item.acf : {}
          const contentRendered = String(item?.content?.rendered || '')
          const excerptRendered = String(item?.excerpt?.rendered || '')
          const candidates = [
            acf.video_url,
            acf.youtube_url,
            acf.tiktok_url,
            acf.embed_url,
            acf.video_link,
            acf.link,
            acf.url,
            extractUrlFromText(contentRendered),
            extractUrlFromText(excerptRendered),
          ]

          const valid = candidates.filter((value: unknown): value is string => typeof value === 'string' && value.trim().length > 0)
          
          // Check for TikTok first, then YouTube, then any valid URL
          let videoUrl = ''
          let videoType: 'youtube' | 'tiktok' | 'unknown' = 'unknown'
          
          const tiktokUrl = valid.find((value) => isTikTokUrl(value))
          if (tiktokUrl) {
            const normalizedTikTokUrl = await resolveTikTokUrl(tiktokUrl)
            const tiktokId = extractTikTokId(normalizedTikTokUrl)

            if (tiktokId) {
              videoUrl = normalizedTikTokUrl
              videoType = 'tiktok'
            }
          } else {
            const youtubeUrl = valid.find((value) => Boolean(extractYouTubeId(value)))
            if (youtubeUrl) {
              videoUrl = youtubeUrl
              videoType = 'youtube'
            } else if (valid.length > 0) {
              videoUrl = valid[0]
            }
          }

          let embedUrl = ''
          if (videoType === 'youtube') {
            embedUrl = toYoutubeEmbed(String(videoUrl || ''))
          } else if (videoType === 'tiktok') {
            embedUrl = toTikTokEmbed(String(videoUrl || ''))
          }

          const excerpt = stripHtml(excerptRendered)
          const description = stripHtml(contentRendered)
          const thumb = item?._embedded?.['wp:featuredmedia']?.[0]?.source_url || (videoType === 'youtube' ? getYoutubeThumb(videoUrl) : '')

          return {
            id: item.id,
            title: item?.title?.rendered || 'فيديو بدون عنوان',
            slug: item?.slug ? decodeURIComponent(item.slug) : '',
            date: item?.date || '',
            link: item?.link || '',
            excerpt,
            description,
            videoUrl,
            embedUrl,
            thumbnail: thumb,
            acf,
            videoType,
          }
        })
        )
      : []

    return {
      source: 'wordpress',
      endpoint,
      total: items.length,
      items,
    }
  } catch (error) {
    return {
      source: 'error',
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
      items: [],
    }
  }
}

export default async function VideosPage() {
  const data = await getVideos()
  const missingVideoCount = data.items.filter((v) => !v.videoUrl).length
  const whatsappNumber = '201030351075'
  const whatsappUrl = `https://wa.me/${whatsappNumber}`

  return (
    <div className="min-h-screen bg-[#f6f6f9] py-12" dir="rtl">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-gray-900 md:text-4xl">فيديوهات WeBikers</h1>
        </div>

        {data.error && (
          <div className="p-4 mb-6 border border-red-200 bg-red-50 rounded-xl">
            <p className="font-bold text-red-700">حصل خطأ أثناء تحميل الفيديوهات</p>
            <p className="mt-1 text-sm text-red-600">{data.error}</p>
            {data.hint && <p className="mt-2 text-sm text-red-700">{data.hint}</p>}
          </div>
        )}

        {!data.error && data.items.length === 0 && (
          <div className="p-6 text-center bg-white border border-gray-200 rounded-2xl">
            <p className="font-bold text-gray-800">لسه مفيش فيديوهات ظاهرة من الـ API</p>
            <p className="mt-2 text-sm text-gray-600">
              تأكد إن في posts منشورة من نوع <span className="font-semibold">webikers_video</span> وإن ACF fields فيها رابط الفيديو.
            </p>
          </div>
        )}

        {!data.error && data.items.length > 0 && missingVideoCount > 0 && (
          <div className="p-4 mb-6 border border-amber-200 bg-amber-50 rounded-xl">
            <p className="font-bold text-amber-800">تم تحميل {data.items.length} فيديو، لكن {missingVideoCount} بدون رابط فيديو واضح.</p>
            <p className="mt-1 text-sm text-amber-700">
              أضف في ACF حقل مثل <span className="font-semibold">video_url</span> أو <span className="font-semibold">youtube_url</span> أو <span className="font-semibold">tiktok_url</span>، وتأكد إن Field Group عليه <span className="font-semibold">Show in REST API</span>.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {data.items.map((video) => (
            <article key={video.id} className="overflow-hidden transition-all bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5">
              {video.embedUrl && video.videoType === 'youtube' ? (
                <div className="bg-black aspect-video">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : video.embedUrl && video.videoType === 'tiktok' ? (
                <div className="bg-black aspect-[9/16] max-h-[85vh] md:max-h-[820px]">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    scrolling="no"
                    allowFullScreen
                  />
                </div>
              ) : video.thumbnail ? (
                <img src={video.thumbnail} alt={video.title} className="object-cover w-full aspect-video" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200 aspect-video">
                  <span className="text-4xl">🎥</span>
                  <p className="text-sm font-semibold">لا يوجد رابط فيديو بعد</p>
                </div>
              )}

              <div className="p-5">
                <h2 className="text-xl font-black text-gray-900" dangerouslySetInnerHTML={{ __html: video.title }} />

                {/* {video.date && (
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(video.date).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )} */}

                {(video.excerpt || video.description) && (
                  <p className="mt-2 text-sm leading-6 text-gray-700 line-clamp-3">{video.excerpt || video.description}</p>
                )}

                {!video.videoUrl && (
                  <p className="mt-2 text-xs font-semibold text-amber-700">⚠️ رابط الفيديو غير موجود في الـ API حالياً.</p>
                )}
 
                {/* 
                <div className="flex flex-wrap gap-2 mt-4">
                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 text-sm font-bold text-white bg-[#db5f02] rounded-lg hover:bg-[#c55206]"
                    >
                      فتح الفيديو
                    </a>
                  )}

                </div> 
                */}
              </div>
            </article>
          ))}
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل واتساب"
          className="fixed z-50 flex items-center justify-center w-14 h-14 text-white transition-transform bg-[#25D366] rounded-full shadow-lg left-6 bottom-6 hover:scale-105 hover:bg-[#1ebe5d]"
        >
          <span className="text-2xl">💬</span>
        </a>
      </div>
    </div>
  )
}
