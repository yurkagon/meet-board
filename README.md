# MeetBoard

A meeting-room schedule display synced with Google Calendar — built to hang by the door of a meeting room and show, at a glance, whether the room is free or in use, what's on now, and what's next.

**No backend.** MeetBoard is a pure client app: it talks directly to the Google Calendar API from the device, with Google OAuth for sign-in. There is no server, no database, and no API of our own — Google Calendar is the single source of truth. State lives on-device (session and preferences persisted to AsyncStorage; calendar data cached in memory by TanStack Query).

Originally a 2018 Expo app (`calendar-planner_expo_2018/`), modernized onto the current Expo / React Native stack and repositioned as a room-display product.

## Features

- **Room board** — full-screen "Available / In use" status with the current meeting, time remaining, and the next event. Color-coded for a glance from across the room.
- **Reserve** — quick-book the room (15 min / 30 min / 1 hour / until next meeting) with editable start/end and an optional title.
- **Events** — searchable agenda list with Now / Upcoming / Past status chips.
- **Profile** — signed-in account and a light / dark / system theme switch.
- **Google sign-in** via OAuth with silent token refresh; falls back to a built-in mock login when no credentials are configured.
- Light and dark themes, persisted session and preferences, cross-platform (iOS / Android / web).

## Tech stack

- Expo SDK 56, React 19, React Native 0.85, TypeScript
- Navigation: `@react-navigation/native` v7 (native-stack + bottom-tabs)
- Client state: Zustand (+ persist via AsyncStorage)
- Server state: TanStack Query (Google Calendar v3)
- Auth: `expo-auth-session` (Google provider, code + PKCE on native, refresh tokens)
- Date/time: `react-native-ui-datepicker`

## Project structure

```
index.js                 entry → src/App
src/
  App.tsx                providers (QueryClient, SafeArea), splash, hosts
  navigation/            RootNavigator, MainTabNavigator, types, navigationRef
  screens/               Login, CurrentEvent, EditEvent
    main/                Status (room board), Planner (reserve), Events, User
  components/            ui.tsx (Screen/Card/AppText/AppButton/Chip), Toast, DateTimePicker, LoadingIndicator
  store/                 useSessionStore, usePreferencesStore
  api/                   googleCalendar (REST), queries (TanStack hooks)
  hooks/                 useGoogleAuth
  lib/                   googleAuth (token refresh), eventUtils, queryClient
  theme/                 useAppTheme (light/dark palette)
  constants/             colors, layout, googleConfig
  types/                 calendar
```

## Getting started

```bash
npm install
npx expo start
```

Then open the web build, or press `i` / `a` for a dev build on a simulator/emulator. Without Google credentials the app runs in mock-login mode so you can browse the UI immediately.

## Google OAuth setup

Real Google Calendar sync needs OAuth client IDs.

1. In the [Google Cloud Console](https://console.cloud.google.com/), create/select a project and enable the **Google Calendar API**.
2. On the **OAuth consent screen** (External, Testing) add the scopes `userinfo.email`, `userinfo.profile`, and `https://www.googleapis.com/auth/calendar`, and add your account under **Test users**.
3. Create OAuth client IDs under **Credentials**:
   - **Web** — add `http://localhost:8081` and `http://localhost:8083` to Authorized JavaScript origins and redirect URIs.
   - **iOS** — bundle ID `com.meetboard.app`.
   - **Android** — package `com.meetboard.app` + the dev build's SHA-1.
4. Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
```

5. Restart with a cleared cache so the new env is picked up:

```bash
npx expo start -c
```

When at least one client ID is set, the login button uses real Google OAuth; otherwise it uses the mock login. The client IDs are public by design and embedded in the client bundle; `.env` is gitignored.

## Running on iOS / Android

Google OAuth on native requires a **development build** (Expo Go cannot use a custom redirect scheme):

```bash
npx expo prebuild --clean
npx expo run:ios      # or: npx expo run:android
```

The iOS reversed-client-id URL scheme is configured in `app.json` (`ios.infoPlist.CFBundleURLTypes`). Web works directly in the browser via `npx expo start --web`.

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm start`       | Start the Expo dev server           |
| `npm run ios`     | Build and run the iOS dev build     |
| `npm run android` | Build and run the Android dev build |
| `npm run web`     | Run in the browser                  |
| `npm run lint`    | Lint with `expo lint`               |

## Notes & roadmap

- Booking currently targets the signed-in account's **primary** calendar. For a true door panel the next step is pointing it at a room **resource calendar**.
- Web token refresh requires a (dev-only) `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET`; native refreshes via PKCE without a secret.
