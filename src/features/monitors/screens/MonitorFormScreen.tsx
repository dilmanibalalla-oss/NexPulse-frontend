import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';

import type { CheckType } from '@/features/dashboard/types';
import { loadMonitor, saveMonitor } from '@/features/monitors/api';
import { useMonitorNotice } from '@/features/monitors/notice';
import {
  MONITOR_CHECK_TYPES,
  MONITOR_INTERVALS,
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
  onFinished?: () => void;
};

const INTERVAL_LABELS: Record<(typeof MONITOR_INTERVALS)[number], string> = {
  60: '1 minute',
  300: '5 minutes',
  600: '10 minutes',
};

export function MonitorFormScreen({ monitorId, onFinished }: MonitorFormScreenProps) {
  const theme = useAppTheme();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState('60');
  const [enabled, setEnabled] = useState(true);
  const [checkType, setCheckType] = useState<CheckType>('HTTP');
  const [port, setPort] = useState('');
  const [expectedStatus, setExpectedStatus] = useState('');
  const [expectedBody, setExpectedBody] = useState('');
  const [fieldErrors, setFieldErrors] = useState<MonitorFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(monitorId != null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const title = monitorId == null ? 'Add monitor' : 'Edit monitor';
  const targetLabel = checkType === 'TCP' || checkType === 'DNS' ? 'Host' : 'URL';

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
        setUrl(displayTarget(monitor.checkType, monitor.url));
        setIntervalSeconds(snapInterval(monitor.intervalSeconds));
        setEnabled(monitor.enabled);
        setCheckType(monitor.checkType);
        setPort(monitor.port == null ? '' : String(monitor.port));
        setExpectedStatus(monitor.expectedStatus == null ? '' : String(monitor.expectedStatus));
        setExpectedBody(monitor.expectedBody ?? '');
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
    const values = {
      name,
      url,
      intervalSeconds,
      enabled,
      checkType,
      port,
      expectedStatus,
      expectedBody,
    };
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
      checkType,
      port: checkType === 'TCP' ? Number(port) : null,
      expectedStatus: checkType === 'REST' && expectedStatus.trim() ? Number(expectedStatus) : null,
      expectedBody: checkType === 'REST' ? expectedBody : null,
    }).then(
      () => {
        useMonitorNotice
          .getState()
          .setMessage(monitorId == null ? 'Monitor added.' : 'Monitor updated.');
        if (onFinished) {
          onFinished();
          return;
        }
        if (monitorId == null) {
          router.replace('/monitors');
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
        if (apiError?.fieldErrors.port) {
          nextFields.port = apiError.fieldErrors.port;
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
          onPress={() => (onFinished ? onFinished() : router.replace('/monitors'))}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: theme.spacing.md }}>
        <Button label="Back" variant="ghost" onPress={() => (onFinished ? onFinished() : router.back())} />
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
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="label">Check</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {MONITOR_CHECK_TYPES.map((type) => (
            <Button
              key={type}
              label={type}
              variant={checkType === type ? 'primary' : 'secondary'}
              disabled={saving}
              onPress={() => setCheckType(type)}
            />
          ))}
        </View>
      </View>
      <TextField
        label={targetLabel}
        value={url}
        onChangeText={setUrl}
        error={fieldErrors.url}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={checkType === 'TCP' || checkType === 'DNS' ? 'default' : 'url'}
        maxLength={2048}
      />
      {checkType === 'TCP' ? (
        <TextField
          label="Port"
          value={port}
          onChangeText={setPort}
          error={fieldErrors.port}
          keyboardType="number-pad"
          inputMode="numeric"
        />
      ) : null}
      {checkType === 'REST' ? (
        <>
          <TextField
            label="Expected status"
            value={expectedStatus}
            onChangeText={setExpectedStatus}
            error={fieldErrors.expectedStatus}
            hint="Optional. Leave blank to accept any 2xx or 3xx response."
            keyboardType="number-pad"
            inputMode="numeric"
          />
          <TextField
            label="Expected text"
            value={expectedBody}
            onChangeText={setExpectedBody}
            error={fieldErrors.expectedBody}
            hint="Optional. The response must contain this text."
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={200}
          />
        </>
      ) : null}
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="label">Interval</Text>
        {fieldErrors.intervalSeconds ? (
          <Text variant="caption">{fieldErrors.intervalSeconds}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {MONITOR_INTERVALS.map((interval) => (
            <Button
              key={interval}
              label={INTERVAL_LABELS[interval]}
              variant={intervalSeconds === String(interval) ? 'primary' : 'secondary'}
              disabled={saving}
              onPress={() => setIntervalSeconds(String(interval))}
            />
          ))}
        </View>
      </View>
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

function snapInterval(seconds: number): string {
  if (seconds === 60 || seconds === 300 || seconds === 600) {
    return String(seconds);
  }

  return '60';
}

function displayTarget(checkType: CheckType, url: string): string {
  if (checkType !== 'TCP' && checkType !== 'DNS') {
    return url;
  }

  try {
    const parsed = new URL(url);
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && (parsed.pathname === '/' || parsed.pathname === '') && !parsed.search) {
      return parsed.hostname;
    }
  } catch {
    return url;
  }

  return url;
}
