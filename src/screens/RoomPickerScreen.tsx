import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen, AppText, AppButton } from '@/components/ui';
import { useAppTheme } from '@/theme/useAppTheme';
import { useCalendars, useCreateCalendar } from '@/api/queries';
import { useRoomStore } from '@/store/useRoomStore';
import * as Toast from '@/components/Toast';
import type { Room } from '@/types/calendar';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomPicker'>;

export default function RoomPickerScreen({ navigation }: Props) {
  const t = useAppTheme();
  const { data: rooms = [], isLoading, isError, refetch } = useCalendars();
  const createCalendar = useCreateCalendar();
  const selectedId = useRoomStore((s) => s.selectedRoomId);
  const setRoom = useRoomStore((s) => s.setRoom);
  const [name, setName] = useState('');

  function pick(room: Room) {
    setRoom(room);
    navigation.goBack();
  }

  async function create() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const room = await createCalendar.mutateAsync(trimmed);
      setName('');
      Toast.show('Room created', Toast.SHORT);
      pick(room);
    } catch {
      Toast.show('Failed to create room', Toast.SHORT);
    }
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 20, gap: 10 }}
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 6 }}>
            <AppText variant="caption" color="textTertiary">
              Choose the room this device shows
            </AppText>
            <View style={[styles.createRow, { backgroundColor: t.surface, borderColor: t.border }]}>
              <MaterialIcons name="add" size={20} color={t.textSecondary} />
              <TextInput
                placeholder="Create a new room"
                placeholderTextColor={t.textTertiary}
                value={name}
                onChangeText={setName}
                onSubmitEditing={create}
                returnKeyType="done"
                maxLength={60}
                style={{ flex: 1, color: t.text, fontSize: 16 }}
              />
              {createCalendar.isPending ? (
                <ActivityIndicator color={t.primary} />
              ) : (
                name.trim().length > 0 && (
                  <Pressable onPress={create} hitSlop={10}>
                    <AppText variant="label" style={{ color: t.primary }}>
                      Create
                    </AppText>
                  </Pressable>
                )
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={t.primary} />
            </View>
          ) : isError ? (
            <View style={styles.center}>
              <AppText variant="body" color="textSecondary" style={{ marginBottom: 12 }}>
                Could not load rooms
              </AppText>
              <AppButton title="Retry" variant="secondary" onPress={() => refetch()} />
            </View>
          ) : (
            <View style={styles.center}>
              <AppText variant="body" color="textSecondary">
                No rooms yet — create one above
              </AppText>
            </View>
          )
        }
        renderItem={({ item }) => {
          const selected = item.id === selectedId;
          return (
            <Pressable
              onPress={() => pick(item)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: t.surface,
                  borderColor: selected ? t.primary : t.border,
                  borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <MaterialIcons name="meeting-room" size={22} color={t.textSecondary} />
              <AppText variant="body" numberOfLines={1} style={{ flex: 1, fontWeight: '600' }}>
                {item.name}
              </AppText>
              {selected && <MaterialIcons name="check-circle" size={22} color={t.primary} />}
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
  },
  center: {
    alignItems: 'center',
    paddingTop: 60,
  },
});
