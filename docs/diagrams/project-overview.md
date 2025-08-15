# �️ プロジェクト全体図

## 📦 C4 Container 構成

実装済みは通常色、導入予定候補はグレーで表示しています。

```mermaid
C4Container
title MyCats - Project Overview

Person(user, "User", "Breeder / Admin / Vet")

Container_Boundary(fe, "Frontend") {
  Container(next, "Next.js App", "Next.js 15, React 19, Mantine, Tailwind", "SSR/SPA UI")
}

Container_Boundary(be, "Backend") {
  Container(api, "NestJS API", "NestJS 10", "REST JSON API v1")
  Container(prisma, "Prisma ORM", "Prisma Client 6.14", "DB access layer")
}

ContainerDb(db, "PostgreSQL", "PostgreSQL 15", "Primary database")

System_Ext(nginx, "Nginx (Reverse Proxy)", "Routing/SSL")
System_Ext(swagger, "Swagger UI (Dev)", "OpenAPI Docs (development only)")

Container_Ext(redis, "Redis (Planned)", "Redis 7", "Caching / Rate limiting (planned)")
System_Ext(mail, "Mail Service (Planned)", "Notifications (planned)")
System_Ext(obj, "Object Storage (Planned)", "Images/Files (planned)")

Rel(user, next, "Uses", "HTTPS")
Rel(nginx, next, "Routes")
Rel(nginx, api, "Routes")
Rel(next, api, "Calls", "JSON/HTTPS")
Rel(api, prisma, "Uses")
Rel_Back(prisma, db, "Reads/Writes", "SQL")
Rel(api, swagger, "Exposes", "OpenAPI")
Rel(api, redis, "Caching / Rate limit", "planned")
Rel(api, mail, "Sends notifications", "planned")
Rel(api, obj, "Uploads / Downloads", "planned")

UpdateElementStyle(redis, $bgColor="#eeeeee", $borderColor="#999999", $fontColor="#555555")
UpdateElementStyle(mail, $bgColor="#eeeeee", $borderColor="#999999", $fontColor="#555555")
UpdateElementStyle(obj, $bgColor="#eeeeee", $borderColor="#999999", $fontColor="#555555")
```

---

## 🗺️ 機能ステータス（実装済み / 導入予定候補）

```mermaid
mindmap
  root((MyCats 機能ステータス))
    認証
      実装済み
        ログイン
        リフレッシュ
        登録
      計画
        パスワードリセット
        個別レート制限
    猫
      実装済み
        統計
        繁殖履歴
        ケア履歴
      計画
        検索拡張・並び替えプリセット
        画像アップロード
    血統
      実装済み
        血統書番号検索
        直系ツリー
        子孫一覧
      計画
        家系図可視化強化
        キャッシュ（Redis）
    ケア
      実装済み
        スケジュール一覧
        完了マーク（PATCH/PUT）
      計画
        通知（メール）
        次回自動生成ロジック拡張
    繁殖
      実装済み
        記録一覧/登録
      計画
        近親交配検出
        スケジュール連携
    マスタ
      実装済み
        猫種CRUD（管理者）
        毛色CRUD（管理者）
        タグ作成/削除
      計画
        CSV一括インポートUI
    共通/運用
      実装済み
        Swagger（開発）
        統一エラーハンドリング
      計画
        監視/ログ集約
        ステージング/本番スケール
```

注: 実装状況は `docs/api-specification.md` とコードの現状から要約しています。詳細は当該ドキュメントをご確認ください。

---

## 🔁 互換版（標準Mermaid Flowchart）

MermaidのC4 / mindmapがレンダリングされない環境向けの簡易図です。

### システム俯瞰（互換）

```mermaid
graph TD
  user[User] --> nginx[Nginx (Reverse Proxy)]
  nginx --> next[Next.js App]
  nginx --> api[NestJS API]
  next --> api
  api --> prisma[Prisma ORM]
  prisma --> db[(PostgreSQL)]
  api -. planned .-> redis[(Redis - planned)]
  api -. planned .-> mail[Mail Service - planned]
  api -. planned .-> storage[Object Storage - planned]
  api --> swagger[Swagger UI (Dev)]

  subgraph Frontend
    next
  end
  subgraph Backend
    api
    prisma
  end
  subgraph Data
    db
    redis
  end
  subgraph External
    nginx
    mail
    storage
    swagger
  end

  style redis fill:#eeeeee,stroke:#999999,color:#555555
  style mail fill:#eeeeee,stroke:#999999,color:#555555
  style storage fill:#eeeeee,stroke:#999999,color:#555555
```

### 機能ステータス（互換）

```mermaid
graph TB
  classDef done fill:#c8e6c9,stroke:#2e7d32,color:#1b5e20
  classDef plan fill:#eeeeee,stroke:#999999,color:#555555

  subgraph 認証
    login[ログイン]:::done
    refresh[リフレッシュ]:::done
    register[登録]:::done
    reset[パスワードリセット]:::plan
    rate[個別レート制限]:::plan
  end

  subgraph 猫
    stats[統計]:::done
    breedingHist[繁殖履歴]:::done
    careHist[ケア履歴]:::done
    search[検索拡張/並び替え]:::plan
    upload[画像アップロード]:::plan
  end

  subgraph 血統
    pedId[血統書番号検索]:::done
    direct[直系ツリー]:::done
    descendants[子孫一覧]:::done
    treeViz[家系図可視化強化]:::plan
    cache[キャッシュ(Redis)]:::plan
  end

  subgraph ケア
    careList[スケジュール一覧]:::done
    careComplete[完了マーク(PATCH/PUT)]:::done
    careNotify[通知(メール)]:::plan
    careNext[次回自動生成ロジック]:::plan
  end

  subgraph 繁殖
    breedingList[記録一覧/登録]:::done
    consanguine[近親交配検出]:::plan
    scheduleLink[スケジュール連携]:::plan
  end

  subgraph マスタ
    breedsCRUD[猫種CRUD(管理者)]:::done
    colorsCRUD[毛色CRUD(管理者)]:::done
    tags[タグ作成/削除]:::done
    csvUI[CSV一括インポートUI]:::plan
  end

  subgraph 共通/運用
    swaggerDev[Swagger(開発)]:::done
    errorHandling[統一エラーハンドリング]:::done
    monitoring[監視/ログ集約]:::plan
    scale[ステージング/本番スケール]:::plan
  end
```

表示されない場合は、VS Codeの「Markdown: Enable Mermaid」を有効化、または最新版のVS Code/拡張機能をご利用ください。
