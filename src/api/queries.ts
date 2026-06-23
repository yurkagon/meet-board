import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionStore } from '@/store/useSessionStore';
import { ensureFreshAccessToken } from '@/lib/googleAuth';
import {
  listEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  type EventInput,
} from '@/api/googleCalendar';
import type { CalendarEvent } from '@/types/calendar';

const EVENTS_KEY = ['events'] as const;
const AUTO_UPDATE_MS = 15000;

export function useEvents() {
  const token = useSessionStore((s) => s.accessToken);
  return useQuery<CalendarEvent[]>({
    queryKey: EVENTS_KEY,
    queryFn: async () => listEvents((await ensureFreshAccessToken()) as string),
    enabled: !!token,
    refetchInterval: AUTO_UPDATE_MS,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EventInput) =>
      createEvent((await ensureFreshAccessToken()) as string, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENTS_KEY }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteEvent((await ensureFreshAccessToken()) as string, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENTS_KEY }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EventInput & { id: string }) =>
      updateEvent((await ensureFreshAccessToken()) as string, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENTS_KEY }),
  });
}
