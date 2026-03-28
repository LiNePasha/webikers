"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import type { Order } from "@/types";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) {
  if (!order) return null;

  // Extract meta_data fields
  const getMetaValue = (key: string) => {
    return order.meta_data?.find((m: any) => m.key === key)?.value;
  };

  const paymentProof = getMetaValue("_instapay_payment_proof");
  const walletFeeAmount = getMetaValue("_instapay_payment_amount");
  const shippingCityId = getMetaValue("_shipping_city_id");
  const shippingDistrictId = getMetaValue("_shipping_district_id");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case "processing":
        return <ClockIcon className="w-6 h-6 text-blue-600" />;
      case "pending":
        return <ClockIcon className="w-6 h-6 text-yellow-600" />;
      case "cancelled":
        return <XMarkIcon className="w-6 h-6 text-red-600" />;
      default:
        return <TruckIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      processing: "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      "on-hold": "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVendorName = (item: any) => {
    const vendorMeta = item.meta_data?.find((m: any) => m.key === "_vendor_id");
    if (vendorMeta) {
      const displayMeta = item.meta_data?.find(
        (m: any) => m.display_key === "البائع"
      );
      return displayMeta?.display_value || `بائع #${vendorMeta.value}`;
    }
    return null;
  };

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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl overflow-hidden transition-all transform bg-white shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="px-6 py-6 text-white bg-gradient-to-r from-blue-600 to-purple-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-bold">
                          طلب #{order.number || order.id}
                        </Dialog.Title>
                        <p className="mt-1 text-sm text-blue-100">
                          {formatDate(order.date_created)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 transition rounded-lg bg-white/20 hover:bg-white/30"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                  {/* Status Timeline */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <span className="font-bold">الحالة:</span>
                      <span>{getStatusText(order.status)}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        المنتجات
                      </h3>
                    </div>
                    <div className="p-4 space-y-3 bg-gray-50 rounded-xl">
                      {order.line_items.map((item, index) => {
                        const vendorName = getVendorName(item);
                        return (
                          <div
                            key={item.id}
                            className="p-4 transition-all bg-white rounded-lg hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start flex-1 gap-3">
                                {item.image?.src && (
                                  <img
                                    src={item.image.src}
                                    alt={item.name}
                                    className="object-cover w-20 h-20 border border-gray-200 rounded-lg"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="mb-1 font-bold text-gray-900">
                                    {item.name}
                                  </h4>
                                  {vendorName && (
                                    <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
                                      <BuildingOfficeIcon className="w-4 h-4" />
                                      <span>{vendorName}</span>
                                    </div>
                                  )}
                                  {item.sku && (
                                    <p className="mb-2 text-xs text-gray-500">
                                      كود المنتج: {item.sku}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-600">
                                      الكمية:{" "}
                                      <span className="font-semibold text-gray-900">
                                        {item.quantity}
                                      </span>
                                    </span>
                                    <span className="text-gray-600">
                                      السعر:{" "}
                                      <span className="font-semibold text-gray-900">
                                        {item.price}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-left">
                                <p className="mb-1 text-sm text-gray-500">
                                  الإجمالي
                                </p>
                                <p className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                                  {item.total}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                      طريقة الدفع
                    </h3>
                    <div className="p-4 space-y-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                      {!walletFeeAmount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">المجموع الفرعي:</span>
                          <span className="font-semibold text-gray-900">
                            {(
                              parseFloat(order.total) -
                              parseFloat(order.shipping_total) -
                              parseFloat(order.cart_tax)
                            ).toFixed(2)}{" "}
                            {order.currency}
                          </span>
                        </div>
                      )}

                      {walletFeeAmount && parseFloat(walletFeeAmount) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            ({order.status === "on-hold" ? "انتظار التأكيد" : "تم إثبات الدفع"})المبلغ المدفوع:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {parseFloat(walletFeeAmount).toFixed(2)}{" "}
                            {order.currency}
                          </span>
                        </div>
                      )}
                      {parseFloat(order.shipping_total) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">الشحن (الدفع عند الإستلام):</span>
                          <span className="font-semibold text-gray-900">
                            {order.shipping_total} {order.currency}
                          </span>
                        </div>
                      )}
                      {parseFloat(order.cart_tax) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">الضرائب:</span>
                          <span className="font-semibold text-gray-900">
                            {order.cart_tax} {order.currency}
                          </span>
                        </div>
                      )}
                      {order.fee_lines && order.fee_lines.length > 0 && (
                        <>
                          {order.fee_lines.map((fee) => (
                            <div
                              key={fee.id}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-700">{fee.name}:</span>
                              <span className="font-semibold text-gray-900">
                                {fee.total} {order.currency}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                      {parseFloat(order.discount_total) > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>الخصم:</span>
                          <span className="font-semibold">
                            -{order.discount_total} {order.currency}
                          </span>
                        </div>
                      )}
                      {/* <div className="pt-2 mt-2 border-t-2 border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            الإجمالي النهائي:
                          </span>
                          <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                            {order.total} {order.currency}
                          </span>
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* Payment Proof - Instapay */}
                  {paymentProof && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCardIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          إثبات الدفع - Instapay
                        </h3>
                      </div>
                      <div className="p-4 border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                        <div className="mb-3">
                          <p className="mb-2 text-sm text-gray-700">
                            تم رفع إثبات الدفع بنجاح
                          </p>
                          {walletFeeAmount && parseFloat(walletFeeAmount) > 0 && (
                            <p className="text-sm text-gray-600">
                              المبلغ المحول:{" "}
                              <span className="font-bold text-green-700">
                                {parseFloat(walletFeeAmount).toFixed(2)}{" "}
                                {order.currency}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="p-3 bg-white border border-green-200 rounded-lg">
                          <img
                            src={paymentProof}
                            alt="Payment Proof"
                            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                          />
                        </div>
                        <p className="mt-2 text-xs text-center text-gray-500">
                          صورة إثبات الدفع من المحفظة الإلكترونية
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Addresses Section */}
                  <div className="grid gap-4 mb-6 md:grid-cols-2">
                    {/* Billing Address */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPinIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          عنوان الفوترة
                        </h3>
                      </div>
                      <div className="p-4 space-y-2 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-sm">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            {order.billing.first_name} {order.billing.last_name}
                          </span>
                        </div>
                        {order.billing.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {order.billing.email}
                            </span>
                          </div>
                        )}
                        {order.billing.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <PhoneIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-right text-gray-700 dir-ltr">
                              {order.billing.phone}
                            </span>
                          </div>
                        )}
                        {order.billing.address_1 && (
                          <p className="mt-2 text-sm text-gray-700">
                            {order.billing.address_1}
                            {order.billing.address_2 &&
                              `, ${order.billing.address_2}`}
                          </p>
                        )}
                        {/* Note: billing.city may contain ID, use shipping address for display */}
                        {order.billing.city && order.billing.city.length < 30 && (
                          <p className="text-sm text-gray-600">
                            {order.billing.city}
                            {order.billing.state && `, ${order.billing.state}`}
                            {order.billing.postcode &&
                              ` - ${order.billing.postcode}`}
                          </p>
                        )}
                        {order.billing.company && (
                          <p className="text-sm text-gray-600">
                            الشركة: {order.billing.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping.address_1 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TruckIcon className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-bold text-gray-900">
                            عنوان الشحن
                          </h3>
                        </div>
                        <div className="p-4 space-y-2 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 text-sm">
                            <UserIcon className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              {order.shipping.first_name}{" "}
                              {order.shipping.last_name}
                            </span>
                          </div>
                          {order.shipping.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-right text-gray-700 dir-ltr">
                                {order.shipping.phone}
                              </span>
                            </div>
                          )}
                          <p className="mt-2 text-sm text-gray-700">
                            {order.shipping.address_1}
                            {order.shipping.address_2 &&
                              `, ${order.shipping.address_2}`}
                          </p>
                          {/* City and District from shipping fields (proper names, not IDs) */}
                          <div className="flex items-center gap-2 p-2 mt-2 text-sm rounded-lg bg-blue-50">
                            <MapPinIcon className="w-4 h-4 text-blue-600" />
                            <div>
                              {order.shipping.city && (
                                <span className="font-semibold text-gray-900">
                                  {order.shipping.city}
                                </span>
                              )}
                              {order.shipping.state && (
                                <span className="text-gray-700">
                                  {" "}
                                  - {order.shipping.state}
                                </span>
                              )}
                              {order.shipping.postcode && (
                                <span className="mr-2 text-xs text-gray-600">
                                  ({order.shipping.postcode})
                                </span>
                              )}
                            </div>
                          </div>
                          {order.shipping.company && (
                            <p className="text-sm text-gray-600">
                              الشركة: {order.shipping.company}
                            </p>
                          )}

                          {/* Shipping Method Details */}
                          {order.shipping_lines &&
                            order.shipping_lines.length > 0 && (
                              <div className="pt-3 mt-3 border-t border-gray-200">
                                {order.shipping_lines.map((line: any) => (
                                  <div key={line.id} className="text-sm">
                                    <p className="text-gray-600">
                                      طريقة الشحن:{" "}
                                      <span className="font-semibold text-gray-900">
                                        {line.method_title}
                                      </span>
                                    </p>
                                    {parseFloat(line.total) > 0 && (
                                      <p className="mt-1 text-gray-600">
                                        تكلفة الشحن:{" "}
                                        <span className="font-semibold text-gray-900">
                                          {line.total} {order.currency}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment & Dates */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Payment Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCardIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          معلومات الدفع
                        </h3>
                      </div>
                      <div className="p-4 space-y-2 bg-gray-50 rounded-xl">
                        <p className="text-sm">
                          <span className="text-gray-600">طريقة الدفع:</span>
                          <span className="mr-2 font-semibold text-gray-900">
                            {order.payment_method_title}
                          </span>
                        </p>
                        {order.transaction_id && (
                          <p className="text-sm">
                            <span className="text-gray-600">رقم المعاملة:</span>
                            <span className="mr-2 font-mono text-gray-900">
                              {order.transaction_id}
                            </span>
                          </p>
                        )}
                        {order.date_paid && (
                          <p className="text-sm">
                            <span className="text-gray-600">تاريخ الدفع:</span>
                            <span className="mr-2 text-gray-900">
                              {formatDate(order.date_paid)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Important Dates */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          التواريخ المهمة
                        </h3>
                      </div>
                      <div className="p-4 space-y-2 bg-gray-50 rounded-xl">
                        <p className="text-sm">
                          <span className="text-gray-600">تاريخ الطلب:</span>
                          <span className="mr-2 text-gray-900">
                            {formatDate(order.date_created)}
                          </span>
                        </p>
                        {order.date_completed && (
                          <p className="text-sm">
                            <span className="text-gray-600">
                              تاريخ الإكمال:
                            </span>
                            <span className="mr-2 text-gray-900">
                              {formatDate(order.date_completed)}
                            </span>
                          </p>
                        )}
                        {order.date_modified !== order.date_created && (
                          <p className="text-sm">
                            <span className="text-gray-600">آخر تحديث:</span>
                            <span className="mr-2 text-gray-900">
                              {formatDate(order.date_modified)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Note */}
                  {order.customer_note && (
                    <div className="mt-6">
                      <h3 className="mb-3 text-lg font-bold text-gray-900">
                        ملاحظات العميل
                      </h3>
                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
                        <p className="text-sm text-gray-700">
                          {order.customer_note}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                  {order.needs_payment && (
                    <a
                      href={order.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                    >
                      إكمال الدفع
                    </a>
                  )}
                  {order.status === "completed" && (
                    <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                      إعادة الطلب
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    إغلاق
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
