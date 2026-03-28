'use client'

import { Product } from '@/types'

interface ProductSchemaProps {
  product: Product
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description?.replace(/<[^>]*>/g, '') || product.name,
    image: product.images?.map(img => img.src) || [],
    sku: product.sku || product.id.toString(),
    brand: {
      '@type': 'Brand',
      name: product.brands?.[0]?.name || 'WeBikers',
    },
    offers: {
      '@type': 'Offer',
      url: `https://webikers.com/products/${product.id}`,
      priceCurrency: 'EGP',
      price: parseFloat(product.price || '0'),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock_status === 'instock' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'WeBikers',
      },
    },
    aggregateRating: product.rating_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating,
      reviewCount: product.rating_count,
    } : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
