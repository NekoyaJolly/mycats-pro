import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import { Providers } from "./providers";
import { Box, Text } from '@mantine/core';

// const inter = Inter({ 
//   subsets: ["latin"],
//   display: 'fallback',
//   fallback: ['system-ui', 'Arial', 'sans-serif']
// });

export const metadata: Metadata = {
  title: "猫生体管理アプリ",
  description: "猫の生体情報を管理するためのアプリケーションです。",
};

import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <Providers>
          <div style={{ minHeight: "100vh", position: "relative", paddingBottom: 72 }}>
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
                backgroundColor: '#fff',
                borderTop: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 100,
              }}
            >
              <Box
                component={Link}
                href="/"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">🏠</Text>
                <Text size="xs">ホーム</Text>
              </Box>
              <Box
                component={Link}
                href="/breeding"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">🔗</Text>
                <Text size="xs">交配</Text>
              </Box>
              <Box
                component={Link}
                href="/kittens"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">🐾</Text>
                <Text size="xs">子猫</Text>
              </Box>
              <Box
                component={Link}
                href="/care"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">🩺</Text>
                <Text size="xs">ケア</Text>
              </Box>
              <Box
                component={Link}
                href="/more"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <Text size="xl">⚙️</Text>
                <Text size="xs">その他</Text>
              </Box>
            </Box>
          </div>
        </Providers>
      </body>
    </html>
  );
}

