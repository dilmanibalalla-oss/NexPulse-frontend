import { type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme, useResponsive } from '@/shared/theme';

type ScreenProps = {
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  centered?: boolean;
};

export function Screen({ children, onRefresh, refreshing = false, centered = false }: ScreenProps) {
  const theme = useAppTheme();
  const responsive = useResponsive();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.accent}
              colors={[theme.colors.accent]}
              progressBackgroundColor={theme.colors.surface}
            />
          ) : undefined
        }
      >
        <View
          style={[
            styles.content,
            centered ? styles.centered : null,
            {
              maxWidth: responsive.contentMaxWidth,
              paddingHorizontal: responsive.horizontalPadding,
              paddingTop: responsive.isCompact ? theme.spacing.xxl : theme.spacing.xxxl,
              paddingBottom: theme.spacing.xxl,
              gap: responsive.sectionGap,
            },
          ]}
        >
          {children}
        </View>
      </ScrollView>
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
  content: {
    width: '100%',
    alignSelf: 'center',
  },
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
