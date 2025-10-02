# AUTH_DISABLED / NEXT_PUBLIC_AUTH_DISABLED 撤去計画 (Deprecation Plan)

このフラグは「初期 UI 実装を高速化するため一時的に認証を完全バイパス」する開発用ショートカットとして導入されました。既に以下が成立したため段階的に撤去します。

成立条件:

- Refresh Token Cookie によるセッション永続化が安定 (E2E `test-session-persistence.sh` パス)
- フロント起動時の自動再ログイン (refresh) 実装済み
- 管理者seedおよび create-or-update-admin スクリプトによる再生成不要化

## フェーズ概要

| フェーズ | 目的 | 具体的変更 | 予定 | Rollback |
|----------|------|------------|------|----------|
| P1 (現状) | 安全に OFF 運用に慣れる | デフォルト値 0; ドキュメントに“非推奨”追加 | 即日 | 変数を 1 に戻す |
| P2 | 使用検知 & 警告 | 起動時 AUTH_DISABLED=1 なら WARN ログ出力 / README から主説明削除 | 1週間後 | そのまま許容 |
| P3 | ビルド防止 | 本番ビルド(prod NODE_ENV=production)で AUTH_DISABLED=1 ならエラー終了 | 2週間後 | ガード解除コード残存で再ビルド |
| P4 | コード削除 | `JwtAuthGuard` のバイパス分岐 / middleware の分岐削除、環境変数例から削除 | 3週間後 | Revert コミット |
| P5 | CI検査 | lint/CI で AUTH_DISABLED 文字列検出→失敗 | P4 同期 | Revert CI ルール |

## 詳細ステップ

1. Phase 1 (非推奨明示):
   - `backend/.env.example` に DEPRECATED コメント
   - `README_AUTH_DISABLED_NOTE.md` に撤去計画リンク
2. Phase 2 (警告出力):
   - `main.ts` 起動時 `process.env.AUTH_DISABLED==='1'` で console.warn
3. Phase 3 (本番ビルド拒否):
   - `if (process.env.NODE_ENV==='production' && process.env.AUTH_DISABLED==='1') throw` 追加
4. Phase 4 (削除):
   - バイパス分岐を削除し純粋な JWT 実施
   - フロント middleware から `NEXT_PUBLIC_AUTH_DISABLED` 分岐削除
5. Phase 5 (CI ルール):
   - `eslint` custom rule / `grep` チェック script を `prepush` か CI に追加

## リスクと緩和

| リスク | 内容 | 緩和策 |
|--------|------|--------|
| 開発者作業効率低下 | ログイン必須に戻って不満 | Refresh 自動化と長め Refresh 有効期限で軽減 |
| 未マージブランチとのコンフリクト | 分岐削除で衝突 | P4前に告知 & 早期 rebase ガイド |
| 認証不具合埋没 | 早期に切ると別課題調査中に阻害 | フェーズを週単位で段階化し検証ウィンドウ確保 |

## Communication Checklist

- [ ] Phase 移行毎に `docs/operations.md` 更新
- [ ] Slack #dev-auth へ告知 (テンプレ用意)
- [ ] リリースノートに Deprecation セクション追加

## 将来置換案

ローカル高速化には Playwright などのログインスクリプト / seed + refresh 直呼び CLI (`scripts/dev-login.sh`) を提供し、フラグ依存を排除。

---
Last Update: 2025-10-03
