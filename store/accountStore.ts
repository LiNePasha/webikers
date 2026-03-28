import { create } from "zustand";
import type { Order } from "@/types";

interface Address {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  city?: string;
  postcode?: string;
  phone?: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  currency?: string;
  images?: { src: string }[];
}

interface AccountState {
  orders: Order[];
  addresses: {
    billing: Address;
    shipping: Address;
  };
  wishlist: Product[];
  loading: {
    orders: boolean;
    addresses: boolean;
    wishlist: boolean;
  };
  error: {
    orders: string;
    addresses: string;
    wishlist: string;
  };
  
  // Actions
  fetchOrders: () => Promise<void>;
  fetchAddresses: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  updateAddresses: (billing: Address, shipping: Address) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  clearErrors: () => void;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  orders: [],
  addresses: {
    billing: {},
    shipping: {},
  },
  wishlist: [],
  loading: {
    orders: false,
    addresses: false,
    wishlist: false,
  },
  error: {
    orders: "",
    addresses: "",
    wishlist: "",
  },

  fetchOrders: async () => {
    // Don't fetch if already loaded and not stale
    if (get().orders.length > 0 && !get().loading.orders) {
      return;
    }

    set((state) => ({
      loading: { ...state.loading, orders: true },
      error: { ...state.error, orders: "" },
    }));

    try {
      const response = await fetch("/api/user/orders");
      const data = await response.json();

      if (data.success) {
        set({ orders: data.orders || [] });
      } else {
        set((state) => ({
          error: { ...state.error, orders: data.error || "فشل في تحميل الطلبات" },
        }));
      }
    } catch (err) {
      set((state) => ({
        error: { ...state.error, orders: "حدث خطأ أثناء تحميل الطلبات" },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, orders: false },
      }));
    }
  },

  fetchAddresses: async () => {
    // Don't fetch if already loaded
    if (
      (get().addresses.billing.address_1 || get().addresses.shipping.address_1) &&
      !get().loading.addresses
    ) {
      return;
    }

    set((state) => ({
      loading: { ...state.loading, addresses: true },
      error: { ...state.error, addresses: "" },
    }));

    try {
      const response = await fetch("/api/user/addresses");
      const data = await response.json();

      if (data.success) {
        set({
          addresses: {
            billing: data.billing || {},
            shipping: data.shipping || {},
          },
        });
      } else {
        set((state) => ({
          error: { ...state.error, addresses: data.error || "فشل في تحميل العناوين" },
        }));
      }
    } catch (err) {
      set((state) => ({
        error: { ...state.error, addresses: "حدث خطأ أثناء تحميل العناوين" },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, addresses: false },
      }));
    }
  },

  fetchWishlist: async () => {
    // Don't fetch if already loaded
    if (get().wishlist.length > 0 && !get().loading.wishlist) {
      return;
    }

    set((state) => ({
      loading: { ...state.loading, wishlist: true },
      error: { ...state.error, wishlist: "" },
    }));

    try {
      const response = await fetch("/api/user/wishlist");
      const data = await response.json();

      if (data.success) {
        set({ wishlist: data.wishlist || [] });
      } else {
        set((state) => ({
          error: { ...state.error, wishlist: data.error || "فشل في تحميل المفضلة" },
        }));
      }
    } catch (err) {
      set((state) => ({
        error: { ...state.error, wishlist: "حدث خطأ أثناء تحميل المفضلة" },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, wishlist: false },
      }));
    }
  },

  updateAddresses: async (billing: Address, shipping: Address) => {
    try {
      const response = await fetch("/api/user/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing, shipping }),
      });

      const data = await response.json();

      if (data.success) {
        set({
          addresses: {
            billing: data.billing || billing,
            shipping: data.shipping || shipping,
          },
        });
        return true;
      } else {
        set((state) => ({
          error: { ...state.error, addresses: data.error || "فشل في تحديث العناوين" },
        }));
        return false;
      }
    } catch (err) {
      set((state) => ({
        error: { ...state.error, addresses: "حدث خطأ أثناء حفظ العناوين" },
      }));
      return false;
    }
  },

  removeFromWishlist: async (productId: number) => {
    try {
      const response = await fetch(`/api/user/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== productId),
        }));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  },

  clearErrors: () => {
    set({
      error: {
        orders: "",
        addresses: "",
        wishlist: "",
      },
    });
  },
}));
