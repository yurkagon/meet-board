import { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { AppText } from '@/components/ui';
import { useAppTheme } from '@/theme/useAppTheme';
import { formatTimeBetweenDates } from '@/lib/eventUtils';
import { useEvents } from '@/api/queries';
import { useRoomStore } from '@/store/useRoomStore';
import type { CalendarEvent } from '@/types/calendar';
import type { RootStackParamList } from '@/navigation/types';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function hhmm(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function startDate(ev: CalendarEvent): Date {
  return new Date(ev.start.dateTime as string);
}

function endDate(ev: CalendarEvent): Date {
  return new Date(ev.end.dateTime as string);
}

function valid(ev: CalendarEvent): boolean {
  return startDate(ev).toString() !== 'Invalid Date' && endDate(ev).toString() !== 'Invalid Date';
}

export default function StatusScreen() {
  const t = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const roomName = useRoomStore((s) => s.selectedRoomName) ?? 'Select room';
  const { data: events = [], isLoading } = useEvents();
  const now = new Date();

  useFocusEffect(
    useCallback(() => {
      activateKeepAwakeAsync('room-board');
      return () => {
        deactivateKeepAwake('room-board');
      };
    }, []),
  );

  const current = events.find((ev) => valid(ev) && startDate(ev) <= now && now <= endDate(ev)) ?? null;
  const upcoming = events
    .filter((ev) => valid(ev) && startDate(ev) > now)
    .sort((a, b) => startDate(a).getTime() - startDate(b).getTime());
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('RoomPicker')} style={styles.roomBtn}>
          <AppText variant="heading" numberOfLines={1} style={{ color: onAccent }}>
            {roomName}
          </AppText>
          <MaterialIcons name="expand-more" size={22} color={onAccentSoft} />
        </Pressable>
        <AppText variant="label" style={{ color: onAccentSoft }}>
          {hhmm(now)}
        </AppText>
      </View>

      <View style={styles.center}>
        <MaterialCommunityIcons
          name={busy ? 'calendar-clock' : 'calendar-check'}
          size={64}
          color={onAccentSoft}
        />
        <AppText variant="display" style={{ color: onAccent, marginTop: 12, textAlign: 'center' }}>
          {busy ? 'In use' : 'Available'}
        </AppText>

        {busy && current && (
          <View style={styles.detail}>
            <AppText variant="title" numberOfLines={2} style={{ color: onAccent, textAlign: 'center' }}>
              {current.summary}
            </AppText>
            <AppText variant="body" style={{ color: onAccentSoft, marginTop: 8, textAlign: 'center' }}>
              Ends at {hhmm(endDate(current))} · in {formatTimeBetweenDates(now, endDate(current))}
            </AppText>
          </View>
        )}

        {!busy && (
          <View style={styles.detail}>
            <AppText variant="body" style={{ color: onAccentSoft, textAlign: 'center' }}>
              {next ? `Free for ${formatTimeBetweenDates(now, startDate(next))}` : 'Free for the rest of the day'}
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
            <AppText variant="body" numberOfLines={1} style={{ color: onAccent, fontWeight: '600' }}>
              {hhmm(startDate(next))} · {next.summary}
            </AppText>
          </>
        ) : (
          <AppText variant="label" style={{ color: onAccentSoft }}>
            No more events today
          </AppText>
        )}
      </View>
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
