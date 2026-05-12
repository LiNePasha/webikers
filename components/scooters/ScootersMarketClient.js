'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ScooterFilters from '@/components/scooters/ScooterFilters'
import ScooterCard from '@/components/scooters/ScooterCard'
import ScooterDetailsModal from '@/components/scooters/ScooterDetailsModal'
import ScootersPagination from '@/components/scooters/ScootersPagination'
import {
  applyClientFilters,
  normalizeScooter,
} from '@/app/lib/scooters-utils'

const PER_PAGE = 12

const DEFAULT_FILTERS = {
  q: '',
  brand: 'all',
  minPrice: '',
  maxPrice: '',
  year: '',
  sort: 'newest',
}

function mapSortToApi(sort) {
  if (sort === 'price_low') {
    return { orderBy: 'meta_value_num', order: 'asc' }
  }

  if (sort === 'price_high') {
    return { orderBy: 'meta_value_num', order: 'desc' }
  }

  return { orderBy: 'date', order: 'desc' }
}

export default function ScootersMarketClient({
  type = 'new',
  title = 'سوق الإسكوترات',
  subtitle = 'اعثر على إسكوترك الجديد أو المستعمل بسهولة.',
}) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedScooter, setSelectedScooter] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(filters.q), 300)
    return () => clearTimeout(timer)
  }, [filters.q])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const { orderBy, order } = mapSortToApi(filters.sort)
      const params = new URLSearchParams({
        type,
        page: String(page),
        per_page: String(PER_PAGE),
        orderBy,
        order,
      })

      if (debouncedQ?.trim()) {
        params.set('search', debouncedQ.trim())
      }

      const res = await fetch(`/api/public-scooters?${params.toString()}`, {
        cache: 'no-store',
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.message || 'تعذر تحميل الإسكوترات.')
      }

      const normalized = Array.isArray(json.items)
        ? json.items.map((item) => normalizeScooter(item))
        : []

      setItems(normalized)
      setTotal(Number(json.total || 0))
      setTotalPages(Number(json.total_pages || 1))
    } catch (fetchError) {
      setItems([])
      setTotal(0)
      setTotalPages(1)
      setError(fetchError instanceof Error ? fetchError.message : 'حدث خطأ غير متوقع.')
    } finally {
      setLoading(false)
    }
  }, [type, debouncedQ, filters.sort, page])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredItems = useMemo(
    () =>
      applyClientFilters(items, {
        ...filters,
        q: debouncedQ,
      }),
    [items, filters, debouncedQ],
  )

  const brands = useMemo(() => {
    return [...new Set(items.map((item) => item.brand).filter(Boolean))]
  }, [items])

  const years = useMemo(() => {
    return [...new Set(items.map((item) => item.year).filter(Boolean))].sort((a, b) => b - a)
  }, [items])

  const handleFilterChange = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#181f2a] py-8 text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-black md:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-gray-300">{subtitle}</p>
        </header>

        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href="/scooters-market/new"
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              type === 'new'
                ? 'bg-[#f3a028] text-[#181f2a]'
                : 'border border-white/15 bg-[#232b3b] text-gray-200 hover:bg-[#2c374a]'
            }`}
            aria-current={type === 'new' ? 'page' : undefined}
          >
            إسكوترات جديدة
          </Link>
          <Link
            href="/scooters-market/used"
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              type === 'used'
                ? 'bg-[#f3a028] text-[#181f2a]'
                : 'border border-white/15 bg-[#232b3b] text-gray-200 hover:bg-[#2c374a]'
            }`}
            aria-current={type === 'used' ? 'page' : undefined}
          >
            إسكوترات مستعملة
          </Link>
        </div>

        <ScooterFilters value={filters} onChange={handleFilterChange} brands={brands} years={years} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-300">
          <p>إجمالي النتائج من السيرفر: {total.toLocaleString('ar-EG')}</p>
          <p>المعروض بعد الفلاتر الحالية: {filteredItems.length.toLocaleString('ar-EG')}</p>
        </div>

        {loading ? <ScooterGridSkeleton /> : null}

        {!loading && error ? (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-5">
            <p className="font-bold text-red-200">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-3 rounded-lg bg-red-400 px-4 py-2 text-sm font-bold text-[#181f2a]"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : null}

        {!loading && !error && filteredItems.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#232b3b] p-8 text-center">
            <p className="text-lg font-bold">لا توجد نتائج مطابقة للفلاتر الحالية</p>
            <p className="mt-1 text-sm text-gray-300">جرّب تعديل نطاق السعر أو الماركة أو البحث.</p>
          </div>
        ) : null}

        {!loading && !error && filteredItems.length > 0 ? (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((scooter) => (
                <ScooterCard
                  key={scooter.id}
                  scooter={scooter}
                  type={type}
                  onOpen={setSelectedScooter}
                />
              ))}
            </section>

            <ScootersPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : null}

        <ScooterDetailsModal
          isOpen={Boolean(selectedScooter)}
          scooter={selectedScooter}
          type={type}
          onClose={() => setSelectedScooter(null)}
        />
      </div>
    </div>
  )
}

function ScooterGridSkeleton() {
  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="جاري التحميل">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#232b3b]"
        >
          <div className="h-52 w-full animate-pulse bg-[#2a3447]" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#2a3447]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#2a3447]" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-[#2a3447]" />
            <div className="h-9 w-full animate-pulse rounded bg-[#2a3447]" />
          </div>
        </div>
      ))}
    </section>
  )
}
