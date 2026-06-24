import * as AuthSession from 'expo-auth-session';

import { useSessionStore } from '@/store/useSessionStore';
import {
  GOOGLE_DISCOVERY,
  getPlatformClientId,
  getPlatformClientSecret,
} from '@/constants/googleConfig';

const EXPIRY_MARGIN_MS = 60_000;

let inFlightRefresh: Promise<string | null> | null = null;

async function doRefresh(refreshToken: string): Promise<string | null> {
  const clientId = getPlatformClientId();
  if (!clientId) return useSessionStore.getState().accessToken;
  try {
    const result = await AuthSession.refreshAsync(
      { clientId, clientSecret: getPlatformClientSecret(), refreshToken },
      GOOGLE_DISCOVERY,
    );
    const expiresAt =
      result.issuedAt && result.expiresIn ? (result.issuedAt + result.expiresIn) * 1000 : null;
    useSessionStore.getState().setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken ?? refreshToken,
      accessTokenExpiresAt: expiresAt,
    });
    return result.accessToken;
  } catch {
    return useSessionStore.getState().accessToken;
  }
}

export async function ensureFreshAccessToken(): Promise<string | null> {
  const { accessToken, refreshToken, accessTokenExpiresAt } = useSessionStore.getState();

  if (!accessToken) return null;

  const isFresh =
    accessTokenExpiresAt == null || Date.now() < accessTokenExpiresAt - EXPIRY_MARGIN_MS;
  if (isFresh) return accessToken;

  if (!refreshToken) return accessToken;

  if (!inFlightRefresh) {
    inFlightRefresh = doRefresh(refreshToken).finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}
