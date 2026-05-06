'use client'

import { useState } from 'react'

const WHATSAPP_NUMBER = '201030351075'

interface Job {
  id: string
  title: string
  department: string
  type: 'full-time' | 'part-time' | 'freelance'
  location: string
  icon: string
  description: string
  requirements: string[]
}

const jobs: Job[] = [
  {
    id: 'social-media',
    title: 'مسؤول سوشيال ميديا',
    department: 'التسويق',
    type: 'full-time',
    location: 'القاهرة',
    icon: '📱',
    description: 'إدارة صفحات WeBikers على فيسبوك وإنستجرام وتيك توك وإنتاج محتوى جذاب لعشاق السكوترات.',
    requirements: [
      'خبرة لا تقل عن سنة في إدارة السوشيال ميديا',
      'إجادة التصميم على Canva أو Adobe',
      'كتابة محتوى إبداعي بالعربية',
      'معرفة بعالم السكوترات والموتوسيكلات ميزة',
    ],
  },
  {
    id: 'accountant',
    title: 'محاسب',
    department: 'المحاسبة والمالية',
    type: 'full-time',
    location: 'القاهرة',
    icon: '🧾',
    description: 'متابعة الحسابات اليومية والمبيعات والمشتريات وإعداد التقارير المالية الدورية.',
    requirements: [
      'بكالوريوس تجارة قسم محاسبة',
      'خبرة في برامج المحاسبة (مثل QuickBooks أو يوسف)',
      'دقة عالية في العمل وإتقان Excel',
    ],
  },
  {
    id: 'scooter-technician',
    title: 'فني صيانة سكوتر',
    department: 'الخدمة الفنية',
    type: 'full-time',
    location: 'القاهرة',
    icon: '🔧',
    description: 'صيانة وإصلاح السكوترات وتركيب قطع الغيار وتقديم الدعم الفني لعملاء WeBikers.',
    requirements: [
      'خبرة عملية في صيانة السكوترات',
      'إجادة تشخيص الأعطال الميكانيكية والكهربائية',
      'القدرة على العمل ضمن فريق',
    ],
  },
  {
    id: 'sales',
    title: 'مندوب مبيعات',
    department: 'المبيعات',
    type: 'full-time',
    location: 'القاهرة / الجيزة',
    icon: '🛍️',
    description: 'متابعة العملاء وإتمام صفقات البيع سواء أونلاين أو بالمتجر وتحقيق أهداف المبيعات الشهرية.',
    requirements: [
      'خبرة مبيعات لا تقل عن سنة',
      'مهارات تواصل عالية',
      'معرفة بقطع غيار السكوترات ميزة',
    ],
  },
  {
    id: 'content-creator',
    title: 'مصور ومونتير محتوى',
    department: 'التسويق',
    type: 'freelance',
    location: 'عن بُعد',
    icon: '🎬',
    description: 'تصوير ومونتاج فيديوهات تعليمية وإعلانية لقطع السكوترات لنشرها على يوتيوب وتيك توك.',
    requirements: [
      'إجادة التصوير والإضاءة',
      'إجادة مونتاج على Premiere أو DaVinci',
      'فهم محتوى السكوترات ميزة كبيرة',
    ],
  },
  {
    id: 'customer-service',
    title: 'موظف خدمة عملاء',
    department: 'خدمة العملاء',
    type: 'full-time',
    location: 'القاهرة',
    icon: '🎧',
    description: 'الرد على استفسارات العملاء عبر واتساب والهاتف ومتابعة الطلبات وحل المشاكل.',
    requirements: [
      'مهارات تواصل ممتازة',
      'قدرة على التعامل مع العملاء باحترافية',
      'سرعة في الاستجابة',
    ],
  },
  {
    id: 'delivery',
    title: 'موظف شحن وتوصيل',
    department: 'العمليات',
    type: 'full-time',
    location: 'القاهرة والجيزة',
    icon: '🚚',
    description: 'تجهيز الطلبات وتغليفها وتسليمها لشركات الشحن ومتابعة حالة التوصيل.',
    requirements: [
      'دقة في تجهيز الطلبات',
      'خبرة في التعامل مع شركات الشحن',
      'القدرة على العمل تحت ضغط',
    ],
  },
]

const typeLabels: Record<Job['type'], string> = {
  'full-time': 'دوام كامل',
  'part-time': 'دوام جزئي',
  'freelance': 'فريلانس',
}

const typeColors: Record<Job['type'], string> = {
  'full-time': 'bg-green-100 text-green-700',
  'part-time': 'bg-blue-100 text-blue-700',
  'freelance': 'bg-purple-100 text-purple-700',
}

export default function CareersPage() {
  const [selected, setSelected] = useState<string | null>(null)

  function buildWhatsAppMessage(job: Job): string {
    const msg = `مرحباً، اسمي [اكتب اسمك] وأود التقدم لوظيفة "${job.title}" في WeBikers.

القسم: ${job.department}
نوع الوظيفة: ${typeLabels[job.type]}
الموقع: ${job.location}

[اكتب نبذة مختصرة عن نفسك وخبرتك]

أرجو النظر في طلبي. شكراً 🙏`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
  }

  const selectedJob = jobs.find((j) => j.id === selected)

  return (
    <div className="min-h-screen bg-[#f6f6f9] py-12" dir="rtl">
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 text-5xl rounded-full bg-gradient-to-br from-[#db5f02] to-orange-400">
            💼
          </div>
          <h1 className="text-3xl font-black text-gray-900 md:text-4xl">وظائف WeBikers</h1>
          <p className="max-w-xl mx-auto mt-3 text-lg text-gray-600">
            انضم لفريق WeBikers — اختار الوظيفة المناسبة ليك وابعتلنا على واتساب مباشرة
          </p>
        </div>

        {/* Jobs grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => setSelected(job.id === selected ? null : job.id)}
              className={`text-right w-full transition-all rounded-2xl border-2 p-5 shadow-sm hover:shadow-md ${
                selected === job.id
                  ? 'border-[#db5f02] bg-orange-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-[#db5f02]'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl leading-none">{job.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-lg font-black text-gray-900">{job.title}</h2>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${typeColors[job.type]}`}>
                      {typeLabels[job.type]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{job.department} · {job.location}</p>
                  <p className="mt-2 text-sm leading-5 text-gray-700">{job.description}</p>
                </div>
              </div>

              {/* Expanded details */}
              {selected === job.id && (
                <div className="pt-4 mt-4 border-t border-orange-200">
                  <p className="mb-2 text-sm font-bold text-gray-800">المتطلبات:</p>
                  <ul className="space-y-1">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#db5f02]" />
                        {req}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={buildWhatsAppMessage(job)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 mt-5 px-5 py-3 text-sm font-black text-white bg-[#25D366] rounded-xl hover:bg-[#1ebe5d] transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.52 3.48A11.86 11.86 0 0012 0C5.37 0 0 5.37 0 12a11.93 11.93 0 001.64 6.06L0 24l6.12-1.6A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12a11.86 11.86 0 00-3.48-8.52zM12 22a9.93 9.93 0 01-5.07-1.39l-.36-.22-3.73.98.99-3.64-.24-.38A9.94 9.94 0 012 12C2 6.48 6.48 2 12 2a9.95 9.95 0 017.07 2.93A9.95 9.95 0 0122 12c0 5.52-4.48 10-10 10zm5.44-7.4c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07a8.16 8.16 0 01-2.4-1.48 9 9 0 01-1.66-2.07c-.17-.3 0-.46.13-.6s.3-.35.44-.52a2 2 0 00.3-.5.55.55 0 000-.52c-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57a1.1 1.1 0 00-.8.37 3.36 3.36 0 00-1.05 2.5 5.84 5.84 0 001.22 3.1 13.38 13.38 0 005.14 4.53c.72.31 1.28.5 1.71.64a4.12 4.12 0 001.9.12 3.08 3.08 0 002.02-1.43 2.5 2.5 0 00.17-1.43c-.07-.13-.27-.2-.57-.35z" />
                    </svg>
                    تقدم للوظيفة على واتساب
                  </a>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* CTA footer */}
        <div className="p-8 mt-10 text-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
          <h3 className="mb-2 text-xl font-black text-white">مش لاقي وظيفتك؟</h3>
          <p className="mb-5 text-gray-400">ابعتلنا CV بشكل عام وهنتواصل معاك لما يتوفر شاغر مناسب</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً، أود إرسال CV للانضمام لفريق WeBikers مستقبلاً. [اكتب اسمك ومجالك]')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold text-gray-900 transition-all bg-white rounded-xl hover:bg-gray-100"
          >
            <span>ابعت CV عام</span>
            <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.52 3.48A11.86 11.86 0 0012 0C5.37 0 0 5.37 0 12a11.93 11.93 0 001.64 6.06L0 24l6.12-1.6A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12a11.86 11.86 0 00-3.48-8.52zM12 22a9.93 9.93 0 01-5.07-1.39l-.36-.22-3.73.98.99-3.64-.24-.38A9.94 9.94 0 012 12C2 6.48 6.48 2 12 2a9.95 9.95 0 017.07 2.93A9.95 9.95 0 0122 12c0 5.52-4.48 10-10 10zm5.44-7.4c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07a8.16 8.16 0 01-2.4-1.48 9 9 0 01-1.66-2.07c-.17-.3 0-.46.13-.6s.3-.35.44-.52a2 2 0 00.3-.5.55.55 0 000-.52c-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57a1.1 1.1 0 00-.8.37 3.36 3.36 0 00-1.05 2.5 5.84 5.84 0 001.22 3.1 13.38 13.38 0 005.14 4.53c.72.31 1.28.5 1.71.64a4.12 4.12 0 001.9.12 3.08 3.08 0 002.02-1.43 2.5 2.5 0 00.17-1.43c-.07-.07-.27-.2-.57-.35z" />
            </svg>
          </a>
        </div>

      </div>

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل واتساب"
        className="fixed z-50 flex items-center justify-center w-14 h-14 text-white transition-transform bg-[#25D366] rounded-full shadow-lg left-6 bottom-6 hover:scale-105 hover:bg-[#1ebe5d]"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.52 3.48A11.86 11.86 0 0012 0C5.37 0 0 5.37 0 12a11.93 11.93 0 001.64 6.06L0 24l6.12-1.6A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12a11.86 11.86 0 00-3.48-8.52zM12 22a9.93 9.93 0 01-5.07-1.39l-.36-.22-3.73.98.99-3.64-.24-.38A9.94 9.94 0 012 12C2 6.48 6.48 2 12 2a9.95 9.95 0 017.07 2.93A9.95 9.95 0 0122 12c0 5.52-4.48 10-10 10zm5.44-7.4c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07a8.16 8.16 0 01-2.4-1.48 9 9 0 01-1.66-2.07c-.17-.3 0-.46.13-.6s.3-.35.44-.52a2 2 0 00.3-.5.55.55 0 000-.52c-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57a1.1 1.1 0 00-.8.37 3.36 3.36 0 00-1.05 2.5 5.84 5.84 0 001.22 3.1 13.38 13.38 0 005.14 4.53c.72.31 1.28.5 1.71.64a4.12 4.12 0 001.9.12 3.08 3.08 0 002.02-1.43 2.5 2.5 0 00.17-1.43c-.07-.07-.27-.2-.57-.35z" />
        </svg>
      </a>
    </div>
  )
}
