'use client'

import { MantineProvider, type MantineColorsTuple, type MantineThemeOverride } from '@mantine/core'
import { useBootstrapAuth } from '@/lib/auth/useBootstrapAuth'
import { QueryClientProvider } from '@/lib/api/query-client'
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css'

export function Providers({ children }: { children: React.ReactNode }) {
  useBootstrapAuth()
  // Define brand palette explicitly to satisfy MantineColorsTuple type (10 shades, light -> dark)
  const brand: MantineColorsTuple = [
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
  ]

  const theme: MantineThemeOverride = {
    primaryColor: 'brand',
    colors: { brand },
    fontFamily: 'Inter, "Noto Sans JP", "Segoe UI", sans-serif',
    headings: {
      fontFamily: 'Inter, "Noto Sans JP", "Segoe UI", sans-serif',
      fontWeight: '600',
    },
    defaultRadius: 'md',
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
