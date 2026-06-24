import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme, type AppTheme } from '@/theme/useAppTheme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll,
  padded = true,
  backgroundColor,
  contentStyle,
}: ScreenProps) {
  const t = useAppTheme();
  const bg = backgroundColor ?? t.bg;
  const inner: StyleProp<ViewStyle> = [padded && { padding: 20, gap: 16 }, contentStyle];

  if (scroll) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
        <ScrollView
          contentContainerStyle={[{ flexGrow: 1 }, inner]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      <View style={[{ flex: 1 }, inner]}>{children}</View>
    </SafeAreaView>
  );
}

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function Card({ children, style, padded = true }: CardProps) {
  const t = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderColor: t.border,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: 16,
        },
        padded && { padding: 16 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';

const variantStyle: Record<TextVariant, TextStyle> = {
  display: { fontSize: 40, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '600' },
  heading: { fontSize: 19, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 13, fontWeight: '500' },
  caption: { fontSize: 13, fontWeight: '400' },
};

type AppTextProps = {
  children: ReactNode;
  variant?: TextVariant;
  color?: keyof AppTheme;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export function AppText({ children, variant = 'body', color, style, numberOfLines }: AppTextProps) {
  const t = useAppTheme();
  const resolved =
    color && typeof t[color] === 'string'
      ? (t[color] as string)
      : variant === 'caption' || variant === 'label'
        ? t.textSecondary
        : t.text;
  return (
    <Text numberOfLines={numberOfLines} style={[variantStyle[variant], { color: resolved }, style]}>
      {children}
    </Text>
  );
}

type ChipProps = {
  label: string;
  bg: string;
  fg: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function Chip({ label, bg, fg, icon }: ChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      {icon && <MaterialIcons name={icon} size={15} color={fg} />}
      <Text style={{ color: fg, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
}: AppButtonProps) {
  const t = useAppTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: t.primary, fg: t.onPrimary, border: t.primary },
    secondary: { bg: t.surfaceAlt, fg: t.text, border: t.border },
    danger: { bg: t.busyBg, fg: t.busy, border: t.busyBg },
    ghost: { bg: 'transparent', fg: t.textSecondary, border: 'transparent' },
  };
  const c = palette[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon && <MaterialIcons name={icon} size={20} color={c.fg} />}
          <Text style={{ color: c.fg, fontSize: 16, fontWeight: '600' }}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Divider() {
  const t = useAppTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border }} />;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  button: {
    height: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
