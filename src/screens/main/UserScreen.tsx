import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { Screen, Card, AppText, AppButton, Divider } from '@/components/ui';
import { googleSignOut } from '@/lib/googleSignOut';
import { useAppTheme } from '@/theme/useAppTheme';
import { useSessionStore } from '@/store/useSessionStore';
import { usePreferencesStore, type ThemePref } from '@/store/usePreferencesStore';
import { useRoomStore } from '@/store/useRoomStore';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'User'>;

const THEME_OPTIONS: {
  key: ThemePref;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { key: 'system', label: 'System', icon: 'smartphone' },
  { key: 'light', label: 'Light', icon: 'light-mode' },
  { key: 'dark', label: 'Dark', icon: 'dark-mode' },
];

export default function UserScreen({ navigation }: Props) {
  const t = useAppTheme();
  const user = useSessionStore((s) => s.user);
  const reset = useSessionStore((s) => s.reset);
  const themePref = usePreferencesStore((s) => s.themePref);
  const setThemePref = usePreferencesStore((s) => s.setThemePref);
  const roomName = useRoomStore((s) => s.selectedRoomName) ?? 'Select room';

  async function logOut() {
    await googleSignOut();
    reset();
    const root = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    root?.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  function openRoomPicker() {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('RoomPicker');
  }

  return (
    <Screen scroll>
      <AppText variant="title">Profile</AppText>

      <Card>
        <View style={styles.row}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: t.surfaceAlt }]}>
              <MaterialIcons name="person" size={36} color={t.textSecondary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <AppText variant="heading" numberOfLines={1}>
              {user.name ?? 'Signed in'}
            </AppText>
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {user.mail ?? '—'}
            </AppText>
          </View>
        </View>

        <View style={{ marginVertical: 14 }}>
          <Divider />
        </View>

        <Field label="Name" value={user.name ?? '—'} />
        <View style={{ height: 12 }} />
        <Field label="Email" value={user.mail ?? '—'} />
      </Card>

      <Card padded={false}>
        <Pressable onPress={openRoomPicker} style={styles.roomRow}>
          <MaterialIcons name="meeting-room" size={22} color={t.textSecondary} />
          <View style={{ flex: 1 }}>
            <AppText variant="label" color="textTertiary">
              Room
            </AppText>
            <AppText variant="body" numberOfLines={1}>
              {roomName}
            </AppText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={t.textTertiary} />
        </Pressable>
      </Card>

      <Card>
        <AppText variant="label" color="textTertiary">
          Appearance
        </AppText>
        <View style={[styles.segment, { backgroundColor: t.surfaceAlt }]}>
          {THEME_OPTIONS.map((opt) => {
            const selected = themePref === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setThemePref(opt.key)}
                style={[styles.segmentItem, selected && { backgroundColor: t.surface }]}
              >
                <MaterialIcons
                  name={opt.icon}
                  size={20}
                  color={selected ? t.primary : t.textSecondary}
                />
                <AppText
                  variant="label"
                  style={{ color: selected ? t.text : t.textSecondary, marginTop: 4 }}
                >
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <AppText variant="caption" color="textTertiary" style={{ textAlign: 'center' }}>
        Tap the room board to toggle full-screen display mode
      </AppText>

      <AppButton title="Log out" icon="logout" variant="danger" onPress={logOut} />
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <AppText variant="label" color="textTertiary">
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginTop: 10,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
});
