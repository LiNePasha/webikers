import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/auth/',
          '/checkout/',
          '/payment/',
          '/_next/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/account/', '/auth/', '/checkout/'],
      },
    ],
    sitemap: 'https://webikers.com/sitemap.xml',
  }
}
