import { Title, TitleProps } from '@mantine/core';
import { ReactNode } from 'react';

/**
 * セクション用タイトル（ページ内階層）
 * - フォントサイズ 16px
 * - 太さ 600
 * - デフォルトで上 1.5rem 下 0.75rem の余白
 */
export interface SectionTitleProps extends Omit<TitleProps, 'order'> {
  children: ReactNode;
  withTopMargin?: boolean;
  withBottomMargin?: boolean;
}

export function SectionTitle({
  children,
  withTopMargin = true,
  withBottomMargin = true,
  style,
  ...rest
}: SectionTitleProps) {
  return (
    <Title
      order={3}
      {...rest}
      style={{
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.35,
        marginTop: withTopMargin ? '1.5rem' : undefined,
        marginBottom: withBottomMargin ? '0.75rem' : undefined,
        ...style,
      }}
    >
      {children}
    </Title>
  );
}
