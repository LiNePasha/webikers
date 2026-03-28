"use client";

import { useEffect, useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { useAccountStore } from "@/store/accountStore";

export default function AddressesTab() {
  const addresses = useAccountStore((state) => state.addresses);
  const loading = useAccountStore((state) => state.loading.addresses);
  const storeError = useAccountStore((state) => state.error.addresses);
  const fetchAddresses = useAccountStore((state) => state.fetchAddresses);
  const updateAddresses = useAccountStore((state) => state.updateAddresses);

  const [localAddresses, setLocalAddresses] = useState(addresses);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    setLocalAddresses(addresses);
  }, [addresses]);

  useEffect(() => {
    if (storeError) {
      setError(storeError);
    }
  }, [storeError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const result = await updateAddresses(localAddresses.billing, localAddresses.shipping);

    if (result) {
      setSuccess("تم تحديث العناوين بنجاح");
      setEditMode(false);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(storeError || "فشل في تحديث العناوين");
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAddresses = addresses.billing?.address_1 || addresses.shipping?.address_1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">عناويني</h2>
        {hasAddresses && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            تعديل العناوين
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 text-green-600 px-6 py-4 rounded-xl">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {!hasAddresses && !editMode ? (
        <div className="text-center py-20">
          <MapPinIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد عناوين محفوظة</h3>
          <p className="text-gray-500 mb-6">أضف عنوانك لتسهيل عملية الشراء</p>
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            + إضافة عنوان
          </button>
        </div>
      ) : editMode ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Billing Address */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">عنوان الفوترة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="الاسم الأول"
                value={localAddresses.billing?.first_name || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, billing: { ...localAddresses.billing, first_name: e.target.value }})}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="اسم العائلة"
                value={localAddresses.billing?.last_name || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, billing: { ...localAddresses.billing, last_name: e.target.value }})}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="العنوان"
                value={localAddresses.billing?.address_1 || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, billing: { ...localAddresses.billing, address_1: e.target.value }})}
                className="md:col-span-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="المدينة"
                value={localAddresses.billing?.city || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, billing: { ...localAddresses.billing, city: e.target.value }})}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="الرمز البريدي"
                value={localAddresses.billing?.postcode || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, billing: { ...localAddresses.billing, postcode: e.target.value }})}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={localAddresses.billing?.phone || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, billing: { ...localAddresses.billing, phone: e.target.value }})}
                className="md:col-span-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">عنوان الشحن</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="الاسم الأول"
                value={localAddresses.shipping?.first_name || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, shipping: { ...localAddresses.shipping, first_name: e.target.value }})}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="اسم العائلة"
                value={localAddresses.shipping?.last_name || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, shipping: { ...localAddresses.shipping, last_name: e.target.value }})}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="العنوان"
                value={localAddresses.shipping?.address_1 || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, shipping: { ...localAddresses.shipping, address_1: e.target.value }})}
                className="md:col-span-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="المدينة"
                value={localAddresses.shipping?.city || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, shipping: { ...localAddresses.shipping, city: e.target.value }})}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="الرمز البريدي"
                value={localAddresses.shipping?.postcode || ""}
                onChange={(e) => setLocalAddresses({ ...localAddresses, shipping: { ...localAddresses.shipping, postcode: e.target.value }})}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : "حفظ العناوين"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setLocalAddresses(addresses);
              }}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Billing Display */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border-2 border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-blue-600" />
              عنوان الفوترة
            </h3>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">{addresses.billing?.first_name} {addresses.billing?.last_name}</p>
              <p>{addresses.billing?.address_1}</p>
              <p>{addresses.billing?.city} {addresses.billing?.postcode}</p>
              <p className="text-blue-600">{addresses.billing?.phone}</p>
            </div>
          </div>

          {/* Shipping Display */}
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border-2 border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-purple-600" />
              عنوان الشحن
            </h3>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">{addresses.shipping?.first_name} {addresses.shipping?.last_name}</p>
              <p>{addresses.shipping?.address_1}</p>
              <p>{addresses.shipping?.city} {addresses.shipping?.postcode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
