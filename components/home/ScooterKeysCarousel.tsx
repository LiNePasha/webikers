'use client'

import Link from 'next/link'
import Image from 'next/image'
import { scooterModels, getWhatsAppLink } from '@/lib/data/scooterKeys'

export default function ScooterKeysCarousel() {
  return (
    <section className="py-2 bg-white border-b border-[#f3cfb5]">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header Row */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="inline-block px-3 py-1 mb-2 text-xs font-bold rounded-full text-[#b84f03] bg-[#fff1e7] border border-[#f5c49e]">
              🔑 خدمة البصمات
            </span>
            <h2 className="text-2xl font-black text-gray-900">بصمات السكوترات</h2>
            <p className="mt-1 text-sm text-gray-500">
              فقدت مفتاحك؟ اختار موديل سكوترك واتواصل معنا فوراً
            </p>
          </div>
          <Link
            href="/keys"
            className="flex-shrink-0 text-sm font-bold text-[#db5f02] hover:underline"
          >
            عرض الكل ←
          </Link>
        </div>

        {/* Horizontal Scroll Container */}
        <div
          className="flex gap-3 pb-4 overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {scooterModels.map((scooter) => (
            <a
              key={scooter.id}
              href={getWhatsAppLink(scooter.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-36 md:w-44 snap-start group"
            >
              <div className="overflow-hidden transition-all border-2 bg-white rounded-2xl border-[#f3cfb5] group-hover:border-[#db5f02] group-hover:shadow-xl group-hover:-translate-y-1 duration-200">
                {/* Image */}
                <div className="relative bg-gradient-to-b from-[#fff8f2] to-white aspect-square">
                  <Image
                    src={`/images/keys/${scooter.id}.webp`}
                    alt={`بصمة ${scooter.name}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 144px, 176px"
                  />
                </div>

                {/* Info */}
                <div className="p-2 text-center border-t border-[#f3cfb5]">
                  <p className="text-xs font-black text-gray-900 truncate">{scooter.name}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold text-[#db5f02]">
                    {scooter.cc}
                  </span>
                  <div className="flex items-center justify-center gap-1 px-2 py-1.5 mt-2 text-xs font-black text-white transition-colors rounded-xl bg-[#25D366] group-hover:bg-[#1aab55]">
                    <span>💬</span>
                    <span>اطلب البصمة</span>
                  </div>
                </div>
              </div>
            </a>
          ))}

          {/* View All Card */}
          <Link
            href="/keys"
            className="flex-shrink-0 w-36 md:w-44 snap-start group"
          >
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center border-2 border-dashed rounded-2xl border-[#f3cfb5] bg-[#fff8f2] group-hover:border-[#db5f02] group-hover:bg-[#fff1e7] transition-all duration-200">
              <span className="mb-2 text-3xl">🔑</span>
              <p className="text-sm font-black text-[#db5f02]">عرض كل الموديلات</p>
              <p className="mt-1 text-xs text-gray-400">←</p>
            </div>
          </Link>
        </div>

      </div>
    </section>
  )
}
