import { MetadataRoute } from 'next'

const SITE_URL = 'https://webikers.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    '',
    '/products',
    '/category',
    '/about',
    '/contact',
    '/deals',
    '/faq',
    '/help',
    '/reviews',
    '/shipping',
    '/returns',
    '/privacy',
    '/terms-and-conditions',
    '/usage-policy',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Fetch dynamic product routes
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL}/products?per_page=100&status=publish`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET}`
          ).toString('base64')}`,
        },
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    )
    
    if (response.ok) {
      const products = await response.json()
      productRoutes = products.map((product: any) => ({
        url: `${SITE_URL}/products/${product.id}`,
        lastModified: new Date(product.date_modified || product.date_created),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  // Fetch dynamic category routes
  let categoryRoutes: MetadataRoute.Sitemap = []
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL}/products/categories?per_page=100`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET}`
          ).toString('base64')}`,
        },
        next: { revalidate: 3600 },
      }
    )
    
    if (response.ok) {
      const categories = await response.json()
      categoryRoutes = categories.map((category: any) => ({
        url: `${SITE_URL}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
