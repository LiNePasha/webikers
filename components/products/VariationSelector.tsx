'use client'

import { useState, useEffect } from 'react'
import { Product, ProductVariation } from '@/types'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface VariationSelectorProps {
  product: Product
  onVariationSelect: (variation: ProductVariation | null, attributes: Record<string, string>) => void
}

export default function VariationSelector({ product, onVariationSelect }: VariationSelectorProps) {
  const [variations, setVariations] = useState<ProductVariation[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch variations on mount
  useEffect(() => {
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      fetchVariations()
    }
  }, [product.id])

  const fetchVariations = async () => {
    try {
      setLoading(true)
      const vars = await wooCommerceAPI.getProductVariations(product.id)
      setVariations(vars)
      console.log('✅ Variations loaded:', vars)
    } catch (error) {
      console.error('Error loading variations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Find matching variation based on selected attributes
  useEffect(() => {
    if (variations.length === 0) return

    const variableAttributes = product.attributes.filter(attr => attr.variation)
    
    // Check if all variable attributes are selected
    const allSelected = variableAttributes.every(attr => selectedAttributes[attr.name])
    
    if (!allSelected) {
      setSelectedVariation(null)
      onVariationSelect(null, selectedAttributes)
      return
    }

    // Find matching variation
    const match = variations.find(variation => {
      return variation.attributes.every(varAttr => {
        const selectedValue = selectedAttributes[varAttr.name]
        return selectedValue === varAttr.option
      })
    })

    setSelectedVariation(match || null)
    onVariationSelect(match || null, selectedAttributes)
  }, [selectedAttributes, variations])

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => {
      // If clicking the same option, deselect it
      if (prev[attributeName] === value) {
        const { [attributeName]: removed, ...rest } = prev
        return rest
      }
      // Otherwise, select the new option
      return {
        ...prev,
        [attributeName]: value
      }
    })
  }

  const isAttributeAvailable = (attributeName: string, option: string): boolean => {
    if (variations.length === 0) return true

    // Get currently selected attributes except this one
    const otherSelected = Object.entries(selectedAttributes).filter(
      ([key]) => key !== attributeName
    )

    // If no other attributes selected, all options are available
    if (otherSelected.length === 0) return true

    // Check if there's a variation with this combination
    return variations.some(variation => {
      // Check if other selected attributes match
      const othersMatch = otherSelected.every(([key, value]) => {
        const varAttr = variation.attributes.find(a => a.name === key)
        return varAttr && varAttr.option === value
      })

      // Check if this option exists in this variation
      const thisAttr = variation.attributes.find(a => a.name === attributeName)
      const thisMatches = thisAttr && thisAttr.option === option

      return othersMatch && thisMatches
    })
  }

  if (product.type !== 'variable') return null
  if (loading) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
          <p className="text-gray-600">جاري تحميل الخيارات...</p>
        </div>
      </div>
    )
  }

  const variableAttributes = product.attributes.filter(attr => attr.variation)

  return (
    <div className="space-y-6">
      <div className="p-4 border-r-4 rounded-lg bg-blue-50 border-blue-500">
        <p className="flex items-center gap-2 text-sm font-medium text-blue-900">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          هذا المنتج متوفر بخيارات متعددة. اختر المواصفات المطلوبة
        </p>
      </div>

      {variableAttributes.map((attribute) => (
        <div key={attribute.name} className="space-y-3">
          <label className="block text-base font-bold text-gray-900">
            {attribute.name}
            {!selectedAttributes[attribute.name] && (
              <span className="mr-2 text-sm font-normal text-red-600">* مطلوب</span>
            )}
          </label>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {attribute.options.map((option) => {
              const isSelected = selectedAttributes[attribute.name] === option
              const isAvailable = isAttributeAvailable(attribute.name, option)
              
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAttributeChange(attribute.name, option)}
                  disabled={!isSelected && !isAvailable}
                  className={`
                    relative px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200
                    ${isSelected
                      ? 'bg-brand-500 border-brand-500 text-white shadow-lg scale-105 hover:bg-brand-600'
                      : isAvailable
                        ? 'bg-white border-gray-300 text-gray-900 hover:border-brand-400 hover:bg-brand-50'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  {option}
                  {isSelected && (
                    <svg className="absolute w-5 h-5 text-white top-1 left-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selectedVariation && (
        <div className="p-4 border-2 rounded-lg bg-green-50 border-green-500">
          <div className="flex items-start gap-3">
            <svg className="flex-shrink-0 w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="mb-2 font-bold text-green-900">الخيار المتاح:</p>
              <div className="space-y-1 text-sm text-green-800">
                {selectedVariation.stock_status === 'instock' ? (
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    متوفر في المخزون
                    {selectedVariation.stock_quantity && (
                      <span className="font-medium">({selectedVariation.stock_quantity} قطعة)</span>
                    )}
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    نفد من المخزون
                  </p>
                )}
                {selectedVariation.sku && (
                  <p className="text-gray-600">رمز المنتج: {selectedVariation.sku}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedVariation && Object.keys(selectedAttributes).length > 0 && (
        <div className="p-4 border-2 rounded-lg bg-yellow-50 border-yellow-500">
          <p className="flex items-center gap-2 text-sm text-yellow-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            يرجى اختيار جميع الخيارات المطلوبة
          </p>
        </div>
      )}
    </div>
  )
}
