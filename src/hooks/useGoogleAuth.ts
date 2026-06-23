import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { useSessionStore } from '@/store/useSessionStore';
import { GOOGLE_CONFIG, OAUTH_SCOPES, hasGoogleConfig } from '@/constants/googleConfig';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const setSession = useSessionStore((s) => s.setSession);
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
    clientSecret: Platform.OS === 'web' ? GOOGLE_CONFIG.webClientSecret : undefined,
    scopes: OAUTH_SCOPES,
    extraParams: { access_type: 'offline', prompt: 'consent' },
  });

  useEffect(() => {
    async function handleSuccess() {
      if (response?.type !== 'success') return;
      const tokens = response.authentication;
      const accessToken = tokens?.accessToken;
      if (!accessToken) return;

      let profile: { givenName?: string; email?: string; photoUrl?: string } = {};
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        profile = { givenName: data.given_name, email: data.email, photoUrl: data.picture };
      } catch {}

      const expiresAt =
        tokens?.issuedAt && tokens?.expiresIn ? (tokens.issuedAt + tokens.expiresIn) * 1000 : null;

      setSession({
        accessToken,
        refreshToken: tokens?.refreshToken ?? null,
        accessTokenExpiresAt: expiresAt,
        user: profile,
      });
    }
    handleSuccess();
  }, [response, setSession]);

  return {
    available: hasGoogleConfig,
    request,
    response,
    promptAsync,
  };
}
