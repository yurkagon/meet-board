import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSessionStore } from '@/store/useSessionStore';
import { ApiError } from '@/api/googleCalendar';
import * as Toast from '@/components/Toast';

export const ONE_DAY_MS = 1000 * 60 * 60 * 24;

function handleAuthError(error: unknown) {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    if (useSessionStore.getState().accessToken) {
      useSessionStore.getState().reset();
      Toast.show('Session expired, please sign in again', Toast.LONG);
    }
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthError }),
  mutationCache: new MutationCache({ onError: handleAuthError }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: ONE_DAY_MS,
    },
  },
});

export const persister = createAsyncStoragePersister({ storage: AsyncStorage });
