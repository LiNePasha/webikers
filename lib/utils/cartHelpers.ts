import { Product, CartItem } from '@/types';

/**
 * Convert a Product to a CartItem with proper vendor data
 * This ensures vendor information is always included when adding to cart
 */
export function productToCartItem(product: Product, quantity: number = 1): CartItem {
  // Extract vendor data - try product.vendor first, then product.store as fallback
  let vendorData: CartItem['vendor'] = undefined;
  
  if (product.vendor) {
    // New API format: product.vendor
    vendorData = {
      id: typeof product.vendor.id === 'string' ? parseInt(product.vendor.id) : product.vendor.id || 0,
      name: product.vendor.name || 'Unknown Vendor',
      store_name: product.vendor.shop_name || product.vendor.name || 'Unknown Store',
    };
  } else if (product.store) {
    // Old API format: product.store
    vendorData = {
      id: typeof product.store.vendor_id === 'string' ? parseInt(product.store.vendor_id) : product.store.vendor_id || 0,
      name: product.store.vendor_display_name || product.store.vendor_shop_name || 'Unknown Vendor',
      store_name: product.store.vendor_shop_name || product.store.vendor_display_name || 'Unknown Store',
    };
  }

  // Get image URL
  const imageUrl = product.images?.[0]?.src || product.images?.[0]?.thumbnail || '';

  return {
    id: product.id,
    product_id: product.id,
    product: product,
    name: product.name,
    slug: product.slug,
    price: product.price,
    thumbnail: imageUrl,
    image: imageUrl,
    quantity: quantity,
    total: parseFloat(product.price) * quantity,
    brand: product.brands?.[0]?.name,
    model: product.brands?.[0]?.slug,
    vendor: vendorData,
    vendor_id: vendorData?.id || 0,
    vendor_name: vendorData?.name,
  };
}

/**
 * Validate if a product has vendor information
 */
export function hasVendorInfo(product: Product): boolean {
  return !!(product.vendor || product.store);
}

/**
 * Get vendor name from product
 */
export function getVendorName(product: Product): string {
  if (product.vendor) {
    return product.vendor.shop_name || product.vendor.name || 'Unknown Vendor';
  }
  if (product.store) {
    return product.store.vendor_shop_name || product.store.vendor_display_name || 'Unknown Vendor';
  }
  return 'Unknown Vendor';
}

/**
 * Get vendor ID from product
 */
export function getVendorId(product: Product): number {
  if (product.vendor) {
    return typeof product.vendor.id === 'string' ? parseInt(product.vendor.id) : product.vendor.id || 0;
  }
  if (product.store?.vendor_id) {
    return typeof product.store.vendor_id === 'string' ? parseInt(product.store.vendor_id) : product.store.vendor_id || 0;
  }
  return 0;
}
