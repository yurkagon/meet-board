import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen, Card, AppText, AppButton, Chip, Divider } from '@/components/ui';
import { useAppTheme } from '@/theme/useAppTheme';
import { pickDateTime } from '@/components/DateTimePicker';
import { formatTimeBetweenDates } from '@/lib/eventUtils';
import { useEvents, useCreateEvent } from '@/api/queries';
import { useRoomStore } from '@/store/useRoomStore';
import type { CalendarEvent } from '@/types/calendar';
import type { RootStackParamList } from '@/navigation/types';
import * as Toast from '@/components/Toast';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function label(d: Date): string {
  return `Today, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function plusMinutes(from: Date, min: number): Date {
  const d = new Date(from);
  d.setMinutes(d.getMinutes() + min);
  return d;
}

const QUICK = [
  { key: '15', label: '15 min', min: 15 },
  { key: '30', label: '30 min', min: 30 },
  { key: '60', label: '1 hour', min: 60 },
  { key: 'next', label: 'Until next', min: 0 },
];

export default function PlannerScreen() {
  const t = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const roomName = useRoomStore((s) => s.selectedRoomName) ?? 'Select room';
  const { data: events = [] } = useEvents();
  const createEvent = useCreateEvent();

  const now = new Date();
  const nextStart = events
    .map((ev: CalendarEvent) => new Date(ev.start.dateTime as string))
    .filter((d) => d.toString() !== 'Invalid Date' && d > now)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const [startTime, setStartTime] = useState<Date>(() => new Date());
  const [endTime, setEndTime] = useState<Date>(() => plusMinutes(new Date(), 30));
  const [title, setTitle] = useState('');
  const [quick, setQuick] = useState<string>('30');

  function applyQuick(key: string, min: number) {
    const start = new Date();
    setQuick(key);
    setStartTime(start);
    if (key === 'next') {
      setEndTime(nextStart && nextStart > start ? nextStart : plusMinutes(start, 60));
    } else {
      setEndTime(plusMinutes(start, min));
    }
  }

  async function pickStart() {
    setQuick('');
    const newStart = await pickDateTime(startTime);
    setStartTime(newStart);
    if (newStart >= endTime) {
      const duration = endTime.getTime() - startTime.getTime();
      setEndTime(new Date(newStart.getTime() + duration));
    }
  }
  async function pickEnd() {
    setQuick('');
    setEndTime(await pickDateTime(endTime));
  }

  async function book() {
    try {
      await createEvent.mutateAsync({
        summary: title.trim() || 'Reserved',
        start: startTime,
        end: endTime,
      });
      Toast.show('Room booked', Toast.SHORT);
      const reset = new Date();
      setStartTime(reset);
      setEndTime(plusMinutes(reset, 30));
      setTitle('');
      setQuick('30');
    } catch {
      Toast.show('Failed to book the room', Toast.SHORT);
    }
  }

  const validRange = endTime > startTime;
  const busyNow = events.some((ev) => {
    const s = new Date(ev.start.dateTime as string);
    const e = new Date(ev.end.dateTime as string);
    return s <= now && now <= e;
  });

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.navigate('RoomPicker')} style={{ flexShrink: 1 }}>
          <AppText variant="title">Reserve room</AppText>
          <View style={styles.roomRow}>
            <AppText variant="caption" numberOfLines={1}>
              {roomName}
            </AppText>
            <MaterialIcons name="expand-more" size={16} color={t.textSecondary} />
          </View>
        </Pressable>
        {busyNow ? (
          <Chip label="In use" bg={t.busyBg} fg={t.busy} icon="schedule" />
        ) : (
          <Chip label="Available" bg={t.availableBg} fg={t.available} icon="check-circle" />
        )}
      </View>

      <View style={{ gap: 8 }}>
        <AppText variant="label">Quick book from now</AppText>
        <View style={styles.quickGrid}>
          {QUICK.map((q) => {
            const selected = quick === q.key;
            return (
              <Pressable
                key={q.key}
                onPress={() => applyQuick(q.key, q.min)}
                style={({ pressed }) => [
                  styles.quick,
                  {
                    backgroundColor: selected ? t.primary : t.surfaceAlt,
                    borderColor: selected ? t.primary : t.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <AppText
                  variant="body"
                  style={{ color: selected ? t.onPrimary : t.text, fontWeight: '600' }}
                >
                  {q.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Card padded={false}>
        <Pressable onPress={pickStart} style={styles.timeRow}>
          <View style={styles.timeLabel}>
            <MaterialIcons name="play-circle-outline" size={20} color={t.textSecondary} />
            <AppText variant="body" color="textSecondary">
              Start
            </AppText>
          </View>
          <AppText variant="body" style={{ fontWeight: '600' }}>
            {label(startTime)}
          </AppText>
        </Pressable>
        <Divider />
        <Pressable onPress={pickEnd} style={styles.timeRow}>
          <View style={styles.timeLabel}>
            <MaterialIcons name="stop-circle" size={20} color={t.textSecondary} />
            <AppText variant="body" color="textSecondary">
              End
            </AppText>
          </View>
          <AppText variant="body" style={{ fontWeight: '600' }}>
            {label(endTime)}
          </AppText>
        </Pressable>
      </Card>

      <AppText variant="caption" color="textTertiary" style={{ marginTop: -8 }}>
        {validRange
          ? `Duration ${formatTimeBetweenDates(startTime, endTime)}`
          : 'End time must be after start time'}
      </AppText>

      <TextInput
        placeholder="Meeting title (optional)"
        placeholderTextColor={t.textTertiary}
        value={title}
        onChangeText={setTitle}
        maxLength={60}
        style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
      />

      <AppButton
        title="Book room"
        icon="event-available"
        onPress={book}
        disabled={!validRange}
        loading={createEvent.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quick: {
    width: '47%',
    flexGrow: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  timeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    fontSize: 16,
  },
});
