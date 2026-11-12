import { useState, type Ref } from 'react';
import { Pressable, type TextInputInstance, type TextInputProps } from 'react-native';

import { Text, TextField } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type PasswordFieldProps = {
  ref?: Ref<TextInputInstance>;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  editable?: boolean;
  autoComplete: NonNullable<TextInputProps['autoComplete']>;
  textContentType: NonNullable<TextInputProps['textContentType']>;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  maxLength?: number;
};

export function PasswordField({
  ref,
  value,
  onChangeText,
  error,
  hint,
  editable = true,
  autoComplete,
  textContentType,
  returnKeyType = 'go',
  onSubmitEditing,
  maxLength,
}: PasswordFieldProps) {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      ref={ref}
      label="Password"
      value={value}
      onChangeText={onChangeText}
      error={error}
      hint={hint}
      editable={editable}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      autoComplete={autoComplete}
      textContentType={textContentType}
      returnKeyType={returnKeyType}
      blurOnSubmit={false}
      maxLength={maxLength}
      onSubmitEditing={onSubmitEditing}
      labelAccessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          disabled={!editable}
          hitSlop={12}
          onPress={() => setVisible((current) => !current)}
        >
          <Text variant="caption" style={{ color: theme.colors.accent, fontWeight: '600' }}>
            {visible ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      }
    />
  );
}
