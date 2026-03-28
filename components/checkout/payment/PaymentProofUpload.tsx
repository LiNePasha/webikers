'use client'

import { useState, useRef } from 'react'
import { CloudArrowUpIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import OptimizedImage from '@/components/ui/OptimizedImage'
import toast from 'react-hot-toast'
import type { PaymentProof } from '@/types'
import { safeFetch } from '@/lib/utils/safeFetch'

interface PaymentProofUploadProps {
  amount: number
  onUploadSuccess: (proof: PaymentProof) => void
  onRemove?: () => void
  existingProof?: PaymentProof
}

export default function PaymentProofUpload({
  amount,
  onUploadSuccess,
  onRemove,
  existingProof,
}: PaymentProofUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingProof?.imageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WEBP)')
      return
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5MB')
      return
    }
    
    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    // Upload to server
    await uploadFile(file)
  }
  
  const uploadFile = async (file: File) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('amount', amount.toString())
      
      const { data, error: fetchError } = await safeFetch<{
        success: boolean
        data?: PaymentProof
        error?: string
      }>('/api/checkout/upload-payment-proof', {
        method: 'POST',
        body: formData,
      })
      
      if (fetchError || !data) {
        toast.error(fetchError || 'فشل رفع الصورة')
        setPreview(null)
        return
      }
      
      if (data.success && data.data) {
        toast.success('تم رفع إثبات الدفع بنجاح')
        onUploadSuccess(data.data)
      } else {
        toast.error(data.error || 'فشل رفع الصورة')
        setPreview(null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('حدث خطأ أثناء رفع الصورة')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }
  
  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
  }
  
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!preview && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 text-center transition-all border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-brand-500 hover:bg-brand-50"
        >
          <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            ارفع صورة إثبات الدفع
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            اضغط لاختيار الصورة أو اسحبها هنا
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG أو WEBP (الحد الأقصى 5MB)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
      
      {/* Preview */}
      {preview && (
        <div className="relative overflow-hidden border-2 border-green-500 rounded-lg">
          {/* Image */}
          <div className="relative w-full h-64 bg-gray-100">
            <OptimizedImage
              src={preview || '/images/placeholder.png'}
              alt="Payment proof"
              fill
              className="object-contain"
            />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-white">
                <CheckCircleIcon className="w-6 h-6" />
                <span className="font-medium">
                  {uploading ? 'جاري الرفع...' : 'تم الرفع بنجاح'}
                </span>
              </div>
              
              {!uploading && (
                <button
                  onClick={handleRemove}
                  className="p-2 text-white transition-colors bg-red-500 rounded-full hover:bg-red-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Loading Overlay */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full animate-spin border-brand-500 border-t-transparent" />
                <p className="font-medium text-gray-700">جاري رفع الصورة...</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Amount Display */}
      <div className="p-4 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">صورة إثبات دفع:</span>
          <span className="text-2xl font-bold text-brand-600">
            {Math.round(amount)} جنيه
          </span>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h4 className="mb-2 font-medium text-blue-900">تعليمات الدفع:</h4>
        <ol className="space-y-1 text-xs text-blue-800 list-decimal list-inside md:text-sm">
          <li>قم بتحويل المبلغ إلى المحفظة أو Instapay</li>
          <li>التقط صورة واضحة لإثبات التحويل</li>
          <li>ارفع الصورة هنا للتأكيد</li>
          <li>سيتم مراجعة الدفع فورا والتواصل معك</li>
        </ol>
      </div>
    </div>
  )
}
