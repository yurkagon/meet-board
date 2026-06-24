import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResult, SessionUser } from '@/types/calendar';

interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
}

interface SessionState extends Tokens {
  user: SessionUser;
  hasHydrated: boolean;
  setSession: (result: AuthResult) => void;
  setTokens: (tokens: Tokens) => void;
  reset: () => void;
  setHasHydrated: (value: boolean) => void;
}

const emptyUser: SessionUser = { name: null, mail: null, avatar: null };

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: emptyUser,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      hasHydrated: false,
      setSession: (result) =>
        set({
          user: {
            name: result.user.givenName ?? null,
            mail: result.user.email ?? null,
            avatar: result.user.photoUrl ?? null,
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken ?? null,
          accessTokenExpiresAt: result.accessTokenExpiresAt ?? null,
        }),
      setTokens: (tokens) => set(tokens),
      reset: () =>
        set({ user: emptyUser, accessToken: null, refreshToken: null, accessTokenExpiresAt: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const getAccessToken = () => useSessionStore.getState().accessToken;
