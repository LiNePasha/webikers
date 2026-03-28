// TypeScript types for Ibrahim Shkman motorcycle parts marketplace

export interface Product {
  id: number
  name: string
  slug: string
  permalink: string
  date_created: string
  date_modified: string
  type: 'simple' | 'variable' | 'grouped'
  status: 'publish' | 'private' | 'draft'
  featured: boolean
  total_products: number
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  purchasable: boolean
  total_sales: number
  virtual: boolean
  downloadable: boolean
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  backorders: 'no' | 'notify' | 'yes'
  backorders_allowed: boolean
  backordered: boolean
  sold_individually: boolean
  weight: string
  dimensions: ProductDimensions
  shipping_required: boolean
  shipping_taxable: boolean
  reviews_allowed: boolean
  average_rating: string
  rating_count: number
  related_ids: number[]
  upsell_ids: number[]
  cross_sell_ids: number[]
  categories: ProductCategory[]
  brands: ProductBrand[]
  tags: ProductTag[]
  images: ProductImage[]
  attributes: ProductAttribute[]
  default_attributes: ProductDefaultAttribute[]
  variations: number[]
  grouped_products: number[]
  menu_order: number
  price_html: string
  meta_data: ProductMetaData[]
  store: VendorStore
  vendor?: {
    id: string | number
    name: string
    shop_name: string
  }
  _links: ProductLinks
}

export interface ProductDimensions {
  length: string
  width: string
  height: string
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
}

export interface ProductBrand {
  id: number
  name: string
  slug: string
}

export interface ProductTag {
  id: number
  name: string
  slug: string
}

export interface ProductImage {
  id: number
  date_created: string
  date_modified: string
  src: string
  name: string
  alt: string
  srcset: string
  sizes: string
  thumbnail: string
  woocommerce_thumbnail: string
  woocommerce_single: string
  woocommerce_gallery_thumbnail: string
}

export interface ProductAttribute {
  id: number
  name: string
  slug?: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface ProductDefaultAttribute {
  id: number
  name: string
  option: string
}

// Product Variation Types
export interface ProductVariation {
  id: number
  date_created: string
  date_modified: string
  description: string
  permalink: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  purchasable: boolean
  virtual: boolean
  downloadable: boolean
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  backorders: 'no' | 'notify' | 'yes'
  backorders_allowed: boolean
  weight: string
  dimensions: ProductDimensions
  shipping_class: string
  image: ProductImage | null
  attributes: VariationAttribute[]
  menu_order: number
  meta_data: ProductMetaData[]
  _links?: ProductLinks
}

export interface VariationAttribute {
  id: number
  name: string
  option: string
}

export interface ProductMetaData {
  id: number
  key: string
  value: string | number | object
}

export interface ProductLinks {
  self: Array<{ href: string }>
  collection: Array<{ href: string }>
}

// Vendor/Store types
export interface VendorStore {
  vendor_id: number
  vendor_display_name: string
  vendor_shop_name: string
  formatted_display_name: string
  store_hide_email: string
  store_hide_phone: string
  store_hide_address: string
  store_hide_description: string
  store_hide_policy: string
  store_products_per_page: number
  vendor_email: string
  vendor_phone: string
  vendor_address: string
  disable_vendor: string
  is_store_offline: string
  vendor_shop_logo: string
  vendor_banner_type: string
  vendor_banner: string
  mobile_banner: string
  vendor_list_banner_type: string
  vendor_list_banner: string
  store_rating: string
  email_verified: string
  vendor_additional_info: VendorAdditionalInfo[]
  vendor_description: string
  vendor_policies: VendorPolicies
  store_tab_headings: VendorTabHeadings
}

// Enhanced Store interface for better structure
export interface Store {
  vendor_id: string // WCFM vendor ID
  total_products?: number
  id?: number
  slug: string
  vendor_shop_name: string // Store name from WCFM
  vendor_display_name: string // Display name from WCFM
  vendor_email: string
  vendor_phone: string
  vendor_address?: {
    street: string
    city: string
    state: string
    postcode: string
    country: string
  }
  vendor_description?: string
  vendor_shop_logo?: string
  vendor_list_logo?: string
  vendor_banner?: string
  social?: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
  }
  rating?: {
    average: number
    count: number
    reviews: StoreReview[]
  }
  disable_vendor: string // "yes" or "no"
  is_store_offline?: string // "yes" or "no"
  is_online?: boolean
  products_count?: number
  vendor_register_date?: string
  last_active?: string
  policies?: {
    shipping: string
    refund: string
    cancellation: string
  }
  // Keep legacy fields for compatibility
  name?: string
  display_name?: string
  email?: string
  phone?: string
  description?: string
  logo?: string
  banner?: string
  status?: 'active' | 'inactive' | 'suspended'
  joined_date?: string
}

export interface StoreReview {
  id: number
  reviewer_name: string
  reviewer_email: string
  rating: number
  comment: string
  date_created: string
  status: 'approved' | 'pending' | 'spam'
}

export interface StoreFilters {
  search?: string
  city?: string
  rating?: number
  status?: 'active' | 'inactive'
  sort?: StoreSortOptions
  page?: number
  per_page?: number
}

export interface VendorAdditionalInfo {
  type: string
  label: string
  options: string
  content: string
  help_text: string
  required: string
  name: string
  value: string
}

export interface VendorPolicies {
  shipping_policy_heading: string
  shipping_policy: string
  refund_policy_heading: string
  refund_policy: string
  cancellation_policy_heading: string
  cancellation_policy: string
}

export interface VendorTabHeadings {
  products: string
  about: string
  policies: string
  reviews: string
}

// Category types
export interface Category {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  display: 'default' | 'products' | 'subcategories' | 'both'
  image: CategoryImage | null | undefined
  menu_order: number
  count: number
  _links: CategoryLinks
}

export interface CategoryImage {
  id: number
  date_created: string
  date_modified: string
  src: string
  name: string
  alt: string
}

export interface CategoryLinks {
  self: Array<{ href: string }>
  collection: Array<{ href: string }>
  up?: Array<{ href: string }>
}

// Search and filter types
export interface ProductFilters {
  category?: string | string[]
  brand?: string | string[]
  min_price?: number
  max_price?: number
  in_stock?: boolean
  on_sale?: boolean
  featured?: boolean
  vendor?: string | string[]
  search?: string
  sort?: ProductSortOptions
  page?: number
  per_page?: number
}

export type ProductSortOptions = 
  | 'popularity'
  | 'rating'
  | 'date'
  | 'price'
  | 'price-desc'
  | 'title'
  | 'title-desc'

export type StoreSortOptions = 
  | 'name'
  | 'rating'
  | 'products_count'
  | 'joined_date'
  | 'last_active'

// Cart types
export interface CartItem {
  id: number // Product ID
  product_id: number
  variation_id?: number // For variable products
  variation?: Record<string, string> // Selected attributes
  product: Product
  quantity: number
  price: string // Individual price
  total: number
  vendor_id: number
  vendor_name?: string
  image?: string
  name?: string
  weight?: string // Product weight in kg
  // Legacy properties for backward compatibility
  size?: string
  color?: string
  slug?: string
  thumbnail?: string
  brand?: string
  model?: string
  part_category?: string
  oem_number?: string
  vendor?: {
    id: number
    name: string
    store_name: string
  }
}

export interface Cart {
  items: CartItem[]
  total_items: number
  total_price: number
  shipping_total: number
  tax_total: number
  grand_total: number
}

// Order types
export interface Order {
  id: number
  parent_id: number
  status: string
  currency: string
  version: string
  prices_include_tax: boolean
  date_created: string
  date_modified: string
  discount_total: string
  discount_tax: string
  shipping_total: string
  shipping_tax: string
  cart_tax: string
  total: string
  total_tax: string
  customer_id: number
  order_key: string
  billing: OrderAddress
  shipping: OrderAddress
  payment_method: string
  payment_method_title: string
  transaction_id: string
  customer_ip_address: string
  customer_user_agent: string
  created_via: string
  customer_note: string
  date_completed: string | null
  date_paid: string | null
  cart_hash: string
  number: string
  meta_data: OrderMetaData[]
  line_items: OrderLineItem[]
  tax_lines: OrderTaxLine[]
  shipping_lines: OrderShippingLine[]
  fee_lines: OrderFeeLine[]
  coupon_lines: OrderCouponLine[]
  refunds: any[]
  payment_url: string
  is_editable: boolean
  needs_payment: boolean
  needs_processing: boolean
  date_created_gmt: string
  date_modified_gmt: string
  date_completed_gmt: string | null
  date_paid_gmt: string | null
  currency_symbol: string
  _links: any
}

export interface OrderAddress {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  state: string
  postcode: string
  country: string
  email?: string
  phone: string
}

export interface OrderMetaData {
  id: number
  key: string
  value: any
}

export interface OrderLineItem {
  id: number
  name: string
  product_id: number
  variation_id: number
  quantity: number
  tax_class: string
  subtotal: string
  subtotal_tax: string
  total: string
  total_tax: string
  taxes: any[]
  meta_data: OrderMetaData[]
  sku: string
  global_unique_id: string
  price: number
  image: {
    id: string
    src: string
  }
  parent_name: string | null
}

export interface OrderTaxLine {
  id: number
  rate_code: string
  rate_id: number
  label: string
  compound: boolean
  tax_total: string
  shipping_tax_total: string
  rate_percent: number
  meta_data: OrderMetaData[]
}

export interface OrderShippingLine {
  id: number
  method_title: string
  method_id: string
  instance_id: string
  total: string
  total_tax: string
  taxes: any[]
  meta_data: OrderMetaData[]
}

export interface OrderFeeLine {
  id: number
  name: string
  tax_class: string
  tax_status: string
  amount: string
  total: string
  total_tax: string
  taxes: any[]
  meta_data: OrderMetaData[]
}

export interface OrderCouponLine {
  id: number
  code: string
  discount: string
  discount_tax: string
  meta_data: OrderMetaData[]
}

// API Response types
export interface APIResponse<T> {
  data: T
  status: number
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
    has_more?: boolean
  }
}

// ============================================
// CHECKOUT TYPES
// ============================================

export interface CheckoutData {
  step: 'cart' | 'address' | 'shipping' | 'payment' | 'review'
  deliveryType?: 'home_delivery' | 'store_pickup'
  cartItems: CartItem[]
  shippingAddress: ShippingAddress | null
  billingAddress: BillingAddress | null
  shippingMethod: ShippingMethod | null
  paymentMethod: PaymentMethod | null
  orderNotes: string
  paymentProof?: PaymentProof
}

// ============================================
// ADDRESS TYPES
// ============================================

export interface ShippingAddress {
  id?: string
  firstName: string
  lastName?: string // Optional now
  phone: string
  city: string
  cityName?: string
  cityNameEn?: string
  district: string
  districtName?: string
  districtNameEn?: string
  address: string
  building?: string
  floor?: string
  apartment?: string
  landmark?: string
  isDefault?: boolean
}

export interface BillingAddress {
  id?: string
  firstName: string
  lastName?: string
  phone: string
  email: string
  city: string
  cityName?: string
  cityNameEn?: string
  district?: string
  districtName?: string
  address: string
  building?: string
  floor?: string
  apartment?: string
  isDefault?: boolean
}

export interface EgyptCity {
  id: string
  name?: string // From Bosta
  nameAr: string
  nameEn: string
  code?: string // From Bosta
  sector?: number // From Bosta
  hub?: string // From Bosta
  pickupAvailable?: boolean // From Bosta
  dropOffAvailable?: boolean // From Bosta
}

export interface EgyptDistrict {
  id: string
  name?: string // From Bosta
  nameAr: string
  nameEn: string
  cityId?: string
  zoneId?: string // From Bosta zones
  zoneName?: string // From Bosta zones
  pickupAvailable?: boolean // From Bosta
  dropOffAvailable?: boolean // From Bosta
}

export interface SavedAddress {
  id?: string
  type: 'shipping' | 'billing'
  firstName: string
  lastName: string
  phone: string
  email?: string
  city: string
  cityName?: string
  district: string
  districtName?: string
  address: string
  building?: string
  floor?: string
  apartment?: string
  landmark?: string
  isDefault: boolean
  createdAt?: string
}

// ============================================
// SHIPPING TYPES
// ============================================

export interface ShippingMethod {
  id: string
  title: string
  cost: number
  estimatedDays?: number | string
  provider?: string
  zoneId?: string
  zoneName?: string
  methodId?: string
  instanceId?: number
}

export interface BostaShippingRequest {
  city: string
  district: string
  weight: number // in grams
  cod: boolean
  codAmount?: number
}

export interface BostaShippingResponse {
  success: boolean
  deliveryFees?: number
  estimatedDays?: string
  zoneId?: string
  error?: string
}

export interface BostaShipmentRequest {
  orderId: number
  customerName: string
  customerPhone: string
  city: string
  district: string
  address: string
  building?: string
  floor?: string
  apartment?: string
  landmark?: string
  notes?: string
  cod: boolean
  codAmount?: number
  weight: number
  itemsCount: number
  description: string
}

export interface BostaShipmentResponse {
  success: boolean
  trackingNumber?: string
  _id?: string
  state?: string
  error?: string
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentMethod {
  id: string
  title: string
  description: string
  enabled: boolean
  requiresProof: boolean
  icon?: string
  accountNumber?: string
  accountName?: string
}

export interface PaymentProof {
  imageUrl: string
  publicId: string
  uploadedAt: string
  amount: number
}

export interface CloudinaryUploadResponse {
  success: boolean
  url?: string
  publicId?: string
  width?: number
  height?: number
  format?: string
  error?: string
}

// ============================================
// ORDER CREATION TYPES
// ============================================

export interface CreateOrderRequest {
  customerId: number
  paymentMethod: string
  paymentMethodTitle: string
  shippingAddress: ShippingAddress
  billingAddress: BillingAddress
  lineItems: OrderLineItemRequest[]
  shippingLines: OrderShippingLineRequest[]
  customerNote?: string
  metaData?: OrderMetaDataRequest[]
  paymentProof?: PaymentProof
  totalWeight: number
  vendorId?: number // Vendor ID to set as parent_id in WooCommerce
}

export interface OrderLineItemRequest {
  product_id: number
  quantity: number
  variation_id?: number
}

export interface OrderShippingLineRequest {
  method_id: string
  method_title: string
  total: string
}

export interface OrderMetaDataRequest {
  key: string
  value: any
}

export interface CreateOrderResponse {
  success: boolean
  orderId?: number // Add for easy access
  order?: {
    id: number
    orderNumber: string
    status: string
    total: number | string
    currency: string
    dateCreated?: string
    paymentUrl?: string
  }
  bostaTracking?: {
    trackingNumber: string
    _id: string
    state: string
  }
  message?: string
  error?: string
  details?: any // Add for validation errors
}

// ============================================
// POS API Types (for Add Products Feature)
// ============================================

/**
 * Simplified product structure from POS API
 * Used for fast loading of all vendor products
 */
export interface POSProduct {
  id: number
  name: string
  status: 'publish' | 'draft' | 'private'
  price: string
  regular_price: string
  sale_price: string
  stock_quantity: number
  manage_stock: boolean
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  in_stock: boolean
  sku: string
  type: 'simple' | 'variable'
  images: POSProductImage[]
  categories: POSProductCategory[]
  last_modified: string
  
  // For variable products
  attributes?: POSProductAttribute[]
  variations?: POSProductVariation[]
}

export interface POSProductImage {
  src: string
}

export interface POSProductCategory {
  id: number
  name: string
  slug: string
  parent?: number // Parent category ID, 0 means top-level
  count?: number // Number of products in category
  image?: string // Category image URL
}

export interface POSProductAttribute {
  id: number
  name: string
  slug: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface POSProductVariation {
  id: number
  sku: string
  price: string
  regular_price: string
  sale_price: string
  stock_quantity: number
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  in_stock: boolean
  manage_stock: boolean
  attributes: Record<string, string>
  images: POSProductImage[]
}

export interface POSAPIResponse {
  products: POSProduct[]
  categories: POSProductCategory[]
  pagination: {
    page: number
    per_page: number
    total_products: number
    total_pages: number
    has_more: boolean
  }
  metadata: {
    sync_timestamp: string
    vendor_id: string
    hash: string
    cache: boolean
  }
}