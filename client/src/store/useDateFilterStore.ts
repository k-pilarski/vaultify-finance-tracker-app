import { create } from 'zustand';

interface DateFilterState {
  month: number;
  year: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setDateFilter: (month: number, year: number) => void;
}

const currentDate = new Date();

export const useDateFilterStore = create<DateFilterState>((set) => ({
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear(),
  setMonth: (month: number) => set({ month }),
  setYear: (year: number) => set({ year }),
  setDateFilter: (month: number, year: number) => set({ month, year }),
}));
