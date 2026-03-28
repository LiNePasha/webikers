'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shippingAddressSchema } from '@/lib/utils/validation'
import type { ShippingAddress } from '@/types'
import AddressAutocomplete from './AddressAutocomplete'
import { useEffect } from 'react'

interface AddressFormProps {
  initialData?: Partial<ShippingAddress>
  onChange?: (data: ShippingAddress, isValid: boolean) => void
  onCityChange?: (cityNameEn: string) => void
}

export default function AddressForm({
  initialData,
  onChange,
  onCityChange,
}: AddressFormProps) {
  const {
    register,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    mode: 'onChange', // Validate on every change
    defaultValues: initialData || {
      isDefault: false,
    },
  })
  
  const cityId = watch('city')
  const formData = watch() // Watch all form fields
  
  // Auto-fill from initialData when component mounts
  useEffect(() => {
    if (initialData) {
      // Set all fields from initialData
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(key as keyof ShippingAddress, value)
        }
      })
    }
  }, [initialData, setValue])
  
  // Auto-save on every change with debounce
  useEffect(() => {
    if (onChange) {
      const timer = setTimeout(() => {
        // Auto-fill lastName if not provided (for API compatibility)
        const processedData = { ...formData }
        if (!processedData.lastName && processedData.firstName) {
          // Split firstName and use last word as lastName, or duplicate if single word
          const nameParts = processedData.firstName.trim().split(/\s+/)
          if (nameParts.length > 1) {
            processedData.lastName = nameParts[nameParts.length - 1]
            processedData.firstName = nameParts.slice(0, -1).join(' ')
          } else {
            // Single word name - use same for both
            processedData.lastName = processedData.firstName
          }
        }
        
        // Only save if form is valid
        if (isValid) {
          onChange(processedData as ShippingAddress, true)
        } else {
          // Still notify parent but mark as invalid
          onChange(processedData as ShippingAddress, false)
        }
      }, 500) // 500ms debounce to reduce updates
      
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formData), isValid]) // Use stringified version to prevent infinite loops
  
  return (
    <div className="space-y-3 md:space-y-4">{/* Changed from form to div */}
      {/* Name - Single field */}
      <div>
        <label className="block mb-1 text-xs font-medium text-gray-700 md:text-sm md:mb-2">
          الاسم الكامل
          <span className="mr-1 text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('firstName')}
          className={`
            w-full px-3 py-2 text-sm rounded-lg border-2 transition-colors md:px-4 md:py-3 md:text-base text-black
            ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          `}
          placeholder="أدخل اسمك الكامل"
        />
        {errors.firstName && (
          <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
            <span>⚠️</span>
            {errors.firstName.message}
          </p>
        )}
      </div>
      
      {/* Phone */}
      <div>
        <label className="block mb-1 text-xs font-medium text-gray-700 md:text-sm md:mb-2">
          رقم الهاتف
          <span className="mr-1 text-red-500">*</span>
        </label>
        <input
          type="tel"
          {...register('phone')}
          className={`
            w-full px-3 py-2 text-sm rounded-lg border-2 transition-colors md:px-4 md:py-3 md:text-base text-black
            ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          `}
          placeholder="01XXXXXXXXX"
          dir="rtl"
        />
        {errors.phone && (
          <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
            <span>⚠️</span>
            {errors.phone.message}
          </p>
        )}
      </div>
      
      {/* City & District - Side by side on mobile */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        {/* City Autocomplete */}
        <AddressAutocomplete
          type="city"
          value={formData.cityName}
          label="المحافظة"
          placeholder="ابحث عن المدينة..."
          onSelect={(id, nameAr, nameEn) => {
            setValue('city', id)
            setValue('cityName', nameAr)
            setValue('cityNameEn', nameEn)
            
            // Trigger auto-calculation when city is selected
            if (onCityChange && nameEn) {
              onCityChange(nameEn)
            }
          }}
          error={errors.city?.message}
        />
        
        {/* District Autocomplete */}
        {cityId && (
          <AddressAutocomplete
            type="district"
            cityId={cityId}
            value={formData.districtName}
            label="المنطقة"
            placeholder="ابحث عن المنطقة..."
            onSelect={(id, nameAr, nameEn) => {
              setValue('district', id)
              setValue('districtName', nameAr)
              setValue('districtNameEn', nameEn)
            }}
            error={errors.district?.message}
          />
        )}
      </div>
      
      {/* Street Address */}
      <div>
        <label className="block mb-1 text-xs font-medium text-gray-700 md:text-sm md:mb-2">
          العنوان بالتفصيل
          <span className="mr-1 text-red-500">*</span>
        </label>
        <textarea
          {...register('address')}
          rows={2}
          className={`
            w-full px-3 py-2 text-sm rounded-lg border-2 transition-colors md:px-4 md:py-3 md:text-base md:rows-3 text-black
            ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            resize-none
          `}
          placeholder="الشارع، الحي, العمارة, علامة مميزة..."
        />
        {errors.address && (
          <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
            <span>⚠️</span>
            {errors.address.message}
          </p>
        )}
      </div>
      
      {/* Building Details */}
      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            رقم العمارة
          </label>
          <input
            type="text"
            {...register('building')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="رقم العمارة"
          />
        </div>
        
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            الدور
          </label>
          <input
            type="text"
            {...register('floor')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="رقم الدور"
          />
        </div>
        
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            رقم الشقة
          </label>
          <input
            type="text"
            {...register('apartment')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="رقم الشقة"
          />
        </div>
      </div> */}
      
      {/* Landmark */}
      {/* <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          علامة مميزة (اختياري)
        </label>
        <input
          type="text"
          {...register('landmark')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="مثال: بجوار مسجد النور"
        />
      </div> */}
      
      {/* Set as Default */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          {...register('isDefault')}
          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-brand-500 md:w-5 md:h-5"
        />
        <label htmlFor="isDefault" className="text-xs font-medium text-gray-700 cursor-pointer md:text-sm">
          حفظ كعنوان افتراضي
        </label>
      </div>
    </div>
  )
}
