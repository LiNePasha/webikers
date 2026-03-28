import { Metadata } from 'next'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  try {
    const product = await wooCommerceAPI.getProduct(id)
    
    const price = product.price ? `${parseFloat(product.price).toLocaleString('ar-EG')} جنيه` : ''
    const description = product.short_description 
      ? product.short_description.replace(/<[^>]*>/g, '').substring(0, 160)
      : `اشتري ${product.name} من WeBikers - اكسسوارات وقطع غيار مميزة في مصر`
    
    return {
      title: `${product.name} | WeBikers`,
      description,
      keywords: [
        product.name,
        'قطع غيار موتوسيكلات',
        'WeBikers',
        ...(product.categories?.map(c => c.name) || []),
        ...(product.brands?.map(b => b.name) || []),
      ].join(', '),
      openGraph: {
        title: `${product.name} - ${price}`,
        description,
        images: [
          {
            url: product.images?.[0]?.src || '/logo.webp',
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        type: 'website',
        locale: 'ar_EG',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: [product.images?.[0]?.src || '/logo.webp'],
      },
      alternates: {
        canonical: `https://webikers.com/products/${id}`,
      },
    }
  } catch (error) {
    return {
      title: 'منتج | WeBikers',
      description: 'قطع غيار وأكسسوارات الموتوسيكلات',
    }
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
