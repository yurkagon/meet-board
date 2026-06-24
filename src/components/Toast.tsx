import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

export const SHORT = 2000;
export const LONG = 3500;

type Handler = (message: string, duration: number) => void;
let activeHandler: Handler | null = null;

export function show(message: string, duration: number = SHORT): void {
  if (activeHandler) {
    activeHandler(String(message), duration);
  } else {
    console.log('[Toast]', message);
  }
}

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const handler: Handler = (msg, duration) => {
      setMessage(msg);
      opacity.stopAnimation();
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(({ finished }) => {
        if (finished) setMessage(null);
      });
    };
    activeHandler = handler;
    return () => {
      if (activeHandler === handler) activeHandler = null;
    };
  }, [opacity]);

  if (message == null) return null;
  return (
    <View style={[styles.wrap, { pointerEvents: 'none' }]}>
      <Animated.View style={[styles.toast, { opacity }]}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60,
    alignItems: 'center',
  },
  toast: {
    maxWidth: '90%',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  text: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  },
});
