// store/cartStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  category: string;
  name: string;
  size: string;
  price: number;
  image_url?: string; // ✅ added (optional)
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) =>
        set((state) => {
          const found = state.items.find((x) => x.id === item.id);
          if (found) {
            return {
              items: state.items.map((x) =>
                x.id === item.id ? { ...x, qty: x.qty + 1 } : x
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: 1 }] };
        }),

      inc: (id) =>
        set((state) => ({
          items: state.items.map((x) =>
            x.id === id ? { ...x, qty: x.qty + 1 } : x
          ),
        })),

      dec: (id) =>
        set((state) => {
          const current = state.items.find((x) => x.id === id);
          if (!current) return state;

          if (current.qty <= 1) {
            return { items: state.items.filter((x) => x.id !== id) };
          }

          return {
            items: state.items.map((x) =>
              x.id === id ? { ...x, qty: x.qty - 1 } : x
            ),
          };
        }),

      remove: (id) =>
        set((state) => ({ items: state.items.filter((x) => x.id !== id) })),

      clear: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0),
          0
        ),
    }),
    { name: "dairy-cart" }
  )
);
