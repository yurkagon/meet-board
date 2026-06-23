import { ActivityIndicator, StyleSheet, View } from 'react-native';

type Props = {
  enabled?: boolean;
  color?: string;
};

export function LoadingIndicator({ enabled, color }: Props) {
  if (!enabled) return null;
  return (
    <View style={styles.bg}>
      <View style={styles.indBg}>
        <ActivityIndicator size="large" color={color} animating={enabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(237, 247, 241,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  indBg: {
    height: 50,
    width: 50,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 6,
  },
});
