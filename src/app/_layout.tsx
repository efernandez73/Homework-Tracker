import AppTabs from '@/components/app-tabs';
import { AssignmentsProvider } from '@/context/assignments-context';

export default function TabLayout() {
  return (
    <AssignmentsProvider>
      <AppTabs />
    </AssignmentsProvider>
  );
}