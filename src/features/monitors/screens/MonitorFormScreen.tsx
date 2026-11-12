import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';

import { loadMonitor, saveMonitor } from '@/features/monitors/api';
import { useMonitorNotice } from '@/features/monitors/notice';
import {
  hasMonitorErrors,
  validateMonitor,
  type MonitorFieldErrors,
} from '@/features/monitors/validation';
import { ApiError } from '@/shared/api/errors';
import {
  Button,
  ErrorMessage,
  LoadingIndicator,
  Screen,
  Text,
  TextField,
} from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type MonitorFormScreenProps = {
  monitorId: number | null;
};

export function MonitorFormScreen({ monitorId }: MonitorFormScreenProps) {
  const theme = useAppTheme();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<MonitorFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(monitorId != null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const title = monitorId == null ? 'Add monitor' : 'Edit monitor';

  useEffect(() => {
    if (monitorId == null) {
      return;
    }

    let active = true;
    void loadMonitor(monitorId).then(
      (monitor) => {
        if (!active) {
          return;
        }

        setName(monitor.name);
        setUrl(monitor.url);
        setIntervalSeconds(String(monitor.intervalSeconds));
        setEnabled(monitor.enabled);
        setLoading(false);
      },
      (error: unknown) => {
        if (!active) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : 'This monitor could not be loaded. Try again.',
        );
        setLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, [monitorId]);

  function submit() {
    const values = { name, url, intervalSeconds, enabled };
    const errors = validateMonitor(values);
    setFieldErrors(errors);
    setFormError(null);
    if (hasMonitorErrors(errors)) {
      return;
    }

    setSaving(true);
    void saveMonitor(monitorId, {
      name,
      url,
      intervalSeconds: Number(intervalSeconds),
      enabled,
    }).then(
      (monitor) => {
        useMonitorNotice
          .getState()
          .setMessage(monitorId == null ? 'Monitor added.' : 'Monitor updated.');
        if (monitorId == null) {
          router.replace({ pathname: '/monitors/[id]/index', params: { id: String(monitor.id) } });
          return;
        }

        router.back();
      },
      (error: unknown) => {
        const apiError = error instanceof ApiError ? error : null;
        const nextFields: MonitorFieldErrors = {};
        if (apiError?.fieldErrors.name) {
          nextFields.name = apiError.fieldErrors.name;
        }
        if (apiError?.fieldErrors.url) {
          nextFields.url = apiError.fieldErrors.url;
        }
        if (apiError?.fieldErrors.intervalSeconds) {
          nextFields.intervalSeconds = apiError.fieldErrors.intervalSeconds;
        }
        setFieldErrors(nextFields);
        setFormError(
          hasMonitorErrors(nextFields)
            ? null
            : (apiError?.message ?? 'The monitor could not be saved. Try again.'),
        );
        setSaving(false);
      },
    );
  }

  if (loading) {
    return (
      <Screen centered>
        <LoadingIndicator label="Loading monitor" size="large" centered />
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen centered>
        <ErrorMessage message={loadError} title="Monitor unavailable" />
        <Button
          label="Back to monitors"
          variant="secondary"
          onPress={() => router.replace('/monitors/index')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: theme.spacing.md }}>
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
        <Text accessibilityRole="header" variant="display">
          {title}
        </Text>
      </View>
      {formError ? <ErrorMessage message={formError} /> : null}
      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        error={fieldErrors.name}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={120}
      />
      <TextField
        label="URL"
        value={url}
        onChangeText={setUrl}
        error={fieldErrors.url}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        maxLength={2048}
      />
      <TextField
        label="Interval (seconds)"
        value={intervalSeconds}
        onChangeText={setIntervalSeconds}
        error={fieldErrors.intervalSeconds}
        hint="A whole number from 1 to 86400."
        keyboardType="number-pad"
        inputMode="numeric"
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        }}
      >
        <Text variant="body">{enabled ? 'Monitoring is on' : 'Monitoring is paused'}</Text>
        <Switch
          accessibilityLabel="Monitoring enabled"
          value={enabled}
          onValueChange={setEnabled}
          disabled={saving}
          trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
          thumbColor={theme.colors.text}
        />
      </View>
      <Button
        label={monitorId == null ? 'Add monitor' : 'Save changes'}
        loading={saving}
        onPress={submit}
      />
    </Screen>
  );
}
