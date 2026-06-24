import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useState } from 'react';

import { GOOGLE_CONFIG, OAUTH_SCOPES, hasGoogleConfig } from '@/constants/googleConfig';
import { useSessionStore } from '@/store/useSessionStore';

GoogleSignin.configure({
  webClientId: GOOGLE_CONFIG.webClientId,
  iosClientId: GOOGLE_CONFIG.iosClientId,
  scopes: OAUTH_SCOPES,
});

type AuthCallbacks = { onSuccess?: () => void; onError?: () => void };

export function useGoogleAuth(callbacks?: AuthCallbacks) {
  const setSession = useSessionStore((s) => s.setSession);
  const [isLoading, setIsLoading] = useState(false);

  async function signIn() {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (!isSuccessResponse(result)) return;
      const { accessToken } = await GoogleSignin.getTokens();
      setSession({
        accessToken,
        refreshToken: null,
        accessTokenExpiresAt: null,
        user: {
          givenName: result.data.user.givenName ?? undefined,
          email: result.data.user.email,
          photoUrl: result.data.user.photo ?? undefined,
        },
      });
      callbacks?.onSuccess?.();
    } catch {
      callbacks?.onError?.();
    } finally {
      setIsLoading(false);
    }
  }

  return { available: hasGoogleConfig, signIn, isLoading };
}
