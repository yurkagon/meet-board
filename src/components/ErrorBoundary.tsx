import { Component, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppText, AppButton } from '@/components/ui';
import { useAppTheme } from '@/theme/useAppTheme';

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const t = useAppTheme();
  return (
    <View style={[styles.fill, { backgroundColor: t.bg }]}>
      <MaterialIcons name="error-outline" size={56} color={t.textTertiary} />
      <AppText variant="heading" style={{ marginTop: 16 }}>
        Something went wrong
      </AppText>
      <AppText
        variant="caption"
        color="textSecondary"
        style={{ marginTop: 6, textAlign: 'center' }}
      >
        The app hit an unexpected error.
      </AppText>
      <View style={{ marginTop: 20 }}>
        <AppButton title="Try again" icon="refresh" onPress={onRetry} />
      </View>
    </View>
  );
}

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('ErrorBoundary caught', error);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
