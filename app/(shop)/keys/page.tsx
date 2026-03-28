import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { scooterModels, getWhatsAppLink } from '@/lib/data/scooterKeys'

export const metadata: Metadata = {
  title: 'بصمات السكوترات | WeBikers',
  description:
    'فقدت مفتاح سكوترك؟ اطلب بصمة جديدة لجميع أنواع وموديلات السكوترات — Honda, Yamaha, Vespa, Kymco وأكثر. تواصل معنا على واتساب.',
  openGraph: {
    title: 'بصمات السكوترات | WeBikers',
    description: 'بصمة لكل أنواع السكوترات — تواصل معنا على واتساب',
  },
}

const brandColors: Record<string, string> = {
  Honda:   'bg-red-50 text-red-600 border-red-200',
  Yamaha:  'bg-blue-50 text-blue-600 border-blue-200',
  Vespa:   'bg-green-50 text-green-600 border-green-200',
  Kymco:   'bg-orange-50 text-orange-600 border-orange-200',
  Sym:     'bg-purple-50 text-purple-600 border-purple-200',
  Piaggio: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  TVS:     'bg-indigo-50 text-indigo-600 border-indigo-200',
  Suzuki:  'bg-sky-50 text-sky-600 border-sky-200',
}

export default function KeysPage() {
  const brands = [...new Set(scooterModels.map((s) => s.brand))]

  return (
    <div className="min-h-screen bg-[#fff8f2]">

      {/* Hero */}
      <div className="bg-[#2a1204] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="block mb-4 text-6xl">🔑</span>
          <h1 className="mb-4 text-4xl font-black md:text-5xl">
            بصمات السكوترات
          </h1>
          <p className="max-w-xl mx-auto text-lg leading-relaxed text-white/80">
            فقدت مفتاح سكوترك؟ عندنا بصمة لجميع أنواع وموديلات السكوترات.
            اختار موديلك وهنرد عليك على واتساب فوراً.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 text-sm font-bold">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20">
              ⚡ رد سريع على واتساب
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20">
              🔑 جميع الموديلات
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20">
              🚚 توصيل لكل مصر
            </span>
          </div>
        </div>
      </div>

      {/* Brand Filter Pills */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-[#f3cfb5] py-3 px-4">
        <div className="flex gap-2 mx-auto overflow-x-auto max-w-7xl" style={{ scrollbarWidth: 'none' }}>
          <a
            href="#all"
            className="flex-shrink-0 px-4 py-1.5 text-sm font-bold rounded-full bg-[#db5f02] text-white"
          >
            الكل
          </a>
          {brands.map((brand) => (
            <a
              key={brand}
              href={`#brand-${brand}`}
              className={`flex-shrink-0 px-4 py-1.5 text-sm font-bold rounded-full border ${brandColors[brand] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
            >
              {brand}
            </a>
          ))}
        </div>
      </div>

      {/* Scooter Grid */}
      <div id="all" className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {brands.map((brand) => {
          const brandScooters = scooterModels.filter((s) => s.brand === brand)
          return (
            <div key={brand} id={`brand-${brand}`} className="mb-12 scroll-mt-32">
              {/* Brand Header */}
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-black text-gray-900">{brand}</h2>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border ${brandColors[brand] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                >
                  {brandScooters.length} موديل
                </span>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {brandScooters.map((scooter) => (
                  <a
                    key={scooter.id}
                    href={getWhatsAppLink(scooter.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="overflow-hidden transition-all duration-200 border-2 bg-white rounded-2xl border-[#f3cfb5] group-hover:border-[#db5f02] group-hover:shadow-xl group-hover:-translate-y-1">

                      {/* Image */}
                      <div className="relative aspect-square bg-gradient-to-b from-[#fff8f2] to-white">
                        <Image
                          src={`/images/keys/${scooter.id}.webp`}
                          alt={`بصمة ${scooter.name}`}
                          fill
                          className="object-contain p-3"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                        />
                        {/* ID badge */}
                        <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-400 bg-white/80 px-1.5 py-0.5 rounded-full border border-gray-100">
                          #{scooter.id}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-3 text-center border-t border-[#f3cfb5]">
                        <p className="text-sm font-black leading-tight text-gray-900">{scooter.name}</p>
                        <span className="inline-block mt-1 text-xs font-bold text-[#db5f02] bg-[#fff1e7] px-2 py-0.5 rounded-full">
                          {scooter.cc}
                        </span>
                        <div className="flex items-center justify-center gap-1 px-3 py-2 mt-3 text-xs font-black text-white transition-colors rounded-xl bg-[#25D366] group-hover:bg-[#1aab55]">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span>اطلب البصمة</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[#f3cfb5] bg-white py-12 px-4 text-center">
        <p className="mb-4 text-gray-600">مش لاقي موديلك؟</p>
        <a
          href={`https://wa.me/201030351075?text=${encodeURIComponent('عايز أسأل عن بصمة سكوتر')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 text-lg font-black text-white rounded-2xl bg-[#25D366] hover:bg-[#1aab55] transition-colors shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 duration-200"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>تواصل معنا على واتساب</span>
        </a>
        <p className="mt-4 text-xs text-gray-400">
          هنساعدك تلاقي بصمة أي موديل حتى لو مش موجود في القائمة
        </p>
      </div>

    </div>
  )
}
