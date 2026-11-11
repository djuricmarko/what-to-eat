import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { api } from '@/lib/api-client';
import { config } from '@/lib/config';

export default function HomeScreen() {
  const c = useThemeColors();
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<{ status: string; db: string }>('/health'),
    retry: false,
  });

  const status = health.isPending
    ? 'checking…'
    : health.isError
      ? `unreachable (${config.apiUrl})`
      : `${health.data.status} (db ${health.data.db})`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={[styles.title, { color: c.foreground }]}>What to Eat</Text>
        <Text style={{ color: c.mutedForeground }}>Vote with your family on today&apos;s lunch.</Text>
        <Text style={[styles.small, { color: c.mutedForeground }]}>API: {status}</Text>
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
