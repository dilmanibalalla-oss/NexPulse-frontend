import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/shared/components';
import { useAppTheme, useResponsive } from '@/shared/theme';

type AuthScaffoldProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScaffold({ title, subtitle, children, footer }: AuthScaffoldProps) {
  const theme = useAppTheme();
  const responsive = useResponsive();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safe}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scroll}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              width: '100%',
              maxWidth: responsive.contentMaxWidth,
              alignSelf: 'center',
              paddingHorizontal: responsive.horizontalPadding,
              paddingTop: responsive.isCompact ? theme.spacing.xxl : theme.spacing.xxxl,
              paddingBottom: theme.spacing.xxl,
              gap: theme.spacing.xl,
            }}
          >
            <View style={{ gap: theme.spacing.md }}>
              <Text variant="label">NexPulse</Text>
              <Text accessibilityRole="header" variant="display">
                {title}
              </Text>
              <Text variant="muted">{subtitle}</Text>
            </View>
            {children}
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
});
