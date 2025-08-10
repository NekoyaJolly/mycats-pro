# DBクイックリファレンス（簡易版）

- スキーマファイル: `backend/prisma/schema.prisma`
- マイグレーション:
  - 開発: `npm run db:migrate`
  - 本番: `npm --prefix backend run prisma:deploy`
- Prisma クライアント再生成: `npm run db:generate`
- データ閲覧: `npm run db:studio`

よく使うテーブル

- cats: 猫の基本情報
- pedigrees: 血統書情報
- breeding_records: 交配記録
- care_records: ケア履歴
- schedules: 予定（ケア/交配など）
- tags, cat_tags: タグ管理

更新予定: サンプルクエリと代表的なJOIN例を追記します。
