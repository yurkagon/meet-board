import { View, StyleSheet, Linking } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen, Card, AppText, AppButton, Chip, Divider } from '@/components/ui';
import { useAppTheme, type AppTheme } from '@/theme/useAppTheme';
import {
  formatDateToDisplay,
  formatTimeBetweenDates,
  eventStart,
  eventEnd,
  isValidEvent,
} from '@/lib/eventUtils';
import { useDeleteEvent } from '@/api/queries';
import * as Toast from '@/components/Toast';
import type { CalendarEvent } from '@/types/calendar';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CurrentEvent'>;

function status(ev: CalendarEvent, t: AppTheme) {
  if (!isValidEvent(ev)) {
    return { label: 'No date', bg: t.surfaceAlt, fg: t.textSecondary, line: 'No information' };
  }
  const start = eventStart(ev);
  const end = eventEnd(ev);
  const now = new Date();
  if (now > end) {
    return {
      label: 'Past',
      bg: t.surfaceAlt,
      fg: t.textTertiary,
      line: `Ended ${formatTimeBetweenDates(end, now)}ago`,
    };
  }
  if (now >= start && now <= end) {
    return {
      label: 'Now',
      bg: t.busyBg,
      fg: t.busy,
      line: `Ends in ${formatTimeBetweenDates(now, end)}`,
    };
  }
  return {
    label: 'Upcoming',
    bg: t.availableBg,
    fg: t.available,
    line: `Starts in ${formatTimeBetweenDates(now, start)}`,
  };
}

export default function CurrentEventScreen({ route, navigation }: Props) {
  const t = useAppTheme();
  const obj = route.params.obj;
  const deleteEvent = useDeleteEvent();
  const s = status(obj, t);

  async function remove() {
    try {
      await deleteEvent.mutateAsync(obj.id);
      Toast.show('Event removed', Toast.SHORT);
      navigation.goBack();
    } catch {
      Toast.show('Failed to remove the event', Toast.SHORT);
    }
  }

  return (
    <Screen scroll>
      <Card>
        <View style={styles.titleRow}>
          <AppText variant="heading" style={{ flex: 1 }}>
            {obj.summary}
          </AppText>
          <Chip label={s.label} bg={s.bg} fg={s.fg} />
        </View>
        <AppText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
          {s.line}
        </AppText>

        <View style={{ marginVertical: 14 }}>
          <Divider />
        </View>

        <Field label="Start" value={formatDateToDisplay(obj.start.dateTime)} />
        <View style={{ height: 12 }} />
        <Field label="End" value={formatDateToDisplay(obj.end.dateTime)} />
      </Card>

      <View style={{ gap: 12 }}>
        {obj.htmlLink && (
          <AppButton
            title="Open in Google Calendar"
            icon="open-in-new"
            variant="secondary"
            onPress={() => Linking.openURL(obj.htmlLink as string)}
          />
        )}
        <AppButton
          title="Edit event"
          icon="edit"
          variant="secondary"
          onPress={() => navigation.navigate('EditEvent', { obj })}
        />
        <AppButton
          title="Remove event"
          icon="delete-outline"
          variant="danger"
          onPress={remove}
          loading={deleteEvent.isPending}
        />
      </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
});
