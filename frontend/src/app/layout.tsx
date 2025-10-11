import type { Metadata } from "next";
import "./globals.css";
import "@mantine/core/styles.css";
import { Providers } from "./providers";
import { AppLayout } from "@/components/AppLayout";

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
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}

