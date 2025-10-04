import type { Metadata } from "next";
import "./globals.css";
import "@mantine/core/styles.css";
import { Providers } from "./providers";
import { AppLayout } from "@/components/AppLayout";
import { Box, Text } from '@mantine/core';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'MyCats',
  description: 'MyCats: 猫の個体・血統・ケア情報を一元管理するアプリケーション',
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'MyCats',
    description: '猫の個体・血統・ケア情報を一元管理するアプリケーション',
    url: 'https://example.com',
    siteName: 'MyCats',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: 'MyCats',
    description: '猫の個体・血統・ケア情報を一元管理するアプリケーション',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <Providers>
          <AppLayout>
            {children}
            {/* 固定フッターナビゲーション */}
            <Box
              component="footer"
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                height: 64,
                backgroundColor: 'var(--surface)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 100,
                boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.05)',
                color: 'var(--text-muted)',
              }}
            >
              <Box
                component={Link}
                href="/"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">🏠</Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>ホーム</Text>
              </Box>
              <Box
                component={Link}
                href="/breeding"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">🔗</Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>交配</Text>
              </Box>
              <Box
                component={Link}
                href="/kittens"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">🐾</Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>子猫</Text>
              </Box>
              <Box
                component={Link}
                href="/care"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">🩺</Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>ケア</Text>
              </Box>
              <Box
                component={Link}
                href="/more"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">⚙️</Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>その他</Text>
              </Box>
            </Box>
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}

