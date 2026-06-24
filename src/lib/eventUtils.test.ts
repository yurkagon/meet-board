import {
  formatDateToDisplay,
  formatTextToDisplayByLimit,
  formatTimeBetweenDates,
  isValidEvent,
  eventStart,
  eventEnd,
  sortDatesToDisplay,
} from '@/lib/eventUtils';
import type { CalendarEvent } from '@/types/calendar';

function ev(id: string, startISO?: string, endISO?: string): CalendarEvent {
  return { id, summary: id, start: { dateTime: startISO }, end: { dateTime: endISO } };
}

describe('formatTextToDisplayByLimit', () => {
  it('returns text under the limit unchanged', () => {
    expect(formatTextToDisplayByLimit('Hello', 21)).toBe('Hello');
  });
  it('truncates long text with an ellipsis', () => {
    expect(formatTextToDisplayByLimit('abcdefghij', 5)).toBe('ab...');
  });
  it('handles empty input', () => {
    expect(formatTextToDisplayByLimit('')).toBe('No information');
  });
});

describe('formatDateToDisplay', () => {
  it('formats an ISO string', () => {
    expect(formatDateToDisplay('2026-06-24T14:30:00.000Z')).toBe('2026/06/24 in 14:30');
  });
  it('handles null', () => {
    expect(formatDateToDisplay(null)).toBe('No information');
  });
});

describe('formatTimeBetweenDates', () => {
  it('returns error for a negative range', () => {
    expect(formatTimeBetweenDates(new Date(1000), new Date(0))).toBe(' error ');
  });
  it('returns no time for equal dates', () => {
    const d = new Date();
    expect(formatTimeBetweenDates(d, d)).toBe(' no time ');
  });
  it('formats hours and minutes', () => {
    const a = new Date('2026-01-01T10:00:00Z');
    const b = new Date('2026-01-01T11:30:00Z');
    const out = formatTimeBetweenDates(a, b);
    expect(out).toContain('1 hour');
    expect(out).toContain('30 minute');
  });
});

describe('event helpers', () => {
  it('isValidEvent is true for valid and false for missing dates', () => {
    expect(isValidEvent(ev('a', '2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z'))).toBe(true);
    expect(isValidEvent(ev('b'))).toBe(false);
  });
  it('eventStart and eventEnd parse to Date', () => {
    const e = ev('a', '2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z');
    expect(eventStart(e).getTime()).toBe(new Date('2026-01-01T10:00:00Z').getTime());
    expect(eventEnd(e).getTime()).toBe(new Date('2026-01-01T11:00:00Z').getTime());
  });
});

describe('sortDatesToDisplay', () => {
  it('orders now first, then future before past', () => {
    const now = Date.now();
    const past = ev(
      'past',
      new Date(now - 7200000).toISOString(),
      new Date(now - 3600000).toISOString(),
    );
    const current = ev(
      'now',
      new Date(now - 600000).toISOString(),
      new Date(now + 600000).toISOString(),
    );
    const future = ev(
      'future',
      new Date(now + 3600000).toISOString(),
      new Date(now + 7200000).toISOString(),
    );
    const out = sortDatesToDisplay([past, future, current]).map((e) => e.id);
    expect(out[0]).toBe('now');
    expect(out.indexOf('future')).toBeLessThan(out.indexOf('past'));
  });
});
