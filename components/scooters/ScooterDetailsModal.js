'use client'

import { useMemo, useState } from 'react'
import { formatPriceEGP, scootersPlaceholderImage } from '@/app/lib/scooters-utils'

const WHATSAPP_NUMBER = '01030351075'

export default function ScooterDetailsModal({
  isOpen,
  scooter,
  type,
  onClose,
}) {
  const [activeImage, setActiveImage] = useState(0)

  const images = useMemo(() => {
    if (!scooter?.images?.length) return [scootersPlaceholderImage]
    return scooter.images
  }, [scooter])

  if (!isOpen || !scooter) return null

  const whatsappText = encodeURIComponent(`مرحباً، مهتم بـ ${scooter.title} (${scooter.brand} ${scooter.model})`)
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تفاصيل الإسكوتر"
      className="fixed inset-0 z-50 flex items-end bg-black/70 p-0 backdrop-blur-sm md:items-center md:justify-center md:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-[#232b3b] p-4 md:max-w-4xl md:rounded-2xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">{scooter.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
          >
            إغلاق
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <img
              src={images[activeImage] || scootersPlaceholderImage}
              alt={scooter.title}
              className="h-72 w-full rounded-xl bg-[#1a2233] object-cover md:h-96"
            />
            {images.length > 1 ? (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded-lg border ${
                      activeImage === index ? 'border-[#f3a028]' : 'border-white/15'
                    }`}
                    aria-label={`صورة ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${scooter.title} - ${index + 1}`}
                      loading="lazy"
                      className="h-16 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-3 text-sm text-gray-200">
            <p className="text-xl font-black text-[#f3a028]">{formatPriceEGP(scooter.price)}</p>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#181f2a] p-3">
              <Spec label="الماركة" value={scooter.brand} />
              <Spec label="الموديل" value={scooter.model} />
              <Spec label="السنة" value={scooter.year || 'غير محدد'} />
              <Spec label="اللون" value={scooter.color} />
              <Spec label="المحرك" value={scooter.engineCC} />
              {type === 'used' && scooter.mileage ? (
                <Spec label="الكيلومترات" value={`${scooter.mileage.toLocaleString('ar-EG')} كم`} />
              ) : null}
            </div>

            <div>
              <h3 className="mb-1 font-bold text-white">الوصف</h3>
              <p className="leading-7 text-gray-300">{scooter.descriptionFull || 'لا يوجد وصف إضافي.'}</p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#25D366] px-4 py-2.5 font-bold text-white hover:bg-[#1fb85a]"
            >
              تواصل واتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spec({ label, value }) {
  return (
    <p>
      <span className="text-gray-400">{label}: </span>
      <span className="font-semibold text-white">{value}</span>
    </p>
  )
}
