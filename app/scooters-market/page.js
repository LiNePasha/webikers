import Link from 'next/link'

export const metadata = {
  title: 'سوق الإسكوترات | اختر الفئة | WeBikers',
  description: 'اختر بين الإسكوترات الجديدة أو المستعملة للدخول إلى السوق المناسب.',
  openGraph: {
    title: 'سوق الإسكوترات | اختر الفئة | WeBikers',
    description: 'اختر بين الإسكوترات الجديدة أو المستعملة للدخول إلى السوق المناسب.',
    type: 'website',
    locale: 'ar_EG',
  },
}

const options = [
  {
    href: '/scooters-market/new',
    title: 'إسكوترات جديدة',
    description: 'اكتشف أحدث موديلات الإسكوترات الجديدة بضمان وحالة ممتازة.',
    badge: 'New',
  },
  {
    href: '/scooters-market/used',
    title: 'إسكوترات مستعملة',
    description: 'تصفح أفضل عروض الإسكوترات المستعملة مع تفاصيل الحالة والعداد.',
    badge: 'Used',
  },
]

export default function ScootersMarketChooserPage() {
  return (
    <div className="min-h-screen bg-[#181f2a] py-10 text-white" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-black md:text-4xl">سوق الإسكوترات</h1>
          <p className="mt-3 text-sm text-gray-300 md:text-base">اختر نوع السوق الذي تريد تصفحه الآن.</p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {options.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="group rounded-2xl border border-white/10 bg-[#232b3b] p-6 transition hover:-translate-y-1 hover:border-[#f3a028]/40 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-full bg-[#f3a028]/20 px-3 py-1 text-xs font-extrabold text-[#ffd18f]">
                {option.badge}
              </div>
              <h2 className="text-2xl font-black text-white">{option.title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-300">{option.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f3a028]">
                ادخل السوق
                <span className="transition group-hover:translate-x-1">←</span>
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  )
}
