import { NextResponse } from 'next/server'
import { uploadPaymentProof } from '@/lib/api/cloudinary'
import { requireAuth } from '@/lib/auth/server'
import type { CloudinaryUploadResponse, PaymentProof } from '@/types'

/**
 * POST /api/checkout/upload-payment-proof
 * 
 * Upload payment proof image to Cloudinary
 * 
 * Request body (multipart/form-data):
 * - image: File
 * - amount: number
 * - orderId: string (optional)
 */
export async function POST(request: Request) {
  try {
    // Guest checkout allowed - no auth required
    // await requireAuth()

    // Parse form data
    const formData = await request.formData()
    const image = formData.get('image') as File
    const amount = parseFloat(formData.get('amount') as string)
    const orderId = formData.get('orderId') as string | null
    
    // Validate image
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'يرجى اختيار صورة' },
        { status: 400 }
      )
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'المبلغ غير صحيح' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'نوع الملف غير مدعوم',
          message: 'يرجى اختيار صورة (JPG, PNG, WEBP)',
        },
        { status: 400 }
      )
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (image.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'حجم الصورة كبير جداً',
          message: 'الحد الأقصى 5MB',
        },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const uploadResult: CloudinaryUploadResponse = await uploadPaymentProof(
      image,
      orderId || undefined
    )
    
    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'فشل رفع الصورة',
          message: uploadResult.error,
        },
        { status: 500 }
      )
    }

    // Create payment proof object
    const paymentProof: PaymentProof = {
      imageUrl: uploadResult.url!,
      publicId: uploadResult.publicId!,
      uploadedAt: new Date().toISOString(),
      amount,
    }

    return NextResponse.json({
      success: true,
      data: paymentProof,
      message: 'تم رفع إثبات الدفع بنجاح',
    })
  } catch (error) {
    console.error('Upload payment proof API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في رفع إثبات الدفع',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع',
      },
      { status: 500 }
    )
  }
}
