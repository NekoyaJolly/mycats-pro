import type { Prisma, PrismaClient } from '@prisma/client';

export type BatchResult<T> = {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ index: number; item: T; error: unknown }>;
};

export type BatchOptions = {
  batchSize?: number; // 件数単位での小バッチ（デフォルト: 100）
  continueOnError?: boolean; // バッチ内の一部失敗時に続行するか（デフォルト: true）
  logEvery?: number; // 進捗ログを出す間隔（件数ベース、デフォルト: 500）
  label?: string; // ログプレフィックス
};

/**
 * 与えられた配列を小バッチに分け、各バッチを prisma.$transaction でまとめて実行します。
 * パフォーマンス面での往復回数削減と、ログのスロットリングが目的です。
 */
export async function batchTransaction<T>(
  prisma: PrismaClient,
  items: T[],
  builder: (tx: Prisma.TransactionClient, item: T, index: number) => Promise<unknown>,
  options: BatchOptions = {},
): Promise<BatchResult<T>> {
  const {
    batchSize = 100,
    continueOnError = true,
    logEvery = 500,
    label = 'batch',
  } = options;

  const total = items.length;
  let processed = 0;
  let success = 0;
  const errors: BatchResult<T>['errors'] = [];

  const t0 = Date.now();
  for (let start = 0; start < items.length; start += batchSize) {
    const end = Math.min(start + batchSize, items.length);
    const chunk = items.slice(start, end);

    try {
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < chunk.length; i++) {
          const item = chunk[i];
          const globalIndex = start + i;
          await builder(tx, item, globalIndex);
        }
      });
      success += chunk.length;
    } catch (e) {
      // トランザクション全体がロールバックされるため、個別にリトライはせず、必要なら1件ずつ実行
      if (!continueOnError) {
        throw e;
      }
      // 1件ずつ実行し、失敗したものだけエラー収集
      for (let i = 0; i < chunk.length; i++) {
        const item = chunk[i];
        const globalIndex = start + i;
        try {
          await prisma.$transaction((tx) => builder(tx, item, globalIndex));
          success += 1;
        } catch (err) {
          errors.push({ index: globalIndex, item, error: err });
        }
      }
    }

    processed = end;
    if (processed % logEvery === 0 || processed === total) {
      const dt = Date.now() - t0;
       
      console.log(
        `[${label}] ${processed}/${total} done (${((processed / total) * 100).toFixed(
          1,
        )}%), ok=${success}, err=${errors.length}, ${dt}ms`,
      );
    }
  }

  return {
    total,
    success,
    failed: errors.length,
    errors,
  };
}

/**
 * 読み取り系や任意関数を小バッチで順次実行したい場合の汎用ヘルパー。
 */
export async function forEachChunk<T>(
  items: T[],
  fn: (chunk: T[], start: number, end: number) => Promise<void>,
  { batchSize = 100, logEvery = 500, label = 'chunk' }: BatchOptions = {},
) {
  const total = items.length;
  const t0 = Date.now();
  for (let start = 0; start < items.length; start += batchSize) {
    const end = Math.min(start + batchSize, items.length);
    const chunk = items.slice(start, end);
    await fn(chunk, start, end);
    if (end % logEvery === 0 || end === total) {
      const dt = Date.now() - t0;
       
      console.log(
        `[${label}] ${end}/${total} done (${((end / total) * 100).toFixed(1)}%), ${dt}ms`,
      );
    }
  }
}
