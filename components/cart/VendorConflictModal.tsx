"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface VendorConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAndAdd: () => void;
  onCancel: () => void;
  currentVendor: {
    id: number;
    name: string;
  };
  newVendor: {
    id: number;
    name: string;
  };
  newProductName?: string;
}

export default function VendorConflictModal({
  isOpen,
  onClose,
  onClearAndAdd,
  onCancel,
  currentVendor,
  newVendor,
  newProductName,
}: VendorConflictModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                      </div>
                      <Dialog.Title className="text-xl font-bold">
                        تنبيه بائع مختلف!
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <div className="mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        لديك منتجات في السلة من بائع مختلف. في نظام المتجر، كل طلب يجب أن يكون من <strong>بائع واحد فقط</strong>.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Current Vendor */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
                          <p className="text-sm font-semibold text-gray-700">
                            البائع الحالي في السلة:
                          </p>
                        </div>
                        <p className="text-base font-bold text-blue-700 mr-7">
                          {currentVendor.name}
                        </p>
                      </div>

                      {/* New Vendor */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-sm font-semibold text-gray-700">
                            المنتج الجديد من:
                          </p>
                        </div>
                        <p className="text-base font-bold text-green-700 mr-7">
                          {newVendor.name}
                        </p>
                        {newProductName && (
                          <p className="text-xs text-gray-600 mr-7 mt-1">
                            {newProductName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 font-medium mb-2">
                        ماذا تريد أن تفعل؟
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1 mr-4">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span><strong>مسح السلة وإضافة المنتج الجديد:</strong> سيتم حذف جميع المنتجات الحالية</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span><strong>الإلغاء:</strong> الاحتفاظ بالمنتجات الحالية وعدم إضافة المنتج الجديد</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={onClearAndAdd}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-bold text-sm"
                    >
                      مسح السلة وإضافة المنتج الجديد
                    </button>
                    <button
                      onClick={onCancel}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm"
                    >
                      إلغاء - الاحتفاظ بالسلة الحالية
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
