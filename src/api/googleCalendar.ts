import { sortDatesReverse } from '@/lib/eventUtils';
import type { CalendarEvent } from '@/types/calendar';

const BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

const WINDOW_DAYS_BEFORE = 3;
const WINDOW_DAYS_AFTER = 3;
const DAY_MS = 86400000;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function authHeaders(token: string, json = false): HeadersInit {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

export interface EventInput {
  summary: string;
  start: Date;
  end: Date;
}

export async function listEvents(token: string): Promise<CalendarEvent[]> {
  const now = Date.now();
  const params = new URLSearchParams({
    timeMin: new Date(now - WINDOW_DAYS_BEFORE * DAY_MS).toISOString(),
    timeMax: new Date(now + WINDOW_DAYS_AFTER * DAY_MS).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });
  const response = await fetch(`${BASE}?${params.toString()}`, { headers: authHeaders(token) });
  if (!response.ok) throw new ApiError(response.status, 'Failed to load events');
  const data = await response.json();
  const items: CalendarEvent[] = data.items;
  if (!Array.isArray(items)) throw new Error('Bad response');

  const normalized = items.map((item) => {
    if (typeof item.summary === 'undefined') {
      item.summary = 'No information';
    }
    if (typeof item.start.dateTime === 'undefined' || typeof item.end.dateTime === 'undefined') {
      item.start.dateTime = new Date(item.start.date as string).toJSON();
      item.end.dateTime = new Date(item.end.date as string).toJSON();
    }
    return item;
  });

  return normalized.sort(sortDatesReverse);
}

export async function createEvent(token: string, input: EventInput): Promise<void> {
  const response = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(token, true),
    body: JSON.stringify({
      start: { dateTime: input.start.toJSON() },
      end: { dateTime: input.end.toJSON() },
      summary: input.summary,
    }),
  });
  if (!response.ok) throw new ApiError(response.status, 'Failed to create event');
}

export async function deleteEvent(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) throw new ApiError(response.status, 'Failed to delete event');
}

export async function updateEvent(
  token: string,
  input: EventInput & { id: string },
): Promise<void> {
  await deleteEvent(token, input.id);
  await createEvent(token, input);
}
