'use client'

import { MantineProvider } from '@mantine/core'
import { useState, useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ハイドレーション完了まで何も表示しない
  if (!mounted) {
    return null
  }

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
