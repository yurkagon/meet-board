import type { NavigatorScreenParams } from '@react-navigation/native';
import type { CalendarEvent } from '@/types/calendar';

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  CurrentEvent: { obj: CalendarEvent };
  EditEvent: { obj: CalendarEvent };
};

export type MainTabParamList = {
  Status: undefined;
  Planner: undefined;
  Events: undefined;
  User: undefined;
};
