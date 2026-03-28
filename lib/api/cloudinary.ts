import { v2 as cloudinary } from 'cloudinary'
import type { CloudinaryUploadResponse } from '@/types'

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ============================================
// UPLOAD FUNCTIONS
// ============================================

/**
 * Upload payment proof image to Cloudinary
 * This runs on the server side (API route)
 */
export async function uploadPaymentProof(
  file: File | Buffer | string,
  orderId?: string
): Promise<CloudinaryUploadResponse> {
  try {
    // Validate Cloudinary credentials
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return {
        success: false,
        error: 'Cloudinary credentials not configured',
      }
    }

    // Convert File to base64 if needed
    let uploadSource: string
    
    if (file instanceof File) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      uploadSource = `data:${file.type};base64,${base64}`
    } else if (Buffer.isBuffer(file)) {
      uploadSource = `data:image/jpeg;base64,${file.toString('base64')}`
    } else {
      uploadSource = file // Already a base64 or URL string
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: 'payment-proofs',
      public_id: orderId ? `order-${orderId}-${Date.now()}` : `payment-${Date.now()}`,
      resource_type: 'image',
      format: 'jpg',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limit max size
        { quality: 'auto:good' }, // Auto quality
      ],
      tags: ['payment-proof', 'instapay'],
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل رفع الصورة',
    }
  }
}

/**
 * Delete payment proof image from Cloudinary
 */
export async function deletePaymentProof(
  publicId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل حذف الصورة',
    }
  }
}

/**
 * Upload from base64 string (client-side usage)
 */
export async function uploadBase64Image(
  base64: string,
  orderId?: string
): Promise<CloudinaryUploadResponse> {
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'payment-proofs',
      public_id: orderId ? `order-${orderId}-${Date.now()}` : `payment-${Date.now()}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
      ],
      tags: ['payment-proof', 'instapay'],
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل رفع الصورة',
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Get Cloudinary URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations?: {
    width?: number
    height?: number
    crop?: string
    quality?: string
  }
): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  
  if (!cloudName) {
    return ''
  }
  
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
  
  if (!transformations) {
    return `${baseUrl}/${publicId}`
  }
  
  const { width, height, crop, quality } = transformations
  const transforms: string[] = []
  
  if (width || height) {
    transforms.push(`w_${width || 'auto'},h_${height || 'auto'}`)
  }
  if (crop) {
    transforms.push(`c_${crop}`)
  }
  if (quality) {
    transforms.push(`q_${quality}`)
  }
  
  const transformString = transforms.length > 0 ? `${transforms.join(',')}/` : ''
  
  return `${baseUrl}/${transformString}${publicId}`
}

/**
 * Validate image before upload
 */
export function validateImageForUpload(file: File): {
  valid: boolean
  error?: string
} {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WEBP)',
    }
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'حجم الصورة كبير جداً. الحد الأقصى 5MB',
    }
  }
  
  return { valid: true }
}

/**
 * Generate unsigned upload parameters (for client-side uploads)
 * Note: You need to generate upload preset in Cloudinary dashboard
 */
export function getUnsignedUploadParams() {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'payment_proofs',
    folder: 'payment-proofs',
  }
}
