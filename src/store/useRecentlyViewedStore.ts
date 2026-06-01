import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewedItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  viewedAt: number;
}

interface RecentlyViewedStore {
  items: ViewedItem[];
  addItem: (item: Omit<ViewedItem, "viewedAt">) => void;
  clearItems: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          // Remove if it already exists to put it at the front
          const filteredItems = state.items.filter((i) => i.id !== item.id);
          // Add to front, keep max 10
          return {
            items: [{ ...item, viewedAt: Date.now() }, ...filteredItems].slice(0, 10),
          };
        }),
      clearItems: () => set({ items: [] }),
    }),
    {
      name: "aura-recently-viewed",
    }
  )
);
