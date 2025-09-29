'use client'

import { MantineProvider } from '@mantine/core'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={{
        primaryColor: 'blue',
        colors: {
          brand: [
            '#e3f2fd',
            '#bbdefb',
            '#90caf9',
            '#64b5f6',
            '#42a5f5',
            '#2196f3',
            '#1e88e5',
            '#1976d2',
            '#1565c0',
            '#0d47a1',
          ],
        },
      }}
    >
      {children}
    </MantineProvider>
  )
}
