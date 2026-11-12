import { createFileRoute } from '@tanstack/react-router';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { UtensilsCrossed } from 'lucide-react';
import { api } from '@/lib/api-client';

export const Route = createFileRoute('/')({ component: Home });

interface Health {
  status: string;
  db: string;
}

function fetchHealth() {
  return api.get<Health>('/health');
}

function describeApiStatus(health: UseQueryResult<Health>) {
  if (health.isPending) return 'checking…';
  if (health.isError) return 'unreachable';
  return `${health.data.status} (db ${health.data.db})`;
}

function Home() {
  const health = useQuery({ queryKey: ['health'], queryFn: fetchHealth, retry: false });

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <UtensilsCrossed className="size-12 text-primary" aria-hidden />
      <h1 className="text-3xl font-bold">What to Eat</h1>
      <p className="text-muted-foreground">Vote with your family on today&apos;s lunch.</p>
      <p className="text-sm text-muted-foreground">API: {describeApiStatus(health)}</p>
    </main>
  );
}
