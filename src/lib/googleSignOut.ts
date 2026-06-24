import { GoogleSignin } from '@react-native-google-signin/google-signin';

export async function googleSignOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {}
}
