<section className="py-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container px-4 mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-block mb-2"
            >
              <div className="px-4 py-3 text-sm font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-brand-500 to-purple-600 Connected">
                ✨ اختار براند ✨ 
              </div>
            </motion.div>
            
            {/* <h2 className="mb-6 text-5xl font-bold text-transparent md:text-6xl bg-gradient-to-r from-gray-900 via-brand-600 to-purple-600 bg-clip-text">
              قطع غيار لجميع الفئات
            </h2> */}
            
            {/* <p className="max-w-3xl mx-auto text-xl leading-relaxed text-gray-600">
              اختر التصنيف المناسب واكتشف مجموعة واسعة من قطع الغيار
            </p> */}
          </motion.div>

          {/* ============================================ */}
          {/* NEW: Categories Horizontal Scroll (Active) */}
          {/* ============================================ */}
          <div className="relative">
            <div className="flex gap-6 pb-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
              {categoriesWithProducts.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryClick(category)}
                  className="flex-shrink-0 w-64 cursor-pointer snap-start group"
                >
                  <div className="relative p-6 overflow-hidden transition-all duration-500 border-2 border-transparent shadow-xl bg-gradient-to-br from-white via-brand-50 to-purple-50 rounded-3xl hover:shadow-2xl hover:border-brand-400">
                    {/* Animated Background Effect */}
                    <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-brand-100 via-purple-100 to-blue-100 group-hover:opacity-100"></div>
                    
                    {/* Sparkle Effect */}
                    <div className="absolute z-10 text-2xl transition-opacity duration-300 opacity-0 top-4 right-4 group-hover:opacity-100 animate-pulse">
                      ✨
                    </div>
                    
                    {/* Badge with Count */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-brand-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1">
                      <span>{category.count}</span>
                      <span>📦</span>
                    </div>

                    {/* Category Image */}
                    <div className="relative w-full h-40 mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 to-purple-100">
                      {category.image && typeof category.image === 'object' && category.image.src ? (
                        <Image
                          src={category.image.src}
                          alt={category.name}
                          fill
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                          sizes="256px"
                        />
                      ) : category.image && typeof category.image === 'string' ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                          sizes="256px"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full transition-transform duration-500 text-7xl group-hover:scale-110">
                          🏍️
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="relative text-center">
                      <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-brand-600 line-clamp-2">
                        {category.name}
                      </h3>

                      {/* CTA Button */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-6 py-2 text-sm font-bold text-white transition-shadow rounded-full bg-gradient-to-r from-brand-500 to-purple-600 group-hover:shadow-lg">
                          عرض القطع
                        </span>
                        <span className="text-brand-600 transition-transform group-hover:translate-x-1">
                          ←
                        </span>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute w-24 h-24 transition-opacity duration-500 rounded-full opacity-0 -bottom-8 -right-8 bg-gradient-to-br from-brand-300 to-purple-300 group-hover:opacity-30 blur-xl"></div>
                    <div className="absolute w-20 h-20 transition-opacity duration-700 rounded-full opacity-0 -top-8 -left-8 bg-gradient-to-br from-blue-300 to-purple-300 group-hover:opacity-30 blur-xl"></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Scroll Indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5 animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>اسحب لليمين أو اليسار لرؤية المزيد</span>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* OLD: Categories Grid (Commented for backup) */}
          {/* ============================================ */}
          {/* <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categoriesWithProducts.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category)}
                className="cursor-pointer group"
              >
                <div className="relative px-2 py-4 overflow-hidden transition-all duration-300 bg-white border-2 border-transparent shadow-lg rounded-2xl hover:shadow-2xl hover:border-brand-400">
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-brand-50 via-purple-50 to-blue-50 group-hover:opacity-100"></div>
                  
                  <div className="absolute z-10 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg top-3 right-3 bg-gradient-to-r from-brand-500 to-purple-600">
                    {category.count} 📦
                  </div>

                  <div className="relative mb-2 overflow-hidden transition-transform duration-300 aspect-square rounded-xl group-hover:scale-105">
                    {category.image && typeof category.image === 'object' && category.image.src ? (
                      <Image
                        src={category.image.src}
                        alt={category.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : category.image && typeof category.image === 'string' ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-6xl transition-transform group-hover:scale-110">
                        🏍️
                      </div>
                    )}
                  </div>

                  <h3 className="relative mb-2 text-lg font-bold text-center text-gray-900 transition-colors group-hover:text-brand-600 line-clamp-2">
                    {category.name}
                  </h3>

                  <div className="relative text-center">
                    <span className="text-sm font-medium text-gray-500 group-hover:text-brand-500">
                      عرض القطع →
                    </span>
                  </div>

                  <div className="absolute w-24 h-24 transition-opacity duration-500 rounded-full opacity-0 -bottom-10 -right-10 bg-gradient-to-br from-brand-200 to-purple-200 group-hover:opacity-20"></div>
                  <div className="absolute w-20 h-20 transition-opacity duration-700 rounded-full opacity-0 -top-10 -left-10 bg-gradient-to-br from-blue-200 to-purple-200 group-hover:opacity-20"></div>
                </div>
              </motion.div>
            ))}
          </div> */}

          {/* Empty State */}
          {categoriesWithProducts.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <div className="mb-6 text-8xl">🏷️</div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">لا توجد تصنيفات متاحة</h3>
              <p className="text-gray-600">الرجاء المحاولة مرة أخرى لاحقاً</p>
            </motion.div>
          )}
        </div>
      </section>