import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface CartLine {
  key: string; // `${handle}::${size}`
  handle: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
}

export interface OrderItem {
  handle: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  address: OrderAddress;
  email: string;
  status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "demo";
}

interface ShopState {
  items: CartLine[];
  wishlist: string[]; // product handles
  orders: Order[];
  cartOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;

  addItem: (
    input: { handle: string; name: string; image: string; price: number; size: string },
    quantity?: number,
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (handle: string) => void;
  placeOrder: (input: { email: string; address: OrderAddress; paymentMethod: string }) => Order;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

function makeOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AUR-${stamp}-${rand}`;
}

export const useCartStore = create<ShopState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      orders: [],
      cartOpen: false,
      searchOpen: false,
      mobileMenuOpen: false,

      addItem: (input, quantity = 1) => {
        const key = `${input.handle}::${input.size}`;
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
              ),
              cartOpen: true,
            };
          }
          return {
            items: [...state.items, { ...input, key, quantity }],
            cartOpen: true,
          };
        });
      },

      updateQuantity: (key, quantity) => {
        if (quantity < 1) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        }));
      },

      removeItem: (key) => {
        set((state) => ({ items: state.items.filter((i) => i.key !== key) }));
      },

      clearCart: () => set({ items: [] }),

      toggleWishlist: (handle) =>
        set((state) => ({
          wishlist: state.wishlist.includes(handle)
            ? state.wishlist.filter((h) => h !== handle)
            : [...state.wishlist, handle],
        })),

      placeOrder: ({ email, address, paymentMethod }) => {
        const { items } = get();
        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 99;
        const order: Order = {
          id: makeOrderId(),
          createdAt: new Date().toISOString(),
          items: items.map((i) => ({
            handle: i.handle,
            name: i.name,
            image: i.image,
            price: i.price,
            size: i.size,
            quantity: i.quantity,
          })),
          subtotal,
          shipping,
          total: subtotal + shipping,
          address,
          email,
          status: "confirmed",
          paymentMethod,
          paymentStatus: paymentMethod === "razorpay" ? "pending" : "demo",
        };
        set((state) => ({ orders: [order, ...state.orders], items: [] }));
        return order;
      },

      setCartOpen: (open) => set({ cartOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: "aurelle-shop",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : localStorage,
      ),
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        orders: state.orders,
      }),
    },
  ),
);

export function cartCount(items: CartLine[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(items: CartLine[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
