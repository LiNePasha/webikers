'use client'

import Link from "next/link";
import CategoriesShowcase from "@/components/categories/CategoriesShowcase";
import FeaturedCategoryProducts from "@/components/home/FeaturedCategoryProducts";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import StoreCategoriesSticky from "@/components/stores/StoreCategoriesSticky";
import { useVendorCategoriesStore } from "@/store/vendorCategoriesStore";
import ScooterKeysCarousel from "@/components/home/ScooterKeysCarousel";
import SocialDropdown from "@/components/home/SocialDropdown";

// Vendor Configuration
const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '5453';

// Featured Categories from Store - Easy to Edit
const featuredStoreCategories = [
  {
    id: 421,
    name: 'خوذة',
    slug: 'motorcycle-safety-gear',
    description: 'خوذات سكوتر معتمدة للسلامة الكاملة',
    icon: '⛑️',
    gradient: 'from-[#db5f02] to-[#ff9a4f]',
    productsCount: 8
  },
  {
    id: 438,
    name: 'زيوت',
    slug: 'oil',
    description: 'زيوت سكوتر عالية الجودة ',
    icon: '🤜',
    gradient: 'from-[#b84f03] to-[#db5f02]',
    productsCount: 8
  },
  {
    id: 422,
    name: 'جونتي',
    slug: 'motorcycle-gloves',
    description: 'قفازات سكوتر عالية الجودة ',
    icon: '🤜',
    gradient: 'from-[#b84f03] to-[#db5f02]',
    productsCount: 8
  },
  {
    id: 178,
    name: 'توب بوكس',
    slug: 'motorcycle-top-box',
    description: 'توب بوكس سكوتر عالية الجودة ',
    icon: '🤜',
    gradient: 'from-[#b84f03] to-[#db5f02]',
    productsCount: 8
  },
  {
    id: 151,
    name: 'هولدر',
    slug: 'mobile-holder-bike',
    description: 'هولدر سكوتر عالية الجودة ',
    icon: '🤜',
    gradient: 'from-[#b84f03] to-[#db5f02]',
    productsCount: 8
  },
];

// Hero Slides - Hot Deals
const heroSlides = [
  {
    id: 1,
    image: 'https://api.spare2app.com/wp-content/uploads/2026/03/images-17.webp',
    title: 'مرايات h2 ',
    subtitle: 'تصميم أنيق ',
    oldPrice: 320,
    newPrice: 280,
    discount: 14,
    savings: 40,
    description: 'مرايه عالية الجودة - متوفر بلونين',
    colors: ['أسود', 'فضي'],
    ctaText: 'اطلب الآن',
    ctaLink: '/deals',
    badge: '💨 الأكثر مبيعًا'
  },
   {
    id: 2,
    image: 'https://api.spare2app.com/wp-content/uploads/2026/03/Repsol-1070x1500-1.jpg',
    title: 'زيت Repsol 4T',
    subtitle: 'F250 / H250 / L250 / V250',
    oldPrice: 950,
    newPrice: 850,
    discount: 10,
    savings: 100,
    description: 'حماية قوية لمحرك موتوسيكلك - موجود جميع الألوان',
    colors: ['أبيض', 'أحمر', 'أخضر', 'أزرق', 'أسود', 'أصفر', 'رمادي'],
    ctaText: 'اطلب الآن',
    ctaLink: '/deals',
    badge: '🔥 عرض ساخن'
  },
];

const quickHighlights = [
  '🛵 متخصصون في السكوترات',
  '🚚 شحن سريع لكل المحافظات',
  '🔧 دعم فني متخصص',
  '✅ قطع أصلية مضمونة',
]

const scooterBrands = [
  { name: 'Honda',   emoji: '🏍️' },
  { name: 'Yamaha',  emoji: '⚡' },
  { name: 'Vespa',   emoji: '🛵' },
  { name: 'Kymco',   emoji: '🔥' },
  { name: 'Piaggio', emoji: '🌟' },
  { name: 'Sym',     emoji: '💫' },
  { name: 'Peugeot', emoji: '🏆' },
  { name: 'TVS',     emoji: '⚙️' },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Zustand store for vendor categories
  const { categories, isLoading: categoriesLoading, fetchVendorCategories } = useVendorCategoriesStore();

  // Load categories from store
  useEffect(() => {
    fetchVendorCategories(VENDOR_ID);
  }, [fetchVendorCategories]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      prevSlide(); // RTL: swipe left = previous
    }
    if (isRightSwipe) {
      nextSlide(); // RTL: swipe right = next
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="min-h-screen">
      {/* Top Highlights Bar */}
      {/* <section className="border-b border-[#f3cfb5] bg-white/90 backdrop-blur">
        <div className="container px-3 py-2 mx-auto max-w-7xl md:px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {quickHighlights.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold border rounded-full text-[#b84f03] bg-[#fff1e7] border-[#f5c49e]"
              >
                <span>✦</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </section> */}

<section className="relative overflow-hidden bg-black">
  
  <div className="absolute inset-0 bg-pattern opacity-40"></div>
{/* 🔥 Badge */}
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 text-xs rounded-full text-brand-500 sm:text-sm">
          🔥 مستني ايه اكسسواراتك وصيانتك عندنا
        </span>
      </div>
  <div className="container relative grid items-center grid-cols-2 gap-4 px-4 py-12 mx-auto lg:py-20">


    {/* 📝 Text */}
    <div className="space-y-6 text-right">

      

      {/* 🧠 Title */}
      <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-5xl">
       <span className="text-white">
         بيت الاسكوترات 🛵  
       </span>
        <br />
        <span className="text-brand-500">
          وغرفة العمليات لكل صيانة
        </span>
      </h1>

      {/* 📄 Description */}
      {/* <p className="text-sm text-gray-300 sm:text-base">
        كل اللي محتاجه لسكوتك في مكان واحد  
        قطع غيار أصلية - أكسسورات - تعديل احترافي  
      </p> */}

      {/* 🔘 Buttons */}
      <div className="flex flex-wrap gap-3">
        
        <a href="/products" className="bg-brand-500 hover:bg-brand-600 text-black font-bold px-5 py-2.5 rounded-lg text-sm sm:text-base transition">
          تسوق دلوقتي
        </a>

        <SocialDropdown />

      </div>
    </div>

    {/* 🖼️ Image */}
    <div className="flex justify-center">
      <img
        src="https://api.spare2app.com/wp-content/uploads/2026/03/636213390_933522365871551_3465819747484172831_n__2_-removebg-preview.png"
        alt="Scooter"
        className="w-[220px] sm:w-[300px] lg:w-[400px]"
      />
    </div>

  </div>
</section>

      {/* Store Categories - Circular & Scrollable & Sticky */}
      <section className="sticky z-40 border-b shadow-sm top-16 md:top-20 border-[#f3cfb5] bg-white/90">
        <div className="px-0 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* <h2 className="mb-3 text-base font-bold text-center text-gray-900 md:text-xl md:mb-4">تصفح حسب الفئة</h2> */}
          
          {/* Store Categories Sticky Component */}
          <StoreCategoriesSticky
            categories={categories}
            loading={categoriesLoading}
            showAsLinks={true}
            storeSlug="category"
            viewMode="horizontal"
          />
        </div>
      </section>

      {/* Scooter Brands Strip */}
      {/* <section className="py-6 bg-white border-b border-[#f3cfb5]">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-bold tracking-widest text-center uppercase text-[#b84f03]">
            🛵 نغطي جميع ماركات السكوترات
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {scooterBrands.map((brand) => (
              <Link
                key={brand.name}
                href={`/products?search=${brand.name}`}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 transition-all border rounded-full border-[#f5c49e] hover:bg-[#db5f02] hover:text-white hover:border-[#db5f02] hover:scale-105 active:scale-95"
              >
                <span>{brand.emoji}</span>
                <span>{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      {/* Featured Store Categories Products */}
      {featuredStoreCategories.map((category) => (
        <FeaturedCategoryProducts
          key={category.id}
          vendorId={VENDOR_ID}
          categoryId={category.id}
          categoryName={category.name}
          categorySlug={category.slug}
          description={category.description}
          icon={category.icon}
          gradient={category.gradient}
          productsCount={category.productsCount}
        />
      ))}

      {/* Scooter Keys Carousel */}
      <ScooterKeysCarousel />

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-bold rounded-full text-[#b84f03] bg-[#fff1e7] border border-[#f5c49e]">
              🛵 متخصصون في السكوترات
            </span>
            <h2 className="mb-4 text-4xl font-black text-gray-900">ليه تشتري من WeBikers؟</h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              نقدم لك أفضل تجربة تسوق لقطع غيار وإكسسوارات السكوترات في مصر
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="relative py-20 overflow-hidden text-white bg-gradient-to-r from-gray-900 to-blue-900">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="relative px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold">لم تجد ما تبحث عنه؟</h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl leading-relaxed text-gray-300">
            تواصل معنا وسنساعدك في العثور على القطعة المناسبة لموتوسيكلك
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center gap-2 transition-all duration-200 transform btn-primary bg-brand-600 hover:bg-brand-700 hover:scale-105"
            >
              <span>تواصل معنا</span>
              <span>📞</span>
            </Link>
            <Link 
              href="/search"
              className="inline-flex items-center justify-center gap-2 text-white border-white btn-outline hover:bg-white hover:text-gray-900"
            >
              <span>بحث متقدم</span>
              <span>🔍</span>
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
}
