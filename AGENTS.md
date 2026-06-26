# MeetBoard — Agent Instructions

> **Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.**

## What this app is

MeetBoard is a meeting-room door-display tablet app. It shows whether a conference room is Available or In use, synced with Google Calendar. No backend — the app talks directly to the Google Calendar REST API using OAuth tokens stored on the device.

Each room is a separate Google Calendar on one account. The user picks a room from a list of their calendars; the board displays that room's live status.

---

## Stack

| Layer         | Library                                                                | Version    |
| ------------- | ---------------------------------------------------------------------- | ---------- |
| Framework     | Expo SDK                                                               | 56         |
| Runtime       | React Native                                                           | 0.85       |
| UI library    | React                                                                  | 19         |
| Language      | TypeScript                                                             | 6 (strict) |
| Navigation    | react-navigation native-stack + bottom-tabs                            | v7         |
| Server state  | TanStack Query                                                         | v5         |
| Client state  | Zustand + persist                                                      | v5         |
| Offline cache | `@tanstack/react-query-persist-client` + AsyncStorage persister        | —          |
| Auth          | `expo-auth-session` Google provider (PKCE on native, code flow on web) | —          |
| Dates         | dayjs (with `duration` plugin)                                         | —          |
| Date picker   | `react-native-ui-datepicker` (pure JS, cross-platform)                 | —          |
| Search input  | `react-native-debounce-input` (`DelayInput`, 300 ms)                   | —          |
| Keep awake    | `expo-keep-awake`                                                      | —          |

---

## Project structure

```
src/
  App.tsx                  — entry; loads fonts, waits for store hydration
  api/
    googleCalendar.ts      — REST wrappers (list/create/delete/update events + calendars)
    queries.ts             — TanStack Query hooks
  components/
    ui.tsx                 — design system primitives (Screen, Card, AppText, AppButton, Chip, Divider)
    DateTimePicker.tsx     — pickDateTime() + DateTimePickerHost
    Toast.tsx              — show() + ToastHost
    ErrorBoundary.tsx      — class component, wraps RootNavigator
  hooks/
    useGoogleAuth.ts       — Google.useAuthRequest → setSession
  lib/
    eventUtils.ts          — pure date helpers (eventStart, eventEnd, isValidEvent, formatTime, …)
    googleAuth.ts          — ensureFreshAccessToken() with in-flight coalescing
    queryClient.ts         — queryClient + AsyncStorage persister + ONE_DAY_MS
  navigation/
    RootNavigator.tsx      — Login / Main / RoomPicker (modal)
    MainTabNavigator.tsx   — Room / Reserve / Events / Profile tabs; hides tab bar in kiosk mode
    types.ts               — RootStackParamList, MainTabParamList
  screens/
    LoginScreen.tsx        — Google login or mock login (if no .env creds)
    RoomPickerScreen.tsx   — modal: list + create calendars
    CurrentEventScreen.tsx — event detail
    main/
      StatusScreen.tsx     — full-screen room board (tap to toggle kiosk)
      PlannerScreen.tsx    — Reserve room (quick-book + custom time)
      EventsScreen.tsx     — agenda list with search + pull-to-refresh
      UserScreen.tsx       — profile, theme toggle, log out
  store/
    useSessionStore.ts     — user, tokens, expiry, hasHydrated
    useRoomStore.ts        — selectedRoomId / selectedRoomName
    usePreferencesStore.ts — themePref, kioskMode
  theme/
    useAppTheme.ts         — light/dark palette hook
  types/
    calendar.ts            — CalendarEvent, Room, EventInput types
```

---

## Code conventions

- **No comments in source code.** Never add them. If you feel the urge to explain something, rename the variable/function instead.
- TypeScript strict mode. No `any`. No `as unknown as X` chains.
- Functional components only. No class components except `ErrorBoundary`.
- Dayjs for all date math — never raw `getTime()` arithmetic except where a `Date` object is explicitly required.
- Imports use the `@/` alias (maps to `src/`).
- Prettier config: `singleQuote`, `trailingComma: "all"`, `printWidth: 100`, `semi: true`, `tabWidth: 2`.

---

## Auth & token flow

- **No backend.** Access + refresh tokens live in `useSessionStore` (persisted to AsyncStorage).
- `ensureFreshAccessToken()` in `src/lib/googleAuth.ts` checks expiry (60 s margin) and refreshes if needed. All query/mutation functions call it — never use the stored token directly.
- On 401/403 the `QueryCache`/`MutationCache` `onError` in `queryClient.ts` resets the session → RootNavigator navigates back to Login.
- Web needs `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET` in `.env` for refresh tokens (dev-only, insecure — accepted).

---

## Environment variables

Stored in `.env` (gitignored). See `.env.example` for keys:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET
```

If none are set, `LoginScreen` falls back to `MockLogin` (no Google call at all — the hook is not mounted).

---

## Commands

```bash
pnpm dev               # Expo dev server (all platforms)
pnpm web               # Expo dev server, open in browser
pnpm typecheck         # tsc --noEmit
pnpm test              # Jest (jest-expo preset)
pnpm lint              # ESLint
pnpm format            # Prettier --write
pnpm format:check      # Prettier --check (used in CI)
```

**Node version gotcha (this machine):** Homebrew node at `/opt/homebrew/bin/node` is broken (missing `libicui18n.73`). Always use nvm:

```bash
PATH="$HOME/.nvm/versions/node/v22.4.0/bin:$PATH" pnpx tsc --noEmit
```

The user's own terminal uses nvm and is fine. Husky git hooks run in the user's shell, so they work.

---

## Git hooks (Husky v9)

- `pre-commit` → `lint-staged` (ESLint --fix + Prettier on `*.ts/tsx`; Prettier on `*.json/md`)
- `pre-push` → `npm run typecheck && npm test`

Never skip hooks (`--no-verify`) unless the user explicitly asks.

---

## Kiosk mode

`kioskMode` in `usePreferencesStore` — when `true`:

- Tab bar is hidden (`tabBarStyle: { display: 'none' }` in `MainTabNavigator`)
- Toggled by tapping anywhere on the Room board (`StatusScreen` outer `Pressable`)
- Orientation follows the device freely (`app.json orientation: "default"`)
- The nested `Pressable` on the room name still opens `RoomPicker`

---

## Multi-room architecture

- Each room = a Google Calendar on the same account.
- `listCalendars()` fetches `users/me/calendarList`, filtered to `owner`/`writer` roles.
- `useRoomStore` persists the selected room. `getSelectedCalendarId()` falls back to `'primary'`.
- All event queries are keyed `['events', calendarId]` — switching rooms auto-refetches.
- `RoomPickerScreen` lists calendars and also creates new ones (`createCalendar()` → POST `/calendars`).

---

## Testing

Tests live in `src/lib/eventUtils.test.ts` and `src/store/stores.test.ts`. They are pure logic tests — no RN renderer. `tsconfig.json` excludes `*.test.*` so tsc doesn't complain about jest globals. `jest.setup.js` mocks AsyncStorage.

Run: `npm test`
