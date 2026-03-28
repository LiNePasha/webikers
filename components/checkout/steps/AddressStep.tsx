'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { useCheckoutAddress, useCheckoutStep } from '@/store/checkoutStore'
import type { SavedAddress, ShippingAddress } from '@/types'
import AddressForm from '../address/AddressForm'
import { safeFetch } from '@/lib/utils/safeFetch'

export default function AddressStep() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  
  const { shippingAddress, setShippingAddress, setUseSameAddress } = useCheckoutAddress()
  const { nextStep } = useCheckoutStep()
  
  // Fetch saved addresses
  useEffect(() => {
    fetchSavedAddresses()
  }, [])
  
  const fetchSavedAddresses = async () => {
    const { data, error } = await safeFetch<{
      success: boolean
      data: SavedAddress[]
    }>('/api/checkout/addresses')
    
    if (error || !data) {
      console.error('Error fetching addresses:', error)
      return
    }
    
    if (data.success) {
      setSavedAddresses(data.data)
      
      // Auto-select default address
      const defaultAddr = data.data.find((addr: SavedAddress) => addr.isDefault)
      if (defaultAddr && !shippingAddress) {
        handleSelectAddress(defaultAddr)
      }
    }
  }
  
  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id || null)
    setShippingAddress({
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      city: address.city,
      cityName: address.cityName,
      district: address.district,
      districtName: address.districtName,
      address: address.address,
      building: address.building,
      floor: address.floor,
      apartment: address.apartment,
      landmark: address.landmark,
      isDefault: address.isDefault,
    })
    setUseSameAddress(true) // Copy to billing by default
  }
  
  const handleNewAddress = (data: ShippingAddress, isValid: boolean) => {
    if (!isValid) return
    
    setShippingAddress(data)
    setUseSameAddress(true)
  }
  
  const handleSaveAddress = async () => {
    if (!shippingAddress) {
      toast.error('برجاء إكمال بيانات العنوان')
      return
    }
    
    setLoading(true)
    
    const { data, error } = await safeFetch<{
      success: boolean
      error?: string
    }>('/api/checkout/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shippingAddress),
    })
    
    setLoading(false)
    
    if (error || !data) {
      toast.error(error || 'فشل حفظ العنوان')
      return
    }
    
    if (data.success) {
      toast.success('تم حفظ العنوان بنجاح')
      setShowNewAddressForm(false)
      fetchSavedAddresses() // Refresh list
    } else {
      toast.error(data.error || 'فشل حفظ العنوان')
    }
  }
  
  const handleContinue = () => {
    if (!shippingAddress) {
      toast.error('يرجى اختيار عنوان الشحن')
      return
    }
    nextStep()
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          عنوان الشحن
        </h2>
        <p className="text-gray-600">
          اختر عنوان الشحن أو أضف عنوان جديد
        </p>
      </div>
      
      {/* Saved Addresses Grid */}
      {!showNewAddressForm && savedAddresses.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {savedAddresses.map((address) => (
            <button
              key={address.id}
              onClick={() => handleSelectAddress(address)}
              className={`
                relative p-4 rounded-lg border-2 text-right transition-all
                ${selectedAddressId === address.id
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-brand-300 bg-white'
                }
              `}
            >
              {/* Selected Indicator */}
              {selectedAddressId === address.id && (
                <div className="absolute top-3 left-3">
                  <CheckCircleIcon className="w-6 h-6 text-brand-600" />
                </div>
              )}
              
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded top-3 right-3">
                  افتراضي
                </div>
              )}
              
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="w-5 h-5 text-brand-500" />
                  <h3 className="font-semibold text-gray-900">
                    {address.firstName} {address.lastName}
                  </h3>
                </div>
                
                <p className="mb-1 text-sm text-gray-600">{address.phone}</p>
                <p className="mb-1 text-sm text-gray-700">
                  {address.cityName || address.city} - {address.districtName || address.district}
                </p>
                <p className="text-sm text-gray-600">{address.address}</p>
                
                {(address.building || address.floor || address.apartment) && (
                  <p className="mt-1 text-xs text-gray-500">
                    {address.building && `عمارة ${address.building}`}
                    {address.floor && ` - دور ${address.floor}`}
                    {address.apartment && ` - شقة ${address.apartment}`}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Add New Address Button */}
      {!showNewAddressForm && (
        <button
          onClick={() => setShowNewAddressForm(true)}
          className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-gray-700 transition-all border-2 border-gray-300 border-dashed rounded-lg md:w-auto hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
        >
          <PlusIcon className="w-5 h-5" />
          <span>إضافة عنوان جديد</span>
        </button>
      )}
      
      {/* New Address Form */}
      {showNewAddressForm && (
        <div className="p-6 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              إضافة عنوان جديد
            </h3>
            <button
              onClick={() => setShowNewAddressForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              إلغاء
            </button>
          </div>
          
          <AddressForm
            onChange={handleNewAddress}
            initialData={shippingAddress || undefined}
          />
          
          {/* Save Button */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowNewAddressForm(false)}
              className="px-6 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveAddress}
              disabled={loading || !shippingAddress}
              className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ واستمرار'}
            </button>
          </div>
        </div>
      )}
      
      {/* Continue Button */}
      {!showNewAddressForm && shippingAddress && (
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={handleContinue}
            className="px-8 py-3 font-semibold text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700"
          >
            متابعة إلى الشحن ←
          </button>
        </div>
      )}
    </div>
  )
}
