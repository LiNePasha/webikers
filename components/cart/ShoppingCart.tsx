'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { MinusIcon, PlusIcon, TrashIcon, BuildingStorefrontIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { useShoppingCart } from '@/store/cartStore'
import { useToastStore } from '@/store/toastStore'
import VendorConflictModal from './VendorConflictModal'

export default function ShoppingCart() {
  const isOpen = useShoppingCart((state) => state.isOpen);
  const closeCart = useShoppingCart((state) => state.closeCart);
  const openCart = useShoppingCart((state) => state.openCart);
  const cartItems = useShoppingCart((state) => state.cartItems);
  const cartQuantityTotal = useShoppingCart((state) => state.cartQuantityTotal);
  const totalPrice = useShoppingCart((state) => state.totalPrice);
  const currentVendor = useShoppingCart((state) => state.currentVendor);
  const addToCart = useShoppingCart((state) => state.addToCart);
  const decreaseCartQuantity = useShoppingCart((state) => state.decreaseCartQuantity);
  const removeFromCart = useShoppingCart((state) => state.removeFromCart);
  
  // Vendor conflict modal state
  const showVendorConflict = useShoppingCart((state) => state.showVendorConflict);
  const pendingProduct = useShoppingCart((state) => state.pendingProduct);
  const setShowVendorConflict = useShoppingCart((state) => state.setShowVendorConflict);
  const clearCartAndAddProduct = useShoppingCart((state) => state.clearCartAndAddProduct);
  
  const addToast = useToastStore((state) => state.addToast);

  // Debug current vendor
  console.log('🛒 ShoppingCart - Current Vendor:', currentVendor);
  console.log('📦 ShoppingCart - Cart Items:', cartItems.map(item => ({
    id: item.id,
    name: item.name,
    vendor: item.vendor
  })));

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toLocaleString()} جنيه`
  }

  const handleClearAndAdd = async () => {
    if (pendingProduct) {
      await clearCartAndAddProduct(pendingProduct);
      addToast(`تم تغيير السلة وإضافة "${pendingProduct.name}" بنجاح`, 'success', 3000);
    }
  };

  const handleCancelConflict = () => {
    setShowVendorConflict(false);
  };

  return ( 
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 left-0 flex max-w-full pr-10 pointer-events-none">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="w-screen max-w-md pointer-events-auto">
                  <div className="flex flex-col h-full overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 px-4 py-6 overflow-y-auto sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          سلة المشتريات
                        </Dialog.Title>
                        <div className="flex items-center mr-3 h-7">
                          <button
                            type="button"
                            className="p-2 -m-2 text-gray-400 hover:text-gray-500"
                            onClick={closeCart}
                          >
                            <span className="sr-only">إغلاق السلة</span>
                            <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {cartItems.length === 0 ? (
                            <div className="py-12 text-center">
                              <div className="mb-4 text-gray-400">
                                <svg 
                                  className="w-12 h-12 mx-auto" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={1.5} 
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m9 6v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"
                                  />
                                </svg>
                              </div>
                              <h3 className="mb-2 text-lg font-medium text-gray-900">
                                السلة فارغة
                              </h3>
                              <p className="mb-6 text-gray-500">
                                لم تضف أي قطع غيار إلى السلة بعد
                              </p>
                              <Link
                                href="/products"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-brand-600 hover:bg-brand-700"
                                onClick={closeCart}
                              >
                                تصفح قطع الغيار
                              </Link>
                            </div>
                          ) : (
                            <>
                              {/* Current Vendor Info */}
                              {/* {currentVendor && (
                                <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                                  <div className="flex items-center gap-2">
                                    <BuildingStorefrontIcon className="w-5 h-5 text-blue-600" />
                                    <div>
                                      <p className="text-xs font-medium text-gray-600">البائع</p>
                                      <p className="text-sm font-bold text-gray-900">{currentVendor.name}</p>
                                    </div>
                                  </div>
                                  <p className="mt-2 text-xs text-gray-500 mr-7">
                                    💡 جميع المنتجات في السلة من نفس البائع
                                  </p>
                                </div>
                              )} */}
                              
                              <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {cartItems.map((product) => (
                                <li key={product.id} className="flex py-6">
                                  <div className="flex-shrink-0 w-24 h-24 overflow-hidden border border-gray-200 rounded-md">
                                    {product.thumbnail ? (
                                      <OptimizedImage src={product.thumbnail}
                                        alt={product.name || ''}
                                        width={96}
                                        height={96}
                                        className="object-cover object-center w-full h-full"
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                        <span className="text-xs text-gray-400">لا توجد صورة</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col flex-1 mr-4">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                          <Link href={`/products/${product.slug}`} onClick={closeCart}>
                                            {product.name}
                                          </Link>
                                        </h3>
                                        <p className="mr-4">{product.price && formatPrice(product.price)}</p>
                                      </div>
                                      
                                      {/* Product details */}
                                      <div className="mt-1 space-y-1 text-sm text-gray-500">
                                        {product.variation && Object.keys(product.variation).length > 0 && (
                                          <div className="flex flex-wrap gap-1 mb-1">
                                            {Object.entries(product.variation).map(([key, value]) => (
                                              <span key={key} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                                                {key}: {value}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        {product.brand && (
                                          <div className="flex items-center gap-2">
                                            <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full text-xs">
                                              {product.brand}
                                            </span>
                                            {product.model && (
                                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                                                {product.model}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                        {product.oem_number && (
                                          <p className="text-xs text-gray-600">
                                            رقم القطعة: {product.oem_number}
                                          </p>
                                        )}
                                        {product.vendor && (
                                          <p className="flex items-center gap-1 text-xs font-medium text-blue-600">
                                            <BuildingStorefrontIcon className="w-3 h-3" />
                                            {product.vendor.store_name || product.vendor.name}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-end justify-between flex-1 text-sm">
                                      <div className="flex items-center gap-3">
                                        <label htmlFor={`quantity-${product.id}`} className="text-gray-500">
                                          الكمية:
                                        </label>
                                        <div className="flex items-center border border-gray-300 rounded-md">
                                          <button
                                            type="button"
                                            onClick={() => decreaseCartQuantity(product)}
                                            className="p-1 text-gray-400 hover:text-gray-600"
                                          >
                                            <MinusIcon className="w-4 h-4" />
                                          </button>
                                          <span className="px-3 py-1 text-gray-900 min-w-[3rem] text-center">
                                            {product.quantity}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              console.log('➕ Increasing quantity for:', product.name, 'Vendor:', product.vendor);
                                              addToCart(product);
                                            }}
                                            className="p-1 text-gray-400 hover:text-gray-600"
                                          >
                                            <PlusIcon className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          onClick={() => removeFromCart(product.id)}
                                          className="flex items-center gap-1 font-medium text-red-600 hover:text-red-500"
                                        >
                                          <TrashIcon className="w-4 h-4" />
                                          إزالة
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {cartItems.length > 0 && (
                      <div className="px-4 py-6 border-t border-gray-200 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>الإجمالي</p>
                          <p>{totalPrice.toLocaleString()} جنيه</p>
                        </div>
                        <div className="flex justify-between mt-1 text-sm text-gray-500">
                          <p>عدد القطع</p>
                          <p>{cartQuantityTotal} قطعة</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          الشحن والضرائب محسوبة عند الدفع.
                        </p>
                        <div className="mt-6">
                          <Link
                            href="/checkout"
                            className="flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                            onClick={closeCart}
                          >
                            إتمام الشراء
                          </Link>
                        </div>
                        <div className="flex justify-center mt-6 text-sm text-center text-gray-500">
                          <p>
                            أو{' '}
                            <button
                              type="button"
                              className="font-medium text-blue-600 hover:text-blue-500"
                              onClick={closeCart}
                            >
                              متابعة التسوق
                              <span aria-hidden="true"> &larr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>

    {/* Vendor Conflict Modal */}
    {pendingProduct && currentVendor && pendingProduct.vendor && (
      <VendorConflictModal
        isOpen={showVendorConflict}
        onClose={handleCancelConflict}
        onClearAndAdd={handleClearAndAdd}
        onCancel={handleCancelConflict}
        currentVendor={currentVendor}
        newVendor={{
          id: pendingProduct.vendor.id,
          name: pendingProduct.vendor.store_name || pendingProduct.vendor.name,
        }}
        newProductName={pendingProduct.name}
      />
    )}
  </>
  )
}