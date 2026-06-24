import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Ionicons } from '@expo/vector-icons';

import RootNavigator from '@/navigation/RootNavigator';
import { ToastHost } from '@/components/Toast';
import { DateTimePickerHost } from '@/components/DateTimePicker';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { queryClient, persister, ONE_DAY_MS } from '@/lib/queryClient';
import { useSessionStore } from '@/store/useSessionStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);

  useEffect(() => {
    async function loadResources() {
      try {
        await Promise.all([
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
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: ONE_DAY_MS }}
      >
        <SafeAreaProvider>
          <View style={styles.container}>
            <StatusBar hidden />
            <ErrorBoundary>
              <RootNavigator />
            </ErrorBoundary>
            <DateTimePickerHost />
            <ToastHost />
          </View>
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
