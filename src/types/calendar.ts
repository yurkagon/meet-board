export interface EventDateTime {
  dateTime?: string;
  date?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: EventDateTime;
  end: EventDateTime;
  created?: string;
  htmlLink?: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface SessionUser {
  name: string | null;
  mail: string | null;
  avatar: string | null;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: number | null;
  user: {
    givenName?: string;
    email?: string;
    photoUrl?: string;
  };
}
