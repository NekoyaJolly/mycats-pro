/* eslint-disable */
/* tslint:disable */
/**
 * 🔒 このファイルは自動生成されています。
 * 生成コマンド: pnpm --filter frontend generate:api-types
 * 直接編集せず、OpenAPI スキーマを更新して再生成してください。
 */
export type paths = {
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** ログイン（JWT発行） */
        post: operations["AuthController_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** ユーザー登録（メール＋パスワード） */
        post: operations["AuthController_register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/set-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** パスワード設定/変更（要JWT） */
        post: operations["AuthController_setPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** パスワード変更（現在のパスワード確認必要） */
        post: operations["AuthController_changePassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/request-password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** パスワードリセット要求 */
        post: operations["AuthController_requestPasswordReset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** パスワードリセット実行 */
        post: operations["AuthController_resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** リフレッシュトークンでアクセストークン再取得 */
        post: operations["AuthController_refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** ログアウト（リフレッシュトークン削除） */
        post: operations["AuthController_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫データを検索・一覧取得 */
        get: operations["CatsController_findAll"];
        put?: never;
        /** 猫データを作成 */
        post: operations["CatsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫データの統計情報を取得 */
        get: operations["CatsController_getStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** IDで猫データを取得 */
        get: operations["CatsController_findOne"];
        put?: never;
        post?: never;
        /** 猫データを削除 */
        delete: operations["CatsController_remove"];
        options?: never;
        head?: never;
        /** 猫データを更新 */
        patch: operations["CatsController_update"];
        trace?: never;
    };
    "/api/v1/cats/{id}/breeding-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫の繁殖履歴を取得 */
        get: operations["CatsController_getBreedingHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats/{id}/care-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫のケア履歴を取得 */
        get: operations["CatsController_getCareHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書データを検索・一覧取得 */
        get: operations["PedigreeController_findAll"];
        put?: never;
        /** 血統書データを作成（管理者のみ） */
        post: operations["PedigreeController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/pedigree-id/{pedigreeId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書番号で血統書データを取得 */
        get: operations["PedigreeController_findByPedigreeId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** IDで血統書データを取得 */
        get: operations["PedigreeController_findOne"];
        put?: never;
        post?: never;
        /** 血統書データを削除（管理者のみ） */
        delete: operations["PedigreeController_remove"];
        options?: never;
        head?: never;
        /** 血統書データを更新（管理者のみ） */
        patch: operations["PedigreeController_update"];
        trace?: never;
    };
    "/api/v1/pedigrees/{id}/family-tree": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書の家系図を取得 */
        get: operations["PedigreeController_getFamilyTree"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/{id}/family": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書データの家系図を取得 */
        get: operations["PedigreeController_getFamily"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/{id}/descendants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書データの子孫を取得 */
        get: operations["PedigreeController_getDescendants"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 品種データを検索・一覧取得 */
        get: operations["BreedsController_findAll"];
        put?: never;
        /** 品種データを作成（管理者のみ） */
        post: operations["BreedsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeds/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 品種データの統計情報を取得 */
        get: operations["BreedsController_getStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeds/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** IDで品種データを取得 */
        get: operations["BreedsController_findOne"];
        put?: never;
        post?: never;
        /** 品種データを削除（管理者のみ） */
        delete: operations["BreedsController_remove"];
        options?: never;
        head?: never;
        /** 品種データを更新（管理者のみ） */
        patch: operations["BreedsController_update"];
        trace?: never;
    };
    "/api/v1/coat-colors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 毛色データを検索・一覧取得 */
        get: operations["CoatColorsController_findAll"];
        put?: never;
        /** 毛色データを作成（管理者のみ） */
        post: operations["CoatColorsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/coat-colors/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 毛色データの統計情報を取得 */
        get: operations["CoatColorsController_getStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/coat-colors/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** IDで毛色データを取得 */
        get: operations["CoatColorsController_findOne"];
        put?: never;
        post?: never;
        /** 毛色データを削除（管理者のみ） */
        delete: operations["CoatColorsController_remove"];
        options?: never;
        head?: never;
        /** 毛色データを更新（管理者のみ） */
        patch: operations["CoatColorsController_update"];
        trace?: never;
    };
    "/api/v1/breeding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 交配記録一覧の取得 */
        get: operations["BreedingController_findAll"];
        put?: never;
        /** 交配記録の新規作成 */
        post: operations["BreedingController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 交配記録の削除 */
        delete: operations["BreedingController_remove"];
        options?: never;
        head?: never;
        /** 交配記録の更新 */
        patch: operations["BreedingController_update"];
        trace?: never;
    };
    "/api/v1/breeding/ng-rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** NGペアルール一覧の取得 */
        get: operations["BreedingController_findNgRules"];
        put?: never;
        /** NGペアルールの作成 */
        post: operations["BreedingController_createNgRule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/ng-rules/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** NGペアルールの削除 */
        delete: operations["BreedingController_removeNgRule"];
        options?: never;
        head?: never;
        /** NGペアルールの更新 */
        patch: operations["BreedingController_updateNgRule"];
        trace?: never;
    };
    "/api/v1/care/schedules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** ケアスケジュール一覧の取得 */
        get: operations["CareController_findSchedules"];
        put?: never;
        /** ケアスケジュールの追加 */
        post: operations["CareController_addSchedule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/care/schedules/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** ケア完了処理（PATCH/PUT対応） */
        patch: operations["CareController_complete"];
        trace?: never;
    };
    "/api/v1/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** タグ一覧の取得 */
        get: operations["TagsController_findAll"];
        put?: never;
        /** タグの作成 */
        post: operations["TagsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** タグの並び替え */
        patch: operations["TagsController_reorder"];
        trace?: never;
    };
    "/api/v1/tags/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** タグの削除 */
        delete: operations["TagsController_remove"];
        options?: never;
        head?: never;
        /** タグの更新 */
        patch: operations["TagsController_update"];
        trace?: never;
    };
    "/api/v1/tags/cats/{id}/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 猫にタグを付与 */
        post: operations["TagsController_assign"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/cats/{id}/tags/{tagId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 猫からタグを剥奪 */
        delete: operations["TagsController_unassign"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** タグカテゴリ一覧の取得 */
        get: operations["TagCategoriesController_findAll"];
        put?: never;
        /** タグカテゴリの作成 */
        post: operations["TagCategoriesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/categories/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** タグカテゴリの並び替え */
        patch: operations["TagCategoriesController_reorder"];
        trace?: never;
    };
    "/api/v1/tags/categories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** タグカテゴリの削除 */
        delete: operations["TagCategoriesController_remove"];
        options?: never;
        head?: never;
        /** タグカテゴリの更新 */
        patch: operations["TagCategoriesController_update"];
        trace?: never;
    };
    "/api/v1/tags/groups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** タググループの作成 */
        post: operations["TagGroupsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/groups/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** タググループの並び替え */
        patch: operations["TagGroupsController_reorder"];
        trace?: never;
    };
    "/api/v1/tags/groups/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** タググループの削除 */
        delete: operations["TagGroupsController_remove"];
        options?: never;
        head?: never;
        /** タググループの更新 */
        patch: operations["TagGroupsController_update"];
        trace?: never;
    };
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
};
export type webhooks = Record<string, never>;
export type components = {
    schemas: {
        LoginDto: {
            /**
             * @description ログインに使用するメールアドレス
             * @example user@example.com
             */
            email: string;
            /**
             * @description パスワード (8文字以上推奨)
             * @example SecurePassword123!
             */
            password: string;
        };
        ChangePasswordDto: {
            /**
             * @description 現在のパスワード
             * @example oldPassword123!
             */
            currentPassword: string;
            /**
             * @description 新しいパスワード（8文字以上、大文字・小文字・数字・特殊文字を含む）
             * @example NewSecurePassword123!
             */
            newPassword: string;
        };
        RequestPasswordResetDto: {
            /**
             * @description メールアドレス
             * @example user@example.com
             */
            email: string;
        };
        ResetPasswordDto: {
            /**
             * @description パスワードリセットトークン
             * @example a1b2c3d4e5f6...
             */
            token: string;
            /**
             * @description 新しいパスワード
             * @example NewSecurePassword123!
             */
            newPassword: string;
        };
        RefreshTokenDto: {
            /**
             * @description リフレッシュトークン (Cookie利用時は省略可)
             * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
             */
            refreshToken?: string;
        };
        CreateCatDto: {
            /**
             * @description 登録ID
             * @example REG-ALPHA
             */
            registrationId: string;
            /**
             * @description 猫の名前
             * @example Alpha
             */
            name: string;
            /** @description 品種ID */
            breedId?: string;
            /** @description 毛色ID */
            colorId?: string;
            /** @description パターン */
            pattern?: string;
            /**
             * @description 性別 (マスター名称またはキー)
             * @example MALE
             * @enum {string}
             */
            gender: "MALE" | "FEMALE" | "NEUTER" | "SPAY" | "1" | "2" | "3" | "4";
            /**
             * @description 生年月日
             * @example 2024-05-01
             */
            birthDate: string;
            /** @description 体重 (kg) */
            weight?: number;
            /** @description マイクロチップID */
            microchipId?: string;
            /** @description 父猫のID */
            fatherId?: string;
            /** @description 母猫のID */
            motherId?: string;
            /** @description 写真URL */
            imageUrl?: string;
            /** @description 備考 */
            notes?: string;
        };
        UpdateCatDto: Record<string, never>;
        CreatePedigreeDto: {
            /** @description 血統書番号 */
            pedigreeId: string;
            /** @description 猫の名前 */
            catName: string;
            /** @description タイトル */
            title?: string;
            /** @description キャッテリー名 */
            catName2?: string;
            /** @description 性別 (1: オス, 2: メス) */
            gender?: number;
            /** @description 目の色 */
            eyeColor?: string;
            /** @description 生年月日 */
            birthDate?: string;
            /** @description 登録年月日 */
            registrationDate?: string;
            /** @description ブリーダー名 */
            breederName?: string;
            /** @description オーナー名 */
            ownerName?: string;
            /** @description 兄弟の人数 */
            brotherCount?: number;
            /** @description 姉妹の人数 */
            sisterCount?: number;
            /** @description 備考 */
            notes?: string;
            /** @description 備考２ */
            notes2?: string;
            /** @description 他団体No */
            otherNo?: string;
            /** @description 旧コード */
            oldCode?: string;
            /** @description 関連する猫のID */
            catId?: string;
            /** @description 品種ID */
            breedId?: string;
            /** @description 毛色ID */
            colorId?: string;
            /** @description 血統書発行日 */
            pedigreeIssueDate?: string;
            /** @description 品種コード */
            breedCode?: number;
            /** @description 毛色コード */
            coatColorCode?: number;
            /** @description 父の血統書ID */
            fatherPedigreeId?: string;
            /** @description 母の血統書ID */
            motherPedigreeId?: string;
            /** @description 父方祖父の血統書ID */
            paternalGrandfatherId?: string;
            /** @description 父方祖母の血統書ID */
            paternalGrandmotherId?: string;
            /** @description 母方祖父の血統書ID */
            maternalGrandfatherId?: string;
            /** @description 母方祖母の血統書ID */
            maternalGrandmotherId?: string;
        };
        UpdatePedigreeDto: Record<string, never>;
        CreateBreedDto: {
            /** @description 品種コード */
            code: number;
            /** @description 品種名 */
            name: string;
            /** @description 品種の説明 */
            description?: string;
        };
        UpdateBreedDto: Record<string, never>;
        CreateCoatColorDto: {
            /** @description 毛色コード */
            code: number;
            /** @description 毛色名 */
            name: string;
            /** @description 毛色の説明 */
            description?: string;
        };
        UpdateCoatColorDto: Record<string, never>;
        CreateBreedingDto: {
            /**
             * @description 母猫のID
             * @example 11111111-1111-1111-1111-111111111111
             */
            motherId: string;
            /**
             * @description 父猫のID
             * @example 22222222-2222-2222-2222-222222222222
             */
            fatherId: string;
            /**
             * @description 交配日
             * @example 2025-08-01
             */
            matingDate: string;
            /**
             * @description 出産予定日 (YYYY-MM-DD)
             * @example 2025-10-01
             */
            expectedBirthDate?: string;
            /**
             * @description メモ
             * @example 初回の交配。
             */
            notes?: string;
        };
        UpdateBreedingDto: Record<string, never>;
        CreateBreedingNgRuleDto: {
            /**
             * @description ルール名
             * @example 近親交配防止
             */
            name: string;
            /**
             * @description 説明
             * @example 血統書付き同士の交配を避ける
             */
            description?: string;
            /**
             * @example TAG_COMBINATION
             * @enum {string}
             */
            type: "TAG_COMBINATION" | "INDIVIDUAL_PROHIBITION" | "GENERATION_LIMIT";
            /**
             * @description 有効フラグ
             * @default true
             */
            active: boolean;
            /** @description オス側のタグ条件 */
            maleConditions?: string[];
            /** @description メス側のタグ条件 */
            femaleConditions?: string[];
            /** @description 禁止するオス猫の名前 */
            maleNames?: string[];
            /** @description 禁止するメス猫の名前 */
            femaleNames?: string[];
            /** @description 世代制限 (親等) */
            generationLimit?: number;
        };
        UpdateBreedingNgRuleDto: Record<string, never>;
        CareScheduleCatDto: {
            /** @example e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60 */
            id: string;
            /** @example レオ */
            name: string;
        };
        CareScheduleReminderDto: {
            /** @example f1e2d3c4-b5a6-7890-1234-56789abcdef0 */
            id: string;
            /**
             * @example ABSOLUTE
             * @enum {string}
             */
            timingType: "ABSOLUTE" | "RELATIVE";
            /** @example 2025-08-01T09:00:00.000Z */
            remindAt?: string;
            /** @example 2 */
            offsetValue?: number;
            /**
             * @example DAY
             * @enum {string}
             */
            offsetUnit?: "MINUTE" | "HOUR" | "DAY" | "WEEK" | "MONTH";
            /**
             * @example START_DATE
             * @enum {string}
             */
            relativeTo?: "START_DATE" | "END_DATE" | "CUSTOM_DATE";
            /**
             * @example IN_APP
             * @enum {string}
             */
            channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
            /**
             * @example NONE
             * @enum {string}
             */
            repeatFrequency?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
            /** @example 1 */
            repeatInterval?: number;
            /** @example 5 */
            repeatCount?: number;
            /** @example 2025-12-31T00:00:00.000Z */
            repeatUntil?: string;
            /** @example 前日9時に通知 */
            notes?: string;
            /** @example true */
            isActive: boolean;
        };
        CareScheduleTagDto: {
            /** @example a1b2c3d4-5678-90ab-cdef-1234567890ab */
            id: string;
            /** @example vaccination */
            slug: string;
            /** @example ワクチン */
            label: string;
            /** @example 1 */
            level: number;
            /** @example parent-tag-id */
            parentId?: string;
        };
        CareScheduleItemDto: {
            /** @example a6f7e52f-4a3b-4a76-9870-1234567890ab */
            id: string;
            /** @example 年次健康診断 */
            name: string;
            /** @example 年次健康診断 */
            title: string;
            /** @example 毎年の定期健診 */
            description: string;
            /** @example 2025-09-01T00:00:00.000Z */
            scheduleDate: string;
            /** @example 2025-09-01T01:00:00.000Z */
            endDate?: string;
            /** @example Asia/Tokyo */
            timezone?: string;
            /**
             * @example CARE
             * @enum {string}
             */
            scheduleType: "BREEDING" | "CARE" | "APPOINTMENT" | "REMINDER" | "MAINTENANCE";
            /**
             * @example PENDING
             * @enum {string}
             */
            status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
            /**
             * @example HEALTH_CHECK
             * @enum {string|null}
             */
            careType: "VACCINATION" | "HEALTH_CHECK" | "GROOMING" | "DENTAL_CARE" | "MEDICATION" | "SURGERY" | "OTHER" | null;
            /**
             * @example MEDIUM
             * @enum {string}
             */
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            /** @example FREQ=YEARLY;INTERVAL=1 */
            recurrenceRule?: string;
            /** @example f3a2c1d7-1234-5678-90ab-cdef12345678 */
            assignedTo: string;
            cat: components["schemas"]["CareScheduleCatDto"] | null;
            reminders: components["schemas"]["CareScheduleReminderDto"][];
            tags: components["schemas"]["CareScheduleTagDto"][];
            /** @example 2025-08-01T00:00:00.000Z */
            createdAt: string;
            /** @example 2025-08-15T12:34:56.000Z */
            updatedAt: string;
        };
        CareScheduleMetaDto: {
            /** @example 42 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            limit: number;
            /** @example 3 */
            totalPages: number;
        };
        CareScheduleListResponseDto: {
            /** @example true */
            success: boolean;
            data: components["schemas"]["CareScheduleItemDto"][];
            meta: components["schemas"]["CareScheduleMetaDto"];
        };
        ScheduleReminderDto: {
            /** @enum {string} */
            timingType: "ABSOLUTE" | "RELATIVE";
            /**
             * @description 指定日時 (ISO8601)
             * @example 2025-08-01T09:00:00.000Z
             */
            remindAt?: string;
            /**
             * @description 相対リマインドの値
             * @example 2
             */
            offsetValue?: number;
            /**
             * @example DAY
             * @enum {string}
             */
            offsetUnit?: "MINUTE" | "HOUR" | "DAY" | "WEEK" | "MONTH";
            /**
             * @example START_DATE
             * @enum {string}
             */
            relativeTo?: "START_DATE" | "END_DATE" | "CUSTOM_DATE";
            /**
             * @example IN_APP
             * @enum {string}
             */
            channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
            /**
             * @example NONE
             * @enum {string}
             */
            repeatFrequency?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
            /**
             * @description 繰り返し間隔
             * @example 1
             */
            repeatInterval?: number;
            /**
             * @description 繰り返し回数
             * @example 5
             */
            repeatCount?: number;
            /**
             * @description 繰り返し終了日時
             * @example 2025-12-31T00:00:00.000Z
             */
            repeatUntil?: string;
            /**
             * @description 備考
             * @example 前日9時に通知
             */
            notes?: string;
            /**
             * @description 有効フラグ
             * @example true
             */
            isActive?: boolean;
        };
        CreateCareScheduleDto: {
            /**
             * @description 猫ID
             * @example e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60
             */
            catId: string;
            /**
             * @description ケア名
             * @example 年次健康診断
             */
            name: string;
            /**
             * @description ケア種別
             * @example HEALTH_CHECK
             * @enum {string}
             */
            careType: "VACCINATION" | "HEALTH_CHECK" | "GROOMING" | "DENTAL_CARE" | "MEDICATION" | "SURGERY" | "OTHER";
            /**
             * @description 予定日 (ISO8601)
             * @example 2025-09-01
             */
            scheduledDate: string;
            /**
             * @description 終了日時 (ISO8601)
             * @example 2025-09-01T10:00:00.000Z
             */
            endDate?: string;
            /**
             * @description タイムゾーン
             * @example Asia/Tokyo
             */
            timezone?: string;
            /**
             * @description ケア名/詳細
             * @example 健康診断 (年1回)
             */
            description?: string;
            /**
             * @example MEDIUM
             * @enum {string}
             */
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            /**
             * @description RRULE形式などの繰り返しルール
             * @example FREQ=YEARLY;INTERVAL=1
             */
            recurrenceRule?: string;
            /** @description リマインダー設定 */
            reminders?: components["schemas"]["ScheduleReminderDto"][];
            /** @description 関連ケアタグID (最大3階層) */
            careTagIds?: string[];
        };
        CareScheduleResponseDto: {
            /** @example true */
            success: boolean;
            data: components["schemas"]["CareScheduleItemDto"];
        };
        CompleteCareMedicalRecordDto: Record<string, never>;
        CompleteCareDto: {
            /**
             * @description 完了日 (YYYY-MM-DD)
             * @example 2025-08-10
             */
            completedDate?: string;
            /**
             * @description 次回予定日 (YYYY-MM-DD)
             * @example 2026-08-10
             */
            nextScheduledDate?: string;
            /**
             * @description メモ
             * @example 体調良好。次回はワクチンA。
             */
            notes?: string;
            medicalRecord?: components["schemas"]["CompleteCareMedicalRecordDto"];
        };
        CareCompleteResponseDto: {
            /** @example true */
            success: boolean;
            /** @example {
             *       "scheduleId": "a6f7e52f-4a3b-4a76-9870-1234567890ab",
             *       "recordId": "bcdef123-4567-890a-bcde-f1234567890a",
             *       "medicalRecordId": "f1234567-89ab-cdef-0123-456789abcdef"
             *     } */
            data: Record<string, never>;
        };
        CreateTagDto: {
            /**
             * @description タグ名
             * @example Indoor
             */
            name: string;
            /**
             * @description タググループID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            groupId: string;
            /**
             * @description カラーコード
             * @example #3B82F6
             */
            color?: string;
            /**
             * @description 説明
             * @example 室内飼いタグ
             */
            description?: string;
            /**
             * @description 手動操作で利用可能か
             * @example true
             */
            allowsManual?: boolean;
            /**
             * @description 自動ルールで利用可能か
             * @example true
             */
            allowsAutomation?: boolean;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder?: number;
            /** @description 任意のメタデータ */
            metadata?: Record<string, never>;
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
        TagOrderItemDto: {
            /**
             * Format: uuid
             * @description タグID
             */
            id: string;
            /**
             * @description 表示順
             * @example 12
             */
            displayOrder: number;
            /**
             * Format: uuid
             * @description 所属タググループID
             */
            groupId?: string;
        };
        ReorderTagsDto: {
            items: components["schemas"]["TagOrderItemDto"][];
        };
        UpdateTagDto: {
            /**
             * @description タグ名
             * @example Indoor
             */
            name?: string;
            /**
             * @description タググループID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            groupId?: string;
            /**
             * @description カラーコード
             * @example #3B82F6
             */
            color?: string;
            /**
             * @description 説明
             * @example 室内飼いタグ
             */
            description?: string;
            /**
             * @description 手動操作で利用可能か
             * @example true
             */
            allowsManual?: boolean;
            /**
             * @description 自動ルールで利用可能か
             * @example true
             */
            allowsAutomation?: boolean;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder?: number;
            /** @description 任意のメタデータ */
            metadata?: Record<string, never>;
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
        AssignTagDto: {
            /**
             * @description タグID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            tagId: string;
        };
        CreateTagCategoryDto: {
            /**
             * @description ユニークキー (未指定時は名前から生成)
             * @example cats_status
             */
            key?: string;
            /**
             * @description カテゴリ名
             * @example 猫ステータス
             */
            name: string;
            /** @description カテゴリの説明 */
            description?: string;
            /**
             * @description カテゴリの代表カラー
             * @example #6366F1
             */
            color?: string;
            /** @description 表示順 */
            displayOrder?: number;
            /** @description 利用するスコープ一覧 */
            scopes?: string[];
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
        TagCategoryOrderItemDto: {
            /**
             * Format: uuid
             * @description カテゴリID
             */
            id: string;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder: number;
        };
        ReorderTagCategoriesDto: {
            items: components["schemas"]["TagCategoryOrderItemDto"][];
        };
        UpdateTagCategoryDto: {
            /**
             * @description ユニークキー (未指定時は名前から生成)
             * @example cats_status
             */
            key?: string;
            /**
             * @description カテゴリ名
             * @example 猫ステータス
             */
            name?: string;
            /** @description カテゴリの説明 */
            description?: string;
            /**
             * @description カテゴリの代表カラー
             * @example #6366F1
             */
            color?: string;
            /** @description 表示順 */
            displayOrder?: number;
            /** @description 利用するスコープ一覧 */
            scopes?: string[];
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
        CreateTagGroupDto: {
            /**
             * @description 所属カテゴリID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            categoryId: string;
            /**
             * @description グループ名
             * @example 屋内管理
             */
            name: string;
            /** @description グループの説明 */
            description?: string;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder?: number;
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
        TagGroupOrderItemDto: {
            /**
             * Format: uuid
             * @description グループID
             */
            id: string;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder: number;
            /**
             * Format: uuid
             * @description 移動先カテゴリID
             */
            categoryId?: string;
        };
        ReorderTagGroupDto: {
            items: components["schemas"]["TagGroupOrderItemDto"][];
        };
        UpdateTagGroupDto: {
            /**
             * @description 所属カテゴリID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            categoryId?: string;
            /**
             * @description グループ名
             * @example 屋内管理
             */
            name?: string;
            /** @description グループの説明 */
            description?: string;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder?: number;
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
    AuthController_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_setPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_changePassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangePasswordDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_requestPasswordReset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestPasswordResetDto"];
            };
        };
        responses: {
            /** @description リセット手順をメールで送信 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordDto"];
            };
        };
        responses: {
            /** @description パスワードがリセットされました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効または期限切れのトークン */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_findAll: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 検索キーワード */
                search?: string;
                /** @description 品種ID */
                breedId?: string;
                /** @description 毛色ID */
                colorId?: string;
                /** @description 性別 */
                gender?: "MALE" | "FEMALE" | "NEUTER" | "SPAY" | "1" | "2" | "3" | "4";
                /** @description 最小年齢 */
                ageMin?: number;
                /** @description 最大年齢 */
                ageMax?: number;
                /** @description ソート項目 */
                sortBy?: string;
                /** @description ソート順 */
                sortOrder?: string;
                /** @description ステータス */
                status?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 猫データの一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCatDto"];
            };
        };
        responses: {
            /** @description 猫データが正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_getStatistics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 統計情報 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 猫データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 猫データが正常に削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCatDto"];
            };
        };
        responses: {
            /** @description 猫データが正常に更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_getBreedingHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 繁殖履歴 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_getCareHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description ケア履歴 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_findAll: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 検索キーワード */
                search?: string;
                /** @description 品種ID */
                breedId?: string;
                /** @description 毛色ID */
                colorId?: string;
                /** @description 性別 (1: オス, 2: メス) */
                gender?: string;
                /** @description キャッテリー名 */
                catName2?: string;
                /** @description 目の色 */
                eyeColor?: string;
                /** @description ソート項目 */
                sortBy?: string;
                /** @description ソート順 */
                sortOrder?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 血統書データの一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePedigreeDto"];
            };
        };
        responses: {
            /** @description 血統書データが正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_findByPedigreeId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書番号 */
                pedigreeId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 血統書データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 血統書データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 血統書データが正常に削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePedigreeDto"];
            };
        };
        responses: {
            /** @description 血統書データが正常に更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_getFamilyTree: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 家系図データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_getFamily: {
        parameters: {
            query?: {
                /** @description 取得する世代数 */
                generations?: number;
            };
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 家系図データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_getDescendants: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 子孫データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_findAll: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 検索キーワード */
                search?: string;
                /** @description ソート項目 */
                sortBy?: string;
                /** @description ソート順 */
                sortOrder?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 品種データの一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBreedDto"];
            };
        };
        responses: {
            /** @description 品種データが正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_getStatistics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 統計情報 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 品種データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 品種データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 品種データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 品種データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 品種データが正常に削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 品種データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 品種データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateBreedDto"];
            };
        };
        responses: {
            /** @description 品種データが正常に更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 品種データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_findAll: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 検索キーワード */
                search?: string;
                /** @description ソート項目 */
                sortBy?: string;
                /** @description ソート順 */
                sortOrder?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 毛色データの一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCoatColorDto"];
            };
        };
        responses: {
            /** @description 毛色データが正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_getStatistics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 統計情報 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 毛色データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 毛色データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 毛色データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 毛色データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 毛色データが正常に削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 毛色データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 毛色データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCoatColorDto"];
            };
        };
        responses: {
            /** @description 毛色データが正常に更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 毛色データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_findAll: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                /** @description 母猫ID */
                motherId?: string;
                /** @description 父猫ID */
                fatherId?: string;
                /** @description 開始日(YYYY-MM-DD) */
                dateFrom?: string;
                /** @description 終了日(YYYY-MM-DD) */
                dateTo?: string;
                sortBy?: string;
                sortOrder?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBreedingDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateBreedingDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_findNgRules: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_createNgRule: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBreedingNgRuleDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_removeNgRule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_updateNgRule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateBreedingNgRuleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CareController_findSchedules: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                /** @description 猫ID */
                catId?: string;
                /** @description ケア種別 */
                careType?: "VACCINATION" | "HEALTH_CHECK" | "GROOMING" | "DENTAL_CARE" | "MEDICATION" | "SURGERY" | "OTHER";
                /** @description 開始日 (YYYY-MM-DD) */
                dateFrom?: string;
                /** @description 終了日 (YYYY-MM-DD) */
                dateTo?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CareScheduleListResponseDto"];
                };
            };
        };
    };
    CareController_addSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCareScheduleDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CareScheduleResponseDto"];
                };
            };
        };
    };
    CareController_complete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompleteCareDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CareCompleteResponseDto"];
                };
            };
        };
    };
    TagsController_findAll: {
        parameters: {
            query?: {
                /** @description 非アクティブなタグを含めるか */
                includeInactive?: boolean;
                /** @description 対象スコープ */
                scope?: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTagDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_reorder: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderTagsDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTagDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_assign: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignTagDto"];
            };
        };
        responses: {
            /** @description 付与成功（重複時もOK） */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_unassign: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                tagId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_findAll: {
        parameters: {
            query?: {
                /** @description 非アクティブカテゴリを含める */
                includeInactive?: boolean;
                /** @description 対象スコープ */
                scope?: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTagCategoryDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_reorder: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderTagCategoriesDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTagCategoryDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagGroupsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTagGroupDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagGroupsController_reorder: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderTagGroupDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagGroupsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagGroupsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTagGroupDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}

