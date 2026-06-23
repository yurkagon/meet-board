import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionStore } from '@/store/useSessionStore';
import { useRoomStore, getSelectedCalendarId } from '@/store/useRoomStore';
import { ensureFreshAccessToken } from '@/lib/googleAuth';
import {
  listEvents,
  listCalendars,
  createCalendar,
  createEvent,
  deleteEvent,
  updateEvent,
  type EventInput,
} from '@/api/googleCalendar';
import type { CalendarEvent, Room } from '@/types/calendar';

const EVENTS_KEY = ['events'];
const CALENDARS_KEY = ['calendars'];
const AUTO_UPDATE_MS = 15000;

export function useEvents() {
  const token = useSessionStore((s) => s.accessToken);
  const calendarId = useRoomStore((s) => s.selectedRoomId) ?? 'primary';
  return useQuery<CalendarEvent[]>({
    queryKey: [...EVENTS_KEY, calendarId],
    queryFn: async () => listEvents((await ensureFreshAccessToken()) as string, calendarId),
    enabled: !!token,
    refetchInterval: AUTO_UPDATE_MS,
  });
}

export function useCalendars() {
  const token = useSessionStore((s) => s.accessToken);
  return useQuery<Room[]>({
    queryKey: CALENDARS_KEY,
    queryFn: async () => listCalendars((await ensureFreshAccessToken()) as string),
    enabled: !!token,
  });
}

export function useCreateCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => createCalendar((await ensureFreshAccessToken()) as string, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CALENDARS_KEY }),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EventInput) =>
      createEvent((await ensureFreshAccessToken()) as string, getSelectedCalendarId(), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENTS_KEY }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      deleteEvent((await ensureFreshAccessToken()) as string, getSelectedCalendarId(), id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENTS_KEY }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EventInput & { id: string }) =>
      updateEvent((await ensureFreshAccessToken()) as string, getSelectedCalendarId(), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENTS_KEY }),
  });
}
