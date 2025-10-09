# 命名規則ガイドライン

## 目的

- レイヤー間で一貫した命名を適用し、認知負荷とバグを減らす。
- 新規メンバーが短時間でコードベースに馴染めるようにする。
- 自動化された検証とレビューの基準を明確にする。

## 適用範囲

- PostgreSQL スキーマと Prisma schema
- NestJS (Backend) アプリケーションコード
- Next.js (Frontend) アプリケーションコード
- テストコード（ユニット / E2E）
- ドキュメント、環境変数、ファイル構成

## 共通原則

1. **意味が伝わる単語を選ぶ**: 文脈なしでも意図が伝わる名前にする。
2. **単語の順序は「対象 → 条件 → 動作」** の優先度で組み立てる。
3. **英語の一貫性を保つ**: 業務用語は英語または外来語の統一訳を採用する。
4. **略語は原則禁止**: 例外は Glossary の "Approved Abbreviations" のみ。
5. **ケース規則の明示**: 各レイヤーの推奨ケースに従う。
6. **ドメイン語と技術語の境界を明示**: ドメイン語は先頭、技術語は接尾辞などで区別する。

## レイヤー別ルール

### Database / Prisma

- **テーブル名**: `snake_case` の複数形 (例: `cats`, `breeding_programs`).
- **列名**: `snake_case`。外部キーは `{参照テーブル単数形}_id`。
- **中間テーブル**: `{左テーブル名}_{右テーブル名}` の順で `snake_case`。
- **Enum**: PascalCase。値は `SCREAMING_SNAKE_CASE`。
- **Prisma Model**: PascalCase の単数形 (例: `Cat`, `BreedingProgram`).
- **Prisma フィールド**: `camelCase`。リレーションはドメイン語 + 役割 (例: `motherCat`, `healthRecords`).

### Backend (NestJS)

- **クラス名**: PascalCase。`Service`, `Controller`, `Module` などの役割サフィックスを付与。
- **Provider トークン**: `SNAKE_CASE` + `_TOKEN`。
- **メソッド名**: `camelCase`。HTTP ハンドラは `findAll`, `createOne` のように CRUD パターンに合わせる。
- **DTO**: ファイル名 `*.dto.ts`、クラス名 PascalCase + `Dto` サフィックス。
- **例外 / ガード**: `*.exception.ts`, `*.guard.ts`。
- **レスポンスの形式**: `{ data: ..., meta?: ..., success: boolean }` を基本形とし、キーは `camelCase`。
- **環境変数**: `UPPER_SNAKE_CASE`。モジュール名や用途でプレフィックス (例: `BACKEND_JWT_SECRET`).

### Frontend (Next.js + React)

- **コンポーネント**: PascalCase (`CatList`, `BreedingForm`).
- **Hooks**: `use` プレフィックス + PascalCase (`useFetchCats`), ファイル名は `use-fetch-cats.ts`。
- **API クライアント**: `verb + Domain` (`getCats`, `updateCatTag`). レスポンス型は `CamelCase` + `Response`。
- **State**: Zustand / Context の store 名は PascalCase + `Store`。
- **CSS Modules / クラス**: `kebab-case`。Mantine のスタイルオブジェクトキーは `camelCase`。
- **ページ / ルート**: Next.js App Router のセグメントは `kebab-case`。動的セグメントは `[camelCaseId]`。

### テスト

- **テストファイル**: `*.spec.ts` (unit), `*.e2e-spec.ts` (E2E)。
- **テストケース**: `describe` は対象 + 条件、`it` は期待する結果を "should ~" で明記。
- **テスト用データ**: `given`, `when`, `then` の prefix を活用。

### ファイル / ディレクトリ

- 共有ユーティリティ: `shared/` ではなく `common/` に統一。
- ファイル名は用途に合わせ `kebab-case.ts` を基本とし、Next.js `page.tsx`, `layout.tsx` を遵守。
- Prisma migration は `YYYYMMDDHHMM__summary`。

## Approved Abbreviations

| Term | Expansion | Notes |
| --- | --- | --- |
| ID | Identifier | テーブルカラムの末尾のみ使用可 |
| API | Application Programming Interface | クラス/ファイル名でのみ許可 |
| DTO | Data Transfer Object | NestJS DTO のみ使用可 |
| UI | User Interface | ドキュメント、コメントでのみ |

Glossary の更新は Pull Request でレビュー必須。

## レビューと運用

1. すべての PR は命名チェックリストをコメントとして添付。
2. 命名違反を検知する ESLint / Prisma Format ルールを導入 (詳細は今後の自動化タスクで定義)。
3. 重大な例外 (例: 既存 API との互換目的) は Issue に理由を明記。
4. 四半期ごとにレビュー会を開催し、Glossary とルールを見直す。

## 採用ロードマップ (2025 Q4)

| 週 | マイルストーン | 詳細 |
| --- | --- | --- |
| Week 1 (10/13-10/17) | ドキュメントレビュー | チームレビュー、フィードバック反映。PR: `docs/naming-guidelines.md` |
| Week 2 (10/20-10/24) | 自動化基盤整備 | ESLint ルール、Prisma schema lint、CI チェック導入 |
| Week 3 (10/27-10/31) | 優先モジュール適用 | Auth/Cats/Breeds ドメインの命名リファクタリング |
| Week 4 (11/03-11/07) | 全体展開と定着化 | 残りモジュール適用、レトロ & ドキュメント更新 |

## 今後のタスク候補

- ESLint カスタムルールで Glossary 参照バリデーションを実装
- Prisma スキーマ差分チェック用スクリプトの追加
- PR テンプレートに命名チェックボックスを追加
