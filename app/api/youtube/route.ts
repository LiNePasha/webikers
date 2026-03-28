import { NextRequest, NextResponse } from 'next/server'
import { videoSuggestions } from '@/lib/data/chatFaq'

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')?.trim() || ''
    const apiKey = process.env.YOUTUBE_API_KEY
    const channelId = process.env.YOUTUBE_CHANNEL_ID

    if (!apiKey || !channelId || !query) {
      return NextResponse.json({ source: 'static', videos: videoSuggestions })
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('q', query)
    url.searchParams.set('channelId', channelId)
    url.searchParams.set('maxResults', '6')
    url.searchParams.set('type', 'video')
    url.searchParams.set('order', 'relevance')
    url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString())
    if (!res.ok) {
      return NextResponse.json({ source: 'static', videos: videoSuggestions, error: 'YouTube API failed' }, { status: 502 })
    }

    const data = await res.json()
    const videos = Array.isArray(data.items)
      ? data.items.map((item: any) => ({
          title: item.snippet?.title || 'فيديو من YouTube',
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }))
      : videoSuggestions

    return NextResponse.json({ source: 'youtube', videos })
  } catch (error) {
    return NextResponse.json({ source: 'static', videos: videoSuggestions, error: (error as Error).message }, { status: 500 })
  }
}
