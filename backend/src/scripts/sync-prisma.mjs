// /appproject/backend/src/scripts/sync-prisma.mjs
// Prismaスキーマファイルをテキストファイルに自動同期するスクリプト
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// scripts/から../../prisma/へのパス
const prismaDir = path.resolve(__dirname, "../../prisma");
const src = path.join(prismaDir, "schema.prisma");
const dst = path.join(prismaDir, "schema_prisma.txt");

function copyOnce() {
  if (!fs.existsSync(src)) {
    console.error(`[sync-prisma] not found: ${src}`);
    process.exit(1);
  }
  
  try {
    const data = fs.readFileSync(src, "utf8");
    
    // タイムスタンプ付きでテキストファイルに出力
    const timestamp = new Date().toISOString();
    const header = `// Prisma Schema - Last Updated: ${timestamp}\n// Auto-generated from schema.prisma\n\n`;
    const content = header + data;
    
    fs.writeFileSync(dst, content, "utf8");
    console.log(`[sync-prisma] copied -> ${path.relative(process.cwd(), dst)} (${new Date().toLocaleTimeString()})`);
  } catch (error) {
    console.error(`[sync-prisma] error: ${error.message}`);
  }
}

const once = process.argv.includes("--once");
if (once) {
  copyOnce();
  process.exit(0);
}

// watch mode
console.log(`[sync-prisma] watching: ${path.relative(process.cwd(), src)}`);
const watcher = chokidar.watch(src, { ignoreInitial: false, awaitWriteFinish: { stabilityThreshold: 200 } });

let busy = false;
watcher.on("change", () => {
  if (busy) return;
  busy = true;
  try {
    copyOnce();
  } finally {
    setTimeout(() => (busy = false), 150);
  }
});
watcher.on("add", copyOnce);
