import { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from '@/navigation/MainTabNavigator';
import LoginScreen from '@/screens/LoginScreen';
import CurrentEventScreen from '@/screens/CurrentEventScreen';
import EditEventScreen from '@/screens/EditEventScreen';
import { formatTextToDisplayByLimit } from '@/lib/eventUtils';
import { useSessionStore } from '@/store/useSessionStore';
import { navigationRef } from '@/navigation/navigationRef';
import { useAppTheme } from '@/theme/useAppTheme';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const t = useAppTheme();
  const accessToken = useSessionStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken && navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [accessToken]);

  const base = t.mode === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: t.primary,
      background: t.bg,
      card: t.surface,
      text: t.text,
      border: t.border,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator
        initialRouteName={accessToken ? 'Main' : 'Login'}
        screenOptions={{
          headerStyle: { backgroundColor: t.surface },
          headerTintColor: t.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="CurrentEvent"
          component={CurrentEventScreen}
          options={({ route }) => ({
            title: formatTextToDisplayByLimit(route.params.obj.summary.toUpperCase(), 20),
          })}
        />
        <Stack.Screen
          name="EditEvent"
          component={EditEventScreen}
          options={({ route }) => ({
            title: formatTextToDisplayByLimit(route.params.obj.summary.toUpperCase(), 20),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
