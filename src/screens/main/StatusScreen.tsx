import { useCallback } from 'react';
import { AppState, Platform, View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { AppText } from '@/components/ui';
import { useAppTheme } from '@/theme/useAppTheme';
import {
  eventStart,
  eventEnd,
  isValidEvent,
  formatTime,
  formatTimeBetweenDates,
} from '@/lib/eventUtils';
import { useEvents } from '@/api/queries';
import { useRoomStore } from '@/store/useRoomStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import type { RootStackParamList } from '@/navigation/types';

export default function StatusScreen() {
  const t = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const roomName = useRoomStore((s) => s.selectedRoomName) ?? 'Select room';
  const kioskMode = usePreferencesStore((s) => s.kioskMode);
  const setKioskMode = usePreferencesStore((s) => s.setKioskMode);
  const { data: events = [], isLoading } = useEvents();
  const now = new Date();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') return;
      activateKeepAwakeAsync('room-board');
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') activateKeepAwakeAsync('room-board').catch(() => {});
      });
      return () => {
        sub.remove();
        deactivateKeepAwake('room-board');
      };
    }, []),
  );

  const current =
    events.find((ev) => isValidEvent(ev) && eventStart(ev) <= now && now <= eventEnd(ev)) ?? null;
  const upcoming = events
    .filter((ev) => isValidEvent(ev) && eventStart(ev) > now)
    .sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime());
  const next = upcoming[0] ?? null;

  const busy = current != null;
  const accent = busy ? t.busy : t.available;
  const onAccent = '#FFFFFF';
  const onAccentSoft = 'rgba(255,255,255,0.85)';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: t.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: accent }]} edges={['top', 'bottom']}>
      <Pressable style={styles.fill} onPress={() => setKioskMode(!kioskMode)}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate('RoomPicker')} style={styles.roomBtn}>
            <AppText variant="heading" numberOfLines={1} style={{ color: onAccent }}>
              {roomName}
            </AppText>
            <MaterialIcons name="expand-more" size={22} color={onAccentSoft} />
          </Pressable>
          <AppText variant="label" style={{ color: onAccentSoft }}>
            {formatTime(now)}
          </AppText>
        </View>

        <View style={styles.center}>
          <MaterialCommunityIcons
            name={busy ? 'calendar-clock' : 'calendar-check'}
            size={64}
            color={onAccentSoft}
          />
          <AppText
            variant="display"
            style={{ color: onAccent, marginTop: 12, textAlign: 'center' }}
          >
            {busy ? 'In use' : 'Available'}
          </AppText>

          {busy && current && (
            <View style={styles.detail}>
              <AppText
                variant="title"
                numberOfLines={2}
                style={{ color: onAccent, textAlign: 'center' }}
              >
                {current.summary}
              </AppText>
              <AppText
                variant="body"
                style={{ color: onAccentSoft, marginTop: 8, textAlign: 'center' }}
              >
                Ends at {formatTime(eventEnd(current))} · in{' '}
                {formatTimeBetweenDates(now, eventEnd(current))}
              </AppText>
            </View>
          )}

          {!busy && (
            <View style={styles.detail}>
              <AppText variant="body" style={{ color: onAccentSoft, textAlign: 'center' }}>
                {next
                  ? `Free for ${formatTimeBetweenDates(now, eventStart(next))}`
                  : 'Free for the rest of the day'}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {next ? (
            <>
              <AppText variant="label" style={{ color: onAccentSoft }}>
                Next
              </AppText>
              <AppText
                variant="body"
                numberOfLines={1}
                style={{ color: onAccent, fontWeight: '600' }}
              >
                {formatTime(eventStart(next))} · {next.summary}
              </AppText>
            </>
          ) : (
            <AppText variant="label" style={{ color: onAccentSoft }}>
              No more events today
            </AppText>
          )}
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  detail: {
    marginTop: 20,
    maxWidth: 360,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.25)',
    gap: 2,
  },
});
