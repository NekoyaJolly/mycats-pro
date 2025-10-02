'use client'

import { MantineProvider } from '@mantine/core'
import { QueryClientProvider } from '@/lib/api/query-client'
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css'

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = {
    primaryColor: 'brand' as const,
    colors: {
      brand: [
        '#eff6ff',
        '#dbeafe',
        '#bfdbfe',
        '#93c5fd',
        '#60a5fa',
        '#3b82f6',
        '#2563eb',
        '#1d4ed8',
        '#1e40af',
        '#1e3a8a',
      ],
    },
    fontFamily: 'Inter, "Noto Sans JP", "Segoe UI", sans-serif',
    headings: {
      fontFamily: 'Inter, "Noto Sans JP", "Segoe UI", sans-serif',
      fontWeight: '600',
    },
    defaultRadius: 'md' as const,
    components: {
      Button: {
        styles: {
          root: {
            fontWeight: 600,
          },
        },
      },
      Paper: {
        styles: {
          root: {
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
          },
        },
      },
      Card: {
        styles: {
          root: {
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
          },
        },
      },
    },
  }

  return (
    <QueryClientProvider>
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <Notifications position="top-right" zIndex={1000} />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  )
}
