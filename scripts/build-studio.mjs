// Builds apps/mesh-gradient-studio as a static export and copies the result to
// public/mesh-gradient-studio/, which Astro serves as-is at /mesh-gradient-studio/.
// Run with: npm run studio:build (after `npm ci` inside apps/mesh-gradient-studio).
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(root, 'apps', 'mesh-gradient-studio');
const out = join(root, 'public', 'mesh-gradient-studio');

if (!existsSync(join(app, 'node_modules'))) {
  console.error('Run `npm ci` in apps/mesh-gradient-studio first.');
  process.exit(1);
}

rmSync(join(app, 'dist'), { recursive: true, force: true });
execFileSync('npx', ['vinext', 'build'], { cwd: app, stdio: 'inherit' });

const built = join(app, 'dist', 'client');
if (!existsSync(join(built, 'index.html'))) {
  console.error('The build produced no index.html. Check the prerender output above.');
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
// Skip the dev manifest, the 404 page and the RSC payload used only for client navigation.
const skip = new Set(['.vite', '404.html', 'index.rsc', '_headers', '.assetsignore']);
for (const entry of readdirSync(built)) {
  if (!skip.has(entry)) cpSync(join(built, entry), join(out, entry), { recursive: true });
}
console.log(`Copied the studio to ${out}`);
