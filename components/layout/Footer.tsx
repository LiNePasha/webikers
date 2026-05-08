'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/webikers'
const TIKTOK_URL = process.env.NEXT_PUBLIC_TIKTOK_URL || 'https://www.tiktok.com/@webikers'
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/webikers.eg'
const YOUTUBE_URL = process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://www.youtube.com/@webikers_eg'
const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '01030351075'
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'spare2appeg@gmail.com'
const VENDOR_NAME = process.env.NEXT_PUBLIC_VENDOR_NAME || 'WeBikers'

export default function Footer() {
  const pathname = usePathname()
  
  // Hide footer on checkout and stores pages
  if (pathname === '/checkout' || pathname?.startsWith('/checkout/') || pathname?.startsWith('/stores/')) {
    return null
  }
  
  const currentYear = new Date().getFullYear()
  
  const footerLinks = {
    company: [
      { name: 'عن WeBikers', href: '/about' },
      { name: 'تواصل معنا', href: '/contact' },
      { name: 'المتجر', href: '/products' },
    ],
    support: [
      { name: 'مركز المساعدة', href: '/help' },
      { name: 'سياسة الإرجاع', href: '/returns' },
      { name: 'الشحن والتوصيل', href: '/shipping' },
      { name: 'الأسئلة الشائعة', href: '/faq' },
    ],
    legal: [
      { name: 'الشروط والأحكام', href: '/terms-and-conditions' },
      { name: 'سياسة الخصوصية', href: '/privacy' },
      { name: 'سياسة الاستخدام', href: '/usage-policy' },
    ],
  }
  
  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ), 
      href: FACEBOOK_URL, 
      color: 'hover:bg-blue-600 hover:text-white' 
    },
    { 
      name: 'Instagram', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.467.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.799-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
        </svg>
      ), 
      href: INSTAGRAM_URL, 
      color: 'hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white' 
    },
    { 
      name: 'YouTube', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ), 
      href: YOUTUBE_URL, 
      color: 'hover:bg-red-600 hover:text-white' 
    },
    { 
      name: 'TikTok', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ), 
      href: TIKTOK_URL, 
      color: 'hover:bg-black hover:text-white' 
    },
    { 
      name: 'WhatsApp', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ), 
      href: `https://wa.me/2${CONTACT_PHONE}`, 
      color: 'hover:bg-green-600 hover:text-white' 
    },
  ]
  
  return (
    <footer className="text-white border-t border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Main Footer Content */}
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center shadow-lg w-14 h-14 bg-gradient-to-br from-brand-500 via-amber-500 to-brand-600 rounded-2xl shadow-brand-500/30">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-transparent bg-gradient-to-r from-brand-400 via-amber-400 to-brand-500 bg-clip-text">
                  {VENDOR_NAME}
                </h3>
                <p className="text-xs text-gray-400">🛵 متخصصون في السكوترات</p>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              متجرك المتخصص في أكسسوارات وقطع غيار السكوترات الأصلية في مصر. نغطي جميع الماركات - Honda, Yamaha, Vespa, Kymco وأكثر.
            </p>
            
            {/* Contact Info */}
            <div className="mb-6 space-y-3">
              <a href={`tel:${CONTACT_PHONE}`} className="flex items-center gap-3 text-gray-400 transition-colors hover:text-brand-400 group">
                <div className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-800 rounded-lg group-hover:bg-brand-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{CONTACT_PHONE}</span>
              </a>
              
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 text-gray-400 transition-colors hover:text-brand-400 group">
                <div className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-800 rounded-lg group-hover:bg-brand-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium break-all">{CONTACT_EMAIL}</span>
              </a>
            </div>
            
            {/* Social Links */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-300">تابعنا على:</p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-700 hover:border-transparent ${social.color} shadow-lg`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="mb-4 text-lg font-bold text-white">الشركة</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 transition-colors duration-300 hover:text-brand-400 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-brand-400 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="mb-4 text-lg font-bold text-white">الدعم</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 transition-colors duration-300 hover:text-brand-400 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-brand-400 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="mb-4 text-lg font-bold text-white">قانوني</h4>
            <ul className="mb-6 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 transition-colors duration-300 hover:text-brand-400 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-brand-400 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Newsletter Signup */}
            {/* <div className="p-4 bg-gray-800 rounded-xl">
              <h5 className="mb-2 text-sm font-semibold text-white">اشترك في النشرة</h5>
              <p className="mb-3 text-xs text-gray-400">احصل على آخر العروض والخصومات</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-3 py-2 text-sm text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button className="px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-lg bg-brand-500 hover:bg-brand-600">
                  اشترك
                </button>
              </div>
            </div> */}
          </motion.div>
        </div>
        
        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-8 border-t border-gray-700/50"
        >
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                © {currentYear} {VENDOR_NAME}. جميع الحقوق محفوظة.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Powered by <span className="font-semibold text-brand-400">Spare2App</span>
              </p>
            </div>
            
            {/* Payment Methods */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-medium text-gray-500">طرق الدفع المتاحة:</span>
              <div className="flex items-center gap-3">
                {/* Cash on Delivery */}
                {/* <div className="relative group">
                  <div className="flex items-center justify-center w-12 h-8 text-lg transition-all duration-300 bg-gray-800 border border-gray-700 rounded-lg hover:border-brand-500 hover:scale-110">
                    💵
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    عند الاستلام
                  </span>
                </div> */}
                
                {/* InstaPay */}
                <div className="relative group">
                  <div className="flex items-center justify-center h-8 px-2 transition-all duration-300 rounded-lg shadow-md bg-gradient-to-br from-purple-600 to-blue-600 hover:scale-110">
                    <span className="text-[10px] font-bold text-white">انستاباي</span>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    انستا باي
                  </span>
                </div>
                
                {/* Fawry */}
                <div className="relative group">
                  <div className="flex items-center justify-center h-8 px-2 transition-all duration-300 rounded-lg shadow-md bg-gradient-to-br from-orange-500 to-red-500 hover:scale-110">
                    <span className="text-[10px] font-bold text-white">فودافون كاش</span>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    كاش
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Bottom Accent */}
      <div className="h-1.5 bg-gradient-to-r from-brand-500 via-amber-400 to-brand-500 shadow-lg shadow-brand-500/30"></div>
    </footer>
  )
}
