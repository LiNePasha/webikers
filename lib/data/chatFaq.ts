export type FAQItem = { q: string; a: string }

export const faqData: FAQItem[] = [
  { q: 'كيف أشحن بطارية السكوتر؟', a: 'استخدم الشاحن الأصلي المرفق مع السكوتر. شغّل الشاحن وافصل كابل الشحن عندما تصل البطارية لـ 100%. عادة يستغرق 4-6 ساعات للشحن الكامل.' },
  { q: 'كيف أقوم بإنشاء طلب؟', a: 'اختر المنتجات المطلوبة وأضفها للسلة، ثم اضغط على "إتمام الطلب" واملأ بيانات التوصيل وطريقة الدفع.' },
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'نوفر الدفع عند الاستلام، التحويل البنكي، فودافون كاش، وبطاقات الائتمان عبر كاشير.' },
  { q: 'هل يمكن تعديل الطلب بعد تأكيده؟', a: 'يمكن تعديل الطلب خلال ساعة من التأكيد عن طريق التواصل معنا مباشرة.' },
  { q: 'كم المدة المتوقعة للتوصيل؟', a: 'القاهرة والجيزة: 1-2 يوم. المحافظات الأخرى: 2-5 أيام حسب الموقع.' },
  { q: 'هل تكلفة الشحن ثابتة؟', a: 'تختلف حسب المحافظة والمسافة. تبدأ من 50 جنيه للقاهرة والجيزة.' },
  { q: 'ما هي مدة الإرجاع؟', a: '7 أيام من تاريخ الاستلام، بشرط أن يكون المنتج بحالته الأصلية.' },
  { q: 'هل المنتجات أصلية؟', a: 'نعم، جميع قطع الغيار أصلية 100% ومضمونة.' },
  { q: 'نسيت كلمة المرور، ماذا أفعل؟', a: 'اضغط على "نسيت كلمة المرور" في صفحة تسجيل الدخول واتبع التعليمات.' },
]

export const videoSuggestions = [
  { title: 'نظام الشحن WeBikers وأفضل نصائح التوصيل', url: 'https://www.youtube.com/watch?v=example1' },
  { title: 'شرح خطوات الطلب من الموقع - WeBikers', url: 'https://www.youtube.com/watch?v=example2' },
  { title: 'الصيانة الدورية للسكوتر للمبتدئين', url: 'https://www.youtube.com/watch?v=example3' },
  { title: 'اختيار قطع غيار السكوتر الصحيحة', url: 'https://www.youtube.com/watch?v=example4' },
]

export function findBestFAQAnswer(query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return null

  const score = (text: string) => {
    const n = text.toLowerCase()
    const exact = n === normalizedQuery
    if (exact) return 100

    const contains = n.includes(normalizedQuery)
    if (contains) return 80

    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean)
    const matches = queryWords.filter((w) => n.includes(w)).length
    return (matches / Math.max(queryWords.length, 1)) * 50
  }

  const results = faqData
    .map((item) => ({ item, score: score(item.q) }))
    .sort((a, b) => b.score - a.score)

  const best = results[0]
  if (!best || best.score < 40) return null
  return { answer: best.item.a, question: best.item.q, score: best.score }
}
