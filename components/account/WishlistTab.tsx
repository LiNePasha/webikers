"use client";

import { useEffect } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useAccountStore } from "@/store/accountStore";

export default function WishlistTab() {
  const wishlist = useAccountStore((state) => state.wishlist);
  const loading = useAccountStore((state) => state.loading.wishlist);
  const error = useAccountStore((state) => state.error.wishlist);
  const fetchWishlist = useAccountStore((state) => state.fetchWishlist);
  const removeFromWishlist = useAccountStore((state) => state.removeFromWishlist);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    const result = await removeFromWishlist(productId);
    if (!result) {
      alert("فشل في حذف المنتج");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl inline-block">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">قائمة المفضلة</h2>
        <span className="text-sm text-gray-500">{wishlist.length} منتج</span>
      </div>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <HeartIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">قائمة المفضلة فارغة</h3>
          <p className="text-gray-500 mb-6">احفظ منتجاتك المفضلة هنا!</p>
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            اكتشف المنتجات
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="relative aspect-square bg-gray-100">
                {product.images?.[0]?.src && (
                  <img
                    src={product.images[0].src}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {product.price} {product.currency || "EGP"}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                    أضف للسلة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
