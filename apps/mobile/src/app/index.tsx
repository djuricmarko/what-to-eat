import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { api } from '@/lib/api-client';
import { config } from '@/lib/config';

interface Health {
  status: string;
  db: string;
}

function fetchHealth() {
  return api.get<Health>('/health');
}

function describeApiStatus(health: UseQueryResult<Health>) {
  if (health.isPending) return 'checking…';
  if (health.isError) return `unreachable (${config.apiUrl})`;
  return `${health.data.status} (db ${health.data.db})`;
}

export default function HomeScreen() {
  const colors = useThemeColors();
  const health = useQuery({ queryKey: ['health'], queryFn: fetchHealth, retry: false });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>What to Eat</Text>
        <Text style={{ color: colors.mutedForeground }}>Vote with your family on today&apos;s lunch.</Text>
        <Text style={[styles.small, { color: colors.mutedForeground }]}>API: {describeApiStatus(health)}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  emoji: { fontSize: 48 },
  title: { fontSize: 28, fontWeight: '700' },
  small: { fontSize: 13 },
});
