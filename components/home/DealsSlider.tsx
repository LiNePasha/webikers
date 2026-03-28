'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface Deal {
  id: number
  title: string
  description: string
  image: string
  oldPrice: number
  newPrice: number
  colors?: string[]
  badge?: string
}

const deals: Deal[] = [
  {
    id: 1,
    title: 'انجن جارد Hogan',
    description: 'كل موديلات الهوجان F250 H250 L250 V250',
    image: 'https://api.spare2app.com/wp-content/uploads/2025/12/489607486_1123433136466183_418431808372432767_n-1-1-1.jpg',
    oldPrice: 800,
    newPrice: 390,
    colors: ['أبيض', 'أحمر', 'أخضر', 'أزرق', 'أسود', 'أصفر', 'رمادي'],
    badge: '🔥 عرض ساخن'
  },
  {
    id: 2,
    title: 'شكمان SC',
    description: 'شكمان SC عالي الجودة',
    image: 'https://api.spare2app.com/wp-content/uploads/2026/01/Abo-Shaaban-ELasly-2026-01-08T122508.746.png',
    oldPrice: 1450,
    newPrice: 1250,
    colors: ['أسود', 'فضي'],
    badge: '⚡ توفير فوري'
  },
  {
    id: 3,
    title: 'شنطة جنب كيمواني',
    description: 'شنطة جانبية عالية الجودة',
    image: 'https://api.spare2app.com/wp-content/uploads/2026/01/Abo-Shaaban-ELasly-87-1.png',
    oldPrice: 1850,
    newPrice: 1450,
    badge: '💎 جودة ممتازة'
  }
]

export default function DealsSlider() {
  const [currentDeal, setCurrentDeal] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const nextDeal = () => {
    setCurrentDeal((prev) => (prev + 1) % deals.length)
  }

  const prevDeal = () => {
    setCurrentDeal((prev) => (prev - 1 + deals.length) % deals.length)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      prevDeal()
    }
    if (isRightSwipe) {
      nextDeal()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const calculateDiscount = (oldPrice: number, newPrice: number) => {
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100)
  }

  const currentDealData = deals[currentDeal]
  const discount = calculateDiscount(currentDealData.oldPrice, currentDealData.newPrice)
  const savings = currentDealData.oldPrice - currentDealData.newPrice

  return (
    <section className="py-4 md:py-8 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="container px-3 mx-auto md:px-4 max-w-7xl sm:px-6 lg:px-8">
        {/* Header - Compact for Mobile */}
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-1 text-xl font-black text-gray-900 md:text-3xl"
            >
              🔥 عروض ساخنة
            </motion.h2>
            <p className="text-xs text-gray-600 md:text-base">لا تفوت فرصة التوفير!</p>
          </div>
          <Link
            href="/deals"
            className="px-3 py-1.5 md:px-6 md:py-3 text-xs md:text-sm font-bold text-white transition-all rounded-lg md:rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            كل العروض
          </Link>
        </div>

        {/* Deals Slider - Touch Enabled */}
        <div 
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDeal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden border-2 shadow-xl md:border-4 bg-gradient-to-br from-white to-orange-50 rounded-2xl md:rounded-3xl border-orange-200"
            >
              <div className="grid gap-3 p-3 md:grid-cols-2 md:gap-6 md:p-6 lg:p-8">
                {/* Image Section - Mobile Optimized */}
                <div className="relative order-2 md:order-1">
                  <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50">
                    {/* Discount Badge - Smaller for Mobile */}
                    <div className="absolute z-20 top-2 right-2 md:top-4 md:right-4">
                      <div className="relative flex flex-col items-center justify-center w-12 h-12 text-white rounded-full md:w-20 md:h-20 bg-gradient-to-br from-red-600 via-red-500 to-orange-500">
                        <span className="text-[10px] md:text-xs font-bold">خصم</span>
                        <span className="text-lg font-black md:text-3xl">-{discount}%</span>
                      </div>
                    </div>

                    <OptimizedImage
                      src={currentDealData.image}
                      alt={currentDealData.title}
                      width={400}
                      height={400}
                      className="object-contain w-full h-40 md:h-64 lg:h-80"
                      loading="eager"
                      quality={85}
                    />
                  </div>
                </div>

                {/* Content Section - Compact for Mobile */}
                <div className="flex flex-col justify-center order-1 space-y-2 md:order-2 md:space-y-4">
                  {/* Badge - Smaller */}
                  {currentDealData.badge && (
                    <div className="inline-flex self-start px-2 py-1 text-[10px] md:text-sm font-bold text-white rounded-full md:px-4 md:py-2 bg-gradient-to-r from-red-600 to-orange-600">
                      {currentDealData.badge}
                    </div>
                  )}

                  {/* Title - Responsive */}
                  <h3 className="text-lg font-black text-gray-900 md:text-2xl lg:text-3xl">
                    {currentDealData.title}
                  </h3>

                  {/* Description - Hide on Small Mobile */}
                  <p className="hidden text-sm text-gray-600 sm:block md:text-base">
                    {currentDealData.description}
                  </p>

                  {/* Colors - Compact */}
                  {currentDealData.colors && (
                    <div className="hidden md:block">
                      <p className="mb-1 text-xs font-semibold text-gray-700 md:text-sm">الألوان المتاحة:</p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {currentDealData.colors.map((color, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price - Compact */}
                  <div className="flex items-end gap-2">
                    <div>
                      <p className="text-[10px] md:text-sm text-gray-500">السعر الجديد</p>
                      <p className="text-2xl font-black text-red-600 md:text-4xl">
                        {currentDealData.newPrice}
                        <span className="text-sm md:text-2xl"> جنيه</span>
                      </p>
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-bold text-gray-500 line-through md:text-lg">
                        {currentDealData.oldPrice} جنيه
                      </p>
                    </div>
                  </div>

                  {/* Savings - Compact */}
                  <div className="inline-flex items-center gap-1.5 px-2 py-1.5 md:px-4 md:py-3 bg-green-100 rounded-lg md:rounded-xl w-fit">
                    <span className="text-lg md:text-2xl">💰</span>
                    <span className="text-sm font-bold text-green-700 md:text-lg">
                      وفر {savings} جنيه!
                    </span>
                  </div>

                  {/* CTA Button - Compact */}
                  <Link
                    href="/deals"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-bold text-white transition-all rounded-lg md:rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-95"
                  >
                    <span>اطلب الآن</span>
                    <span className="text-lg md:text-2xl">🛒</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons - Smaller for Mobile */}
          <div className="absolute z-20 flex gap-1 transform -translate-y-1/2 md:gap-2 top-1/2 left-2 md:left-4">
            <button
              onClick={prevDeal}
              className="flex items-center justify-center w-8 h-8 text-white transition-all bg-black rounded-full shadow-lg md:w-12 md:h-12 bg-opacity-60 hover:bg-opacity-80 active:scale-90"
              aria-label="العرض السابق"
            >
              <ChevronRightIcon className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>

          <div className="absolute z-20 flex gap-1 transform -translate-y-1/2 md:gap-2 top-1/2 right-2 md:right-4">
            <button
              onClick={nextDeal}
              className="flex items-center justify-center w-8 h-8 text-white transition-all bg-black rounded-full shadow-lg md:w-12 md:h-12 bg-opacity-60 hover:bg-opacity-80 active:scale-90"
              aria-label="العرض التالي"
            >
              <ChevronLeftIcon className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Dots Indicator - Smaller */}
          <div className="flex justify-center gap-1.5 mt-3 md:gap-2 md:mt-6">
            {deals.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentDeal(index)}
                className={`h-1.5 md:h-2 rounded-full transition-all ${
                  index === currentDeal 
                    ? 'w-6 md:w-8 bg-gradient-to-r from-red-600 to-orange-600' 
                    : 'w-1.5 md:w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`الانتقال للعرض ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
