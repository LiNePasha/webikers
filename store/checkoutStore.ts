import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CheckoutData,
  ShippingAddress,
  BillingAddress,
  ShippingMethod,
  PaymentMethod,
  PaymentProof,
  CartItem,
} from '@/types'

// ============================================
// CHECKOUT STORE STATE & ACTIONS
// ============================================

interface CheckoutStore {
  // State
  checkoutData: CheckoutData
  
  // Actions
  setStep: (step: CheckoutData['step']) => void
  nextStep: () => void
  previousStep: () => void
  
  setShippingAddress: (address: ShippingAddress) => void
  setBillingAddress: (address: BillingAddress | null) => void
  setUseSameAddress: (useSame: boolean) => void
  
  setShippingMethod: (method: ShippingMethod | null) => void
  setPaymentMethod: (method: PaymentMethod | null) => void
  setPaymentProof: (proof: PaymentProof | null) => void
  
  setOrderNotes: (notes: string) => void
  
  resetCheckout: () => void
  
  // Helper getters
  canProceedToShipping: () => boolean
  canProceedToPayment: () => boolean
  canProceedToReview: () => boolean
  isCheckoutComplete: () => boolean
}

// ============================================
// INITIAL STATE
// ============================================

const initialCheckoutData: CheckoutData = {
  step: 'address',
  deliveryType: 'home_delivery',
  cartItems: [],
  shippingAddress: null,
  billingAddress: null,
  shippingMethod: null,
  paymentMethod: null,
  orderNotes: '',
  paymentProof: undefined,
}

// ============================================
// CHECKOUT STORE
// ============================================

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      // Initial state
      checkoutData: initialCheckoutData,

      // Step navigation
      setStep: (step) => {
        set((state) => ({
          checkoutData: { ...state.checkoutData, step },
        }))
      },

      nextStep: () => {
        const { checkoutData } = get()
        const stepOrder: CheckoutData['step'][] = [
          'address',
          'shipping',
          'payment',
          'review',
        ]
        const currentIndex = stepOrder.indexOf(checkoutData.step)
        if (currentIndex < stepOrder.length - 1) {
          set((state) => ({
            checkoutData: {
              ...state.checkoutData,
              step: stepOrder[currentIndex + 1],
            },
          }))
        }
      },

      previousStep: () => {
        const { checkoutData } = get()
        const stepOrder: CheckoutData['step'][] = [
          'address',
          'shipping',
          'payment',
          'review',
        ]
        const currentIndex = stepOrder.indexOf(checkoutData.step)
        if (currentIndex > 0) {
          set((state) => ({
            checkoutData: {
              ...state.checkoutData,
              step: stepOrder[currentIndex - 1],
            },
          }))
        }
      },

      // Address management
      setShippingAddress: (address) => {
        set((state) => ({
          checkoutData: { ...state.checkoutData, shippingAddress: address },
        }))
      },

      setBillingAddress: (address) => {
        set((state) => ({
          checkoutData: { ...state.checkoutData, billingAddress: address },
        }))
      },

      setUseSameAddress: (useSame) => {
        if (useSame) {
          // Copy shipping to billing
          const { shippingAddress } = get().checkoutData
          if (shippingAddress) {
            set((state) => ({
              checkoutData: {
                ...state.checkoutData,
                billingAddress: {
                  firstName: shippingAddress.firstName,
                  lastName: shippingAddress.lastName,
                  phone: shippingAddress.phone,
                  email: '', // Will be filled from user profile
                  city: shippingAddress.city,
                  address: shippingAddress.address,
                  building: shippingAddress.building,
                  floor: shippingAddress.floor,
                  apartment: shippingAddress.apartment,
                },
              },
            }))
          }
        } else {
          // Clear billing address
          set((state) => ({
            checkoutData: { ...state.checkoutData, billingAddress: null },
          }))
        }
      },

      // Shipping & Payment
      setShippingMethod: (method) => {
        set((state) => ({
          checkoutData: { ...state.checkoutData, shippingMethod: method },
        }))
      },

      setPaymentMethod: (method) => {
        set((state) => ({
          checkoutData: { ...state.checkoutData, paymentMethod: method },
        }))
      },

      setPaymentProof: (proof) => {
        set((state) => ({
          checkoutData: { ...state.checkoutData, paymentProof: proof ?? undefined },
        }))
      },

      // Order notes
      setOrderNotes: (notes) => {
        set((state) => ({
          checkoutData: { ...state.checkoutData, orderNotes: notes },
        }))
      },

      // Reset
      resetCheckout: () => {
        set({ checkoutData: initialCheckoutData })
      },

      // Validation helpers
      canProceedToShipping: () => {
        const { shippingAddress, billingAddress } = get().checkoutData
        return !!(shippingAddress && (billingAddress || shippingAddress))
      },

      canProceedToPayment: () => {
        const { shippingMethod } = get().checkoutData
        return !!shippingMethod
      },

      canProceedToReview: () => {
        const { paymentMethod } = get().checkoutData
        
        // If payment method requires proof, check if proof is uploaded
        if (paymentMethod?.requiresProof) {
          const { paymentProof } = get().checkoutData
          return !!paymentProof
        }
        
        return !!paymentMethod
      },

      isCheckoutComplete: () => {
        const {
          shippingAddress,
          billingAddress,
          shippingMethod,
          paymentMethod,
          paymentProof,
        } = get().checkoutData
        
        const hasAddresses = !!(shippingAddress && billingAddress)
        const hasShipping = !!shippingMethod
        const hasPayment = !!paymentMethod
        
        // If payment requires proof, check it
        const hasRequiredProof = paymentMethod?.requiresProof
          ? !!paymentProof
          : true
        
        return hasAddresses && hasShipping && hasPayment && hasRequiredProof
      },
    }),
    {
      name: 'checkout-storage', // localStorage key
      partialize: (state) => ({
        // Only persist essential data
        checkoutData: {
          step: state.checkoutData.step,
          shippingAddress: state.checkoutData.shippingAddress,
          billingAddress: state.checkoutData.billingAddress,
          shippingMethod: state.checkoutData.shippingMethod,
          paymentMethod: state.checkoutData.paymentMethod,
          orderNotes: state.checkoutData.orderNotes,
          // Don't persist payment proof for security
          // Will be re-uploaded if needed
        },
      }),
    }
  )
)

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to get current step info
 */
export function useCheckoutStep() {
  const step = useCheckoutStore((state) => state.checkoutData.step)
  const setStep = useCheckoutStore((state) => state.setStep)
  const nextStep = useCheckoutStore((state) => state.nextStep)
  const previousStep = useCheckoutStore((state) => state.previousStep)
  
  return { step, setStep, nextStep, previousStep }
}

/**
 * Hook to get address info
 */
export function useCheckoutAddress() {
  const shippingAddress = useCheckoutStore(
    (state) => state.checkoutData.shippingAddress
  )
  const billingAddress = useCheckoutStore(
    (state) => state.checkoutData.billingAddress
  )
  const setShippingAddress = useCheckoutStore(
    (state) => state.setShippingAddress
  )
  const setBillingAddress = useCheckoutStore(
    (state) => state.setBillingAddress
  )
  const setUseSameAddress = useCheckoutStore(
    (state) => state.setUseSameAddress
  )
  
  return {
    shippingAddress,
    billingAddress,
    setShippingAddress,
    setBillingAddress,
    setUseSameAddress,
  }
}

/**
 * Hook to get shipping info
 */
export function useCheckoutShipping() {
  const shippingMethod = useCheckoutStore(
    (state) => state.checkoutData.shippingMethod
  )
  const setShippingMethod = useCheckoutStore(
    (state) => state.setShippingMethod
  )
  
  return { shippingMethod, setShippingMethod }
}

/**
 * Hook to get payment info
 */
export function useCheckoutPayment() {
  const paymentMethod = useCheckoutStore(
    (state) => state.checkoutData.paymentMethod
  )
  const paymentProof = useCheckoutStore(
    (state) => state.checkoutData.paymentProof
  )
  const setPaymentMethod = useCheckoutStore(
    (state) => state.setPaymentMethod
  )
  const setPaymentProof = useCheckoutStore((state) => state.setPaymentProof)
  
  return {
    paymentMethod,
    paymentProof,
    setPaymentMethod,
    setPaymentProof,
  }
}

/**
 * Hook to get validation status
 */
export function useCheckoutValidation() {
  const canProceedToShipping = useCheckoutStore(
    (state) => state.canProceedToShipping()
  )
  const canProceedToPayment = useCheckoutStore(
    (state) => state.canProceedToPayment()
  )
  const canProceedToReview = useCheckoutStore(
    (state) => state.canProceedToReview()
  )
  const isCheckoutComplete = useCheckoutStore(
    (state) => state.isCheckoutComplete()
  )
  
  return {
    canProceedToShipping,
    canProceedToPayment,
    canProceedToReview,
    isCheckoutComplete,
  }
}
