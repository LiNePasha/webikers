'use client'

import { formatPriceEGP } from '@/app/lib/scooters-utils'

export default function ScooterCard({ scooter, type, onOpen }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#232b3b] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <img
        src={scooter.image}
        alt={scooter.title || 'صورة إسكوتر'}
        loading="lazy"
        className="h-52 w-full bg-[#1a2233] object-cover"
      />

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-extrabold text-white">{scooter.title}</h3>
          <span className="shrink-0 rounded-full bg-[#f3a028]/20 px-2.5 py-1 text-xs font-bold text-[#ffd18f]">
            {scooter.status === 'publish' ? 'متاح' : scooter.status}
          </span>
        </div>

        <p className="text-sm text-gray-300">
          {scooter.brand} • {scooter.model} • {scooter.year || 'غير محدد'}
        </p>

        <p className="text-lg font-black text-[#f3a028]">{formatPriceEGP(scooter.price)}</p>

        {type === 'used' && scooter.mileage ? (
          <p className="text-sm font-semibold text-gray-200">العداد: {scooter.mileage.toLocaleString('ar-EG')} كم</p>
        ) : null}

        <button
          type="button"
          onClick={() => onOpen(scooter)}
          aria-label={`عرض تفاصيل ${scooter.title}`}
          className="w-full rounded-lg bg-[#f3a028] px-3 py-2 text-sm font-bold text-[#181f2a] transition hover:bg-[#ffb84a]"
        >
          عرض التفاصيل
        </button>
      </div>
    </article>
  )
}
