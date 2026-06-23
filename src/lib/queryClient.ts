import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

import { useSessionStore } from '@/store/useSessionStore';
import { ApiError } from '@/api/googleCalendar';
import * as Toast from '@/components/Toast';

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
    },
  },
});
