/**
 * React Query (TanStack Query) 設定
 */

'use client';

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * デフォルトのクエリ設定
 */
const defaultQueryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間データを新鮮とみなす
      gcTime: 1000 * 60 * 10, // 10分間キャッシュを保持
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再フェッチを無効化
      refetchOnReconnect: true, // 再接続時に再フェッチ
      retry: 1, // エラー時のリトライ回数
    },
    mutations: {
      retry: 0, // ミューテーションはリトライしない
    },
  },
};

/**
 * QueryClientProvider コンポーネント
 * アプリケーション全体をラップしてReact Queryを有効化
 */
export function QueryClientProvider({ children }: { children: ReactNode }) {
  // クライアント側でのみQueryClientを作成（SSR対応）
  const [queryClient] = useState(() => new QueryClient(defaultQueryClientOptions));

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </TanStackQueryClientProvider>
  );
}
