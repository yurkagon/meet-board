import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { useSessionStore } from '@/store/useSessionStore';

export async function ensureFreshAccessToken(): Promise<string | null> {
  try {
    const { accessToken } = await GoogleSignin.getTokens();
    return accessToken;
  } catch {
    useSessionStore.getState().reset();
    return null;
  }
}
