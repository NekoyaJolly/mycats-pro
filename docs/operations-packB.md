# Pack B 導入内容 (構造化ログ + Sentry + レートリミット + migrate deploy 前処理)

## 概要

本ドキュメントは Pack B として追加した運用・監視強化要素の一覧です。

## 追加要素

- themeColor 警告解消: `layout.tsx` で `viewport` export へ移行
- 構造化ログ: nestjs-pino 導入 (`LoggerModule`)
- RequestId 付与: `RequestIdMiddleware` により `x-request-id` を入出力ヘッダへ付加
- レートリミット強化: /auth/login 5/min, /auth/refresh 20/min の個別スロットル
- Sentry backend: DSN 存在時のみ初期化 (トレース & プロファイル サンプリング率環境変数化)
- Sentry frontend: `@sentry/nextjs` クライアント/サーバ設定ファイル（dsn 未設定なら無効）
- Prisma migrate deploy 前処理: `scripts/prestart-migrate.sh`

## 環境変数 (backend)

| 変数 | 用途 | 例 | 必須 | 備考 |
|------|------|----|------|------|
| LOG_LEVEL | Pino ログレベル | info | 任意 | production 省略時 info |
| SENTRY_DSN | Sentry DSN | https://... | 任意 | 未設定で無効 |
| SENTRY_TRACES_SAMPLE_RATE | トレースサンプリング | 0.1 | 任意 | 数値 0..1 |
| SENTRY_PROFILES_SAMPLE_RATE | プロファイルサンプリング | 0.1 | 任意 | 数値 0..1 |

## 環境変数 (frontend)

| 変数 | 用途 | 例 |
|------|------|----|
| NEXT_PUBLIC_SENTRY_DSN | フロント用DSN | https://... |
| NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE | トレース率 | 0.1 |

## デプロイ手順推奨フロー

1. `scripts/prestart-migrate.sh` を本番エントリポイント直前で実行
2. backend コンテナ起動（SENTRY_DSN/LOG_LEVEL 設定）
3. frontend ビルド/デプロイ（NEXT_PUBLIC_SENTRY_DSN 設定）
4. ログ集約基盤（CloudWatch / Loki 等）で `x-request-id` による関連付け

## レートリミット調整方法

`auth.controller.ts` の `@Throttle` デコレータで `limit`/`ttl` を変更。

## ロールバック方法

- Sentry: DSN 環境変数を外すだけで無効化
- 構造化ログ: `LoggerModule` を AppModule から一時的に除去も可
- レートリミット: `@Throttle` デコレータ削除 or 値拡大

## 今後の拡張候補

- 429 レスポンスボディ統一 (現在はデフォルト)
- 失敗ログイン連続回数に応じたアカウント一時ロック
- Sentry Release / Commit tagging (CI で SENTRY_RELEASE export)
- OpenTelemetry 連携 (Sentry または OTLP Export)
