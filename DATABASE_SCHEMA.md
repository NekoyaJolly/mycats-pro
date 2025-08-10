# データベース設計（簡易版）

このドキュメントは一時的な簡易ページです。詳細なスキーマは `backend/prisma/schema.prisma` を参照してください。

- 主要モデル:
  - users, cats, pedigrees, breeds, coat_colors, breeding_records, care_records, schedules, tags, cat_tags
- 主なリレーション:
  - users 1–N cats
  - cats 1–1 pedigrees（実装上は可変）
  - cats N–N tags（cat_tags 経由）
  - cats 1–N breeding_records（雄/雌で別リレーション）
  - cats 1–N care_records / schedules

更新予定: 将来的にER図・インデックス戦略・制約の一覧を追加します。
