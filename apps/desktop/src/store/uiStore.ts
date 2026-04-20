import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  paletteOpen: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  setPaletteOpen: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  paletteOpen: false,
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
  setPaletteOpen: (value) => set({ paletteOpen: value })
}));
