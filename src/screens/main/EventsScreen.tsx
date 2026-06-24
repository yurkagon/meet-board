import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import DelayInput from 'react-native-debounce-input';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText, Chip } from '@/components/ui';
import { useAppTheme, type AppTheme } from '@/theme/useAppTheme';
import {
  formatDateToDisplay,
  sortDatesToDisplay,
  eventStart,
  eventEnd,
  isValidEvent,
} from '@/lib/eventUtils';
import { useEvents } from '@/api/queries';
import type { CalendarEvent } from '@/types/calendar';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function statusOf(ev: CalendarEvent, t: AppTheme) {
  if (!isValidEvent(ev)) {
    return { label: 'No date', bg: t.surfaceAlt, fg: t.textSecondary };
  }
  const start = eventStart(ev);
  const end = eventEnd(ev);
  const now = new Date();
  if (now > end) return { label: 'Past', bg: t.surfaceAlt, fg: t.textTertiary };
  if (now >= start && now <= end) return { label: 'Now', bg: t.busyBg, fg: t.busy };
  return { label: 'Upcoming', bg: t.availableBg, fg: t.available };
}

export default function EventsScreen() {
  const t = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [searchKey, setSearchKey] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const { data: events = [], refetch, isRefetching, isLoading } = useEvents();

  useEffect(() => {
    if (!isRefetching) setIsManualRefreshing(false);
  }, [isRefetching]);

  function handleRefresh() {
    setIsManualRefreshing(true);
    refetch();
  }

  function clearSearch() {
    setSearch('');
    setSearchKey((k) => k + 1);
  }

  const query = search.trim().toUpperCase();
  const sorted = sortDatesToDisplay(events);
  const filtered = query ? sorted.filter((ev) => ev.summary.toUpperCase().includes(query)) : sorted;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={styles.header}>
        <AppText variant="title">Events</AppText>
        <AppText variant="caption" color="textTertiary">
          Today ± 3 days
        </AppText>
      </View>

      <View style={[styles.search, { backgroundColor: t.surface, borderColor: t.border }]}>
        <MaterialIcons name="search" size={20} color={t.textSecondary} />
        <DelayInput
          key={searchKey}
          value={search}
          onChangeText={(v) => setSearch(String(v))}
          delayTimeout={300}
          minLength={1}
          placeholder="Search events"
          placeholderTextColor={t.textTertiary}
          returnKeyType="search"
          style={{ flex: 1, color: t.text, fontSize: 16 }}
        />
        {search.length > 0 && (
          <Pressable onPress={clearSearch} hitSlop={10}>
            <MaterialIcons name="close" size={20} color={t.textSecondary} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(_item, index) => String(index)}
        contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={handleRefresh}
            tintColor={t.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name={query ? 'calendar-search' : 'calendar-blank-outline'}
                size={72}
                color={t.textTertiary}
              />
              <AppText
                variant="body"
                color="textSecondary"
                style={{ marginTop: 12, textAlign: 'center' }}
              >
                {query ? `No events match “${search.trim()}”` : 'No events in the next few days'}
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
