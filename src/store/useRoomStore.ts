import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Room } from '@/types/calendar';

interface RoomState {
  selectedRoomId: string | null;
  selectedRoomName: string | null;
  setRoom: (room: Room) => void;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      selectedRoomId: null,
      selectedRoomName: null,
      setRoom: (room) => set({ selectedRoomId: room.id, selectedRoomName: room.name }),
    }),
    {
      name: 'room',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const getSelectedCalendarId = () => useRoomStore.getState().selectedRoomId ?? 'primary';
