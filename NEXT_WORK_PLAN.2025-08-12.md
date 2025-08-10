# 次回作業計画（2025-08-12〜）

## 優先度A: 本番お試し準備の最終仕上げ（0.5〜1日）

- 環境変数の整備（JWT_SECRET, DB接続, CORS許可）
- DBマイグレーションの最終適用とシード確認（軽量化）
- 監視/ログの最低限設定（リクエストID, 重要イベント監査ログ）
- Docker/Nginx起動手順の簡易ドキュメント更新

## 優先度B: 型とドキュメントの磨き込み（半日）

- Lint警告の段階解消（no-explicit-any, 未使用importなど）
- Swagger: 残DTO（breeds/coat-colors/pedigree周辺）の例/説明追加
- AuthService: Prisma型の追従再確認（generate後にraw UPDATE回避できるか検証）

## 優先度C: 小さな体験改善（半日）

- tags assign/unassign のエラーメッセージ整備とSwaggerレスポンス例
- care schedule クエリの並び順/フィルタの明記（Swagger）
- cats birthDateの入力フォーマットをSwaggerに明示（YYYY-MM-DD or ISO8601）

## 任意（バックログ）

- Rate limit/CORS/CSRFの最終確認
- 重要クエリのインデックス確認と追加
- E2Eカバレッジの拡張（breeding/pedigreeの主要ハッピーパス）

## チェックリスト

- [ ] e2e 全件グリーン
- [ ] build OK / prisma deploy OK
- [ ] Swagger UIで主要フロー確認
- [ ] 本番用envをSecretsに反映
- [ ] 手順書更新（起動/停止/トラブルシュート）
