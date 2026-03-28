import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";
import { useToastStore } from "./toastStore";

interface CartState {
  cartItems: CartItem[];
  isOpen: boolean;
  _hasHydrated: boolean;
  
  // Vendor conflict state
  showVendorConflict: boolean;
  pendingProduct: CartItem | null;
  
  // Computed values
  cartQuantity: number;
  cartQuantityTotal: number;
  totalPrice: number;
  currentVendor: { id: number; name: string } | null;
  
  // Actions
  addToCart: (product: CartItem, skipVendorCheck?: boolean) => Promise<boolean>;
  decreaseCartQuantity: (product: CartItem) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  getItemQuantity: (product: CartItem) => number;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => void;
  resetCart: () => void;
  clearCartAndAddProduct: (product: CartItem) => Promise<void>;
  setShowVendorConflict: (show: boolean) => void;
  setPendingProduct: (product: CartItem | null) => void;
  updateComputedValues: () => void;
}

const calculateTotalPrice = (cartItems: CartItem[]) => {
  let price = 0;
  cartItems?.forEach((item) => {
    if (typeof item.price === 'string') {
      price += (parseFloat(item.price) || 0) * item.quantity;
    }
  });
  return price;
};

// API calls for WooCommerce (optional - fallback to client-side cart)
const callAddToCart = async (product: CartItem) => {
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: product.id,
        quantity: product.quantity ?? 1,
      }),
    });

    if (response.ok) {
      console.log("Product added to WooCommerce cart successfully");
      const result = await response.json();
      return result;
    } else {
      console.warn("WooCommerce cart sync failed, using client-side cart only");
      return null;
    }
  } catch (error) {
    console.warn("WooCommerce cart API not available, using client-side cart only:", error);
    return null;
  }
};

const callRemoveFromCart = async (itemId: number) => {
  try {
    const response = await fetch('/api/cart/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: itemId,
      }),
    });

    if (response.ok) {
      console.log("Product removed from WooCommerce cart successfully");
      const result = await response.json();
      return result;
    } else {
      console.warn("WooCommerce cart sync failed, using client-side cart only");
      return null;
    }
  } catch (error) {
    console.warn("WooCommerce cart API not available, using client-side cart only:", error);
    return null;
  }
};

const updateCartQuantity = async (product: CartItem, quantity: number) => {
  try {
    const response = await fetch('/api/cart/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: product.id,
        quantity: quantity,
      }),
    });

    if (response.ok) {
      console.log("WooCommerce cart quantity updated successfully");
      const result = await response.json();
      return result;
    } else {
      console.warn("WooCommerce cart sync failed, using client-side cart only");
      return null;
    }
  } catch (error) {
    console.warn("WooCommerce cart API not available, using client-side cart only:", error);
    return null;
  }
};

export const useShoppingCart = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isOpen: false,
      _hasHydrated: false,
      showVendorConflict: false,
      pendingProduct: null,
      cartQuantity: 0,
      cartQuantityTotal: 0,
      totalPrice: 0,
      currentVendor: null,

      setShowVendorConflict: (show: boolean) => {
        set({ showVendorConflict: show });
      },

      setPendingProduct: (product: CartItem | null) => {
        set({ pendingProduct: product });
      },

      // Helper to update computed values
      updateComputedValues: () => {
        const cartItems = get().cartItems;
        const cartQuantity = cartItems.length;
        const cartQuantityTotal = cartItems.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = calculateTotalPrice(cartItems);
        const currentVendor = cartItems.length === 0 ? null : 
          (cartItems[0].vendor ? {
            id: cartItems[0].vendor.id,
            name: cartItems[0].vendor.store_name || cartItems[0].vendor.name
          } : null);
        
        set({ cartQuantity, cartQuantityTotal, totalPrice, currentVendor });
      },

      resetCart: () => {
        console.log("Resetting cart");
        set({ 
          cartItems: [], 
          pendingProduct: null, 
          showVendorConflict: false,
          cartQuantity: 0,
          cartQuantityTotal: 0,
          totalPrice: 0,
          currentVendor: null
        });
      },

      clearCartAndAddProduct: async (product: CartItem) => {
        console.log("Clearing cart and adding new product from different vendor");
        
        // Clear existing cart
        set({ 
          cartItems: [], 
          showVendorConflict: false, 
          pendingProduct: null,
          cartQuantity: 0,
          cartQuantityTotal: 0,
          totalPrice: 0,
          currentVendor: null
        });
        
        // Add new product
        const newItem: CartItem = {
          id: product.id,
          product_id: product.id,
          variation_id: product.variation_id, // Variable product variation ID
          variation: product.variation, // Variable product attributes
          product: product.product || product as any,
          slug: product.slug,
          name: product.name,
          thumbnail: product.thumbnail,
          image: product.image || product.thumbnail,
          price: product.price || '0',
          quantity: product.quantity ?? 1,
          total: parseFloat(product.price || '0') * (product.quantity ?? 1),
          brand: product.brand,
          model: product.model,
          part_category: product.part_category,
          oem_number: product.oem_number,
          vendor: product.vendor,
          vendor_id: product.vendor?.id || 0,
          vendor_name: product.vendor?.name,
        };

        set({ cartItems: [newItem] });
        get().updateComputedValues();
        
        // Try to add on server (optional)
        try {
          await callAddToCart(newItem);
        } catch (error) {
          console.warn("Server sync skipped:", error);
        }
      },

      addToCart: async (product: CartItem, skipVendorCheck = false) => {
        console.log("🛒 Adding to cart:", product.name);
        console.log("📦 Product vendor data:", product.vendor);
        
        const cartItems = get().cartItems;
        const currentVendor = get().currentVendor;
        
        console.log("🏪 Current vendor in cart:", currentVendor);
        console.log("📊 Cart items count:", cartItems.length);
        
        // DISABLED: Vendor conflict check - Single vendor store
        // Since this is a single vendor store, skip vendor conflict checking
        const SINGLE_VENDOR_STORE = true;
        
        // Check vendor conflict (unless explicitly skipped or single vendor store)
        if (!skipVendorCheck && !SINGLE_VENDOR_STORE && cartItems.length > 0) {
          // If cart has items, check vendor compatibility
          if (currentVendor && product.vendor) {
            // Both have vendor data - check if they match
            console.log("🔍 Checking vendor conflict...");
            console.log("   Current vendor ID:", currentVendor?.id);
            console.log("   New product vendor ID:", product.vendor.id);
            
            if (currentVendor.id !== product.vendor.id) {
              console.log("⚠️ Vendor conflict detected!");
              console.log("   Current:", currentVendor.name, `(ID: ${currentVendor.id})`);
              console.log("   New:", product.vendor.name, `(ID: ${product.vendor.id})`);
              set({ 
                showVendorConflict: true, 
                pendingProduct: product 
              });
              return false; // Indicate that product was not added
            } else {
              console.log("✅ Same vendor - OK to add");
            }
          } else if (currentVendor && !product.vendor) {
            // Cart has vendor but new product doesn't - show warning
            console.log("⚠️ Cannot add product without vendor info to cart with vendor");
            set({ 
              showVendorConflict: true, 
              pendingProduct: product 
            });
            return false;
          } else if (!currentVendor && product.vendor) {
            // Cart has no vendor but new product does - show warning
            console.log("⚠️ Cannot add product with vendor to cart without vendor info");
            set({ 
              showVendorConflict: true, 
              pendingProduct: product 
            });
            return false;
          }
          // If both don't have vendor, allow (legacy products)
        } else {
          console.log("⏭️ Skipping vendor check:", {
            skipVendorCheck,
            hasVendor: !!product.vendor,
            cartEmpty: cartItems.length === 0
          });
        }
        
        // For variable products, check both product ID and variation ID
        const itemIndex = cartItems.findIndex((item) => {
          if (product.variation_id) {
            // Variable product: match both product ID and variation ID
            return item.id === product.id && item.variation_id === product.variation_id;
          } else {
            // Simple product: match product ID only
            return item.id === product.id && !item.variation_id;
          }
        });

        if (itemIndex !== -1) {
          // Item already exists, increase quantity
          const newCartItems = [...cartItems];
          newCartItems[itemIndex].quantity++;
          set({ cartItems: newCartItems });
          get().updateComputedValues();
          
          // Show success toast
          useToastStore.getState().addToast(
            `تم تحديث الكمية: ${product.name}`,
            "success",
            3000
          );
          
          // Try to update on server (optional)
          try {
            await updateCartQuantity(product, newCartItems[itemIndex].quantity);
          } catch (error) {
            console.warn("Server sync skipped:", error);
          }
        } else {
          // New item, add to cart
          const newItem: CartItem = {
            id: product.id,
            product_id: product.id,
            variation_id: product.variation_id, // Variable product variation ID
            variation: product.variation, // Variable product attributes
            product: product.product || product as any,
            slug: product.slug,
            name: product.name,
            thumbnail: product.thumbnail,
            image: product.image || product.thumbnail,
            price: product.price || '0',
            quantity: product.quantity ?? 1,
            total: parseFloat(product.price || '0') * (product.quantity ?? 1),
            brand: product.brand,
            model: product.model,
            part_category: product.part_category,
            oem_number: product.oem_number,
            vendor: product.vendor,
            vendor_id: product.vendor?.id || 0,
            vendor_name: product.vendor?.name,
          };

          set({ cartItems: [...cartItems, newItem] });
          get().updateComputedValues();
          
          // Show success toast
          useToastStore.getState().addToast(
            `تم إضافة ${product.name} إلى السلة ✓`,
            "success",
            3000
          );
          
          // Try to add on server (optional)
          try {
            await callAddToCart(newItem);
          } catch (error) {
            console.warn("Server sync skipped:", error);
          }
        }
        
        return true; // Successfully added
      },

      decreaseCartQuantity: async (product: CartItem) => {
        const cartItems = get().cartItems;
        const itemIndex = cartItems.findIndex((item) => item.id === product.id);
        const currentQuantity = cartItems?.find((item) => item.id === product.id)?.quantity ?? 1;

        if (itemIndex !== -1) {
          const newCartItems = [...cartItems];
          if (newCartItems[itemIndex].quantity <= 1) {
            return get().removeFromCart(product.id);
          } else {
            newCartItems[itemIndex].quantity--;
            set({ cartItems: newCartItems });
            get().updateComputedValues();
            
            // Try to update on server (optional)
            try {
              await updateCartQuantity(product, currentQuantity - 1);
            } catch (error) {
              console.warn("Server sync skipped:", error);
            }
          }
        }
      },

      removeFromCart: async (itemId: number) => {
        const cartItems = get().cartItems;
        const itemIndex = cartItems.findIndex((item) => item.id === itemId);

        if (itemIndex !== -1) {
          const newCartItems = [...cartItems];
          newCartItems.splice(itemIndex, 1);
          set({ cartItems: newCartItems });
          get().updateComputedValues();
          
          // Try to remove from server (optional)
          try {
            await callRemoveFromCart(itemId);
          } catch (error) {
            console.warn("Server sync skipped:", error);
          }
        }
      },

      getItemQuantity: (product: CartItem) => {
        return get().cartItems?.find((item) => item.id === product.id)?.quantity ?? 0;
      },

      openCart: () => {
        console.log("Opening cart");
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      refreshCart: () => {
        console.log("Refreshing cart");
        // Could fetch latest cart from server here
      },
    }),
    {
      name: "spare2app_cart",
      onRehydrateStorage: () => {
        return (state) => {
          console.log('💾 Cart hydration finished')
          console.log('📦 Loaded cart items:', state?.cartItems?.length || 0)
          if (state) {
            state._hasHydrated = true
            state.updateComputedValues()
          }
        }
      },
    }
  )
);

export default useShoppingCart;
export { useShoppingCart as useCartStore };