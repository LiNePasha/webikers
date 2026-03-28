import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية - WeBikers',
  description: 'سياسة الخصوصية وحماية البيانات في متجر WeBikers. نحن ملتزمون بحماية خصوصيتك',
  keywords: 'سياسة الخصوصية, حماية البيانات, الأمان, Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 bg-gray-50" dir="rtl">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 text-5xl rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            🔒
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            سياسة الخصوصية
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية
          </p>
          <p className="mt-2 text-sm text-gray-500">
            آخر تحديث: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="p-8 bg-white shadow-lg md:p-12 rounded-3xl">
          <div className="prose prose-lg max-w-none">
            
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">المقدمة</h2>
              <p className="leading-relaxed text-gray-700">
                نحن في <strong>WeBikers</strong> نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. 
                توضح هذه السياسة كيفية جمعنا واستخدامنا وحماية معلوماتك عند استخدام موقعنا الإلكتروني.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">البيانات التي نجمعها</h2>
              <div className="p-6 border-r-4 border-blue-500 bg-blue-50 rounded-xl">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">•</span>
                    <span><strong>المعلومات الشخصية:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، العنوان</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">•</span>
                    <span><strong>معلومات الطلب:</strong> تفاصيل المنتجات، طرق الدفع، تاريخ الشراء</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">•</span>
                    <span><strong>بيانات التصفح:</strong> عنوان IP، نوع المتصفح، صفحات الزيارة</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">كيف نستخدم بياناتك</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-green-600 bg-green-100 rounded-full">✓</span>
                  <span>معالجة وإتمام طلباتك</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-green-600 bg-green-100 rounded-full">✓</span>
                  <span>التواصل معك بخصوص الطلبات والعروض</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-green-600 bg-green-100 rounded-full">✓</span>
                  <span>تحسين خدماتنا وتجربة المستخدم</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-green-600 bg-green-100 rounded-full">✓</span>
                  <span>الامتثال للمتطلبات القانونية</span>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">حماية بياناتك</h2>
              <p className="mb-4 leading-relaxed text-gray-700">
                نطبق إجراءات أمنية صارمة لحماية معلوماتك الشخصية:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-xl">
                  <h3 className="mb-2 font-bold text-gray-900">🔐 تشفير SSL</h3>
                  <p className="text-sm text-gray-700">جميع البيانات المنقولة مشفرة</p>
                </div>
                <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-xl">
                  <h3 className="mb-2 font-bold text-gray-900">🛡️ خوادم آمنة</h3>
                  <p className="text-sm text-gray-700">تخزين محمي بجدران نارية</p>
                </div>
                <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-xl">
                  <h3 className="mb-2 font-bold text-gray-900">👥 وصول محدود</h3>
                  <p className="text-sm text-gray-700">فقط الموظفون المصرح لهم</p>
                </div>
                <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-xl">
                  <h3 className="mb-2 font-bold text-gray-900">💳 دفع آمن</h3>
                  <p className="text-sm text-gray-700">معالجة الدفع عبر بوابات معتمدة</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">مشاركة البيانات</h2>
              <div className="p-6 border-2 border-yellow-200 bg-yellow-50 rounded-xl">
                <p className="mb-3 text-gray-700">
                  <strong>لا نبيع أو نؤجر</strong> معلوماتك الشخصية لأي طرف ثالث.
                </p>
                <p className="text-gray-700">
                  قد نشارك البيانات فقط مع:
                </p>
                <ul className="mt-3 space-y-2 text-gray-700">
                  <li>• شركات الشحن لتوصيل طلباتك</li>
                  <li>• بوابات الدفع الإلكتروني لمعالجة المدفوعات</li>
                  <li>• الجهات القانونية عند الضرورة القانونية</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">حقوقك</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <strong>الوصول:</strong> يمكنك طلب نسخة من بياناتك الشخصية
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✏️</span>
                  <div>
                    <strong>التصحيح:</strong> يمكنك تحديث أو تصحيح بياناتك في أي وقت
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🗑️</span>
                  <div>
                    <strong>الحذف:</strong> يمكنك طلب حذف بياناتك (وفقاً للقوانين المعمول بها)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🚫</span>
                  <div>
                    <strong>الاعتراض:</strong> يمكنك الاعتراض على معالجة بياناتك لأغراض تسويقية
                  </div>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">ملفات تعريف الارتباط (Cookies)</h2>
              <p className="leading-relaxed text-gray-700">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك التحكم في الكوكيز من إعدادات متصفحك.
                استخدامنا للكوكيز يشمل:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• تذكر تفضيلاتك</li>
                <li>• تتبع عناصر السلة</li>
                <li>• تحليل استخدام الموقع</li>
                <li>• عرض إعلانات مخصصة</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">التعديلات على السياسة</h2>
              <p className="leading-relaxed text-gray-700">
                قد نقوم بتحديث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني
                أو عبر إشعار على الموقع.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">تواصل معنا</h2>
              <div className="p-6 text-white bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl">
                <p className="mb-4">
                  لأي استفسارات بخصوص سياسة الخصوصية، يمكنك التواصل معنا:
                </p>
                <ul className="space-y-2">
                  <li>📧 البريد: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@webikers.com'}</li>
                  <li>📱 الهاتف: {process.env.NEXT_PUBLIC_CONTACT_PHONE || '01030351075'}</li>
                </ul>
                <Link href="/help" className="inline-block px-6 py-2 mt-4 font-bold text-gray-900 transition-colors bg-white rounded-lg hover:bg-gray-100">
                  مركز المساعدة
                </Link>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  )
}
