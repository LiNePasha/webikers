"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { videoSuggestions } from '@/lib/data/chatFaq';

const STORAGE_KEY = 'webikers.chat.history';


export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [matchedQuestion, setMatchedQuestion] = useState("");
  const [source, setSource] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<{ query: string; answer: string; source: string; date: string }[]>([]);

  const [youtubeResults, setYoutubeResults] = useState<{ title: string; url: string }[]>([])
  const [youtubeSearching, setYoutubeSearching] = useState(false)
  const suggestedVideos = useMemo(() => videoSuggestions.slice(0, 4), [])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setHistory(Array.isArray(parsed) ? parsed : [])
      } catch {
        setHistory([])
      }
    }
  }, [])

  const appendHistory = (q: string, a: string, src: string) => {
    const entry = { query: q, answer: a, source: src, date: new Date().toISOString() }
    setHistory((prev) => {
      const nextHistory = [entry, ...prev].slice(0, 20)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))
      return nextHistory
    })
  }

  const handleAsk = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setIsSearching(true)
    setAnswer('')
    setMatchedQuestion('')
    setSource('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })

      const data = await response.json()
      const answerText = data?.answer || 'معلش، حصل خطأ في الحصول على الإجابة.'
      setAnswer(answerText)
      setMatchedQuestion(data?.question || '')
      setSource(data?.source || 'unknown')
      appendHistory(trimmed, answerText, data?.source || 'unknown')
    } catch (error) {
      setAnswer('واجهنا مشكلة في الوصول للخادم. حاول مرة أخرى بعد شوية.')
      setSource('error')
    } finally {
      setIsSearching(false)
    }
  };

  const handleYoutubeSearch = async (query: string) => {
    if (!query.trim()) return
    setYoutubeSearching(true)

    try {
      const response = await fetch(`/api/youtube?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setYoutubeResults(Array.isArray(data.videos) ? data.videos : [])
    } catch {
      setYoutubeResults([])
    } finally {
      setYoutubeSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f9] py-12" dir="rtl">
      <div className="max-w-3xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="p-6 mb-6 rounded-2xl bg-white shadow-md border border-[#f0f0f5]">
          <h1 className="text-3xl font-black text-gray-900 mb-2">اسأل WeBikers Chat</h1>
          <p className="mb-4 text-sm text-gray-600">اكتب سؤالك وكأنك بتسأل ChatGPT. هنقارن مع الأسئلة الشائعة ونرشح لك فيديوهات مفيدة.</p>

          <form onSubmit={handleAsk} className="flex flex-col gap-3">
            <textarea
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#db5f02]"
              placeholder="اكتب سؤالك هنا..."
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-5 py-3 font-bold text-white bg-[#db5f02] rounded-xl hover:bg-[#c55206] transition-all"
              disabled={isSearching}
            >
              {isSearching ? "جاري البحث..." : "اسأل الآن"}
            </button>
          </form>
          <div className="mt-4">
            <button
              onClick={() => handleYoutubeSearch(query)}
              className="inline-flex items-center justify-center px-4 py-2 font-bold text-white bg-[#1a73e8] rounded-xl hover:bg-[#1558b0] transition-all"
              disabled={youtubeSearching || !query.trim()}
            >
              {youtubeSearching ? 'جاري البحث في اليوتيوب...' : 'ابحث في قناة WeBikers'}
            </button>
          </div>
        </div>

        {answer && (
          <div className="p-6 mb-6 rounded-2xl bg-white shadow-md border border-[#f0f0f5]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">النتيجة</p>
              <span className="text-xs font-bold text-[#db5f02]">المصدر: {source || 'unknown'}</span>
            </div>
            {matchedQuestion ? (
              <>
                <p className="mb-1 text-sm font-bold text-gray-800">مقترح السؤال: {matchedQuestion}</p>
                <p className="text-gray-700">{answer}</p>
              </>
            ) : (
              <p className="text-gray-700">{answer}</p>
            )}
          </div>
        )}

        {history.length > 0 && (
          <section className="p-6 mb-6 rounded-2xl bg-white shadow-md border border-[#f0f0f5]">
            <h3 className="mb-4 text-lg font-black text-gray-900">آخر الأسئلة</h3>
            <ul className="space-y-3">
              {history.slice(0, 5).map((item, idx) => (
                <li key={`${item.date}-${idx}`} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-bold text-gray-800">سؤال: {item.query}</p>
                  <p className="text-sm text-gray-600">إجابة: {item.answer}</p>
                  <p className="mt-1 text-xs text-gray-400">المصدر: {item.source} - {new Date(item.date).toLocaleString('ar-EG')}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="p-6 rounded-2xl bg-white shadow-md border border-[#f0f0f5]">
          <h2 className="mb-3 text-xl font-black text-gray-900">فيديوهات مقترحة</h2>
          <p className="mb-4 text-sm text-gray-600">لو الإجابة مش كفاية، افتح الفيديوهات التالية من قناة WeBikers.</p>
          <ul className="space-y-3">
            {suggestedVideos.map((video) => (
              <li key={video.url}>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-4 py-3 transition-all border rounded-xl border-gray-200 hover:border-[#db5f02] hover:bg-[#fff4e6]"
                >
                  <p className="font-semibold text-gray-800">{video.title}</p>
                  <p className="text-xs text-gray-500">فتح في يوتيوب</p>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-sm text-gray-500">
            لو دايمًا عايز تتأكد، ادخل <Link href="/faq" className="font-bold text-[#db5f02] hover:underline">الأسئلة الشائعة</Link>.
          </div>
        </div>

        {youtubeResults.length > 0 && (
          <div className="p-6 mt-6 rounded-2xl bg-white shadow-md border border-[#f0f0f5]">
            <h3 className="mb-3 text-lg font-black text-gray-900">نتائج بحث يوتيوب لـ "{query}"</h3>
            <ul className="space-y-2">
              {youtubeResults.map((video, idx) => (
                <li key={`${video.url}-${idx}"`}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 text-sm font-semibold text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-50"
                  >
                    {video.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
