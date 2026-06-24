import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import type { CalendarEvent } from '@/types/calendar';

dayjs.extend(duration);

export function eventStart(ev: CalendarEvent): Date {
  return dayjs(ev.start.dateTime).toDate();
}

export function eventEnd(ev: CalendarEvent): Date {
  return dayjs(ev.end.dateTime).toDate();
}

export function isValidEvent(ev: CalendarEvent): boolean {
  return (
    !!ev.start.dateTime &&
    !!ev.end.dateTime &&
    dayjs(ev.start.dateTime).isValid() &&
    dayjs(ev.end.dateTime).isValid()
  );
}

export function formatTime(d: Date): string {
  return dayjs(d).format('HH:mm');
}

export function formatDateToDisplay(str?: string | null): string {
  try {
    if (!str) {
      return 'No information';
    }
    const date = str.split('T')[0].replace(/-/g, '/');
    const time = str.split('T')[1].slice(0, 5);
    return date + ' in ' + time;
  } catch {
    return 'No information';
  }
}

export function formatTextToDisplayByLimit(str?: string | null, limit?: number): string {
  const max = limit ? limit : 21;
  if (!str) {
    return 'No information';
  }
  if (str.length > max) return str.substring(0, max - 3) + '...';
  return str;
}

export function sortDatesReverse(d1: CalendarEvent, d2: CalendarEvent): number {
  const a = new Date(d1.end.dateTime as string);
  const b = new Date(d2.end.dateTime as string);
  if (a.toString() === 'Invalid Date') return 1;
  if (b.toString() === 'Invalid Date') return -1;
  return a.getTime() - b.getTime();
}

export function sortDates(d1: CalendarEvent, d2: CalendarEvent): number {
  const a = new Date(d1.end.dateTime as string);
  const b = new Date(d2.end.dateTime as string);
  if (a.toString() === 'Invalid Date') return 1;
  if (b.toString() === 'Invalid Date') return -1;
  return b.getTime() - a.getTime();
}

export function sortDatesToDisplay(arr: CalendarEvent[]): CalendarEvent[] {
  const nowDate = new Date();

  const past = arr
    .filter((it) => {
      if (new Date(it.start.dateTime as string).toString() === 'Invalid Date') return false;
      return nowDate > new Date(it.end.dateTime as string);
    })
    .sort(sortDates);
  const future = arr
    .filter((it) => {
      if (new Date(it.start.dateTime as string).toString() === 'Invalid Date') return false;
      return nowDate < new Date(it.start.dateTime as string);
    })
    .sort(sortDatesReverse);
  const now = arr
    .filter((it) => {
      if (new Date(it.start.dateTime as string).toString() === 'Invalid Date') return false;
      return (
        nowDate >= new Date(it.start.dateTime as string) &&
        nowDate <= new Date(it.end.dateTime as string)
      );
    })
    .sort(sortDatesReverse);
  const noDate = arr.filter(
    (it) => new Date(it.start.dateTime as string).toString() === 'Invalid Date',
  );

  return now.concat(future, past, noDate);
}

export function formatTimeBetweenDates(d1: Date, d2: Date): string {
  const ms = d2.getTime() - d1.getTime();
  if (ms < 0) return ' error ';

  const dur = dayjs.duration(ms);
  const days = Math.floor(dur.asDays());
  const hours = dur.hours();
  const minutes = dur.minutes();
  const seconds = dur.seconds();

  return days || hours || minutes
    ? (days ? days + (days > 1 ? ' days ' : ' day ') : '') +
        (hours ? hours + (hours > 1 ? ' hours ' : ' hour ') : '') +
        (minutes ? minutes + (minutes > 1 ? ' minutes ' : ' minute ') : '')
    : seconds
      ? seconds + (seconds > 1 ? ' seconds ' : ' second ')
      : ' no time ';
}
