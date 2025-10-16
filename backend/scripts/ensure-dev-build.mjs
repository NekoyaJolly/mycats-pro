#!/usr/bin/env node
import { existsSync, rmSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '..');
const distDir = path.join(backendRoot, 'dist');
const requiredArtifacts = [
  path.join(distDir, 'src', 'auth', 'auth.module.js'),
  path.join(distDir, 'src', 'users', 'users.module.js'),
];

const missingArtifacts = requiredArtifacts.filter((artifact) => !existsSync(artifact));

if (missingArtifacts.length === 0) {
  process.exit(0);
}

console.log('[prestart:dev] Detected missing build artifacts:');
missingArtifacts.forEach((artifact) => {
  console.log(`  - ${path.relative(backendRoot, artifact)}`);
});

console.log('[prestart:dev] Removing stale build outputs...');
rmSync(distDir, { recursive: true, force: true });

const tsBuildInfo = path.resolve(backendRoot, '..', '.tmp', 'backend.tsbuildinfo');
rmSync(tsBuildInfo, { force: true });

console.log('[prestart:dev] Running fresh "pnpm run build" to regenerate dist...');
const buildResult = spawnSync('pnpm', ['run', 'build'], {
  cwd: backendRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (buildResult.status !== 0) {
  console.error('[prestart:dev] Build failed. Aborting start.');
  process.exit(buildResult.status ?? 1);
}

console.log('[prestart:dev] Build artifacts regenerated. Continuing to start:dev...');
