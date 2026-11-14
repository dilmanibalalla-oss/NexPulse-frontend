import { router } from 'expo-router';

import { Button, ErrorMessage, Screen } from '@/shared/components';

export function MissingMonitor() {
  return (
    <Screen centered>
      <ErrorMessage message="This monitor link is not valid." title="Monitor unavailable" />
      <Button label="Back to monitors" onPress={() => router.replace('/monitors')} />
    </Screen>
  );
}
