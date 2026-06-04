import { create } from "zustand";
import { TodayItemInput, todayItemRepository } from "../repositories/TodayItemRepository";
import { SortMode, TodayItem } from "../types/models";
import { isTodayItemDue } from "../utils/date";
import { matchesSearch, sortByMode } from "../utils/filter";
import { queueCloudDelete, queueCloudPush } from "../supabase/autoSync";

type TodayItemState = {
  items: TodayItem[];
  loading: boolean;
  error: string | null;
  search: string;
  sort: SortMode;
  load: () => Promise<void>;
  setSearch: (search: string) => void;
  setSort: (sort: SortMode) => void;
  createItem: (input: TodayItemInput) => Promise<void>;
  updateItem: (id: string, input: TodayItemInput) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  filteredItems: () => TodayItem[];
  dueToday: () => TodayItem[];
};

export const useTodayItemStore = create<TodayItemState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  search: "",
  sort: "newest",
  load: async () => {
    set({ loading: true, error: null });
    try {
      set({ items: await todayItemRepository.list(), loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load today items", loading: false });
    }
  },
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),
  createItem: async (input) => {
    await todayItemRepository.create(input);
    await get().load();
    void queueCloudPush();
  },
  updateItem: async (id, input) => {
    await todayItemRepository.update(id, input);
    await get().load();
    void queueCloudPush();
  },
  deleteItem: async (id) => {
    await queueCloudDelete("today_items", id);
    await todayItemRepository.delete(id);
    await get().load();
  },
  filteredItems: () => {
    const { items, search, sort } = get();
    return sortByMode(items.filter((item) => matchesSearch([item.title, item.description], search)), sort);
  },
  dueToday: () => get().filteredItems().filter((item) => isTodayItemDue(item)),
}));
