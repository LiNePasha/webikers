import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'سياسة الاستخدام - WeBikers',
  description: 'شروط وسياسة استخدام موقع WeBikers. قواعد وإرشادات استخدام المتجر الإلكتروني',
  keywords: 'سياسة الاستخدام, شروط الاستخدام, قواعد الموقع, Terms of Use',
}

export default function UsagePolicyPage() {
  return (
    <div className="min-h-screen py-12 bg-gray-50" dir="rtl">
      <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 text-5xl rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            📜
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            سياسة الاستخدام
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            شروط وقواعد استخدام متجر WeBikers الإلكتروني
          </p>
        </div>

        <div className="p-8 bg-white shadow-lg md:p-12 rounded-3xl">
          <div className="prose prose-lg max-w-none">
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">قبول الشروط</h2>
              <div className="bg-brand-50 border-r-4 border-brand-500 p-6 rounded-xl">
                <p className="text-gray-700 leading-relaxed">
                  باستخدامك لموقع <strong>WeBikers</strong>، فإنك توافق على الالتزام بهذه الشروط والأحكام.
                  إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام الموقع.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الاستخدام المسموح</h2>
              <div className="space-y-4">
                {[
                  'تصفح المنتجات والخدمات المتاحة',
                  'إنشاء حساب شخصي والحفاظ على سرية معلوماته',
                  'إجراء عمليات الشراء وفقاً للشروط المحددة',
                  'التواصل مع خدمة العملاء للاستفسارات',
                  'مشاركة المحتوى بطرق مشروعة',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <span className="flex-shrink-0 text-2xl">✅</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الاستخدام الممنوع</h2>
              <div className="space-y-4">
                {[
                  'استخدام الموقع لأغراض غير قانونية أو احتيالية',
                  'محاولة اختراق الموقع أو الوصول غير المصرح به',
                  'نشر محتوى مسيء أو غير لائق',
                  'انتحال شخصية أشخاص أو جهات أخرى',
                  'استخدام برامج آلية (bots) لجمع البيانات',
                  'إعادة بيع المنتجات دون تصريح مسبق',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <span className="flex-shrink-0 text-2xl">❌</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الحسابات المستخدمين</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-xl">🔑</span>
                  <div>
                    <strong>مسؤولية الحساب:</strong> أنت مسؤول عن الحفاظ على سرية معلومات حسابك
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">👤</span>
                  <div>
                    <strong>معلومات دقيقة:</strong> يجب تقديم معلومات صحيحة وحديثة عند التسجيل
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🚫</span>
                  <div>
                    <strong>حساب واحد:</strong> يُسمح بحساب واحد لكل شخص، ما لم يُصرح بخلاف ذلك
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <strong>الإبلاغ:</strong> يجب إبلاغنا فوراً في حالة الاستخدام غير المصرح به لحسابك
                  </div>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الملكية الفكرية</h2>
              <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <p className="text-gray-700 mb-4">
                  جميع المحتويات على الموقع (نصوص، صور، شعارات، رموز) هي ملكية <strong>WeBikers</strong>
                  ومحمية بموجب قوانين حقوق الملكية الفكرية.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• لا يجوز نسخ أو توزيع المحتوى دون إذن كتابي</li>
                  <li>• يمكن مشاركة روابط المنتجات لأغراض شخصية</li>
                  <li>• استخدام الشعارات والعلامات التجارية محظور تماماً</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الأسعار والمدفوعات</h2>
              <div className="space-y-4">
                <div className="p-5 bg-blue-50 border-r-4 border-blue-500 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">💰 الأسعار</h3>
                  <p className="text-gray-700">
                    جميع الأسعار بالجنيه المصري وشاملة ضريبة القيمة المضافة. نحتفظ بالحق في تعديل الأسعار في أي وقت.
                  </p>
                </div>
                <div className="p-5 bg-blue-50 border-r-4 border-blue-500 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">💳 المدفوعات</h3>
                  <p className="text-gray-700">
                    جميع المدفوعات يجب أن تتم عبر الطرق المعتمدة. أي محاولة دفع احتيالية ستؤدي لإيقاف الحساب.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">إخلاء المسؤولية</h2>
              <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0">⚠️</span>
                    <span>الموقع متاح "كما هو" دون أي ضمانات صريحة أو ضمنية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0">⚠️</span>
                    <span>لا نضمن عدم انقطاع الخدمة أو خلوها من الأخطاء</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0">⚠️</span>
                    <span>لسنا مسؤولين عن أي أضرار ناتجة عن استخدام الموقع</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0">⚠️</span>
                    <span>المعلومات المقدمة للإرشاد فقط وقابلة للتغيير</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">إنهاء الخدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بالحق في تعليق أو إنهاء وصولك إلى الموقع في أي وقت، دون إشعار مسبق، 
                في حالة انتهاك هذه الشروط أو لأي سبب آخر نراه مناسباً.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">القانون الحاكم</h2>
              <p className="text-gray-700 leading-relaxed">
                تخضع هذه الشروط وتُفسر وفقاً لقوانين جمهورية مصر العربية. 
                أي نزاع ينشأ عن استخدام الموقع يخضع للاختصاص الحصري للمحاكم المصرية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التواصل</h2>
              <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl">
                <p className="mb-4">
                  لأي استفسارات حول سياسة الاستخدام:
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/help" className="px-6 py-2 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                    مركز المساعدة
                  </Link>
                  <Link href="/terms-and-conditions" className="px-6 py-2 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-gray-900 transition-colors">
                    الشروط والأحكام
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  )
}
