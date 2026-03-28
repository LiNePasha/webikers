'use client'

// Type fix for vendor
type Vendor = {
  id?: number | string;
  store_name?: string;
  store_address?: string | { street_1?: string };
  social_links?: { gplus?: string };
};

type CartItem = {
  id: number;
  quantity: number;
  vendor?: Vendor;
  categories?: Array<{ name?: string }>;
  variation_id?: number;
  selected_attributes?: { [key: string]: any };
  [key: string]: any;
};

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useUserStore } from '@/store/userStore'
import { calculateWalletFee, getWalletFeeInfo } from '@/lib/utils/fees'
import { 
  MapPinIcon, 
  TruckIcon, 
  CreditCardIcon, 
  ShoppingBagIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import OrderSummary from '@/components/checkout/OrderSummary'
import AddressForm from '@/components/checkout/address/AddressForm'
import PaymentProofUpload from '@/components/checkout/payment/PaymentProofUpload'
import TermsModal from '@/components/checkout/TermsModal'
import type { ShippingAddress, ShippingMethod, PaymentMethod } from '@/types'
import OptimizedImage from '@/components/ui/OptimizedImage'

// Vendor-specific configurations
interface VendorConfig {
  vendorId: number
  paymentType: 'half_payment' | 'full_payment' // يمكن إضافة أنواع أخرى
  instaPayAccount?: string // رقم حساب Instapay الخاص بالبائع
  instaPayName?: string // اسم صاحب الحساب
  instaPayLink?: string // لينك Instapay للدفع المباشر
}

const VENDOR_CONFIGS: VendorConfig[] = [
  {
    vendorId: 27,
    paymentType: 'full_payment',
    instaPayAccount: '01144747314',
    instaPayName: 'يوسف إيهاب',
    instaPayLink: 'https://ipn.eg/S/yoihab/instapay/0ct8h5'
  },
  {
    vendorId: 352,
    paymentType: 'full_payment',
    instaPayAccount: '01281333831',
     instaPayName: 'ادهم ا*** ب****',
  },
  {
    vendorId: 351,
    paymentType: 'full_payment',
    instaPayAccount: '01281333831',
    instaPayName: 'ادهم ا*** ب****',
  },
  {
    vendorId: 74,
    paymentType: 'full_payment',
    instaPayAccount: '01030351075',
    instaPayName: "احمد س*** ع********"
  },
  // يمكن إضافة vendors آخرين هنا بسهولة
  // {
  //   vendorId: 30,
  //   paymentType: 'full_payment',
  //   instaPayAccount: '01234567890',
  //   instaPayName: 'اسم التاجر',
  //   instaPayLink: 'https://ipn.eg/your-instapay-link'
  // },
]

// Fixed payment method: Instapay only
const FIXED_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'instapay',
    title: 'الدفع عبر فودافون كاش أو Instapay',
    description: 'قم بتحويل المبلغ إلى حساب Instapay ثم ارفع صورة إثبات الدفع',
    enabled: true,
    requiresProof: true,
    icon: '/vocash.webp',
    accountNumber: process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT_NUMBER || '01025338973',
    accountName: process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT_NAME || 'وليد أحمد',
  }
]

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems: rawCartItems, totalPrice, resetCart, _hasHydrated } = useCartStore()
  // حل مشكلة النوع: تعريف cartItems بنوع يحتوي vendor من نوع Vendor
  const cartItems = rawCartItems as Array<{ vendor?: Vendor; [key: string]: any }>
  const { user, setUser } = useUserStore()
  const checkoutData = useCheckoutStore((state) => state.checkoutData)
  const {
    setShippingAddress,
    setBillingAddress,
    setShippingMethod,
    setPaymentMethod,
    setPaymentProof,
    setOrderNotes,
  } = useCheckoutStore()

  // States
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false) // Flag to prevent redirect after order
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(FIXED_PAYMENT_METHODS)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [orderNotes, setLocalOrderNotes] = useState('')
  const [showGuestCheckoutModal, setShowGuestCheckoutModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [showOrderSummary, setShowOrderSummary] = useState(false) // For mobile order summary toggle
  
  // Check if cart has electrical products
  const hasElectricalProducts = cartItems.some((item: any) => 
    item.categories?.some((cat: any) => 
      cat?.name?.toLowerCase().includes('كهرباء')
    )
  )
  
  // Validation states
  const [addressValid, setAddressValid] = useState(false)
  const [shippingValid, setShippingValid] = useState(false)
  const [paymentValid, setPaymentValid] = useState(false)

  // Minimum cart total check
  const minCartTotal = parseFloat(process.env.NEXT_PUBLIC_MIN_CART_TOTAL || '50')

  // Vendor-specific customizations - Get config from array
  // Ensure vendorId is always a number for proper comparison
  const rawVendorId = cartItems[0]?.vendor?.id
  const vendorId = rawVendorId ? (typeof rawVendorId === 'string' ? parseInt(rawVendorId) : rawVendorId) : null
  const vendorConfig = VENDOR_CONFIGS.find(config => config.vendorId === vendorId)
  const isHalfPayment = vendorConfig?.paymentType === 'half_payment'
  
  // Debug log to verify vendor detection
  console.log('🏪 Vendor Detection:', { 
    rawVendorId, 
    vendorId, 
    vendorConfig: vendorConfig ? 'Found' : 'Not Found',
    isHalfPayment 
  })
  
  // Get vendor-specific Instapay info or use default
  const instaPayAccount = vendorConfig?.instaPayAccount || process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT_NUMBER || '01025338973'
  const instaPayName = vendorConfig?.instaPayName || process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT_NAME || 'وليد أحمد'
  const instaPayLink = vendorConfig?.instaPayLink || process.env.NEXT_PUBLIC_INSTAPAY_LINK || 'https://ipn.eg/S/ahmeedwaleed2004/instapay/0ct8h5'

  // Set Instapay as default payment method on mount (ALWAYS - it's the only option)
  useEffect(() => {
    // Force Instapay as payment method since it's the only option
    if (FIXED_PAYMENT_METHODS.length > 0) {
      setPaymentMethod(FIXED_PAYMENT_METHODS[0])
      console.log('✅ Instapay payment method auto-selected')
    }
  }, [])

  // Define calculateShippingCost using useCallback so it can be used in useEffect and loadSavedAddresses
  const calculateShippingCost = useCallback(async (cityNameEn: string) => {
    try {
      setCalculatingShipping(true)
      const response = await fetch('/api/checkout/shipping-cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dropOffCity: cityNameEn, // Use English city name for Bosta
          cartTotal: totalPrice,
          size: 'Normal'
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.data.method) {
        const bostaMethod = data.data.method
        setShippingMethods([bostaMethod])
        setShippingMethod(bostaMethod)
        setShippingValid(true)
        console.log('✅ Shipping method set:', bostaMethod)
        toast.success(`تم حساب تكلفة الشحن: ${bostaMethod.cost} جنيه`)
      } else {
        // Fallback to free shipping
        const freeMethod: ShippingMethod = {
          id: 'free',
          title: 'توصيل مجاني',
          cost: 0
        }
        setShippingMethods([freeMethod])
        setShippingMethod(freeMethod)
        setShippingValid(true)
      }
    } catch (error) {
      console.error('Failed to calculate shipping cost:', error)
      // Fallback to free shipping
      const freeMethod: ShippingMethod = {
        id: 'free',
        title: 'توصيل مجاني',
        cost: 0
      }
      setShippingMethods([freeMethod])
      setShippingMethod(freeMethod)
      setShippingValid(true)
    } finally {
      setCalculatingShipping(false)
    }
  }, [totalPrice, setShippingMethod, setShippingMethods, setShippingValid])

  // Ensure payment method is always set (double-check after hydration)
  useEffect(() => {
    if (_hasHydrated && FIXED_PAYMENT_METHODS.length > 0) {
      if (!checkoutData.paymentMethod) {
        console.log('🔄 Re-applying Instapay payment method after hydration')
        setPaymentMethod(FIXED_PAYMENT_METHODS[0])
      } else if (checkoutData.paymentMethod.id === 'instapay') {
        console.log('✅ Instapay payment method already selected')
      }
    }
  }, [_hasHydrated, checkoutData.paymentMethod])

  // Auto-calculate shipping if address exists but no shipping method is set
  useEffect(() => {
    if (_hasHydrated && checkoutData.shippingAddress && !checkoutData.shippingMethod && !calculatingShipping) {
      const cityNameEn = checkoutData.shippingAddress.cityNameEn
      if (cityNameEn) {
        console.log('🚚 Auto-calculating shipping for existing address:', cityNameEn)
        calculateShippingCost(cityNameEn)
      }
    }
  }, [_hasHydrated, checkoutData.shippingAddress, checkoutData.shippingMethod, calculatingShipping])

  useEffect(() => {
    // Wait for cart to hydrate from localStorage
    if (!_hasHydrated) {
      console.log('⏳ Waiting for cart to hydrate...')
      return
    }

    console.log('✅ Cart hydrated! Items:', cartItems.length)

    const checkAuthAndLoadData = async () => {
      // Don't redirect if order was just created successfully
      if (orderSuccess) {
        return
      }
      
      // Check cart (client-side data from Zustand store with persist)
      if (cartItems.length === 0) {
        toast.error('السلة فارغة! أضف منتجات أولاً')
        router.push('/products')
        return
      }
      
      if (totalPrice < minCartTotal) {
        toast.error(`الحد الأدنى للطلب هو ${minCartTotal} جنيه`)
        router.push('/products')
        return
      }

      // Check authentication
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        
        if (!response.ok || !data.user) {
          // User not logged in - show guest checkout modal
          setShowGuestCheckoutModal(true)
          setAuthChecked(true)
          setLoading(false)
          return
        }
        
        setUser(data.user)
        setAuthChecked(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        // Show guest checkout modal on error
        setShowGuestCheckoutModal(true)
        setAuthChecked(true)
        setLoading(false)
        return
      }

      // Load initial data (only for logged-in users)
      await loadSavedAddresses()
      
      setLoading(false)
    }

    checkAuthAndLoadData()
  }, [_hasHydrated, cartItems.length, totalPrice, minCartTotal, router, setUser])

  const loadSavedAddresses = async () => {
    try {
      const response = await fetch('/api/checkout/addresses')
      const data = await response.json()
      if (data.success) {
        setSavedAddresses(data.data)
        
        // Auto-fill shipping address if exists
        const shippingAddr = data.data.find((addr: any) => addr.type === 'shipping')
        if (shippingAddr) {
          console.log('✅ Auto-filling shipping address:', shippingAddr)
          setShippingAddress(shippingAddr)
          setAddressValid(true)
          
          // Auto-calculate shipping cost if city exists
          if (shippingAddr.cityNameEn) {
            console.log('🚚 Auto-calculating shipping for saved address city:', shippingAddr.cityNameEn)
            calculateShippingCost(shippingAddr.cityNameEn)
          }
        }
        
        // Auto-fill billing address if exists
        const billingAddr = data.data.find((addr: any) => addr.type === 'billing')
        if (billingAddr) {
          console.log('✅ Auto-filling billing address:', billingAddr)
          setBillingAddress(billingAddr)
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error)
    }
  }

  const handleAddressChange = (address: ShippingAddress, isValid: boolean) => {
    // Only update if data actually changed to prevent infinite loops
    const currentAddress = checkoutData.shippingAddress
    const hasChanged = JSON.stringify(currentAddress) !== JSON.stringify(address)
    
    if (hasChanged) {
      setShippingAddress(address)
      setAddressValid(isValid)
      
      if (sameAsShipping && isValid) {
        // Convert shipping address to billing address
        // Keep all fields and add email (which billing address requires)
        const billingAddr: any = {
          ...address,
          email: user?.email || '' // Use user's email if available
        }
        setBillingAddress(billingAddr)
      }
    }
  }

  const handleShippingMethodSelect = (method: ShippingMethod) => {
    setShippingMethod(method)
    setShippingValid(true)
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method)
    setPaymentValid(!method.requiresProof)
  }

  const handlePaymentProofUpload = (proof: any) => {
    setPaymentProof(proof)
    setPaymentValid(true)
  }

  const handleSubmitOrder = async () => {
    const { shippingAddress, shippingMethod, paymentMethod, paymentProof } = checkoutData

    // Helper function to highlight sections with errors and show toast
    const highlightSection = (sectionId: string, errorMessage: string) => {
      const section = document.getElementById(sectionId)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' })
        section.classList.add('ring-4', 'ring-red-500', 'ring-opacity-50')
        setTimeout(() => {
          section.classList.remove('ring-4', 'ring-red-500', 'ring-opacity-50')
        }, 2000)
      }
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          border: '2px solid #DC2626',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold',
        },
        icon: '⚠️',
      })
    }

    // Comprehensive validation with user-friendly error messages
    console.log('1. Checking address...')
    // 1. Validate Address - All required fields
    if (!shippingAddress) {
      console.log('❌ STOPPED: No shippingAddress')
      highlightSection('address-section', 'يرجى إدخال بيانات العنوان كاملة')
      return
    }
    
    console.log('2. Checking firstName...')
    if (!shippingAddress.firstName) {
      console.log('❌ STOPPED: No firstName')
      highlightSection('address-section', 'يرجى إدخال الاسم الكامل')
      return
    }
    
    console.log('3. Checking phone...')
    if (!shippingAddress.phone) {
      console.log('❌ STOPPED: No phone')
      highlightSection('address-section', 'يرجى إدخال رقم الهاتف')
      return
    }
    
    // Validate phone format (Egyptian phone numbers) - Remove spaces, dashes, parentheses
    const phoneRegex = /^(010|011|012|015)\d{8}$/
    const cleanPhone = shippingAddress.phone.replace(/[\s\-()]/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      highlightSection('address-section', 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010, 011, 012, أو 015 ويتكون من 11 رقم')
      return
    }
    
    // For store pickup, city/district/address are auto-filled, skip validation
    if (checkoutData.deliveryType !== 'store_pickup') {
      console.log('4. Checking city...')
      if (!shippingAddress.city || !shippingAddress.cityName) {
        console.log('❌ STOPPED: No city')
        highlightSection('address-section', 'يرجى اختيار المحافظة من القائمة')
        return
      }
      
      console.log('5. Checking district...')
      if (!shippingAddress.district || !shippingAddress.districtName) {
        console.log('❌ STOPPED: No district')
        highlightSection('address-section', 'يرجى اختيار المنطقة من القائمة')
        return
      }
      
      console.log('6. Checking address details...')
      if (!shippingAddress.address || shippingAddress.address.trim().length < 5) {
        console.log('❌ STOPPED: No address or too short')
        highlightSection('address-section', 'يرجى إدخال العنوان: الشارع ورقم العمارة')
        return
      }
    }

    console.log('7. Checking shipping method...')
    // 2. Validate Shipping Method
    if (!shippingMethod) {
      console.log('❌ STOPPED: No shippingMethod')
      highlightSection('shipping-section', 'يرجى اختيار طريقة الشحن')
      return
    }

    console.log('8. Checking payment method...')
    // 3. Validate Payment Method
    if (!paymentMethod) {
      console.log('❌ STOPPED: No paymentMethod')
      highlightSection('payment-section', 'يرجى اختيار طريقة الدفع')
      return
    }
    
    console.log('9. Checking payment proof...')
    // 4. Validate Payment Proof (if required for Instapay)
    if (paymentMethod.requiresProof && !paymentProof) {
      console.log('❌ STOPPED: Payment proof required but missing')
      highlightSection('payment-section', 'يرجى رفع صورة إثبات الدفع (لقطة شاشة من التحويل)')
      return
    }

    console.log('10. Auto-filling billing address...')
    // 5. Auto-fill Billing Address
    let billingAddress = checkoutData.billingAddress
    
    // Helper function to split full name into first and last name
    const splitName = (fullName: string) => {
      const nameParts = fullName.trim().split(/\s+/)
      if (nameParts.length > 1) {
        // Multiple words: use last word as lastName, rest as firstName
        return {
          firstName: nameParts.slice(0, -1).join(' '),
          lastName: nameParts[nameParts.length - 1]
        }
      } else {
        // Single word: duplicate it for both (minimum 2 chars for API)
        return {
          firstName: fullName.trim(),
          lastName: fullName.trim()
        }
      }
    }
    
    // For store pickup, create proper billing address
    if (checkoutData.deliveryType === 'store_pickup') {
      const { firstName, lastName } = shippingAddress.lastName 
        ? { firstName: shippingAddress.firstName || '', lastName: shippingAddress.lastName }
        : splitName(shippingAddress.firstName || 'عميل')
        
      billingAddress = {
        firstName,
        lastName,
        phone: shippingAddress.phone || '',
        email: user?.email || `${shippingAddress.phone}@spare2app.temp`, // Generate temp email if needed
        city: 'pickup',
        cityName: 'استلام من المتجر',
        district: 'pickup',
        districtName: 'استلام من المتجر',
        address: 'استلام من المتجر',
      }
      setBillingAddress(billingAddress)
    } else if (!billingAddress || !billingAddress.city) {
      // For home delivery, use shipping address
      const { firstName, lastName } = shippingAddress.lastName 
        ? { firstName: shippingAddress.firstName || '', lastName: shippingAddress.lastName }
        : splitName(shippingAddress.firstName || 'عميل')
        
      billingAddress = {
        ...shippingAddress,
        firstName,
        lastName,
        email: user?.email || `${shippingAddress.phone}@spare2app.temp`
      }
      setBillingAddress(billingAddress)
    } else {
      // Billing address exists, but ensure firstName/lastName are valid
      const { firstName, lastName } = billingAddress.lastName 
        ? { firstName: billingAddress.firstName || '', lastName: billingAddress.lastName }
        : splitName(billingAddress.firstName || 'عميل')
      
      billingAddress = {
        ...billingAddress,
        firstName,
        lastName
      }
    }
    
    console.log('📋 Final billing address:', billingAddress)
    
    console.log('✅✅✅ ALL VALIDATIONS PASSED! Creating order...')

    setSubmitting(true)

    try {
      // Get vendor ID from first product (all products in cart must be from same vendor)
      // Ensure vendorId is always a number for proper comparison
      const rawVendorIdInOrder = cartItems[0]?.vendor?.id
      const vendorIdInOrder = rawVendorIdInOrder ? (typeof rawVendorIdInOrder === 'string' ? parseInt(rawVendorIdInOrder) : rawVendorIdInOrder) : null
      
      console.log('🛒 DEBUG - Cart items:', cartItems)
      console.log('🏪 DEBUG - First item vendor:', cartItems[0]?.vendor)
      console.log('🔢 DEBUG - Vendor ID:', vendorIdInOrder)
      
      // Prepare metadata
      const metadata: Array<{ key: string; value: string }> = [
        {
          key: '_delivery_type',
          value: checkoutData.deliveryType || 'home_delivery'
        },
        {
          key: '_vendor_id',
          value: vendorIdInOrder?.toString() || ''
        },
        {
          key: '_vendor_name',
          value: cartItems[0]?.vendor?.store_name || ''
        }
      ]

      // Half payment metadata (based on vendor config)
      if (isHalfPayment) {
        metadata.push(
          {
            key: '_payment_type',
            value: 'half_payment'
          },
          {
            key: '_paid_amount',
            value: halfPaymentAmount.toString()
          },
          {
            key: '_remaining_amount',
            value: remainingAmount.toString()
          },
          {
            key: '_payment_note',
            value: `تم دفع ${halfPaymentAmount} جنيه مقدماً - المتبقي ${remainingAmount} جنيه عند التوصيل`
          }
        )
      }
      
      // Add store pickup specific metadata
      if (checkoutData.deliveryType === 'store_pickup') {
        metadata.push(
          {
            key: '_is_store_pickup',
            value: 'yes'
          },
          {
            key: '_store_address',
            value: typeof cartItems[0]?.vendor?.store_address === 'string'
              ? cartItems[0]?.vendor?.store_address
              : ((cartItems[0]?.vendor?.store_address as { street_1?: string })?.street_1 || '')
          },
          {
            key: '_google_maps_link',
            value: cartItems[0]?.vendor?.social_links?.gplus || ''
          }
        )
      }
      
      console.log('🏷️ Order metadata:', metadata)
      
      // Prepare order data
      const orderData: any = {
        paymentMethod: paymentMethod.id,
        paymentMethodTitle: paymentMethod.title,
        shippingAddress,
        billingAddress,
        lineItems: cartItems.map((item: any) => ({
          product_id: item.id,
          quantity: item.quantity,
          variation_id: item.variation_id || 0,  // CRITICAL: Use actual variation_id from cart
          meta_data: item.selected_attributes ? 
            Object.entries(item.selected_attributes).map(([key, value]: [string, any]) => ({
              key: key,
              value: typeof value === 'object' ? (value.option || value.name || JSON.stringify(value)) : value
            })) : []
        })),
        shippingLines: [
          {
            method_id: shippingMethod.methodId || shippingMethod.id,
            method_title: shippingMethod.title,
            total: shippingMethod.cost.toString(),
          },
        ],
        customerNote: checkoutData.orderNotes || undefined,
        metaData: metadata,
        paymentProof: paymentProof || undefined,
        totalWeight: cartItems.reduce((sum: number, item) => sum + 0.5 * item.quantity, 0),
        vendorId: vendorId,
        deliveryType: checkoutData.deliveryType || 'home_delivery',
        storeAddress: typeof cartItems[0]?.vendor?.store_address === 'string'
            ? cartItems[0]?.vendor?.store_address
            : ((cartItems[0]?.vendor?.store_address as { street_1?: string })?.street_1 || ''),
        
        googleMapsLink: cartItems[0]?.vendor?.social_links?.gplus || undefined,
      }
      
      // Add customerId only for logged-in users
      if (user?.id && !isGuest) {
        orderData.customerId = user.id;
        console.log('👤 Adding customer ID to order:', user.id);
      } else {
        console.log('⚠️ No customer ID - Guest checkout or user not logged in');
        console.log('User:', user);
        console.log('Is Guest:', isGuest);
      }
      
      console.log('📦 Sending order data:', orderData)

      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()
      
      console.log('📬 Order creation response:', result)

      if (result.success && result.order) {
        toast.success('✅ تم إنشاء الطلب بنجاح!')
        
        // Set flag to prevent useEffect from redirecting
        setOrderSuccess(true)
        
        // Get seller info from first product in cart
        const firstProduct = cartItems[0]
        console.log('First product for seller info:', cartItems[0])
        const sellerName = firstProduct?.vendor?.store_name || 'متجر غير محدد'
        const sellerLogo = '' // Will be fetched from product details if needed
        const storeAddress = typeof firstProduct?.vendor?.store_address === 'string'
          ? firstProduct?.vendor?.store_address
          : (firstProduct?.vendor?.store_address as { street_1?: string })?.street_1 || ''
        const googleMapsLink = firstProduct?.vendor?.social_links?.gplus || ''
        
        // Prepare success page params
        const successParams = new URLSearchParams({
          totalPay: result.paymentProof?.amount || totalAmount.toString(),
          paymentMethod: paymentMethod.title,
          sellerName: sellerName,
          deliveryType: checkoutData.deliveryType || 'home_delivery', // Add delivery type
        })
        
        // Add optional params
        if (sellerLogo) {
          successParams.append('sellerLogo', sellerLogo)
        }
        if (storeAddress) {
          successParams.append('storeAddress', storeAddress)
        }
        if (googleMapsLink) {
          successParams.append('googleMapsLink', googleMapsLink)
        }
        
        // Navigate to success page with order details
        router.push(`/checkout/success/${result.order.id}?${successParams.toString()}`)
        
        // Clear cart after a short delay
        setTimeout(() => {
          resetCart()
        }, 500)
      } else {
        toast.error(result.error || 'فشل في إنشاء الطلب')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      toast.error('حدث خطأ أثناء إنشاء الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-4 rounded-full animate-spin border-brand-600"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }
  
  // Show guest checkout modal if user not logged in
  if (!user && !isGuest && showGuestCheckoutModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl">
          <div className="p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-50 to-purple-50">
                <span className="text-4xl">🛒</span>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="mb-3 text-2xl font-bold text-center text-gray-900">
              إتمام عملية الشراء
            </h2>
            
            <p className="mb-8 text-center text-gray-600">
              اختر الطريقة المناسبة لك لإتمام طلبك
            </p>
            
            {/* Options */}
            <div className="space-y-4">
              {/* Login Option */}
              <button
                onClick={() => {
                  router.push('/auth/login?redirect=/checkout')
                }}
                className="flex items-center justify-between w-full p-5 text-right transition-all duration-300 border-2 border-transparent rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-white/20">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="text-white">
                    <div className="mb-1 text-lg font-bold">تسجيل الدخول</div>
                    <div className="text-sm text-white/80">
                      للاستفادة من الخصومات ومتابعة طلباتك
                    </div>
                  </div>
                </div>
                <div className="text-white transition-transform duration-300 group-hover:translate-x-1">
                  ←
                </div>
              </button>
              
              {/* Guest Option */}
              <button
                onClick={() => {
                  setIsGuest(true)
                  setShowGuestCheckoutModal(false)
                  setAuthChecked(true)
                  // Payment methods are hardcoded (COD only)
                }}
                className="flex items-center justify-between w-full p-5 text-right transition-all duration-300 border-2 border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 text-gray-600 transition-colors duration-300 bg-gray-100 rounded-lg group-hover:bg-brand-100 group-hover:text-brand-600">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <div className="mb-1 text-lg font-bold text-gray-900">متابعة كضيف</div>
                    <div className="text-sm text-gray-600">
                      إتمام الطلب بدون إنشاء حساب
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-600">
                  ←
                </div>
              </button>
            </div>
            
            {/* Benefits for logged-in users */}
            <div className="p-4 mt-6 border border-blue-200 bg-blue-50 rounded-xl">
              <h3 className="mb-3 text-sm font-semibold text-blue-900">
                مزايا التسجيل:
              </h3>
              <ul className="space-y-2 text-xs text-blue-800">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>متابعة حالة الطلبات</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>حفظ العناوين للطلبات المستقبلية</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>الحصول على خصومات وعروض حصرية</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>عملية شراء أسرع في المرات القادمة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return null // Will redirect
  }

  // Calculate totals
  
  // Half payment calculation (based on vendor config) - Must be calculated BEFORE wallet fee
  const halfPaymentAmount = isHalfPayment ? Math.round(totalPrice / 2) : totalPrice
  const remainingAmount = isHalfPayment ? totalPrice - halfPaymentAmount : 0
  
  // Calculate wallet fee based on the amount to be paid now (halfPaymentAmount if half payment)
  const walletFee = checkoutData.paymentMethod?.id === 'instapay' ? calculateWalletFee(halfPaymentAmount) : 0
  const walletFeeInfo = getWalletFeeInfo()
  
  // Debug log for half payment
  console.log('💰 Payment Calculation:', {
    isHalfPayment,
    totalPrice,
    halfPaymentAmount,
    remainingAmount,
    walletFee
  })
  
  const totalAmount = halfPaymentAmount + walletFee // Shipping is separate (COD)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container p-2 mx-auto">
        {/* Page Header */}
        {/* <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            إتمام الطلب
          </h1>
          <p className="text-lg text-gray-600">
            خطوة واحدة فقط تفصلك عن الحصول على منتجاتك 🚀
          </p>
        </div> */}

        <div className="grid grid-cols-1 gap-8 pb-6 lg:pb-8 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* 1. Delivery Type Selection - FIRST - ENHANCED */}
            <section 
              id="delivery-type-section"
              className="relative p-4 overflow-hidden transition-all duration-300 border-2 shadow-lg bg-gradient-to-br from-white via-brand-50/30 to-white md:p-8 rounded-2xl hover:shadow-2xl border-brand-200 animate-fade-in"
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-brand-100/20 via-purple-100/20 to-brand-100/20 animate-pulse"></div>
              
              {/* Spotlight Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-30 bg-gradient-to-br from-brand-400 to-transparent blur-3xl animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-brand-400 opacity-20"></div>
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-gradient-to-br from-brand-500 to-brand-600 animate-bounce-slow">
                      <TruckIcon className="text-white w-7 h-7 drop-shadow-lg" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-transparent md:text-3xl bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text">
                      طريقة الاستلام
                    </h2>
                    <p className="text-sm text-gray-600 md:text-base animate-fade-in">
                      🎯 اختر كيف تريد استلام طب
                    </p>
                  </div>
                </div>
              
              {/* Delivery Type Selection - Enhanced Cards */}
              <div className="grid grid-cols-2 gap-3 md:gap-6">
                {/* Home Delivery */}
                <button
                  onClick={() => {
                    const newDeliveryType = 'home_delivery'
                    useCheckoutStore.setState((state) => ({
                      checkoutData: {
                        ...state.checkoutData,
                        deliveryType: newDeliveryType,
                        shippingMethod: null,
                      }
                    }))
                  }}
                  className={`
                    group relative p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-center transition-all duration-300
                    transform hover:scale-105 hover:-translate-y-1
                    ${checkoutData.deliveryType === 'home_delivery' || !checkoutData.deliveryType
                      ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-brand-100 shadow-xl ring-4 ring-brand-200/50'
                      : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-lg'
                    }
                  `}
                >
                  {/* Selected Badge */}
                  {(checkoutData.deliveryType === 'home_delivery' || !checkoutData.deliveryType) && (
                    <div className="absolute flex items-center gap-1 px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 animate-bounce-slow">
                      <CheckCircleIcon className="w-3 h-3" />
                      مختار
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className={`
                      relative p-3 md:p-4 rounded-2xl transition-all duration-300
                      ${checkoutData.deliveryType === 'home_delivery' || !checkoutData.deliveryType 
                        ? 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg scale-110' 
                        : 'bg-gray-100 group-hover:bg-brand-100'
                      }
                    `}>
                      {/* Icon Glow Effect */}
                      {(checkoutData.deliveryType === 'home_delivery' || !checkoutData.deliveryType) && (
                        <div className="absolute inset-0 rounded-2xl animate-ping bg-brand-400 opacity-30"></div>
                      )}
                      <TruckIcon className={`
                        relative w-8 h-8 md:w-10 md:h-10 transition-all duration-300
                        ${checkoutData.deliveryType === 'home_delivery' || !checkoutData.deliveryType 
                          ? 'text-white drop-shadow-lg' 
                          : 'text-gray-600 group-hover:text-brand-600'
                        }
                      `} />
                    </div>
                    
                    <div>
                      <h3 className={`
                        text-sm md:text-lg font-bold transition-colors duration-300
                        ${checkoutData.deliveryType === 'home_delivery' || !checkoutData.deliveryType
                          ? 'text-brand-700'
                          : 'text-gray-900 group-hover:text-brand-600'
                        }
                      `}>
                        🏠 توصيل للمنزل
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 md:text-sm">
                        توصيل سريع وآمن
                      </p>
                    </div>
                  </div>
                </button>
                
                {/* Store Pickup */}
                <button
                  onClick={() => {
                    const newDeliveryType = 'store_pickup'
                    const pickupMethod: ShippingMethod = {
                      id: 'store_pickup',
                      title: 'استلام من المتجر',
                      cost: 0,
                    }
                    useCheckoutStore.setState((state) => ({
                      checkoutData: {
                        ...state.checkoutData,
                        deliveryType: newDeliveryType,
                        shippingMethod: pickupMethod,
                      }
                    }))
                  }}
                  className={`
                    group relative p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-center transition-all duration-300
                    transform hover:scale-105 hover:-translate-y-1
                    ${checkoutData.deliveryType === 'store_pickup'
                      ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-brand-100 shadow-xl ring-4 ring-brand-200/50'
                      : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-lg'
                    }
                  `}
                >
                  {/* Selected Badge */}
                  {checkoutData.deliveryType === 'store_pickup' && (
                    <div className="absolute flex items-center gap-1 px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 animate-bounce-slow">
                      <CheckCircleIcon className="w-3 h-3" />
                      مختار
                    </div>
                  )}
                  
                  {/* Free Badge */}
                  {/* <div className="absolute flex items-center gap-1 px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg -top-2 -left-2 bg-gradient-to-r from-green-500 to-green-600">
                    ✨ مجاني
                  </div> */}
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className={`
                      relative p-3 md:p-4 rounded-2xl transition-all duration-300
                      ${checkoutData.deliveryType === 'store_pickup' 
                        ? 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg scale-110' 
                        : 'bg-gray-100 group-hover:bg-brand-100'
                      }
                    `}>
                      {/* Icon Glow Effect */}
                      {checkoutData.deliveryType === 'store_pickup' && (
                        <div className="absolute inset-0 rounded-2xl animate-ping bg-brand-400 opacity-30"></div>
                      )}
                      <MapPinIcon className={`
                        relative w-8 h-8 md:w-10 md:h-10 transition-all duration-300
                        ${checkoutData.deliveryType === 'store_pickup' 
                          ? 'text-white drop-shadow-lg' 
                          : 'text-gray-600 group-hover:text-brand-600'
                        }
                      `} />
                    </div>
                    
                    <div>
                      <h3 className={`
                        text-sm md:text-lg font-bold transition-colors duration-300
                        ${checkoutData.deliveryType === 'store_pickup'
                          ? 'text-brand-700'
                          : 'text-gray-900 group-hover:text-brand-600'
                        }
                      `}>
                        🏪 استلام من المتجر
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 md:text-sm">
                        وفّر رسوم الشحن
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            </section>

            {/* Electrical Products Warning */}
            {hasElectricalProducts && (
              <div className="flex items-start gap-3 p-4 border-2 border-orange-300 shadow-lg md:p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50 animate-fade-in">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-6 h-6 text-orange-600 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 text-base font-bold text-orange-900 md:text-lg">⚠️ تنبيه هام - المنتجات الكهربائية</h4>
                  <p className="text-sm leading-relaxed text-orange-800 md:text-base">
                    طلبك يحتوي على منتجات كهربائية. <span className="font-bold">المنتجات الكهربائية لا يمكن استرجاعها أو استبدالها</span> بعد البيع لأسباب تتعلق بالسلامة والجودة.
                    يرجى التأكد من المواصفات والتوافق مع دراجتك قبل إتمام الطلب.
                  </p>
                </div>
              </div>
            )}
            
            {/* 2. Address Section */}
            <section 
              id="address-section"
              className="p-4 transition-all bg-white border-2 border-transparent shadow-lg md:p-8 rounded-2xl hover:shadow-xl focus-within:border-brand-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  addressValid ? 'bg-green-500' : 'bg-brand-500'
                }`}>
                  {addressValid ? (
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  ) : (
                    <MapPinIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 md:text-2xl">
                    {checkoutData.deliveryType === 'store_pickup' ? 'بيانات الاستلام' : 'عنوان التوصيل'}
                  </h2>
                  <p className="text-xs text-gray-500 md:text-sm">
                    {checkoutData.deliveryType === 'store_pickup' 
                      ? 'أدخل اسمك ورقم هاتفك' 
                      : 'أين تريد استلام طلبك؟'
                    }
                  </p>
                </div>
              </div>

              {checkoutData.deliveryType === 'store_pickup' ? (
                /* Simple form for pickup - name and phone only */
                <div className="space-y-4">
                  {/* <div className="p-4 mb-4 border border-green-200 rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-green-800">
                      📍 سيظهر عنوان المتجر أدناه بعد إدخال بياناتك
                    </p>
                  </div> */}
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        الاسم كامل <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={checkoutData.shippingAddress?.firstName || ''}
                        onChange={(e) => {
                          const addr = checkoutData.shippingAddress || {} as any
                          setShippingAddress({
                            ...addr,
                            firstName: e.target.value,
                            lastName: e.target.value, // Use same value as lastName
                            city: 'pickup',
                            cityName: 'استلام من المتجر',
                            district: 'pickup',
                            districtName: 'استلام من المتجر',
                            address: 'استلام من المتجر',
                          })
                        }}
                        placeholder="أدخل الاسم الكامل"
                        className="w-full px-4 py-3 transition-all border-2 border-gray-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      رقم الهاتف <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={checkoutData.shippingAddress?.phone || ''}
                      onChange={(e) => {
                        const addr = checkoutData.shippingAddress || {} as any
                        setShippingAddress({
                          ...addr,
                          phone: e.target.value,
                          city: 'pickup',
                          cityName: 'استلام من المتجر',
                          district: 'pickup',
                          districtName: 'استلام من المتجر',
                          address: 'استلام من المتجر',
                        })
                      }}
                      placeholder="01xxxxxxxxx"
                      className="w-full px-4 py-3 transition-all border-2 border-gray-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      required
                      onBlur={() => {
                        // Validate and mark as complete when both fields are filled
                        if (checkoutData.shippingAddress?.firstName && checkoutData.shippingAddress?.phone) {
                          setAddressValid(true)
                        }
                      }}
                    />
                  </div>
                  {/* Store Name Display */}
                  {cartItems.length > 0 && cartItems[0]?.vendor && (
                    <div className="p-4 mt-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-start gap-3">
                        <MapPinIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="mb-2 text-sm font-bold text-blue-900">
                            المتجر:
                          </h4>
                          <p className="text-sm font-semibold text-blue-800">
                            {cartItems[0].vendor.store_name}
                          </p>
                          
                          {/* Debug: Show vendor data */}
                          {/* {process.env.NODE_ENV === 'development' && (
                            <details className="p-2 mt-2 text-xs bg-white rounded">
                              <summary className="font-bold cursor-pointer">🔍 Debug Vendor Data</summary>
                              <pre className="mt-2 overflow-auto text-xs">
                                {JSON.stringify(cartItems[0].vendor, null, 2)}
                              </pre>
                            </details>
                          )} */}
                          
                          {/* Show address if available */}
                          {cartItems[0].vendor.store_address ? (
                            <div className="p-2 mt-2 border border-blue-300 rounded bg-blue-100/50">
                              <p className="text-xs font-medium text-blue-900">📍 العنوان:</p>
                              <p className="mt-1 text-xs text-blue-800">
                                {typeof cartItems[0].vendor.store_address === 'string' ? cartItems[0].vendor.store_address : (cartItems[0].vendor.store_address as { street_1?: string })?.street_1 || ''}
                              </p>
                              
                              {/* Google Maps Link */}
                              {cartItems[0].vendor.social_links?.gplus && (
                                <a
                                  href={cartItems[0].vendor.social_links.gplus}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 mt-2 text-xs font-semibold text-white transition-all rounded-lg shadow-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-md"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                  </svg>
                                  فتح الموقع في خرائط Google
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-blue-700">
                              سيتم إرسال العنوان وتفاصيل الاستلام بعد تأكيد الطلب
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Full address form for home delivery */
                <AddressForm
                  onChange={handleAddressChange}
                  onCityChange={(cityNameEn) => {
                    // Auto-calculate shipping when city is selected
                    if (cityNameEn) {
                      calculateShippingCost(cityNameEn)
                    }
                  }}
                  initialData={checkoutData.shippingAddress || undefined}
                />
              )}

              {/* Same as Shipping Checkbox */}
              {/* <div className="pt-6 mt-6 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => {
                      setSameAsShipping(e.target.checked)
                      if (e.target.checked && checkoutData.shippingAddress) {
                        // Copy all shipping address fields to billing address and add email
                        const billingAddr: any = {
                          ...checkoutData.shippingAddress,
                          email: user?.email || ''
                        }
                        setBillingAddress(billingAddr)
                      }
                    }}
                    className="w-5 h-5 border-gray-300 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-gray-700 transition-colors group-hover:text-brand-600">
                    عنوان الفاتورة نفس عنوان التوصيل
                  </span>
                </label>
              </div> */}
            </section>

            {/* 3. Shipping Methods Section - Only for Home Delivery */}
            {/* {checkoutData.deliveryType !== 'store_pickup' && (
            <section 
              id="shipping-methods-section"
              className="p-4 transition-all bg-white border-2 border-transparent shadow-lg md:p-8 rounded-2xl hover:shadow-xl focus-within:border-brand-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  shippingValid ? 'bg-green-500' : 'bg-brand-500'
                }`}>
                  {shippingValid ? (
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  ) : (
                    <TruckIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 md:text-2xl">طريقة الشحن</h2>
                  <p className="text-xs text-gray-500 md:text-sm">اختر الطريقة المناسبة لك</p>
                </div>
              </div>
              
              {calculatingShipping ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-b-2 rounded-full animate-spin border-brand-600"></div>
                      <p className="text-sm text-gray-500">جاري حساب تكلفة الشحن...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`
                          flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer
                          transition-all hover:shadow-md
                          ${
                            checkoutData.shippingMethod?.id === method.id
                              ? 'border-brand-500 bg-brand-50 shadow-md'
                              : 'border-gray-200 hover:border-brand-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="shipping"
                            checked={checkoutData.shippingMethod?.id === method.id}
                            onChange={() => handleShippingMethodSelect(method)}
                            className="w-5 h-5 border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{method.title}</p>
                            {method.estimatedDays && (
                              <p className="mt-1 text-xs text-gray-400">
                                التوصيل خلال {method.estimatedDays} يوم
                              </p>
                            )}
                          </div>
                        </div>
                      <div className="text-left">
                        <p className="text-xl font-bold text-brand-600">
                          {method.cost === 0 ? 'مجاناً' : `${Math.round(method.cost)} جنيه`}
                        </p>
                      </div>
                    </label>
                  ))}
                  </div>
                )}
            </section>
            )} */}

            {/* 4. Payment Section */}
            <section 
              id="payment-section"
              className="p-4 transition-all bg-white border-2 border-transparent shadow-lg md:p-8 rounded-2xl hover:shadow-xl focus-within:border-brand-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  paymentValid ? 'bg-green-500' : 'bg-brand-500'
                }`}>
                  {paymentValid ? (
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  ) : (
                    <OptimizedImage src="/vocash.webp" alt="Vo Cash Or Instapay" width={50} height={50} />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 md:text-2xl">طريقة الدفع</h2>
                  <p className="text-xs text-gray-500 md:text-sm">كيف تريد الدفع؟</p>
                </div>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 rounded-full animate-spin border-brand-500 border-t-transparent" />
                  <p className="mt-4 text-gray-500">جاري تحميل طرق الدفع...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id}>
                      <label
                        className={`
                          flex items-center justify-between p-2 md:p-4 rounded-xl border-2 cursor-pointer
                          transition-all hover:shadow-md
                          ${
                            checkoutData.paymentMethod?.id === method.id
                              ? 'border-brand-500 bg-brand-50 shadow-md'
                              : 'border-gray-200 hover:border-brand-300'
                          }
                        `}
                      >
                        <div className="flex items-center flex-1 gap-4">
                          <input
                            type="radio"
                            name="payment"
                            checked={checkoutData.paymentMethod?.id === method.id}
                            onChange={() => handlePaymentMethodSelect(method)}
                            className="w-5 h-5 border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{method.title}</p>
                          </div>
                        </div>
                      </label>

                      {/* Instapay Payment Proof Upload */}
                      {checkoutData.paymentMethod?.id === method.id &&
                        method.requiresProof &&
                        method.id === 'instapay' && (
                          <div className="p-4 mt-4 border md:p-6 bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl border-brand-200">
                            <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
                              <ExclamationCircleIcon className="w-5 h-5 text-brand-600" />
                               الدفع عبر المحفظة أو Instapay
                            </h3>
                            
                            <div className="p-4 mb-6 bg-white border rounded-lg border-brand-200">
                              <p className="mb-3 text-sm font-medium text-gray-700">
                                قم بتحويل (<span className="text-lg font-bold text-black">
                                    {Math.round(totalAmount)} جنيه
                                  </span>) على:
                              </p>
                              
                              {/* Half Payment Notice (based on vendor config) */}
                              {isHalfPayment && (
                                <div className="p-3 mb-4 border border-yellow-300 rounded-lg bg-yellow-50">
                                  <p className="text-sm font-bold text-yellow-800">
                                    💰 ادفع نصف المبلغ فقط الآن
                                  </p>
                                  <p className="mt-1 text-xs text-yellow-700">
                                    • المبلغ المطلوب الآن: <span className="font-bold">{halfPaymentAmount} جنيه</span>
                                  </p>
                                  <p className="text-xs text-yellow-700">
                                    • الباقي عند الأستلام: <span className="font-bold">{remainingAmount} جنيه</span>
                                  </p>
                                </div>
                              )}
                              
                              <div className="space-y-3">
                                {/* Account Number with Copy */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-gray-600">رقم الحساب:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-lg font-bold text-brand-600">
                                      {instaPayAccount}
                                    </span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(instaPayAccount)
                                        toast.success('تم نسخ الرقم!')
                                      }}
                                      className="p-2 transition-colors rounded-lg hover:bg-brand-100"
                                      title="نسخ الرقم"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Account Name */}
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">الاسم:</span>
                                  <span className="font-semibold text-gray-900">
                                    {instaPayName}
                                  </span>
                                </div>
                                
                                {/* Instapay Link */}
                                <div className="pt-3 border-t border-gray-200">
                                  <a
                                    href={instaPayLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                    ادفع عبر Instapay مباشرة
                                  </a>
                                </div>
                              
                                {/* Order Breakdown */}
                                <div className="pt-3 mt-3 space-y-2 border-t border-gray-200">
                                  
                                  {walletFeeInfo.enabled && (
                                    <>
                                    <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">قيمة الطلب:</span>
                                    <span className="font-medium text-gray-900">
                                      {Math.round(totalPrice)} جنيه
                                    </span>
                                  </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">رسوم المحفظة ({walletFeeInfo.percentage}%):</span>
                                        <span className="font-medium text-gray-900">
                                          {Math.round(walletFee)} جنيه
                                        </span>
                                      </div>
                                      <div className="pr-4 text-xs text-gray-500">
                                        الحد الأدنى {walletFeeInfo.min} جنيه • الحد الأقصى {walletFeeInfo.max} جنيه
                                      </div>
                                    </>
                                  )}
                                  {!walletFeeInfo.enabled && (
                                    <div className="p-2 text-xs text-green-700 rounded bg-green-50">
                                      🎉 لا توجد رسوم إضافية على الدفع!
                                    </div>
                                  )}
                                </div>
                                
                                {/* Total to Pay */}
                                {/* <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-brand-200">
                                  <span className="font-bold text-gray-900">المبلغ المطلوب دفعه:</span>
                                  <span className="text-2xl font-bold text-green-600">
                                    {Math.round(totalAmount)} جنيه
                                  </span>
                                </div> */}
                                
                                {/* Shipping Notice */}
                                {checkoutData.shippingMethod && checkoutData.deliveryType === 'store_pickup' ? (
                                  <div></div>
                                ) : (
                                  <div className="p-2 mt-3 text-xs text-blue-700 rounded bg-blue-50">
                                    💡 الشحن في حدود ({checkoutData.shippingMethod ? `${Math.round(checkoutData.shippingMethod.cost) -30} ل ${Math.round(checkoutData.shippingMethod.cost)}` : 0} جنيه) يُدفع نقداً عند الاستلام
                                  </div>
                                )}
                              </div>
                            </div>

                            <PaymentProofUpload
                              amount={totalAmount}
                              onUploadSuccess={handlePaymentProofUpload}
                              onRemove={() => {
                                setPaymentProof(null)
                                setPaymentValid(false)
                              }}
                              existingProof={checkoutData.paymentProof}
                            />
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Order Notes */}
            <section className="p-4 bg-white shadow-lg md:p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBagIcon className="w-6 h-6 text-brand-500" />
                <h2 className="text-base font-bold text-white md:text-xl">ملاحظات إضافية - اختياري</h2>
              </div>
              <textarea
                value={orderNotes}
                onChange={(e) => {
                  setLocalOrderNotes(e.target.value)
                  setOrderNotes(e.target.value)
                }}
                placeholder="أي تعليمات خاصة بالتوصيل أو الخدمة؟"
                rows={3}
                className="w-full px-4 pt-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />

              {/* Terms & Conditions */}
              <div className="text-xs text-center text-gray-600 md:text-sm">
                <p>
                  بالضغط على "تنفيذ الطلب"، أنت توافق على{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-semibold underline text-brand-600 hover:text-brand-700"
                  >
                    الشروط والأحكام
                  </button>
                  {' '}الخاصة بالمتجر
                </p>
              </div>
            </section>

            {/* Submit Button - Mobile - Now Fixed at Bottom */}
          </div>

          {/* Sidebar - Order Summary (Hidden on Mobile) */}
          <div className="hidden lg:col-span-1 md:block">
            <div className="sticky space-y-6 top-8">
              <OrderSummary 
                isHalfPayment={isHalfPayment}
                halfPaymentAmount={halfPaymentAmount}
                remainingAmount={remainingAmount}
              />

              {/* Submit Button - Desktop */}
              <div className="hidden lg:block">
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="w-full px-6 py-5 font-bold text-white transition-all shadow-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                      جاري الإنشاء...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="w-6 h-6" />
                      إتمام الطلب - {Math.round(totalAmount)} جنيه
                    </span>
                  )}
                </button>

                {/* Validation Status */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className={`flex items-center gap-2 ${checkoutData.shippingAddress ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>عنوان التوصيل</span>
                  </div>
                  <div className={`flex items-center gap-2 ${checkoutData.shippingMethod ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>طريقة الشحن</span>
                  </div>
                  <div className={`flex items-center gap-2 ${checkoutData.paymentMethod ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>طريقة الدفع</span>
                  </div>
                  {checkoutData.paymentMethod?.requiresProof && (
                    <div className={`flex items-center gap-2 ${checkoutData.paymentProof ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>إثبات الدفع</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="p-6 border border-green-200 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                <h3 className="mb-4 font-bold text-center text-gray-900">
                  🔒 عملية دفع آمنة
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span>بياناتك محمية بالكامل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span>توصيل سريع وآمن</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span>دعم فني 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom Button - Mobile & Tablet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white border-t-2 border-gray-200 shadow-2xl">
          {/* Collapsible Order Summary - Mobile */}
          {showOrderSummary && (
            <div className="max-h-[60vh] overflow-y-auto border-b border-gray-200">
              <div className="px-4 py-4">
                <OrderSummary 
                  isHalfPayment={isHalfPayment}
                  halfPaymentAmount={halfPaymentAmount}
                  remainingAmount={remainingAmount}
                />
              </div>
            </div>
          )}
          
          <div className="container px-4 py-4 mx-auto">
            {/* Toggle Order Summary Button */}
            <button
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="w-full px-4 py-3 mb-3 text-sm font-semibold text-center transition-all border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 rounded-xl"
            >
              <span className="flex items-center justify-center gap-2">
                {showOrderSummary ? (
                  <>
                    <ChevronDownIcon className="w-5 h-5" />
                    إخفاء تفاصيل الطلب
                  </>
                ) : (
                  <>
                    <ChevronUpIcon className="w-5 h-5" />
                    عرض تفاصيل الطلب ({cartItems.length} منتج)
                  </>
                )}
              </span>
            </button>
            
            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full px-6 py-4 text-lg font-bold text-white transition-all shadow-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                  جاري إنشاء الطلب...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-6 h-6" />
                    تنفيذ الطلب - {Math.round(totalAmount)} جنيه
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
    </div>
  )
}
