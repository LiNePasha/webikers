# SEO Implementation Guide - WeBikers

## ✅ تم التنفيذ

### 1. ملفات SEO الأساسية
- ✅ **robots.txt** - `app/robots.ts`
- ✅ **sitemap.xml** - `app/sitemap.ts` (يتحدث تلقائياً)
- ✅ **Metadata** - كل صفحة لها metadata خاص

### 2. Structured Data (Schema.org)
- ✅ **Organization Schema** - معلومات المتجر
- ✅ **Product Schema** - معلومات المنتجات
- ✅ **Breadcrumb Schema** - مسار التنقل

### 3. Dynamic Metadata
- ✅ **صفحات المنتجات** - metadata ديناميكي لكل منتج
- ✅ **صفحات الفئات** - metadata ديناميكي لكل فئة
- ✅ **Open Graph** - للمشاركة على السوشيال ميديا
- ✅ **Twitter Cards** - للمشاركة على تويتر

### 4. Technical SEO
- ✅ **Canonical URLs** - لتجنب المحتوى المكرر
- ✅ **Mobile Responsive** - متجاوب مع الموبايل
- ✅ **RTL Support** - دعم اللغة العربية
- ✅ **Image Optimization** - OptimizedImage component

## 🔧 الإعدادات المطلوبة

### 1. تحديث البيانات في `.env.local`
```env
NEXT_PUBLIC_SITE_URL=https://webikers.com
NEXT_PUBLIC_WOOCOMMERCE_API_URL=https://api.spare2app.com/wp-json/wc/v3
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY=your_key
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET=your_secret
```

### 2. إضافة ProductSchema للمنتجات
في `app/(shop)/products/[id]/page.tsx`، أضف:
```tsx
import ProductSchema from '@/components/seo/ProductSchema'

// داخل الـ component
{product && <ProductSchema product={product} />}
```

### 3. إضافة BreadcrumbSchema للصفحات
```tsx
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema'

<BreadcrumbSchema items={[
  { name: 'الرئيسية', url: 'https://webikers.com' },
  { name: 'المنتجات', url: 'https://webikers.com/products' },
  { name: product.name, url: `https://webikers.com/products/${product.id}` }
]} />
```

## 📊 التحسينات الإضافية المطلوبة

### 1. صور OG (Open Graph)
- ❌ إنشاء صور OG مخصصة لكل منتج
- المسار: `/public/images/og/`
- الحجم: 1200x630 بكسل

### 2. Google Search Console
1. أضف الموقع على [Google Search Console](https://search.google.com/search-console)
2. حدّث `verification.google` في `app/layout.tsx`
2. حدّث سيتماب: `https://webikers.com/sitemap.xml`

### 3. Google Analytics
أضف Google Analytics في `app/layout.tsx`:
```tsx
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

### 4. Performance Optimization
- ❌ تفعيل ISR (Incremental Static Regeneration) للمنتجات
- ❌ تحسين loading time بـ lazy loading
- ❌ إضافة service worker للـ PWA

### 5. Content SEO
- ❌ إضافة محتوى نصي غني في صفحات الفئات
- ❌ إضافة مدونة لزيادة المحتوى
- ❌ إضافة FAQs مع Schema

## 🎯 Best Practices

### الكلمات المفتاحية
استخدم في كل صفحة:
- اسم المنتج + "WeBikers"
- اسم المنتج + "قطع غيار موتوسيكلات"
- اسم المنتج + "مصر"
- Brand name + model name

### URL Structure
- ✅ `/products/[id]` - للمنتجات
- ✅ `/category/[slug]` - للفئات
- ✅ `/tag/[slug]` - للوسوم
- Clean URLs بدون query parameters

### Internal Linking
- ربط المنتجات المشابهة
- ربط الفئات ذات الصلة
- Breadcrumbs في كل صفحة

## 📱 Testing

### أدوات الفحص
1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **Google Rich Results Test**: https://search.google.com/test/rich-results
3. **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
4. **Lighthouse** (في Chrome DevTools)

### الفحوصات المطلوبة
- ✅ Sitemap يعمل: `/sitemap.xml`
- ✅ Robots يعمل: `/robots.txt`
- ✅ Metadata موجود في كل صفحة
- ✅ Structured data صحيح
- ⚠️ Page Speed > 90
- ⚠️ Mobile Score > 90

## 🚀 Next Steps

1. ✅ فحص الـ sitemap: `https://webikers.com/sitemap.xml`
2. ✅ فحص robots: `https://webikers.com/robots.txt`
3. ⚠️ إضافة ProductSchema لصفحات المنتجات
4. ⚠️ إضافة BreadcrumbSchema للتنقل
5. ⚠️ تسجيل الموقع في Google Search Console
6. ⚠️ إضافة Google Analytics
7. ⚠️ فحص Performance
8. ⚠️ إنشاء sitemap للصور

## 📞 Support

للمزيد من التحسينات، راجع:
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
