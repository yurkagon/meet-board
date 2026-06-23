import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen, Card, AppText, AppButton, Divider } from '@/components/ui';
import { useAppTheme } from '@/theme/useAppTheme';
import { pickDateTime } from '@/components/DateTimePicker';
import { formatDateToDisplay, formatTimeBetweenDates } from '@/lib/eventUtils';
import { useUpdateEvent } from '@/api/queries';
import * as Toast from '@/components/Toast';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditEvent'>;

export default function EditEventScreen({ route, navigation }: Props) {
  const t = useAppTheme();
  const obj = route.params.obj;
  const updateEvent = useUpdateEvent();

  const [title, setTitle] = useState(obj.summary);
  const [startTime, setStartTime] = useState<Date>(() => new Date(obj.start.dateTime as string));
  const [endTime, setEndTime] = useState<Date>(() => new Date(obj.end.dateTime as string));

  async function pickStart() {
    setStartTime(await pickDateTime(startTime));
  }
  async function pickEnd() {
    setEndTime(await pickDateTime(endTime));
  }

  async function save() {
    try {
      await updateEvent.mutateAsync({
        id: obj.id,
        summary: title.trim() || 'Reserved',
        start: startTime,
        end: endTime,
      });
      Toast.show('Event updated', Toast.SHORT);
    } catch {
      Toast.show('Failed to update', Toast.SHORT);
    }
    navigation.navigate('Main', { screen: 'Events' });
  }

  const validRange = endTime > startTime;

  return (
    <Screen scroll>
      <AppText variant="label" color="textTertiary">
        Title
      </AppText>
      <TextInput
        value={title}
        onChangeText={setTitle}
        maxLength={60}
        placeholder="Event title"
        placeholderTextColor={t.textTertiary}
        style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
      />

      <Card padded={false}>
        <Pressable onPress={pickStart} style={styles.timeRow}>
          <View style={styles.timeLabel}>
            <MaterialIcons name="play-circle-outline" size={20} color={t.textSecondary} />
            <AppText variant="body" color="textSecondary">
              Start
            </AppText>
          </View>
          <AppText variant="body" style={{ fontWeight: '600' }}>
            {formatDateToDisplay(startTime.toJSON())}
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
            {formatDateToDisplay(endTime.toJSON())}
          </AppText>
        </Pressable>
      </Card>

      <AppText variant="caption" color="textTertiary" style={{ marginTop: -8 }}>
        {validRange
          ? `Duration ${formatTimeBetweenDates(startTime, endTime)}`
          : 'End time must be after start time'}
      </AppText>

      <AppButton
        title="Save changes"
        icon="check"
        onPress={save}
        disabled={!validRange}
        loading={updateEvent.isPending}
      />
      <AppButton title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    fontSize: 16,
    marginTop: -8,
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
});
