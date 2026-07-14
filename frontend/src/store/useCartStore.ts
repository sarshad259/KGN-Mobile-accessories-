import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  qty: number;
  selectedColor?: string;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number, selectedColor?: string) => void;
  updateQty: (id: string | number, qty: number, selectedColor?: string) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      addToCart: (item) => {
        const exists = get().cartItems.find(
          (x) => x.id === item.id && x.selectedColor === item.selectedColor
        );
        if (exists) {
          set({
            cartItems: get().cartItems.map((x) =>
              x.id === item.id && x.selectedColor === item.selectedColor
                ? { ...x, qty: x.qty + item.qty }
                : x
            ),
          });
        } else {
          set({ cartItems: [...get().cartItems, item] });
        }
      },
      updateQty: (id, qty, selectedColor) => {
        if (qty <= 0) {
          set({
            cartItems: get().cartItems.filter(
              (x) => !(x.id === id && x.selectedColor === selectedColor)
            ),
          });
        } else {
          set({
            cartItems: get().cartItems.map((x) =>
              x.id === id && x.selectedColor === selectedColor ? { ...x, qty } : x
            ),
          });
        }
      },
      removeFromCart: (id, selectedColor) => {
        set({
          cartItems: get().cartItems.filter(
            (x) => !(x.id === id && x.selectedColor === selectedColor)
          ),
        });
      },
      clearCart: () => set({ cartItems: [] }),
      cartTotal: () =>
        get().cartItems.reduce((acc, item) => acc + item.qty * item.price, 0),
    }),
    { name: 'kgn-cart-storage' }
  )
);
