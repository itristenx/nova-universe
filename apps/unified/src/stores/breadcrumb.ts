import { create } from 'zustand';

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

type BreadcrumbState = {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
  clear: () => void;
};

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  clear: () => set({ items: [] }),
}));

