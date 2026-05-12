'use client'

import { useEffect, useState } from 'react'

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price_low', label: 'السعر الأقل' },
  { value: 'price_high', label: 'السعر الأعلى' },
]

export default function ScooterFilters({
  value,
  onChange,
  brands = [],
  years = [],
}) {
  const [searchInput, setSearchInput] = useState(value.q || '')

  useEffect(() => {
    setSearchInput(value.q || '')
  }, [value.q])

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((value.q || '') !== searchInput) {
        onChange({ q: searchInput })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, onChange, value.q])

  return (
    <section
      aria-label="فلاتر سوق الإسكوترات"
      className="rounded-2xl border border-white/10 bg-[#232b3b] p-4 md:p-5"
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label htmlFor="scooters-search" className="mb-1 block text-sm text-gray-300">
            بحث بالاسم أو الموديل
          </label>
          <input
            id="scooters-search"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="مثال: Vespa GTS"
            className="w-full rounded-lg border border-white/15 bg-[#181f2a] px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-[#f3a028] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="scooters-brand" className="mb-1 block text-sm text-gray-300">
            الماركة
          </label>
          <select
            id="scooters-brand"
            value={value.brand}
            onChange={(e) => onChange({ brand: e.target.value })}
            className="w-full rounded-lg border border-white/15 bg-[#181f2a] px-3 py-2 text-sm text-white focus:border-[#f3a028] focus:outline-none"
          >
            <option value="all">كل الماركات</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="scooters-min" className="mb-1 block text-sm text-gray-300">
            السعر من
          </label>
          <input
            id="scooters-min"
            type="number"
            min="0"
            value={value.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="w-full rounded-lg border border-white/15 bg-[#181f2a] px-3 py-2 text-sm text-white focus:border-[#f3a028] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="scooters-max" className="mb-1 block text-sm text-gray-300">
            السعر إلى
          </label>
          <input
            id="scooters-max"
            type="number"
            min="0"
            value={value.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="w-full rounded-lg border border-white/15 bg-[#181f2a] px-3 py-2 text-sm text-white focus:border-[#f3a028] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="scooters-year" className="mb-1 block text-sm text-gray-300">
            سنة الصنع
          </label>
          <select
            id="scooters-year"
            value={value.year}
            onChange={(e) => onChange({ year: e.target.value })}
            className="w-full rounded-lg border border-white/15 bg-[#181f2a] px-3 py-2 text-sm text-white focus:border-[#f3a028] focus:outline-none"
          >
            <option value="">كل السنوات</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label htmlFor="scooters-sort" className="mb-1 block text-sm text-gray-300">
            ترتيب حسب
          </label>
          <select
            id="scooters-sort"
            value={value.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
            className="w-full rounded-lg border border-white/15 bg-[#181f2a] px-3 py-2 text-sm text-white focus:border-[#f3a028] focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
