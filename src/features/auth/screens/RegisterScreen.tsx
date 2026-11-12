import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View, type TextInputInstance } from 'react-native';

import { login, persistSessionToken, register } from '@/features/auth/api';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { presentAuthError } from '@/features/auth/errors';
import { registerRequestBody } from '@/features/auth/request';
import { useAuthSubmission } from '@/features/auth/useAuthSubmission';
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  hasFieldErrors,
  validateRegistration,
  type FieldErrors,
} from '@/features/auth/validation';
import { Button, Card, ErrorMessage, Text, TextField } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

export function RegisterScreen() {
  const theme = useAppTheme();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const registeredEmail = useRef<string | null>(null);
  const [name, setName] = useState('');
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
    const errors = validateRegistration({ name, email, password });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) {
      setFormError(null);
      return;
    }

    const body = registerRequestBody({ name, email, password });
    void run(async () => {
      setFormError(null);
      setFieldErrors({});
      try {
        if (registeredEmail.current !== body.email) {
          await register(body);
          registeredEmail.current = body.email;
        }

        const token = await login({ email: body.email, password: body.password });
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
      title="Create account"
      subtitle="Use your name, email, and a password to join NexPulse."
      footer={
        <View style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
          <Text variant="muted">Already have an account?</Text>
          <Button
            label="Sign in"
            variant="ghost"
            fullWidth
            disabled={submitting}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/login');
              }
            }}
          />
        </View>
      }
    >
      <Card>
        <View style={{ gap: theme.spacing.lg }}>
          <TextField
            label="Name"
            value={name}
            onChangeText={(value) => {
              setName(value);
              clearField('name');
            }}
            error={fieldErrors.name}
            editable={!submitting}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            maxLength={NAME_MAX_LENGTH}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <TextField
            ref={emailRef}
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearField('email');
              if (registeredEmail.current !== null && registeredEmail.current !== value.trim()) {
                registeredEmail.current = null;
              }
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
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={submit}
            maxLength={PASSWORD_MAX_LENGTH}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button
            label="Create account"
            fullWidth
            size="lg"
            loading={submitting}
            onPress={submit}
          />
        </View>
      </Card>
    </AuthScaffold>
  );
}
