import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View, type TextInputInstance } from 'react-native';

import { login, persistSessionToken } from '@/features/auth/api';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { presentAuthError } from '@/features/auth/errors';
import { useAuthSubmission } from '@/features/auth/useAuthSubmission';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  hasFieldErrors,
  validateLogin,
  type FieldErrors,
} from '@/features/auth/validation';
import { Button, Card, ErrorMessage, Text, TextField } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

export function LoginScreen() {
  const theme = useAppTheme();
  const passwordRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { submitting, run } = useAuthSubmission();

  function clearField(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError(null);
  }

  function submit() {
    const errors = validateLogin({ email, password });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) {
      setFormError(null);
      return;
    }

    void run(async () => {
      setFormError(null);
      setFieldErrors({});
      try {
        const token = await login({ email, password });
        await persistSessionToken(token);
        router.replace('/');
      } catch (error) {
        const presented = presentAuthError(error);
        setFieldErrors(presented.fieldErrors);
        setFormError(presented.message);
      }
    });
  }

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Sign in with your email to open the dashboard."
      footer={
        <View style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
          <Text variant="muted">Need an account?</Text>
          <Button
            label="Create an account"
            variant="ghost"
            fullWidth
            disabled={submitting}
            onPress={() => router.push('/register')}
          />
        </View>
      }
    >
      <Card>
        <View style={{ gap: theme.spacing.lg }}>
          <TextField
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearField('email');
            }}
            error={fieldErrors.email}
            editable={!submitting}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardType="email-address"
            inputMode="email"
            autoComplete="email"
            textContentType="emailAddress"
            importantForAutofill="yes"
            maxLength={EMAIL_MAX_LENGTH}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <PasswordField
            ref={passwordRef}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearField('password');
            }}
            error={fieldErrors.password}
            hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
            editable={!submitting}
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={submit}
            maxLength={PASSWORD_MAX_LENGTH}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button label="Sign in" fullWidth size="lg" loading={submitting} onPress={submit} />
        </View>
      </Card>
    </AuthScaffold>
  );
}
