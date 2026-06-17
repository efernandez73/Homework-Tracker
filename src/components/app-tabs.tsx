import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AppTabs() {
  const colorScheme = useColorScheme();

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Calendar',
        }}
      />
    </Tabs>
  );
} 