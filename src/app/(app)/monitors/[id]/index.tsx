import { useLocalSearchParams } from 'expo-router';

import { MissingMonitor } from '@/features/monitors/components/MissingMonitor';
import { parseMonitorId } from '@/features/monitors/params';
import { MonitorDetailScreen } from '@/features/monitors/screens/MonitorDetailScreen';

export default function MonitorDetailRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const monitorId = parseMonitorId(params.id);
  if (monitorId == null) {
    return <MissingMonitor />;
  }

  return <MonitorDetailScreen monitorId={monitorId} />;
}
