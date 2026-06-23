import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAppTheme } from '@/theme/useAppTheme';
import StatusScreen from '@/screens/main/StatusScreen';
import PlannerScreen from '@/screens/main/PlannerScreen';
import EventsScreen from '@/screens/main/EventsScreen';
import UserScreen from '@/screens/main/UserScreen';
import type { MainTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function renderTabIcon(routeName: keyof MainTabParamList, color: string) {
  switch (routeName) {
    case 'Status':
      return <MaterialIcons name="meeting-room" size={26} color={color} />;
    case 'Planner':
      return <MaterialCommunityIcons name="calendar-plus" size={26} color={color} />;
    case 'Events':
      return <MaterialCommunityIcons name="calendar-text" size={26} color={color} />;
    case 'User':
      return <FontAwesome name="user-circle" size={24} color={color} />;
  }
}

export default function MainTabNavigator() {
  const t = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textTertiary,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.border },
        tabBarIcon: ({ color }) => renderTabIcon(route.name, color),
      })}
    >
      <Tab.Screen name="Status" component={StatusScreen} options={{ title: 'Room' }} />
      <Tab.Screen name="Planner" component={PlannerScreen} options={{ title: 'Reserve' }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ title: 'Events' }} />
      <Tab.Screen name="User" component={UserScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
