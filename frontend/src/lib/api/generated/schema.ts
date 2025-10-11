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
        patch?: never;
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
        CreateCareScheduleDto: {
            /**
             * @description 猫ID
             * @example e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60
             */
            catId: string;
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
             * @description ケア名/詳細
             * @example 健康診断 (年1回)
             */
            description?: string;
        };
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
        };
        CreateTagDto: {
            /**
             * @description タグ名
             * @example Indoor
             */
            name: string;
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
        };
        AssignTagDto: {
            /**
             * @description タグID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            tagId: string;
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
                content?: never;
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
                content?: never;
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
                content?: never;
            };
        };
    };
    TagsController_findAll: {
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

