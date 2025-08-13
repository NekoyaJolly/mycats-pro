# 開発環境セットアップ（簡易版）

このページは暫定の簡易ガイドです。ルートの `package.json` の scripts を併せて参照してください。

## 前提

- Node.js 20.x（22.x でも動作想定）
- PostgreSQL 15+
- Prisma 6.14.0
- Next.js 15.4.5
- NestJS 10.0.0

## 初回セットアップ

```bash
npm run install:all
npm run db:generate
npm run db:migrate
```

## 起動

```bash
npm run dev
```

## よくある問題

- ポート競合: `npm run predev`
- Prisma の型再生成: `npm run db:generate`
- Prisma Studio: `npm run db:studio`
