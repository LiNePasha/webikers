"use client";

import { useEffect, useMemo } from "react";
import {
  ShoppingBagIcon,
  BellIcon,
  ShieldCheckIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import QuickActionCard from "./QuickActionCard";
import { useAccountStore } from "@/store/accountStore";

export default function OverviewTab({ user }: { user: any }) {
  const orders = useAccountStore((state) => state.orders);
  const wishlist = useAccountStore((state) => state.wishlist);
  const loading = useAccountStore((state) => state.loading.orders || state.loading.wishlist);
  const fetchOrders = useAccountStore((state) => state.fetchOrders);
  const fetchWishlist = useAccountStore((state) => state.fetchWishlist);

  useEffect(() => {
    fetchOrders();
    fetchWishlist();
  }, []);

  const stats = useMemo(() => ({
    totalOrders: orders.length,
    pendingOrders: orders.filter((o: any) => o.status === "pending" || o.status === "processing").length,
    completedOrders: orders.filter((o: any) => o.status === "completed").length,
    wishlistCount: wishlist.length,
  }), [orders, wishlist]);

  const statsCards = [
    { label: "إجمالي الطلبات", value: stats.totalOrders, color: "from-blue-500 to-blue-600", icon: ShoppingBagIcon },
    { label: "قيد التنفيذ", value: stats.pendingOrders, color: "from-yellow-500 to-orange-600", icon: BellIcon },
    { label: "المكتملة", value: stats.completedOrders, color: "from-green-500 to-green-600", icon: ShieldCheckIcon },
    { label: "المفضلة", value: stats.wishlistCount, color: "from-pink-500 to-red-600", icon: HeartIcon },
  ];

  return (
    <div className="space-y-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">نظرة عامة</h2>
      
      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm opacity-90">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="mb-4 text-xl font-bold text-gray-900">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuickActionCard
            title="تصفح المنتجات"
            description="اكتشف أحدث قطع الغيار"
            icon="🛒"
            href="/products"
          />
          <QuickActionCard
            title="تتبع الطلبات"
            description="تابع حالة طلباتك"
            icon="📦"
            onClick={() => {}}
          />
          <QuickActionCard
            title="اتصل بنا"
            description="خدمة العملاء 24/7"
            icon="💬"
            href="/contact"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 mt-8 bg-gray-50 rounded-xl">
        <h3 className="mb-4 text-xl font-bold text-gray-900">النشاط الأخير</h3>
        <div className="py-12 text-center text-gray-500">
          <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">لا توجد أنشطة حتى الآن</p>
          <p className="mt-2 text-sm">ابدأ التسوق الآن!</p>
        </div>
      </div>
    </div>
  );
}
