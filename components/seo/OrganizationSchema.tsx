'use client'

export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WeBikers',
    alternateName: 'WeBikers Store',
    url: 'https://webikers.com',
    logo: 'https://webikers.com/logo.webp',
    description: 'متجر WeBikers لقطع غيار وأكسسوارات الموتوسيكلات في مصر',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+20-XXX-XXX-XXXX',
      contactType: 'Customer Service',
      areaServed: 'EG',
      availableLanguage: ['ar', 'en'],
    },
    sameAs: [
      'https://www.facebook.com/webikers',
      'https://www.instagram.com/webikers',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG',
      addressLocality: 'Cairo',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
