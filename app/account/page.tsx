"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import {
  UserIcon,
  ShoppingBagIcon,
  MapPinIcon,
  HeartIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import OverviewTab from "@/components/account/OverviewTab";
import OrdersTab from "@/components/account/OrdersTab";
import AddressesTab from "@/components/account/AddressesTab";
import WishlistTab from "@/components/account/WishlistTab";
import SettingsTab from "@/components/account/SettingsTab";

type Tab = "overview" | "orders" | "addresses" | "wishlist" | "settings";

export default function AccountPage() {
  const { user, setUser } = useUserStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (response.ok && data.user) {
          setUser(data.user);
          setAuthChecked(true);
          setLoading(false);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router, setUser]);

  const handleLogout = async () => {
    const { logout } = useUserStore.getState();
    await logout();
    router.push('/auth/login');
  };

  if (loading || !authChecked || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "نظرة عامة", icon: UserIcon },
    { id: "orders", name: "طلباتي", icon: ShoppingBagIcon },
    { id: "addresses", name: "العناوين", icon: MapPinIcon },
    { id: "wishlist", name: "المفضلة", icon: HeartIcon },
    { id: "settings", name: "الإعدادات", icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  مرحباً، {user.name || "عزيزي"}
                </h1>
                <p className="text-gray-500 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                        : "text-gray-700 hover:bg-gray-50 hover:scale-102"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 min-h-[600px]">
              {activeTab === "overview" && <OverviewTab user={user} />}
              {activeTab === "orders" && <OrdersTab />}
              {activeTab === "addresses" && <AddressesTab />}
              {activeTab === "wishlist" && <WishlistTab />}
              {activeTab === "settings" && <SettingsTab user={user} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
