'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { TermsContent } from '@/lib/content/terms-content'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[95vh] bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-white border-b border-gray-200 md:p-4">
          <h2 className="text-base font-bold text-white md:text-xl">
            الشروط والأحكام
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="إغلاق"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-3 overflow-y-auto max-h-[calc(95vh-120px)] md:p-5">
          <TermsContent />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-3 bg-white border-t border-gray-200 md:p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-bold text-white transition-all bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-lg md:text-base md:py-3"
          >
            فهمت، إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
