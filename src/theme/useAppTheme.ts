import { useColorScheme } from 'react-native';
import { usePreferencesStore } from '@/store/usePreferencesStore';

const palettes = {
  light: {
    mode: 'light' as const,
    bg: '#F2F3F5',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF0F3',
    text: '#11181C',
    textSecondary: '#5B6068',
    textTertiary: '#8A8F98',
    border: 'rgba(0,0,0,0.08)',
    primary: '#2F6FED',
    onPrimary: '#FFFFFF',
    available: '#1E9E5B',
    availableBg: '#E7F6EC',
    busy: '#D64545',
    busyBg: '#FBE9E9',
    soon: '#B97400',
    soonBg: '#FBF0DC',
  },
  dark: {
    mode: 'dark' as const,
    bg: '#0C0D0F',
    surface: '#17191C',
    surfaceAlt: '#202327',
    text: '#ECEDEE',
    textSecondary: '#A8ADB4',
    textTertiary: '#71767E',
    border: 'rgba(255,255,255,0.12)',
    primary: '#5B8DEF',
    onPrimary: '#0C0D0F',
    available: '#3FBE74',
    availableBg: '#10261A',
    busy: '#E26A6A',
    busyBg: '#2A1515',
    soon: '#E0A33A',
    soonBg: '#2A2010',
  },
};

export type AppTheme = typeof palettes.light | typeof palettes.dark;

export function useAppTheme(): AppTheme {
  const system = useColorScheme();
  const pref = usePreferencesStore((s) => s.themePref);
  const mode = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  return mode === 'dark' ? palettes.dark : palettes.light;
}
