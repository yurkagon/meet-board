import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import RootNavigator from '@/navigation/RootNavigator';
import { ToastHost } from '@/components/Toast';
import { DateTimePickerHost } from '@/components/DateTimePicker';
import { queryClient } from '@/lib/queryClient';
import { useSessionStore } from '@/store/useSessionStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);

  useEffect(() => {
    async function loadResources() {
      try {
        await Promise.all([
          Asset.loadAsync([require('./assets/images/logo.gif')]),
          Font.loadAsync({
            ...Ionicons.font,
            'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
          }),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }
    loadResources();
  }, []);

  if (!isReady || !hasHydrated) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <View style={styles.container}>
            <StatusBar hidden />
            <RootNavigator />
            <DateTimePickerHost />
            <ToastHost />
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
