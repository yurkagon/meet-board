import { useSessionStore, getAccessToken } from '@/store/useSessionStore';
import { useRoomStore, getSelectedCalendarId } from '@/store/useRoomStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';

describe('useSessionStore', () => {
  beforeEach(() => useSessionStore.getState().reset());

  it('setSession stores the token and maps the user', () => {
    useSessionStore.getState().setSession({
      accessToken: 'tok',
      user: { givenName: 'Ann', email: 'a@b.c', photoUrl: 'p' },
    });
    const s = useSessionStore.getState();
    expect(s.accessToken).toBe('tok');
    expect(s.user.name).toBe('Ann');
    expect(s.user.mail).toBe('a@b.c');
    expect(getAccessToken()).toBe('tok');
  });

  it('reset clears the session', () => {
    useSessionStore.getState().setSession({ accessToken: 'tok', user: {} });
    useSessionStore.getState().reset();
    expect(useSessionStore.getState().accessToken).toBeNull();
    expect(useSessionStore.getState().user.name).toBeNull();
  });
});

describe('useRoomStore', () => {
  it('defaults the calendar id to primary', () => {
    expect(getSelectedCalendarId()).toBe('primary');
  });

  it('setRoom updates id and name', () => {
    useRoomStore.getState().setRoom({ id: 'r1', name: 'Room 1' });
    expect(useRoomStore.getState().selectedRoomId).toBe('r1');
    expect(useRoomStore.getState().selectedRoomName).toBe('Room 1');
    expect(getSelectedCalendarId()).toBe('r1');
  });
});

describe('usePreferencesStore', () => {
  it('updates theme and kiosk preferences', () => {
    usePreferencesStore.getState().setThemePref('dark');
    expect(usePreferencesStore.getState().themePref).toBe('dark');
    usePreferencesStore.getState().setKioskMode(true);
    expect(usePreferencesStore.getState().kioskMode).toBe(true);
  });
});
