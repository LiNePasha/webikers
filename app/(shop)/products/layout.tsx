import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'جميع المنتجات | WeBikers',
  description: 'تصفح جميع قطع غيار وأكسسوارات الموتوسيكلات من WeBikers - بنيلي، هوجان، فيجوري وجميع الماركات',
  keywords: 'قطع غيار موتوسيكلات, أكسسوارات موتوسيكلات, بنيلي, هوجان, فيجوري, WeBikers',
  openGraph: {
    title: 'جميع المنتجات | WeBikers',
    description: 'تصفح جميع قطع غيار وأكسسوارات الموتوسيكلات',
    type: 'website',
    locale: 'ar_EG',
  },
  alternates: {
    canonical: 'https://webikers.com/products',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
