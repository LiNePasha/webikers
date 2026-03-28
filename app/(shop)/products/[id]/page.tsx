'use client'

import { useState, useEffect, use } from 'react'
import { useProduct } from '@/lib/hooks/useProducts'
import { useShoppingCart } from '@/store/cartStore'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import { productToCartItem } from '@/lib/utils/cartHelpers'
import OptimizedImage from '@/components/ui/OptimizedImage'
import VariationSelector from '@/components/products/VariationSelector'
import Link from 'next/link'
import { Product, ProductVariation, CartItem } from '@/types'
import { useToastStore } from '@/store/toastStore'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params)
  const { product, loading, error } = useProduct(resolvedParams.id)
  const { addToCart, cartItems, openCart } = useShoppingCart()
  const addToast = useToastStore((state) => state.addToast)
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description')
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [allVariations, setAllVariations] = useState<ProductVariation[]>([])
  const [loadingVariations, setLoadingVariations] = useState(false)

  // Fetch variations for variable products
  useEffect(() => {
    if (product?.type === 'variable' && product.variations && product.variations.length > 0) {
      setLoadingVariations(true)
      wooCommerceAPI.getProductVariations(product.id)
        .then(vars => {
          setAllVariations(vars)
          console.log('✅ All variations loaded:', vars)
        })
        .catch(error => console.error('Error loading variations:', error))
        .finally(() => setLoadingVariations(false))
    }
  }, [product?.id])

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0)
    setSelectedVariation(null)
    setSelectedAttributes({})
    setAllVariations([])
  }, [product?.id])

  // Get current quantity in cart (for variable products, check variation ID)
  const cartItem = cartItems.find(item => {
    if (product?.type === 'variable' && selectedVariation) {
      return item.variation_id === selectedVariation.id
    }
    return item.id === product?.id
  })
  const quantityInCart = cartItem?.quantity || 0

  // Determine stock status
  const isVariableProduct = product?.type === 'variable'
  const effectiveStockStatus = isVariableProduct && selectedVariation
    ? selectedVariation.stock_status
    : product?.stock_status
  const isOutOfStock = effectiveStockStatus === 'outofstock'

  // Determine price
  const effectivePrice = isVariableProduct && selectedVariation
    ? selectedVariation.price
    : product?.price

  const effectiveRegularPrice = isVariableProduct && selectedVariation
    ? selectedVariation.regular_price
    : product?.regular_price

  const effectiveSalePrice = isVariableProduct && selectedVariation
    ? selectedVariation.sale_price
    : product?.sale_price

  // Handle variation selection
  const handleVariationSelect = (variation: ProductVariation | null, attributes: Record<string, string>) => {
    setSelectedVariation(variation)
    setSelectedAttributes(attributes)
    
    // Reset quantity when variation changes to prevent exceeding new variation stock
    if (variation) {
      const maxStock = variation.stock_quantity || 1
      if (quantity > maxStock) {
        setQuantity(maxStock)
        addToast(`تم تعديل الكمية للحد الأقصى المتاح: ${maxStock}`, 'info')
      }
    }
    
    // Update image if variation has one
    if (variation?.image) {
      // Find the variation image in all images
      const allImages = [
        ...(product?.images || []),
        ...allVariations
          .filter(v => v.image)
          .map(v => v.image!)
          .filter((img, index, self) => 
            index === self.findIndex(i => i.id === img.id)
          ) // Remove duplicates
      ]
      
      const varImageIndex = allImages.findIndex(img => img.id === variation.image?.id)
      if (varImageIndex >= 0) {
        setSelectedImageIndex(varImageIndex)
      }
    }
  }

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return

    // For variable products, require variation selection
    if (product.type === 'variable') {
      if (!selectedVariation) {
        addToast('يرجى اختيار جميع الخيارات المطلوبة', 'error')
        return
      }
      
      if (selectedVariation.stock_status === 'outofstock') {
        addToast('هذا الخيار نفد من المخزون', 'error')
        return
      }
    }

    if (isOutOfStock) {
      addToast('المنتج نفد من المخزون', 'error')
      return
    }

    // Create cart item
    const cartItemToAdd = isVariableProduct && selectedVariation
      ? {
          ...productToCartItem(product, quantity),
          variation_id: selectedVariation.id,
          variation: selectedAttributes,
          price: selectedVariation.price
        }
      : productToCartItem(product, quantity)

    const success = await addToCart(cartItemToAdd)
    
    if (success) {
      addToast(`تم إضافة "${product.name}" إلى السلة`, 'success')
      // Open cart after adding item
      setTimeout(() => {
        openCart()
      }, 300) // Small delay to allow toast to show first
    }
  }

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    // Determine max quantity based on product type
    let maxQuantity = 999
    
    if (isVariableProduct && selectedVariation) {
      // For variable products, use selected variation stock
      maxQuantity = selectedVariation.stock_quantity || 0
    } else {
      // For simple products, use product stock
      maxQuantity = product?.stock_quantity || 999
    }
    
    // Validate quantity
    if (newQuantity < 1) {
      addToast('الكمية يجب أن تكون على الأقل 1', 'error')
      return
    }
    
    if (newQuantity > maxQuantity) {
      addToast(`المخزون المتاح: ${maxQuantity} فقط`, 'error')
      setQuantity(maxQuantity > 0 ? maxQuantity : 1)
      return
    }
    
    setQuantity(newQuantity)
  }

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'منتج',
      text: product?.short_description?.replace(/<[^>]*>/g, '') || 'تحقق من هذا المنتج الرائع',
      url: window.location.href,
    }

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled or failed:', err)
      }
    } else {
      // Fallback: show custom share menu
      setShareMenuOpen(!shareMenuOpen)
    }
  }

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('تم نسخ الرابط!')
      setShareMenuOpen(false)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Share on WhatsApp
  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${product?.name}\n${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShareMenuOpen(false)
  }

  // Share on Facebook
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
    setShareMenuOpen(false)
  }

  // Share on Twitter
  const shareOnTwitter = () => {
    const text = encodeURIComponent(product?.name || '')
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank')
    setShareMenuOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-8 container-custom">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* Images Skeleton */}
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-lg aspect-square"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg aspect-square"></div>
                  ))}
                </div>
              </div>
              
              {/* Content Skeleton */}
              <div className="space-y-6">
                <div className="w-3/4 h-8 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 container-custom">
          <div className="text-center">
            <div className="max-w-md p-8 mx-auto border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-red-900">المنتج غير موجود</h3>
              <p className="mb-6 text-red-700">{error || 'لم نتمكن من العثور على هذا المنتج'}</p>
              <Link href="/products" className="btn-primary">
                العودة للمنتجات
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Combine product images with variation images
  const baseImages = product.images && product.images.length > 0 
    ? product.images 
    : [{ id: 0, src: '/images/placeholder-motorcycle.jpg', alt: product.name }]

  // Add variation images that aren't already in base images
  const variationImages = allVariations
    .filter(v => v.image && !baseImages.find(img => img.id === v.image?.id))
    .map(v => v.image!)

  const allImages = [...baseImages, ...variationImages]
  const currentImage = allImages[selectedImageIndex] || allImages[0]
  
  const isOnSale = product.on_sale && parseFloat(product.sale_price) < parseFloat(product.regular_price)
  const discountPercentage = isOnSale 
    ? Math.round(((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="py-4 container-custom">
          <nav className="flex items-center gap-2 text-sm text-gray-600" dir="rtl">
            <Link href="/" className="transition-colors hover:text-brand-600">الرئيسية</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <Link href="/products" className="transition-colors hover:text-brand-600">المنتجات</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {product.categories && product.categories[0] && (
              <>
                <Link 
                  href={`/products?category=${product.categories[0].slug}`}
                  className="transition-colors hover:text-brand-600"
                >
                  {product.categories[0].name}
                </Link>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </>
            )}
            <span className="font-medium text-gray-900 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="py-8 container-custom">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden bg-white border rounded-lg aspect-square group">
              <OptimizedImage
                key={`product-image-${selectedImageIndex}`}
                src={currentImage.src}
                alt={currentImage.alt || product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              
              {/* Badges */}
              <div className="absolute flex flex-col gap-2 top-4 left-4">
                {isOnSale && (
                  <span className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-full shadow-lg">
                    خصم {discountPercentage}%
                  </span>
                )}
                {product.featured && (
                  <span className="px-3 py-1 text-sm font-bold text-white bg-yellow-500 rounded-full shadow-lg">
                    مميز
                  </span>
                )}
                {isOutOfStock && (
                  <span className="px-3 py-1 text-sm font-bold text-white bg-gray-500 rounded-full shadow-lg">
                    نفد المخزون
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images - Show all product + variation images */}
            {allImages.length > 1 && (
              <div className="relative">
                {loadingVariations && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
                      <div className="w-4 h-4 border-2 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
                      <span className="text-sm text-gray-600">تحميل الصور...</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {allImages.map((image, index) => {
                    // Check if this image belongs to a variation
                    const variationForImage = allVariations.find(v => v.image?.id === image.id)
                    
                    return (
                      <button
                        key={`${image.id}-${index}`}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all ${
                          selectedImageIndex === index
                            ? 'border-brand-500 ring-2 ring-brand-200 scale-105'
                            : 'border-gray-200 hover:border-brand-300 hover:scale-105'
                        }`}
                      >
                        <OptimizedImage
                          src={image.src || '/images/placeholder-motorcycle.jpg'}
                          alt={`${product.name} - صورة ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, 12.5vw"
                        />
                        
                        {/* Badge for variation images */}
                        {variationForImage && (
                          <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[8px] font-bold text-center text-white truncate bg-gradient-to-t from-black/80 to-transparent">
                            {variationForImage.attributes.map(attr => attr.option).join(' - ')}
                          </div>
                        )}
                        
                        {/* Selected indicator */}
                        {selectedImageIndex === index && (
                          <div className="absolute top-1 right-1">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Vendor Info */}
            {/* {product.store && (
              <div className="flex items-center gap-3 p-4 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md">
                <div className="relative">
                  {product.store.vendor_shop_logo ? (
                    <OptimizedImage
                      src={product.store.vendor_shop_logo}
                      alt={product.store.vendor_shop_name}
                      width={48}
                      height={48}
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-100">
                      <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute w-4 h-4 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.store.vendor_display_name}</p>
                  <p className="text-sm text-gray-600">{product.store.vendor_shop_name}</p>
                </div>
                <Link 
                  href={`/vendors/${product.store.vendor_id}`}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  زيارة المتجر
                </Link>
              </div>
            )} */}

            {/* Brand */}
            {product.brands && product.brands[0] && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">الماركة:</span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-brand-100 text-brand-800">
                  {product.brands[0].name}
                </span>
              </div>
            )}

            {/* Product Name */}
            <div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
                {product.name}
              </h1>
              {product.short_description && (
                <p className="leading-relaxed text-gray-600"
                   dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}
            </div>

            {/* Rating */}
            {product.rating_count > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(parseFloat(product.average_rating))
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.rating_count} تقييم)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="p-6 border bg-gradient-to-r from-gray-50 to-brand-50 rounded-xl border-brand-100">
              {effectiveSalePrice && parseFloat(effectiveSalePrice) < parseFloat(effectiveRegularPrice || effectivePrice || '0') ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold lg:text-4xl text-brand-600">
                      {wooCommerceAPI.formatPrice(effectiveSalePrice)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {wooCommerceAPI.formatPrice(effectiveRegularPrice || effectivePrice || '0')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-full">
                      خصم {Math.round(((parseFloat(effectiveRegularPrice || effectivePrice || '0') - parseFloat(effectiveSalePrice)) / parseFloat(effectiveRegularPrice || effectivePrice || '0')) * 100)}%
                    </span>
                    <span className="font-medium text-green-600">
                      وفرت {wooCommerceAPI.formatPrice(
                        (parseFloat(effectiveRegularPrice || effectivePrice || '0') - parseFloat(effectiveSalePrice)).toString()
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold lg:text-4xl text-brand-600">
                    {isVariableProduct && !selectedVariation 
                      ? `${wooCommerceAPI.formatPrice(product.price)} - ${wooCommerceAPI.formatPrice(product.price_html.match(/\d+/g)?.slice(-1)[0] || product.price)}`
                      : wooCommerceAPI.formatPrice(effectivePrice || '0')
                    }
                  </span>
                  {product.featured && (
                    <span className="px-3 py-1 text-sm font-bold text-white bg-yellow-500 rounded-full">
                      مميز
                    </span>
                  )}
                </div>
              )}
              <div className="mt-2 text-sm text-gray-600">
                السعر شامل الضريبة
              </div>
            </div>

            {/* Variation Selector for Variable Products */}
            {product.type === 'variable' && (
              <VariationSelector
                product={product}
                onVariationSelect={handleVariationSelect}
              />
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  الكمية:
                </label>
                <div className="flex items-center transition-colors border-2 border-gray-300 rounded-lg hover:border-brand-400">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={isVariableProduct && selectedVariation ? (selectedVariation.stock_quantity || 999) : (product.stock_quantity || 999)}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 py-2 font-medium text-center text-black border-0 focus:ring-0"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (isVariableProduct && selectedVariation ? (selectedVariation.stock_quantity || 999) : (product.stock_quantity || 999))}
                    className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                
                {quantityInCart > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0a2 2 0 100-4 2 2 0 000 4zm-6 0a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <span className="text-sm font-medium text-brand-600">
                      في السلة: {quantityInCart}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 hover:shadow-lg transform hover:scale-[1.02]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0a2 2 0 100-4 2 2 0 000 4zm-6 0a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  {isOutOfStock ? 'نفد المخزون' : 'أضف للسلة'}
                </button>
                
                <button className="flex items-center justify-center gap-2 px-6 py-4 text-gray-700 transition-colors border-2 border-gray-300 rounded-lg hover:border-brand-400 hover:text-brand-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="hidden sm:inline">المفضلة</span>
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isOutOfStock ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <span className={`font-medium ${
                  isOutOfStock ? 'text-red-600' : 'text-green-600'
                }`}>
                  {isOutOfStock ? 'نفد المخزون' : 'متوفر في المخزون'}
                </span>
              </div>
              {(() => {
                const currentStock = isVariableProduct && selectedVariation 
                  ? selectedVariation.stock_quantity 
                  : product.stock_quantity
                
                return currentStock && currentStock <= 10 && !isOutOfStock && (
                  <span className="text-sm font-medium text-orange-600">
                    متبقي {currentStock} فقط
                  </span>
                )
              })()}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center w-full gap-2 p-3 text-sm text-gray-600 transition-colors rounded-lg hover:text-brand-600 hover:bg-brand-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  مشاركة
                </button>

                {/* Share Menu */}
                {shareMenuOpen && (
                  <div className="absolute left-0 z-10 w-64 p-4 mt-2 bg-white border rounded-lg shadow-xl">
                    <div className="mb-3 text-sm font-semibold text-gray-900">مشاركة المنتج</div>
                    <div className="space-y-2">
                      <button
                        onClick={shareOnWhatsApp}
                        className="flex items-center w-full gap-3 p-2 text-sm transition-colors rounded-lg hover:bg-green-50"
                      >
                        <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </div>
                        <span className="text-gray-700">واتساب</span>
                      </button>

                      <button
                        onClick={shareOnFacebook}
                        className="flex items-center w-full gap-3 p-2 text-sm transition-colors rounded-lg hover:bg-blue-50"
                      >
                        <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-full">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        <span className="text-gray-700">فيسبوك</span>
                      </button>

                      <button
                        onClick={shareOnTwitter}
                        className="flex items-center w-full gap-3 p-2 text-sm transition-colors rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex items-center justify-center w-8 h-8 text-white bg-gray-900 rounded-full">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </div>
                        <span className="text-gray-700">تويتر (X)</span>
                      </button>

                      <button
                        onClick={copyLink}
                        className="flex items-center w-full gap-3 p-2 text-sm transition-colors rounded-lg hover:bg-brand-50"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full text-brand-600 bg-brand-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-gray-700">نسخ الرابط</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setShareMenuOpen(false)}
                      className="w-full px-3 py-2 mt-3 text-sm text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      إغلاق
                    </button>
                  </div>
                )}
              </div>
              {/* <button className="flex items-center justify-center gap-2 p-3 text-sm text-gray-600 transition-colors rounded-lg hover:text-brand-600 hover:bg-brand-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                استفسار
              </button> */}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="overflow-hidden bg-white border rounded-lg">
            {/* Tab Headers */}
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`flex-1 py-4 px-6 text-center font-medium border-b-2 transition-colors ${
                    activeTab === 'description'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  الوصف
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`flex-1 py-4 px-6 text-center font-medium border-b-2 transition-colors ${
                    activeTab === 'specifications'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  المواصفات
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 py-4 px-6 text-center font-medium border-b-2 transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  التقييمات ({product.rating_count})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'description' && (
                <div className="prose prose-lg max-w-none">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p className="text-gray-600">لا يوجد وصف متاح لهذا المنتج.</p>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-6">
                  {product.attributes && product.attributes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {product.attributes.map((attr) => (
                        <div key={attr.id} className="flex justify-between py-3 border-b border-gray-200">
                          <span className="font-medium text-gray-900">{attr.name}:</span>
                          <span className="text-gray-600">{attr.options.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">لا توجد مواصفات متاحة لهذا المنتج.</p>
                  )}

                  {/* Basic Product Info */}
                  <div className="pt-8 mt-8 border-t border-gray-200">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">معلومات أساسية</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">SKU:</span>
                        <span className="text-gray-600">{product.sku || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">الوزن:</span>
                        <span className="text-gray-600">{product.weight || 'غير محدد'}</span>
                      </div>
                      {product.categories && product.categories.length > 0 && (
                        <div className="flex justify-between py-3 border-b border-gray-200">
                          <span className="font-medium text-gray-900">الفئة:</span>
                          <span className="text-gray-600">
                            {product.categories.map(cat => cat.name).join(', ')}
                          </span>
                        </div>
                      )}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex justify-between py-3 border-b border-gray-200">
                          <span className="font-medium text-gray-900">العلامات:</span>
                          <span className="text-gray-600">
                            {product.tags.map(tag => tag.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="py-12 text-center">
                  <div className="mb-4 text-6xl">⭐</div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    تقييم هذا المنتج
                  </h3>
                  <p className="mb-6 text-gray-600">
                    {product.rating_count > 0 
                      ? `متوسط التقييم: ${product.average_rating} من 5 نجوم`
                      : 'لا توجد تقييمات بعد'
                    }
                  </p>
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          className="w-8 h-8 text-gray-300 transition-colors hover:text-yellow-400"
                        >
                          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <button className="w-full btn-primary">
                      اكتب تقييماً
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {/* <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">منتجات مشابهة</h2>
            <Link 
              href={`/products${product.categories?.[0] ? `?category=${product.categories[0].slug}` : ''}`}
              className="flex items-center gap-2 font-medium text-brand-600 hover:text-brand-700"
            >
              عرض المزيد
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          
          <div className="p-8 bg-white border rounded-lg">
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🔧</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                منتجات مشابهة قريباً
              </h3>
              <p className="mb-6 text-gray-600">
                سنعرض لك المنتجات المشابهة لهذا المنتج قريباً
              </p>
              <Link href="/products" className="btn-primary">
                تصفح جميع المنتجات
              </Link>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}