import { NextRequest, NextResponse } from 'next/server'
import { findBestFAQAnswer, videoSuggestions } from '@/lib/data/chatFaq'

const FALLBACK_RESPONSE = 'عذراً، لم أتمكن من العثور على إجابة دقيقة الآن. الرجاء محاولة سؤال آخر، أو مراجعة الأسئلة الشائعة.'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = (body?.query ?? '').toString().trim()

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required.' }, { status: 400 })
    }

    const faqResult = findBestFAQAnswer(query)
    if (faqResult) {
      return NextResponse.json({
        source: 'faq',
        question: faqResult.question,
        answer: faqResult.answer,
        score: faqResult.score,
        videos: videoSuggestions,
      })
    }

    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY

    if (!GROQ_API_KEY) {
      return NextResponse.json({
        source: 'fallback',
        answer: FALLBACK_RESPONSE,
        videos: videoSuggestions,
      })
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `أنت مساعد دعم عملاء متخصص بمتجر WeBikers لقطع غيار السكوترات. أجب بالعربية بلهجة مصرية بسيطة وودية. السؤال: ${query}`,
          },
        ],
        max_tokens: 320,
        temperature: 0.7,
      }),
    })

    const groqData = await groqResponse.json()
    
    if (!groqResponse.ok) {
      console.error('Groq API error:', groqData)
      return NextResponse.json({
        source: 'fallback',
        answer: FALLBACK_RESPONSE,
        videos: videoSuggestions,
      })
    }

    const content = groqData?.choices?.[0]?.message?.content || FALLBACK_RESPONSE

    return NextResponse.json({
      source: 'groq',
      answer: content,
      videos: videoSuggestions,
    })
  } catch (error) {
    return NextResponse.json({
      source: 'error',
      error: (error as Error)?.message || 'Unknown error',
      answer: FALLBACK_RESPONSE,
      videos: videoSuggestions,
    }, { status: 500 })
  }
}
