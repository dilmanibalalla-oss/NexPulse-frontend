import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/shared/components/Text';
import { useAppTheme } from '@/shared/theme';

type TextFieldProps = Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> & {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  error,
  hint,
  editable = true,
  accessibilityLabel,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? theme.colors.down
    : focused
      ? theme.colors.focus
      : theme.colors.border;
  const helper = error ?? hint;

  return (
    <View style={{ gap: theme.spacing.sm, opacity: editable ? 1 : 0.55 }}>
      <Text variant="caption" style={{ color: theme.colors.text, fontWeight: '600' }}>
        {label}
      </Text>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={theme.colors.textSubtle}
        keyboardAppearance="dark"
        selectionColor={theme.colors.accent}
        cursorColor={theme.colors.accent}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          theme.typography.body,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            borderColor,
            borderRadius: theme.radius.lg,
            minHeight: theme.layout.controlHeight,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
          },
        ]}
      />
      {helper ? (
        <Text
          variant="caption"
          accessibilityRole={error ? 'alert' : undefined}
          accessibilityLiveRegion={error ? 'polite' : undefined}
          style={error ? { color: theme.colors.down } : undefined}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    width: '100%',
  },
});
