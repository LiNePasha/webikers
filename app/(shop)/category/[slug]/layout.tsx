import { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  // Convert slug to readable name
  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return {
    title: `${categoryName} | WeBikers`,
    description: `تصفح جميع منتجات ${categoryName} من WeBikers - قطع غيار وأكسسوارات الموتوسيكلات الأصلية بأفضل الأسعار`,
    keywords: `${categoryName}, قطع غيار موتوسيكلات, أكسسوارات موتوسيكلات, WeBikers`,
    openGraph: {
      title: `${categoryName} | WeBikers`,
      description: `تصفح جميع منتجات ${categoryName}`,
      type: 'website',
      locale: 'ar_EG',
    },
    alternates: {
      canonical: `https://webikers.com/category/${slug}`,
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
