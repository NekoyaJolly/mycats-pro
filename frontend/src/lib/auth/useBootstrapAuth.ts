import { useEffect } from 'react';
import { useAuthStore } from './store';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function useBootstrapAuth() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('refresh failed');
        }

        const json: unknown = await res.json();
        const data = isRecord(json) && 'data' in json ? (json as Record<string, unknown>).data : null;

        if (!cancelled) {
          bootstrap(data ?? null);
        }
      } catch {
        if (!cancelled) {
          bootstrap(null);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [bootstrap]);
}
