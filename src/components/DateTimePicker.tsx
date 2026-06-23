import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import Colors from '@/constants/colors';

type Opener = (date: Date, resolve: (value: Date) => void) => void;
let opener: Opener | null = null;

export function pickDateTime(currentDate: Date): Promise<Date> {
  return new Promise((resolve) => {
    if (opener) opener(new Date(currentDate), resolve);
    else resolve(new Date(currentDate));
  });
}

export function DateTimePickerHost() {
  const defaultStyles = useDefaultStyles('light');
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState<Date>(new Date());
  const resolverRef = useRef<((value: Date) => void) | null>(null);
  const originalRef = useRef<Date>(new Date());

  useEffect(() => {
    opener = (date, resolve) => {
      resolverRef.current = resolve;
      originalRef.current = new Date(date);
      setValue(new Date(date));
      setVisible(true);
    };
    return () => {
      opener = null;
    };
  }, []);

  const finish = (date: Date) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setVisible(false);
    if (resolve) resolve(date);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible
      onRequestClose={() => finish(new Date(originalRef.current))}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <DateTimePicker
            mode="single"
            date={value}
            timePicker
            onChange={({ date }) => setValue(dayjs(date as dayjs.ConfigType).toDate())}
            styles={{
              ...defaultStyles,
              today: { borderColor: Colors.tintColor, borderWidth: 1 },
              selected: { backgroundColor: Colors.tintColor },
              selected_label: { color: 'white' },
            }}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.action, { backgroundColor: Colors.errorColor }]}
              onPress={() => finish(new Date(originalRef.current))}
            >
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.action, { backgroundColor: Colors.nowColor }]}
              onPress={() => finish(dayjs(value).toDate())}
            >
              <Text style={styles.actionText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  action: {
    flex: 1,
    marginHorizontal: 4,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
});
