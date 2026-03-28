'use client'

import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { TermsContent } from '@/lib/content/terms-content'

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50" dir="rtl">
      <div className="container max-w-5xl px-4 mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600">
              <ShieldCheckIcon className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            الشروط والأحكام
          </h1>
          <p className="text-lg text-gray-600">
            يُرجى قراءة هذه الشروط بعناية قبل إتمام عملية الشراء
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <span>آخر تحديث:</span>
            <span className="font-semibold">نوفمبر 2024</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 bg-white shadow-2xl md:p-12 rounded-3xl">
          <TermsContent />
          
          {/* Final Note */}
          <section className="p-8 mt-10 border-4 bg-gradient-to-r from-brand-500 to-purple-600 border-brand-600 rounded-2xl">
            <div className="text-center text-white">
              <h2 className="mb-4 text-3xl font-bold">
                شكرًا لثقتك بنا! 🙏
              </h2>
              <p className="text-lg leading-relaxed">
                بإتمامك للطلب، فأنت توافق على جميع الشروط والأحكام المذكورة أعلاه.
                نحن ملتزمون بتقديم أفضل خدمة لك ونتطلع لخدمتك دائمًا.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
