import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export const TermsContent = () => {
  return (
    <div className="space-y-3 md:space-y-4">
      {/* Introduction */}
      {/* <div className="p-2.5 border-r-4 bg-blue-50 border-brand-500 rounded-lg md:p-3">
        <p className="text-xs leading-relaxed text-gray-700 md:text-sm">
          مرحبًا بك في متجرنا! بإتمامك لعملية الشراء، فأنت توافق على الالتزام بالشروط والأحكام التالية.
        </p>
      </div> */}

      {/* Return & Exchange */}
      <div>
        <h2 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 md:text-base">
          <XCircleIcon className="w-4 h-4 text-red-600 md:w-5 md:h-5" />
          سياسة الاسترجاع والاستبدال
        </h2>
        <div className="p-2.5 space-y-1.5 border-2 border-red-200 bg-red-50 rounded-lg md:p-3 md:space-y-2">
          <p className="text-xs font-bold text-red-900 md:text-sm">⚠️ منتجات لا تقبل الاسترجاع:</p>
          <ul className="pr-4 space-y-1 text-xs text-gray-700 list-disc">
            <li>المنتجات الكهربائية والإلكترونية</li>
            <li>قطع الغيار المستخدمة</li>
            <li>المنتجات التالفة بسبب سوء الاستخدام</li>
          </ul>
          <p className="pt-1.5 text-xs font-bold text-green-900 md:text-sm">✅ حالات الاسترجاع المقبولة:</p>
          <ul className="pr-4 space-y-1 text-xs text-gray-700 list-disc">
            <li>عيب تصنيع (خلال 7 أيام)</li>
            <li>خطأ في الطلب من المتجر</li>
            <li>المنتج لم يتم فتح عبوته (3 أيام)</li>
          </ul>
        </div>
      </div>

      {/* Shipping */}
      <div>
        <h2 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 md:text-base">
          <span>🚚</span>
          الشحن والتوصيل
        </h2>
        <div className="p-2.5 space-y-1.5 border border-gray-200 rounded-lg md:p-3">
          <p className="text-xs text-gray-700"><span className="font-semibold">⏱ أيام:</span> 1-2 (القاهرة والجيزة )   باقي المحافظات 2-4</p>
          <p className="text-xs text-gray-700"><span className="font-semibold">💰 التكلفة:</span> حسب الوزن والمنطقة</p>
          <p className="text-xs text-gray-700"><span className="font-semibold">✋ مهم:</span> فحص المنتج عند الاستلام</p>
        </div>
      </div>

      {/* Payment */}
      <div>
        <h2 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 md:text-base">
          <span>💳</span>
          طرق الدفع
        </h2>
        <div className="p-2.5 space-y-1.5 border border-gray-200 rounded-lg md:p-3">
          <p className="text-xs text-gray-700">• التحويل البنكي / المحفظة (مع رفع إثبات)</p>
        </div>
      </div>

      {/* Warranty */}
      <div>
        <h2 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 md:text-base">
          <span>🛡️</span>
          الضمان
        </h2>
        <div className="p-2.5 space-y-1 border-2 border-purple-200 bg-purple-50 rounded-lg md:p-3">
          <p className="text-xs text-gray-700">• بعض المنتجات بضمان المصنع</p>
          <p className="text-xs text-gray-700">• لا يشمل سوء الاستخدام</p>
          <p className="text-xs text-gray-700">• يلزم الفاتورة للمطالبة</p>
        </div>
      </div>

      {/* Privacy */}
      <div>
        <h2 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 md:text-base">
          <span>🔒</span>
          الخصوصية
        </h2>
        <div className="p-2.5 space-y-1 border-2 border-blue-200 bg-blue-50 rounded-lg md:p-3">
          <p className="text-xs text-gray-700">• نحترم خصوصيتك ونحمي بياناتك</p>
          <p className="text-xs text-gray-700">• لا مشاركة مع أطراف ثالثة</p>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h2 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 md:text-base">
          <span>📞</span>
          خدمة العملاء
        </h2>
        <div className="p-2.5 border-2 border-yellow-200 bg-yellow-50 rounded-lg md:p-3">
          <div className="space-y-1 text-xs">
            <p>📧 <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'spare2appeg@gmail.com'}`} className="underline text-brand-600">{process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'spare2appeg@gmail.com'}</a></p>
            <p>📱 <a href={`tel:+2${process.env.NEXT_PUBLIC_CONTACT_PHONE || '01025338973'}`} className="underline text-brand-600">{process.env.NEXT_PUBLIC_CONTACT_PHONE || '01025338973'}</a></p>
            <p>🕐 احنا موجودين 24 ساعة</p>
          </div>
        </div>
      </div>
    </div>
  )
}
