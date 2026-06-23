import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText, Chip } from '@/components/ui';
import { useAppTheme, type AppTheme } from '@/theme/useAppTheme';
import { formatDateToDisplay, sortDatesToDisplay } from '@/lib/eventUtils';
import { useEvents } from '@/api/queries';
import type { CalendarEvent } from '@/types/calendar';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function statusOf(ev: CalendarEvent, t: AppTheme) {
  const start = new Date(ev.start.dateTime as string);
  const end = new Date(ev.end.dateTime as string);
  const now = new Date();
  if (start.toString() === 'Invalid Date' || end.toString() === 'Invalid Date') {
    return { label: 'No date', bg: t.surfaceAlt, fg: t.textSecondary };
  }
  if (now > end) return { label: 'Past', bg: t.surfaceAlt, fg: t.textTertiary };
  if (now >= start && now <= end) return { label: 'Now', bg: t.busyBg, fg: t.busy };
  return { label: 'Upcoming', bg: t.availableBg, fg: t.available };
}

export default function EventsScreen() {
  const t = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const { data: events = [], refetch, isRefetching, isLoading } = useEvents();

  const sorted = sortDatesToDisplay(events);
  const filtered = sorted.filter((ev) =>
    ev.summary.toUpperCase().includes(search.toUpperCase()),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={styles.header}>
        <AppText variant="title">Events</AppText>
      </View>

      <View style={[styles.search, { backgroundColor: t.surface, borderColor: t.border }]}>
        <MaterialIcons name="search" size={20} color={t.textSecondary} />
        <TextInput
          placeholder="Search events"
          placeholderTextColor={t.textTertiary}
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, color: t.text, fontSize: 16 }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(_item, index) => String(index)}
        contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={t.primary} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={72} color={t.textTertiary} />
              <AppText variant="body" color="textSecondary" style={{ marginTop: 12 }}>
                No events yet
              </AppText>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const status = statusOf(item, t);
          return (
            <Pressable
              onPress={() => navigation.navigate('CurrentEvent', { obj: item })}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: t.surface, borderColor: t.border, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="body" numberOfLines={1} style={{ fontWeight: '600' }}>
                  {item.summary}
                </AppText>
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                  {formatDateToDisplay(item.start.dateTime)}
                </AppText>
              </View>
              <Chip label={status.label} bg={status.bg} fg={status.fg} />
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
});
