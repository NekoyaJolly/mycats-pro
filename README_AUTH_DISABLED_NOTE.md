# 開発用 認証バイパスについて

`AUTH_DISABLED=1` (backend) と `NEXT_PUBLIC_AUTH_DISABLED=1` (frontend) を設定すると:

- Backend: すべての `JwtAuthGuard` が通過し、ダミー管理者ユーザー `{ userId: dev-admin, role: ADMIN }` を `req.user` に注入
- Frontend: middleware が認証チェックを行わず `/login` `/register` へアクセスすると `/` へリダイレクト

## 使い方

```bash
# backend/.env など
AUTH_DISABLED=1

# frontend/.env.local など
NEXT_PUBLIC_AUTH_DISABLED=1
```

再起動後、トークン無しで保護APIへアクセス可能になります。

## 注意

- 本番 / 共有環境で **絶対に有効化しないこと**
- E2E テスト実行時は認証ロジックの検証ができなくなるため OFF にしてください
- 残ったまま commit / デプロイされないよう CI で検査を導入するのが推奨です
- 本機能は非推奨 (Deprecated) です。撤去タイムライン: `docs/auth-disabled-deprecation.md` を参照してください。

## 復帰

値を削除または `0` に変更しアプリ再起動で元の認証フローに戻ります。
