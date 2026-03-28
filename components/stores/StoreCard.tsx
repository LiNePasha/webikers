'use client'

import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { Store } from '@/types'

interface StoreCardProps {
  store: any // Will be Store type when properly mapped
  variant?: 'default' | 'compact' | 'featured'
  showDescription?: boolean
  className?: string
}

export default function StoreCard({ 
  store, 
  variant = 'default',
  showDescription = true,
  className = '' 
}: StoreCardProps) {
  
  // Map WCFM data to our Store interface
  const storeData = {
    slug: store.vendor_display_name?.toLowerCase().replace(/\s+/g, '-') || store.vendor_id?.toString(), // Generate slug from display name
    name: store.vendor_shop_name || store.vendor_display_name,
    display_name: store.vendor_shop_name || store.vendor_display_name,
    logo: store.vendor_shop_logo || '/images/placeholder-store.png',
    banner: store.vendor_banner || store.vendor_list_banner || '/images/placeholder-banner.jpg',
    description: store.vendor_description ? store.vendor_description.replace(/<[^>]*>/g, '') : '', // Strip HTML tags
    address: store.vendor_address || '',
    phone: store.vendor_phone || '',
    email: store.vendor_email || '',
    rating: parseFloat(store.store_rating || '0'),
    is_online: store.is_store_offline !== 'yes',
    is_active: store.disable_vendor !== 'yes',
    email_verified: store.email_verified === '1'
  }

  const cardClasses = {
    default: 'card card-hover h-full bg-white border border-gray-200',
    compact: 'card card-hover h-full bg-white border border-gray-200 p-4',
    featured: 'card card-hover h-full bg-gradient-to-br from-brand-50 to-brand-100 border-brand-200',
  }

  return (
    <div className={`group ${cardClasses[variant]} ${className}`}>
      <Link href={`/stores/${storeData.slug}`} className="block h-full">
        <div className="h-full flex flex-col">
          
          {/* Store Banner */}
          <div className="relative overflow-hidden bg-gray-100 rounded-t-xl">
            <div className="aspect-[3/1]">
              <OptimizedImage
                src={storeData.banner}
                alt={`${storeData.name} banner`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            
            {/* Store Status Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                storeData.is_online 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {storeData.is_online ? 'مفتوح' : 'مغلق'}
              </span>
            </div>

            {/* Store Rating */}
            {storeData.rating > 0 && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="text-sm font-medium text-gray-900">{storeData.rating.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Store Content */}
          <div className="p-6 flex-1 flex flex-col">
            
            {/* Store Logo & Info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm flex-shrink-0">
                <OptimizedImage
                  src={storeData.logo}
                  alt={`${storeData.name} logo`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                  {storeData.display_name || storeData.name}
                </h3>
                
                {storeData.address && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                    📍 {storeData.address}
                  </p>
                )}
              </div>
            </div>

            {/* Store Description */}
            {showDescription && storeData.description && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {storeData.description}
                </p>
              </div>
            )}

            {/* Store Stats */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    🏪 متجر{storeData.is_active ? ' نشط' : ' غير نشط'}
                  </span>
                  
                  {storeData.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-600">{storeData.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {storeData.email_verified && (
                    <span className="text-green-600 text-xs">✓ موثق</span>
                  )}
                </div>
                
                <div className="text-brand-600 font-medium">
                  عرض المتجر ←
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}