import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePref = 'system' | 'light' | 'dark';

interface PreferencesState {
  themePref: ThemePref;
  kioskMode: boolean;
  setThemePref: (pref: ThemePref) => void;
  setKioskMode: (value: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      themePref: 'system',
      kioskMode: false,
      setThemePref: (themePref) => set({ themePref }),
      setKioskMode: (kioskMode) => set({ kioskMode }),
    }),
    {
      name: 'preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
