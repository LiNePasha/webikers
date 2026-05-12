const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg'

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function stripHtmlTags(input = '') {
  return String(input)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitizeText(input = '', maxLength) {
  const plain = stripHtmlTags(input)
  if (!maxLength || plain.length <= maxLength) return plain
  return `${plain.slice(0, maxLength).trim()}...`
}

export function parseImages(imagesField) {
  if (!imagesField) return []

  let raw = imagesField

  if (typeof raw === 'string') {
    const parsed = safeJsonParse(raw)
    raw = parsed ?? [raw]
  }

  if (!Array.isArray(raw)) return []

  return raw
    .map((image) => {
      if (!image) return ''
      if (typeof image === 'string') return image.trim()
      if (typeof image === 'object') {
        return (
          image.url ||
          image.src ||
          image.link ||
          image.guid?.rendered ||
          ''
        )
      }
      return ''
    })
    .filter(Boolean)
}

export function formatPriceEGP(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 'السعر غير محدد'

  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(numeric)
}

export function normalizeScooter(item = {}) {
  const acf = item?.acf && typeof item.acf === 'object' ? item.acf : {}
  const images = parseImages(acf.images)

  return {
    id: item.id,
    slug: item.slug || '',
    date: item.date || '',
    status: item.status || 'publish',
    title: sanitizeText(item?.title?.rendered || 'إعلان بدون عنوان'),
    description: sanitizeText(item?.content?.rendered || ''),
    descriptionFull: sanitizeText(item?.content?.rendered || '', 5000),
    brand: sanitizeText(acf.brand || 'غير محدد'),
    model: sanitizeText(acf.model || 'غير محدد'),
    year: Number(acf.year) || null,
    price: Number(acf.price) || 0,
    color: sanitizeText(acf.color || 'غير محدد'),
    engineCC: sanitizeText(acf.engine_cc || 'غير محدد'),
    mileage: Number(acf.mileage) || null,
    images,
    image: images[0] || PLACEHOLDER_IMAGE,
  }
}

export function applyClientFilters(items = [], filters = {}) {
  const {
    brand = 'all',
    minPrice = '',
    maxPrice = '',
    year = '',
    q = '',
    sort = 'newest',
  } = filters

  const min = minPrice !== '' ? Number(minPrice) : null
  const max = maxPrice !== '' ? Number(maxPrice) : null
  const yearNumber = year !== '' ? Number(year) : null
  const query = String(q || '').trim().toLowerCase()

  const filtered = items.filter((item) => {
    const brandMatch = brand === 'all' ? true : item.brand === brand
    const minMatch = min === null ? true : item.price >= min
    const maxMatch = max === null ? true : item.price <= max
    const yearMatch = yearNumber === null ? true : item.year === yearNumber

    const queryTarget = `${item.title} ${item.brand} ${item.model}`.toLowerCase()
    const queryMatch = !query ? true : queryTarget.includes(query)

    return brandMatch && minMatch && maxMatch && yearMatch && queryMatch
  })

  const sorted = [...filtered]

  if (sort === 'price_low') {
    sorted.sort((a, b) => a.price - b.price)
  } else if (sort === 'price_high') {
    sorted.sort((a, b) => b.price - a.price)
  } else {
    sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return sorted
}

export const scootersPlaceholderImage = PLACEHOLDER_IMAGE
