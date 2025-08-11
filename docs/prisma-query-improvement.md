# 認証サービス改善提案: 生SQLからPrismaクエリビルダへの移行

## 現在の実装の問題点

### 1. 型安全性の欠如

**現在の実装（問題のあるコード）:**
```typescript
// 生SQLクエリ - 型安全性なし
const result = await this.prisma.$queryRaw<Array<{
  failed_login_attempts: number;
  locked_until: Date | null;
}>>`
  SELECT failed_login_attempts, locked_until
  FROM users 
  WHERE email = ${email}
`;
```

**改善後（型安全なコード）:**
```typescript
// Prismaクエリビルダ - 完全な型安全性
const user = await this.prisma.user.findUnique({
  where: { email },
  select: {
    failedLoginAttempts: true,
    lockedUntil: true,
  },
});
```

### 2. カラム名の不整合問題

**現在の実装:**
- Prismaスキーマ: `failedLoginAttempts` (camelCase)
- 生SQLクエリ: `failed_login_attempts` (snake_case)

この不整合により、スキーマ変更時にクエリエラーが発生しやすい。

**改善後:**
Prismaクエリビルダを使用することで、スキーマとクエリの一貫性が自動的に保証される。

### 3. メンテナンス性の問題

**現在の実装:**
```typescript
// 複雑で読みにくい生SQLクエリ
await this.prisma.$executeRaw`
  INSERT INTO login_attempts (id, user_id, email, ip_address, user_agent, success, reason, created_at)
  VALUES (gen_random_uuid()::text, ${user?.id}, ${data.email}, ${data.ipAddress}, ${data.userAgent}, ${data.success}, ${data.reason}, NOW())
`;
```

**改善後:**
```typescript
// 読みやすく、型安全なcreate操作
await this.prisma.loginAttempt.create({
  data: {
    userId: user?.id,
    email: data.email,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    success: data.success,
    reason: data.reason,
  },
});
```

## 改善の利点

### 1. 型安全性の向上

- **コンパイル時エラー検出**: TypeScriptコンパイラがスキーマ不整合を検出
- **IntelliSense支援**: IDEでの自動補完とエラー表示
- **リファクタリング安全性**: カラム名変更時の自動更新

### 2. セキュリティの向上

**SQLインジェクション対策:**
```typescript
// 現在: テンプレートリテラルでの変数バインド
await this.prisma.$executeRaw`UPDATE users SET failed_login_attempts = ${newCount}`;

// 改善後: Prismaの自動サニタイゼーション
await this.prisma.user.update({
  where: { id: userId },
  data: { failedLoginAttempts: newCount },
});
```

### 3. パフォーマンスと機能の向上

**クエリ最適化:**
```typescript
// 改善後: 関連データの効率的な取得
const loginAttempts = await this.prisma.loginAttempt.findMany({
  where: { email },
  include: {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    },
  },
  orderBy: { createdAt: "desc" },
  take: limit,
});
```

**統計機能の追加:**
```typescript
// groupByを使った効率的な集計
const failedStats = await this.prisma.loginAttempt.groupBy({
  by: ["email"],
  where: {
    success: false,
    createdAt: { gte: startDate, lte: endDate },
  },
  _count: { id: true },
  _max: { createdAt: true },
});
```

## 移行戦略

### Phase 1: 新しいサービスクラスの導入
1. `LoginAttemptServiceImproved` と `AuthServiceImproved` を作成
2. 既存のサービスと並行して動作させる
3. 段階的にエンドポイントを新しいサービスに移行

### Phase 2: テストと検証
1. 既存のE2Eテストが新しい実装でも通ることを確認
2. パフォーマンステストで性能劣化がないことを確認
3. セキュリティテストでSQLインジェクション耐性を確認

### Phase 3: 完全移行
1. 既存のサービスクラスを新しい実装に置き換え
2. 古いファイルを削除
3. ドキュメントの更新

## 具体的な実装例

### ログイン試行回数の更新（Before/After）

**Before (生SQL):**
```typescript
private async updateFailedLoginCount(userId: string): Promise<void> {
  const result = await this.prisma.$queryRaw<Array<{ failed_login_attempts: number }>>`
    SELECT failed_login_attempts FROM users WHERE id = ${userId}
  `;
  
  const newCount = (result[0]?.failed_login_attempts || 0) + 1;
  
  await this.prisma.$executeRaw`
    UPDATE users SET failed_login_attempts = ${newCount} WHERE id = ${userId}
  `;
}
```

**After (Prismaクエリビルダ):**
```typescript
private async updateFailedLoginCount(userId: string): Promise<void> {
  const currentUser = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true },
  });

  if (!currentUser) return;

  const newFailedAttempts = currentUser.failedLoginAttempts + 1;
  
  await this.prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: newFailedAttempts },
  });
}
```

## 推奨される実装パターン

### 1. 基本的なCRUD操作
```typescript
// ✅ 推奨: Prismaクエリビルダ
await this.prisma.user.create({ data: userData });
await this.prisma.user.findMany({ where: condition });
await this.prisma.user.update({ where: { id }, data: updateData });
await this.prisma.user.delete({ where: { id } });

// ❌ 非推奨: 生SQL（必要な場合のみ）
await this.prisma.$executeRaw`INSERT INTO users ...`;
```

### 2. 複雑なクエリ
```typescript
// ✅ 推奨: include/selectを活用
const userWithAttempts = await this.prisma.user.findUnique({
  where: { email },
  include: {
    loginAttempts: {
      where: { success: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
});

// ✅ 推奨: groupByを活用
const stats = await this.prisma.loginAttempt.groupBy({
  by: ['email'],
  _count: { id: true },
  where: { success: false },
});
```

### 3. トランザクション
```typescript
// ✅ 推奨: Prismaトランザクション
await this.prisma.$transaction(async (tx) => {
  await tx.user.update({ where: { id }, data: { failedLoginAttempts: 0 } });
  await tx.loginAttempt.create({ data: attemptData });
});
```

## 結論

生SQLからPrismaクエリビルダへの移行により、以下の重要な改善が実現されます：

1. **型安全性**: コンパイル時エラー検出による品質向上
2. **メンテナンス性**: スキーマ変更に対する自動追従
3. **セキュリティ**: SQLインジェクション攻撃への耐性強化
4. **開発効率**: IntelliSenseと自動補完による開発速度向上
5. **パフォーマンス**: Prismaの最適化された誶リ生成

この改善により、E2Eテストで発生していたスキーマ不整合エラーも根本的に解決され、より堅牢で保守しやすいコードベースを構築できます。
