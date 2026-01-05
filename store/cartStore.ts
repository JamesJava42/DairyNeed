import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  category: string;
  name: string;
  size: string;
  price: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (p: Omit<CartItem, "qty">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p) =>
        set((s) => {
          const found = s.items.find((i) => i.id === p.id);
          if (found) {
            return { items: s.items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)) };
          }
          return { items: [...s.items, { ...p, qty: 1 }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Number(qty) || 1) } : i)),
        })),
      inc: (id) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
        })),
      dec: (id) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: "dairy-cart" }
  )
);
