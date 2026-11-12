import { useLocalSearchParams } from 'expo-router';

import { MissingMonitor } from '@/features/monitors/components/MissingMonitor';
import { parseMonitorId } from '@/features/monitors/params';
import { MonitorFormScreen } from '@/features/monitors/screens/MonitorFormScreen';

export default function EditMonitorRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const monitorId = parseMonitorId(params.id);
  if (monitorId == null) {
    return <MissingMonitor />;
  }

  return <MonitorFormScreen monitorId={monitorId} />;
}
