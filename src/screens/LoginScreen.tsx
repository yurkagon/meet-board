import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppText, AppButton } from '@/components/ui';
import { useAppTheme } from '@/theme/useAppTheme';
import { useSessionStore } from '@/store/useSessionStore';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { hasGoogleConfig } from '@/constants/googleConfig';
import * as Toast from '@/components/Toast';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen(props: Props) {
  return hasGoogleConfig ? <GoogleLogin {...props} /> : <MockLogin {...props} />;
}

function MockLogin({ navigation }: Props) {
  const setSession = useSessionStore((s) => s.setSession);

  function onSignIn() {
    setSession({
      accessToken: 'mock-access-token',
      user: {
        givenName: 'Demo User',
        email: 'demo@example.com',
        photoUrl: 'https://www.gravatar.com/avatar/?d=mp&s=300',
      },
    });
    navigation.navigate('Main');
    Toast.show('Success', Toast.SHORT);
  }

  return <LoginView onSignIn={onSignIn} loading={false} />;
}

function GoogleLogin({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const { promptAsync, response } = useGoogleAuth();

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      navigation.navigate('Main');
      Toast.show('Success', Toast.SHORT);
    } else if (response.type === 'error') {
      Toast.show('Failed! Try again', Toast.LONG);
    }
    setLoading(false);
  }, [response, navigation]);

  function onSignIn() {
    setLoading(true);
    promptAsync();
  }

  return <LoginView onSignIn={onSignIn} loading={loading} />;
}

function LoginView({ onSignIn, loading }: { onSignIn: () => void; loading: boolean }) {
  const t = useAppTheme();
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: t.bg }]}>
      <View style={styles.content}>
        <View style={[styles.logoBadge, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logoImage} />
        </View>
        <AppText variant="title" style={{ marginTop: 24 }}>
          MeetBoard
        </AppText>
        <AppText variant="body" color="textSecondary" style={{ marginTop: 6, textAlign: 'center' }}>
          Meeting room schedule, synced with Google Calendar
        </AppText>
      </View>

      <View style={styles.footer}>
        <AppButton title="Sign in with Google" icon="login" onPress={onSignIn} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
