import { Title, TitleProps } from '@mantine/core';
import { ReactNode } from 'react';

/**
 * 統一ページタイトルコンポーネント
 * - フォントサイズ 18px 固定
 * - 太さ 700
 * - 余白や色は必要に応じて親側で追加
 */
export interface PageTitleProps extends Omit<TitleProps, 'order'> {
  children: ReactNode;
  withMarginBottom?: boolean;
}

export function PageTitle({ children, withMarginBottom = true, ...rest }: PageTitleProps) {
  return (
    <Title
      order={2}
      {...rest}
      style={{
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1.3,
        ...(withMarginBottom ? { marginBottom: '0.75rem' } : {}),
        ...(rest.style || {}),
      }}
    >
      {children}
    </Title>
  );
}
