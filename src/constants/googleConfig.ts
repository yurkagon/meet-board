import { Platform } from 'react-native';

export const GOOGLE_CONFIG = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  webClientSecret: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET,
};

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';
export const OAUTH_SCOPES = ['openid', 'profile', 'email', CALENDAR_SCOPE];

export const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function getPlatformClientId(): string | undefined {
  return Platform.select({
    ios: GOOGLE_CONFIG.iosClientId,
    android: GOOGLE_CONFIG.androidClientId,
    default: GOOGLE_CONFIG.webClientId,
  });
}

export function getPlatformClientSecret(): string | undefined {
  return Platform.OS === 'web' ? GOOGLE_CONFIG.webClientSecret : undefined;
}

export const hasGoogleConfig = Boolean(
  GOOGLE_CONFIG.iosClientId || GOOGLE_CONFIG.androidClientId || GOOGLE_CONFIG.webClientId,
);
