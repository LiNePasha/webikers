"use client";

import { useEffect, useState } from "react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useAccountStore } from "@/store/accountStore";
import OrderDetailsModal from "./OrderDetailsModal";
import type { Order } from "@/types";

export default function OrdersTab() {
  const orders = useAccountStore((state) => state.orders);
  const loading = useAccountStore((state) => state.loading.orders);
  const error = useAccountStore((state) => state.error.orders);
  const fetchOrders = useAccountStore((state) => state.fetchOrders);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      "on-hold": "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const statusText: Record<string, string> = {
      pending: "قيد الانتظار",
      processing: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغي",
      "on-hold": "معلق",
    };
    return statusText[status] || status;
  };

  // Extract meta_data fields
  const getMetaValue = (key: string,order: any) => {
    return order.meta_data?.find((m: any) => m.key === key)?.value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block px-6 py-4 text-red-600 bg-red-50 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">طلباتي</h2>
        <span className="text-sm text-gray-500">إجمالي الطلبات: {orders.length}</span>
      </div>
      
      {orders.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBagIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="mb-2 text-xl font-semibold text-gray-600">لا توجد طلبات</h3>
          <p className="mb-6 text-gray-500">ابدأ التسوق واطلب منتجاتك المفضلة!</p>
          <a
            href="/products"
            className="inline-block px-6 py-3 text-white transition-all bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:shadow-lg"
          >
            تصفح المنتجات
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.line_items?.length || 0;
            const totalItems = order.line_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            
            return (
              <div
                key={order.id}
                className="relative p-6 overflow-hidden transition-all bg-white border border-gray-200 group rounded-2xl hover:shadow-xl hover:border-blue-300"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 w-full h-1 transition-opacity opacity-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 group-hover:opacity-100"></div>
                
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 transition-transform bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl group-hover:scale-110">
                      <ShoppingBagIcon className="text-blue-600 w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-xl font-bold text-gray-900">
                        طلب #{order.number || order.id}
                      </h3>
                      <p className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(order.date_created).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {itemCount} منتج • {totalItems} قطعة
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    {order.date_paid && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        تم الدفع
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mb-4 border-t border-gray-100">
                  <div className="space-y-2.5">
                    {order.line_items?.slice(0, 2).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 text-sm transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          {item.image?.src && (
                            <img 
                              src={item.image.src} 
                              alt={item.name}
                              className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
                            />
                          )}
                          {!item.image?.src && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <div>
                            <span className="block font-medium text-gray-800">{item.name}</span>
                            <span className="text-xs text-gray-500">× {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">
                          {item.total} {order.currency}
                        </span>
                      </div>
                    ))}
                    {order.line_items?.length > 2 && (
                      <p className="text-sm font-medium text-blue-600 pr-9">
                        + {order.line_items.length - 2} منتجات أخرى...
                      </p>
                    )}
                  </div>

                  {/* Shipping Address Preview */}
                  {order.shipping?.city && (
                    <div className="p-3 mt-4 border border-blue-100 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <span className="font-medium text-gray-700">عنوان الشحن: </span>
                          <span className="text-gray-600">
                            {order.shipping.city}
                            {order.shipping.state && ` - ${order.shipping.state}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-100">
                    <span className="text-base font-bold text-gray-700">الإجمالي النهائي:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
                        {order.total}
                      </span>
                      <span className="mr-1 text-lg font-bold text-gray-600">{order.currency}</span>
                    </div>
                  </div> */}
                </div>

                {/* Payment Method */}
                {order.payment_method_title && (
                  <div className="px-3 py-2 mb-4 border border-blue-100 rounded-lg bg-blue-50">
                    <p className="flex items-center justify-between gap-2 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="font-medium text-gray-700">{order.payment_method_title}</span>
                      <span className="text-lg text-brand-600">{getMetaValue("_instapay_payment_amount",order)} ج.م.</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleViewDetails(order)}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    عرض التفاصيل
                  </button>
                  {order.status === "completed" && (
                    <button className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 hover:shadow-md">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      إعادة الطلب
                    </button>
                  )}
                  {order.needs_payment && (
                    <a
                      href={order.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all text-sm font-bold flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      إكمال الدفع
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </div>
  );
}
