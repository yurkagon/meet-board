import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePref = 'system' | 'light' | 'dark';

interface PreferencesState {
  themePref: ThemePref;
  setThemePref: (pref: ThemePref) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      themePref: 'system',
      setThemePref: (themePref) => set({ themePref }),
    }),
    {
      name: 'preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
