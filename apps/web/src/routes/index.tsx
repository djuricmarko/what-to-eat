import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { UtensilsCrossed } from 'lucide-react';
import { api } from '@/lib/api-client';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<{ status: string; db: string }>('/health'),
    retry: false,
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <UtensilsCrossed className="size-12 text-primary" aria-hidden />
      <h1 className="text-3xl font-bold">What to Eat</h1>
      <p className="text-muted-foreground">Vote with your family on today&apos;s lunch.</p>
      <p className="text-sm text-muted-foreground">
        API:{' '}
        {health.isPending
          ? 'checking…'
          : health.isError
            ? 'unreachable'
            : `${health.data.status} (db ${health.data.db})`}
      </p>
    </main>
  );
}
