import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import {
  addShopifyCartLine,
  createShopifyCart,
  readShopifyCart,
  removeShopifyCartLine,
  updateShopifyCartLine,
  type ShopifyProduct,
  type ShopifyVariant,
} from "@/lib/shopify-storefront";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface AurelleCartItem {
  lineId: string;
  productId: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  variantId: string;
  variantTitle: string;
  selectedOptions: ShopifyVariant["selectedOptions"];
  price: ShopifyVariant["price"];
  quantity: number;
}

interface CartState {
  items: AurelleCartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  wishlist: string[];
  isLoading: boolean;
  message: string | null;
  addItem: (product: ShopifyProduct, variant: ShopifyVariant, quantity?: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  syncCart: () => Promise<void>;
  toggleWishlist: (productId: string) => void;
  clearMessage: () => void;
}

function lineIdForVariant(
  productCart: Awaited<ReturnType<typeof createShopifyCart>>,
  variantId: string,
): string | null {
  return (
    productCart.lines.edges.find(({ node }) => node.merchandise.id === variantId)?.node.id ?? null
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      wishlist: [],
      isLoading: false,
      message: null,
      addItem: async (product, variant, quantity = 1) => {
        set({ isLoading: true, message: null });
        try {
          const state = get();
          const existing = state.items.find((item) => item.variantId === variant.id);
          const nextQuantity = (existing?.quantity ?? 0) + quantity;
          const cart = state.cartId
            ? existing
              ? await updateShopifyCartLine(state.cartId, existing.lineId, nextQuantity)
              : await addShopifyCartLine(state.cartId, { merchandiseId: variant.id, quantity })
            : await createShopifyCart([{ merchandiseId: variant.id, quantity }]);

          const lineId = lineIdForVariant(cart, variant.id);
          if (!lineId) throw new Error("The piece was not returned in your Shopify bag.");
          const nextItem: AurelleCartItem = {
            lineId,
            productId: product.id,
            handle: product.handle,
            title: product.title,
            imageUrl: product.images.edges[0]?.node.url ?? null,
            variantId: variant.id,
            variantTitle: variant.title,
            selectedOptions: variant.selectedOptions,
            price: variant.price,
            quantity: nextQuantity,
          };
          set({
            cartId: cart.id,
            checkoutUrl: cart.checkoutUrl,
            items: existing
              ? get().items.map((item) => (item.variantId === variant.id ? nextItem : item))
              : [...get().items, nextItem],
            message: null,
          });
        } catch (error) {
          set({
            message:
              error instanceof Error ? error.message : "Could not add this piece to your bag.",
          });
        } finally {
          set({ isLoading: false });
        }
      },
      updateQuantity: async (variantId, quantity) => {
        if (quantity < 1) {
          await get().removeItem(variantId);
          return;
        }
        const { cartId, items } = get();
        const item = items.find((entry) => entry.variantId === variantId);
        if (!cartId || !item) return;
        set({ isLoading: true, message: null });
        try {
          const cart = await updateShopifyCartLine(cartId, item.lineId, quantity);
          set({
            items: get().items.map((entry) =>
              entry.variantId === variantId ? { ...entry, quantity } : entry,
            ),
            checkoutUrl: cart.checkoutUrl,
          });
        } catch (error) {
          set({ message: error instanceof Error ? error.message : "Could not update your bag." });
        } finally {
          set({ isLoading: false });
        }
      },
      removeItem: async (variantId) => {
        const { cartId, items } = get();
        const item = items.find((entry) => entry.variantId === variantId);
        if (!cartId || !item) return;
        set({ isLoading: true, message: null });
        try {
          const cart = await removeShopifyCartLine(cartId, item.lineId);
          const remaining = get().items.filter((entry) => entry.variantId !== variantId);
          set(
            remaining.length
              ? { items: remaining, checkoutUrl: cart.checkoutUrl }
              : { items: [], cartId: null, checkoutUrl: null },
          );
        } catch (error) {
          set({ message: error instanceof Error ? error.message : "Could not remove this piece." });
        } finally {
          set({ isLoading: false });
        }
      },
      syncCart: async () => {
        const { cartId } = get();
        if (!cartId) return;
        try {
          const cart = await readShopifyCart(cartId);
          if (!cart || cart.totalQuantity === 0) {
            set({ items: [], cartId: null, checkoutUrl: null });
            return;
          }
          set({ checkoutUrl: cart.checkoutUrl });
        } catch {
          // Preserve the locally saved bag during a temporary Storefront API outage.
        }
      },
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),
      clearMessage: () => set({ message: null }),
    }),
    {
      name: "aurelle-shopify-cart",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : localStorage,
      ),
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
        wishlist: state.wishlist,
      }),
    },
  ),
);
