import { z } from 'zod'

// ============================================
// VALIDATION REGEX PATTERNS
// ============================================

const phoneRegex = /^(010|011|012|015)\d{8}$/
const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ============================================
// ADDRESS VALIDATION SCHEMAS
// ============================================

/**
 * Shipping Address Schema
 */
export const shippingAddressSchema = z.object({
  firstName: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم طويل جداً'),
  
  lastName: z
    .string()
    .optional(),
  // No validation for lastName - it's optional now
  
  phone: z
    .string()
    .regex(egyptianPhoneRegex, 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 010, 011, 012, أو 015)'),
  
  city: z.string().min(1, 'يرجى اختيار المدينة'),
  cityName: z.string().optional(),
  
  district: z.string().min(1, 'يرجى اختيار المنطقة'),
  districtName: z.string().optional(),
  
  address: z
    .string()
    .min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل')
    .max(200, 'العنوان طويل جداً'),
  
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  landmark: z.string().optional(),
  
  isDefault: z.boolean().optional().default(false),
})

/**
 * Billing Address Schema
 */
export const billingAddressSchema = z.object({
  firstName: z
    .string()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم الأول طويل جداً'),
  
  lastName: z
    .string()
    .optional(), // Make optional like shipping address
  
  phone: z
    .string()
    .regex(egyptianPhoneRegex, 'رقم الهاتف غير صحيح'),
  
  email: z
    .string()
    .regex(emailRegex, 'البريد الإلكتروني غير صحيح')
    .optional()
    .or(z.literal('')),
  
  city: z.string().min(1, 'يرجى اختيار المدينة'),
  cityName: z.string().optional(), // Add cityName
  district: z.string().min(1, 'يرجى اختيار المنطقة'),
  districtName: z.string().optional(), // Add districtName
  
  address: z
    .string()
    .min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل')
    .max(200, 'العنوان طويل جداً'),
  
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
})

// ============================================
// SAVED ADDRESS VALIDATION
// ============================================

/**
 * Saved Address Schema
 */
export const savedAddressSchema = shippingAddressSchema.extend({
  id: z.string().optional(),
  type: z.enum(['shipping', 'billing']).default('shipping'),
  createdAt: z.string().optional(),
})

// ============================================
// SHIPPING CALCULATION VALIDATION
// ============================================

/**
 * Bosta Shipping Request Schema
 */
export const bostaShippingRequestSchema = z.object({
  city: z.string().min(1, 'المدينة مطلوبة'),
  district: z.string().min(1, 'المنطقة مطلوبة'),
  weight: z.number().min(0.1, 'الوزن يجب أن يكون أكبر من صفر'),
  cod: z.boolean().optional().default(false),
  codAmount: z.number().optional(),
})

/**
 * Validate COD amount if COD is enabled
 */
export const bostaShippingRequestWithCODSchema = bostaShippingRequestSchema.refine(
  (data) => {
    if (data.cod && (!data.codAmount || data.codAmount <= 0)) {
      return false
    }
    return true
  },
  {
    message: 'مبلغ الدفع عند الاستلام مطلوب',
    path: ['codAmount'],
  }
)

// ============================================
// PAYMENT VALIDATION
// ============================================

/**
 * Payment Proof Upload Schema
 */
export const paymentProofSchema = z.object({
  imageUrl: z.string().url('رابط الصورة غير صحيح'),
  publicId: z.string().min(1, 'معرف الصورة مطلوب'),
  uploadedAt: z.string(),
  amount: z.number().min(1, 'المبلغ يجب أن يكون أكبر من صفر'),
})

/**
 * Instapay Payment Schema
 */
export const instapayPaymentSchema = z.object({
  amount: z.number().min(1, 'المبلغ يجب أن يكون أكبر من صفر'),
  image: z.instanceof(File, { message: 'يرجى اختيار صورة' }),
})

/**
 * Validate image file type
 */
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return allowedTypes.includes(file.type)
}

/**
 * Validate image file size (max 5MB)
 */
export const validateImageSize = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  return file.size <= maxSize
}

/**
 * Complete image validation
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  if (!validateImageFile(file)) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WEBP)',
    }
  }
  
  if (!validateImageSize(file)) {
    return {
      valid: false,
      error: 'حجم الصورة كبير جداً. الحد الأقصى 5MB',
    }
  }
  
  return { valid: true }
}

// ============================================
// ORDER CREATION VALIDATION
// ============================================

/**
 * Order Line Item Schema
 */
export const orderLineItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  variation_id: z.number().int().optional(),
})

/**
 * Order Shipping Line Schema
 */
export const orderShippingLineSchema = z.object({
  method_id: z.string().min(1, 'معرف طريقة الشحن مطلوب'),
  method_title: z.string().min(1, 'اسم طريقة الشحن مطلوب'),
  total: z.string().or(z.number()),
})

/**
 * Order Meta Data Schema
 */
export const orderMetaDataSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
})

/**
 * Create Order Request Schema
 */
export const createOrderRequestSchema = z.object({
  customerId: z.number().int().positive().optional(), // Optional for guest checkout
  
  paymentMethod: z.string().min(1, 'طريقة الدفع مطلوبة'),
  paymentMethodTitle: z.string().min(1, 'اسم طريقة الدفع مطلوب'),
  
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema,
  
  lineItems: z.array(orderLineItemSchema).min(1, 'يجب أن يحتوي الطلب على منتج واحد على الأقل'),
  
  shippingLines: z.array(orderShippingLineSchema).min(1, 'طريقة الشحن مطلوبة'),
  
  customerNote: z.string().optional(),
  
  metaData: z.array(orderMetaDataSchema).optional(),
  
  paymentProof: paymentProofSchema.optional(),
  
  totalWeight: z.number().min(0.1, 'الوزن الكلي مطلوب'),
  
  vendorId: z.number().int().positive().optional(), // Vendor ID for parent_id
})

// ============================================
// CHECKOUT FLOW VALIDATION
// ============================================

/**
 * Validate if user can proceed to shipping step
 */
export const canProceedToShippingSchema = z.object({
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema.nullable(),
})

/**
 * Validate if user can proceed to payment step
 */
export const canProceedToPaymentSchema = z.object({
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema.nullable(),
  shippingMethod: z.object({
    id: z.string(),
    title: z.string(),
    cost: z.number(),
  }),
})

/**
 * Validate if user can proceed to review step
 */
export const canProceedToReviewSchema = z.object({
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema.nullable(),
  shippingMethod: z.object({
    id: z.string(),
    title: z.string(),
    cost: z.number(),
  }),
  paymentMethod: z.object({
    id: z.string(),
    title: z.string(),
    requiresProof: z.boolean(),
  }),
  paymentProof: paymentProofSchema.optional().nullable(),
})

/**
 * Complete checkout validation
 */
export const completeCheckoutValidationSchema = canProceedToReviewSchema.refine(
  (data) => {
    // If payment requires proof, it must be present
    if (data.paymentMethod.requiresProof && !data.paymentProof) {
      return false
    }
    return true
  },
  {
    message: 'إثبات الدفع مطلوب لهذه الطريقة',
    path: ['paymentProof'],
  }
)

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safe parse with error handling
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true, data: result.data }
    }
    return { success: false, errors: result.error }
  } catch (error) {
    return {
      success: false,
      errors: new z.ZodError([
        {
          code: 'custom',
          message: 'حدث خطأ أثناء التحقق من البيانات',
          path: [],
        },
      ]),
    }
  }
}

/**
 * Format Zod errors to Arabic messages
 */
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}
  
  errors.issues.forEach((error) => {
    const path = error.path.join('.')
    formatted[path] = error.message
  })
  
  return formatted
}

/**
 * Get first error message from Zod error
 */
export function getFirstError(errors: z.ZodError): string {
  return errors.issues[0]?.message || 'حدث خطأ في البيانات المدخلة'
}
