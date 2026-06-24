import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { useSessionStore } from '@/store/useSessionStore';
import { GOOGLE_CONFIG, OAUTH_SCOPES, hasGoogleConfig } from '@/constants/googleConfig';

WebBrowser.maybeCompleteAuthSession();

type AuthCallbacks = { onSuccess?: () => void; onError?: () => void };

export function useGoogleAuth(callbacks?: AuthCallbacks) {
  const setSession = useSessionStore((s) => s.setSession);
  const [isLoading, setIsLoading] = useState(false);

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CONFIG.webClientId,
    clientSecret: GOOGLE_CONFIG.webClientSecret,
    scopes: OAUTH_SCOPES,
    extraParams: { access_type: 'offline', prompt: 'consent' },
  });

  useEffect(() => {
    async function handle() {
      if (!response) return;
      if (response.type === 'success') {
        const tokens = response.authentication;
        const accessToken = tokens?.accessToken;
        if (accessToken) {
          let profile: { givenName?: string; email?: string; photoUrl?: string } = {};
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            profile = { givenName: data.given_name, email: data.email, photoUrl: data.picture };
          } catch {}
          const expiresAt =
            tokens?.issuedAt && tokens?.expiresIn
              ? (tokens.issuedAt + tokens.expiresIn) * 1000
              : null;
          setSession({
            accessToken,
            refreshToken: tokens?.refreshToken ?? null,
            accessTokenExpiresAt: expiresAt,
            user: profile,
          });
          callbacks?.onSuccess?.();
        }
      } else if (response.type === 'error') {
        callbacks?.onError?.();
      }
      setIsLoading(false);
    }
    handle();
  }, [response]);

  function signIn() {
    setIsLoading(true);
    promptAsync();
  }

  return { available: hasGoogleConfig, signIn, isLoading };
}
