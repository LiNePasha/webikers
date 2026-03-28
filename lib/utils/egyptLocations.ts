import type { EgyptCity, EgyptDistrict } from '@/types'

// ============================================
// EGYPT CITIES DATA
// ============================================

export const egyptCities: EgyptCity[] = [
  // القاهرة الكبرى
  { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo' },
  { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza' },
  { id: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia' },
  { id: '6th-october', nameAr: '6 أكتوبر', nameEn: '6th of October' },
  { id: 'new-cairo', nameAr: 'القاهرة الجديدة', nameEn: 'New Cairo' },
  { id: 'heliopolis', nameAr: 'مصر الجديدة', nameEn: 'Heliopolis' },
  { id: 'nasr-city', nameAr: 'مدينة نصر', nameEn: 'Nasr City' },
  { id: 'maadi', nameAr: 'المعادي', nameEn: 'Maadi' },
  { id: 'zamalek', nameAr: 'الزمالك', nameEn: 'Zamalek' },
  { id: 'downtown-cairo', nameAr: 'وسط البلد', nameEn: 'Downtown Cairo' },
  
  // الإسكندرية
  { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
  { id: 'borg-el-arab', nameAr: 'برج العرب', nameEn: 'Borg El Arab' },
  
  // الدلتا
  { id: 'beheira', nameAr: 'البحيرة', nameEn: 'Beheira' },
  { id: 'kafr-el-sheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh' },
  { id: 'gharbia', nameAr: 'الغربية', nameEn: 'Gharbia' },
  { id: 'monufia', nameAr: 'المنوفية', nameEn: 'Monufia' },
  { id: 'dakahlia', nameAr: 'الدقهلية', nameEn: 'Dakahlia' },
  { id: 'damietta', nameAr: 'دمياط', nameEn: 'Damietta' },
  { id: 'sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia' },
  { id: 'ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia' },
  { id: 'port-said', nameAr: 'بورسعيد', nameEn: 'Port Said' },
  { id: 'suez', nameAr: 'السويس', nameEn: 'Suez' },
  
  // القناة
  { id: 'north-sinai', nameAr: 'شمال سيناء', nameEn: 'North Sinai' },
  { id: 'south-sinai', nameAr: 'جنوب سيناء', nameEn: 'South Sinai' },
  
  // الصعيد
  { id: 'faiyum', nameAr: 'الفيوم', nameEn: 'Faiyum' },
  { id: 'beni-suef', nameAr: 'بني سويف', nameEn: 'Beni Suef' },
  { id: 'minya', nameAr: 'المنيا', nameEn: 'Minya' },
  { id: 'asyut', nameAr: 'أسيوط', nameEn: 'Asyut' },
  { id: 'sohag', nameAr: 'سوهاج', nameEn: 'Sohag' },
  { id: 'qena', nameAr: 'قنا', nameEn: 'Qena' },
  { id: 'luxor', nameAr: 'الأقصر', nameEn: 'Luxor' },
  { id: 'aswan', nameAr: 'أسوان', nameEn: 'Aswan' },
  
  // البحر الأحمر
  { id: 'red-sea', nameAr: 'البحر الأحمر', nameEn: 'Red Sea' },
  { id: 'hurghada', nameAr: 'الغردقة', nameEn: 'Hurghada' },
  { id: 'marsa-alam', nameAr: 'مرسى علم', nameEn: 'Marsa Alam' },
  
  // الصحراء الغربية
  { id: 'matrouh', nameAr: 'مطروح', nameEn: 'Matrouh' },
  { id: 'new-valley', nameAr: 'الوادي الجديد', nameEn: 'New Valley' },
]

// ============================================
// EGYPT DISTRICTS DATA
// ============================================

export const egyptDistricts: EgyptDistrict[] = [
  // القاهرة
  { id: 'nasr-city-1', nameAr: 'مدينة نصر - المنطقة الأولى', nameEn: 'Nasr City - Zone 1', cityId: 'cairo' },
  { id: 'nasr-city-2', nameAr: 'مدينة نصر - المنطقة الثانية', nameEn: 'Nasr City - Zone 2', cityId: 'cairo' },
  { id: 'nasr-city-3', nameAr: 'مدينة نصر - المنطقة الثالثة', nameEn: 'Nasr City - Zone 3', cityId: 'cairo' },
  { id: 'heliopolis-1', nameAr: 'مصر الجديدة - الكوربة', nameEn: 'Heliopolis - Korba', cityId: 'cairo' },
  { id: 'heliopolis-2', nameAr: 'مصر الجديدة - روكسي', nameEn: 'Heliopolis - Roxy', cityId: 'cairo' },
  { id: 'heliopolis-3', nameAr: 'مصر الجديدة - الميرغني', nameEn: 'Heliopolis - Merghany', cityId: 'cairo' },
  { id: 'maadi-1', nameAr: 'المعادي - المعادي القديمة', nameEn: 'Maadi - Old Maadi', cityId: 'cairo' },
  { id: 'maadi-2', nameAr: 'المعادي - دجلة', nameEn: 'Maadi - Degla', cityId: 'cairo' },
  { id: 'maadi-3', nameAr: 'المعادي - الحي السابع', nameEn: 'Maadi - 7th District', cityId: 'cairo' },
  { id: 'zamalek', nameAr: 'الزمالك', nameEn: 'Zamalek', cityId: 'cairo' },
  { id: 'garden-city', nameAr: 'جاردن سيتي', nameEn: 'Garden City', cityId: 'cairo' },
  { id: 'downtown', nameAr: 'وسط البلد', nameEn: 'Downtown', cityId: 'cairo' },
  { id: 'abdeen', nameAr: 'عابدين', nameEn: 'Abdeen', cityId: 'cairo' },
  { id: 'bab-el-louq', nameAr: 'باب اللوق', nameEn: 'Bab El Louq', cityId: 'cairo' },
  { id: 'shubra', nameAr: 'شبرا', nameEn: 'Shubra', cityId: 'cairo' },
  { id: 'rod-el-farag', nameAr: 'روض الفرج', nameEn: 'Rod El Farag', cityId: 'cairo' },
  { id: 'ain-shams', nameAr: 'عين شمس', nameEn: 'Ain Shams', cityId: 'cairo' },
  { id: 'matariya', nameAr: 'المطرية', nameEn: 'Matariya', cityId: 'cairo' },
  { id: 'hadayek-el-kobba', nameAr: 'حدائق القبة', nameEn: 'Hadayek El Kobba', cityId: 'cairo' },
  { id: 'helwan', nameAr: 'حلوان', nameEn: 'Helwan', cityId: 'cairo' },
  { id: 'masr-el-adema', nameAr: 'مصر القديمة', nameEn: 'Masr El Adema', cityId: 'cairo' },
  { id: 'sayeda-zeinab', nameAr: 'السيدة زينب', nameEn: 'Sayeda Zeinab', cityId: 'cairo' },
  { id: 'dar-el-salam', nameAr: 'دار السلام', nameEn: 'Dar El Salam', cityId: 'cairo' },
  { id: 'basatin', nameAr: 'البساتين', nameEn: 'Basatin', cityId: 'cairo' },
  
  // القاهرة الجديدة
  { id: 'new-cairo-1', nameAr: 'التجمع الأول', nameEn: 'First Settlement', cityId: 'new-cairo' },
  { id: 'new-cairo-3', nameAr: 'التجمع الثالث', nameEn: 'Third Settlement', cityId: 'new-cairo' },
  { id: 'new-cairo-5', nameAr: 'التجمع الخامس', nameEn: 'Fifth Settlement', cityId: 'new-cairo' },
  { id: 'rehab', nameAr: 'الرحاب', nameEn: 'Rehab', cityId: 'new-cairo' },
  { id: 'shorouk', nameAr: 'الشروق', nameEn: 'Shorouk', cityId: 'new-cairo' },
  { id: 'badr', nameAr: 'بدر', nameEn: 'Badr', cityId: 'new-cairo' },
  { id: 'new-heliopolis', nameAr: 'مصر الجديدة الجديدة', nameEn: 'New Heliopolis', cityId: 'new-cairo' },
  
  // الجيزة
  { id: 'dokki', nameAr: 'الدقي', nameEn: 'Dokki', cityId: 'giza' },
  { id: 'mohandessin', nameAr: 'المهندسين', nameEn: 'Mohandessin', cityId: 'giza' },
  { id: 'agouza', nameAr: 'العجوزة', nameEn: 'Agouza', cityId: 'giza' },
  { id: 'imbaba', nameAr: 'إمبابة', nameEn: 'Imbaba', cityId: 'giza' },
  { id: 'faisal', nameAr: 'فيصل', nameEn: 'Faisal', cityId: 'giza' },
  { id: 'haram', nameAr: 'الهرم', nameEn: 'Haram', cityId: 'giza' },
  { id: 'pyramids', nameAr: 'الأهرامات', nameEn: 'Pyramids', cityId: 'giza' },
  { id: 'hawamdeya', nameAr: 'الحوامدية', nameEn: 'Hawamdeya', cityId: 'giza' },
  { id: 'smart-village', nameAr: 'القرية الذكية', nameEn: 'Smart Village', cityId: 'giza' },
  { id: 'hadayek-october', nameAr: 'حدائق أكتوبر', nameEn: 'Hadayek October', cityId: 'giza' },
  
  // 6 أكتوبر
  { id: '6th-october-1', nameAr: '6 أكتوبر - الحي الأول', nameEn: '6th October - District 1', cityId: '6th-october' },
  { id: '6th-october-2', nameAr: '6 أكتوبر - الحي الثاني', nameEn: '6th October - District 2', cityId: '6th-october' },
  { id: '6th-october-3', nameAr: '6 أكتوبر - الحي الثالث', nameEn: '6th October - District 3', cityId: '6th-october' },
  { id: '6th-october-4', nameAr: '6 أكتوبر - الحي الرابع', nameEn: '6th October - District 4', cityId: '6th-october' },
  { id: 'sheikh-zayed', nameAr: 'الشيخ زايد', nameEn: 'Sheikh Zayed', cityId: '6th-october' },
  { id: 'beverly-hills', nameAr: 'بيفرلي هيلز', nameEn: 'Beverly Hills', cityId: '6th-october' },
  { id: 'allegria', nameAr: 'أليجريا', nameEn: 'Allegria', cityId: '6th-october' },
  
  // القليوبية
  { id: 'shubra-el-kheima', nameAr: 'شبرا الخيمة', nameEn: 'Shubra El Kheima', cityId: 'qalyubia' },
  { id: 'qalyub', nameAr: 'قليوب', nameEn: 'Qalyub', cityId: 'qalyubia' },
  { id: 'obour', nameAr: 'العبور', nameEn: 'Obour', cityId: 'qalyubia' },
  { id: 'khanka', nameAr: 'الخانكة', nameEn: 'Khanka', cityId: 'qalyubia' },
  { id: 'benha', nameAr: 'بنها', nameEn: 'Benha', cityId: 'qalyubia' },
  
  // الإسكندرية
  { id: 'miami', nameAr: 'ميامي', nameEn: 'Miami', cityId: 'alexandria' },
  { id: 'sidi-bishr', nameAr: 'سيدي بشر', nameEn: 'Sidi Bishr', cityId: 'alexandria' },
  { id: 'stanley', nameAr: 'ستانلي', nameEn: 'Stanley', cityId: 'alexandria' },
  { id: 'gleem', nameAr: 'جليم', nameEn: 'Gleem', cityId: 'alexandria' },
  { id: 'sporting', nameAr: 'سبورتنج', nameEn: 'Sporting', cityId: 'alexandria' },
  { id: 'smouha', nameAr: 'سموحة', nameEn: 'Smouha', cityId: 'alexandria' },
  { id: 'miami-alex', nameAr: 'ميامي', nameEn: 'Miami', cityId: 'alexandria' },
  { id: 'mandara', nameAr: 'المندرة', nameEn: 'Mandara', cityId: 'alexandria' },
  { id: 'montazah', nameAr: 'المنتزه', nameEn: 'Montazah', cityId: 'alexandria' },
  { id: 'abukir', nameAr: 'أبو قير', nameEn: 'Abukir', cityId: 'alexandria' },
  { id: 'agami', nameAr: 'العجمي', nameEn: 'Agami', cityId: 'alexandria' },
  { id: 'borg-el-arab-city', nameAr: 'مدينة برج العرب', nameEn: 'Borg El Arab City', cityId: 'alexandria' },
  { id: 'raml-station', nameAr: 'محطة الرمل', nameEn: 'Raml Station', cityId: 'alexandria' },
  { id: 'attarin', nameAr: 'العطارين', nameEn: 'Attarin', cityId: 'alexandria' },
  { id: 'manshia', nameAr: 'المنشية', nameEn: 'Manshia', cityId: 'alexandria' },
  { id: 'karmouz', nameAr: 'كرموز', nameEn: 'Karmouz', cityId: 'alexandria' },
  { id: 'sidi-gaber', nameAr: 'سيدي جابر', nameEn: 'Sidi Gaber', cityId: 'alexandria' },
  { id: 'camp-caesar', nameAr: 'كامب شيزار', nameEn: 'Camp Caesar', cityId: 'alexandria' },
  { id: 'san-stefano', nameAr: 'سان ستيفانو', nameEn: 'San Stefano', cityId: 'alexandria' },
  { id: 'bacchus', nameAr: 'باكوس', nameEn: 'Bacchus', cityId: 'alexandria' },
  { id: 'fleming', nameAr: 'فليمنج', nameEn: 'Fleming', cityId: 'alexandria' },
  
  // محافظات أخرى - عينات
  { id: 'tanta', nameAr: 'طنطا', nameEn: 'Tanta', cityId: 'gharbia' },
  { id: 'mahalla', nameAr: 'المحلة الكبرى', nameEn: 'Mahalla', cityId: 'gharbia' },
  { id: 'mansoura', nameAr: 'المنصورة', nameEn: 'Mansoura', cityId: 'dakahlia' },
  { id: 'zagazig', nameAr: 'الزقازيق', nameEn: 'Zagazig', cityId: 'sharqia' },
  { id: 'ismailia-city', nameAr: 'الإسماعيلية', nameEn: 'Ismailia', cityId: 'ismailia' },
  { id: 'port-said-city', nameAr: 'بورسعيد', nameEn: 'Port Said', cityId: 'port-said' },
  { id: 'suez-city', nameAr: 'السويس', nameEn: 'Suez', cityId: 'suez' },
  { id: 'sharm-el-sheikh', nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh', cityId: 'south-sinai' },
  { id: 'dahab', nameAr: 'دهب', nameEn: 'Dahab', cityId: 'south-sinai' },
  { id: 'hurghada-city', nameAr: 'الغردقة', nameEn: 'Hurghada', cityId: 'hurghada' },
  { id: 'el-gouna', nameAr: 'الجونة', nameEn: 'El Gouna', cityId: 'hurghada' },
  { id: 'aswan-city', nameAr: 'أسوان', nameEn: 'Aswan', cityId: 'aswan' },
  { id: 'luxor-city', nameAr: 'الأقصر', nameEn: 'Luxor', cityId: 'luxor' },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all districts for a specific city
 */
export function getDistrictsByCity(cityId: string): EgyptDistrict[] {
  return egyptDistricts.filter(district => district.cityId === cityId)
}

/**
 * Search cities by name (Arabic or English)
 */
export function searchCities(query: string): EgyptCity[] {
  const lowerQuery = query.toLowerCase()
  return egyptCities.filter(
    city =>
      city.nameAr.toLowerCase().includes(lowerQuery) ||
      city.nameEn.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Search districts by name (Arabic or English) within a city
 */
export function searchDistricts(cityId: string, query: string): EgyptDistrict[] {
  const lowerQuery = query.toLowerCase()
  const cityDistricts = getDistrictsByCity(cityId)
  
  return cityDistricts.filter(
    district =>
      district.nameAr.toLowerCase().includes(lowerQuery) ||
      district.nameEn.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get city by ID
 */
export function getCityById(cityId: string): EgyptCity | undefined {
  return egyptCities.find(city => city.id === cityId)
}

/**
 * Get district by ID
 */
export function getDistrictById(districtId: string): EgyptDistrict | undefined {
  return egyptDistricts.find(district => district.id === districtId)
}

/**
 * Validate if a city-district combination is valid
 */
export function isValidCityDistrict(cityId: string, districtId: string): boolean {
  const district = getDistrictById(districtId)
  return district?.cityId === cityId
}
