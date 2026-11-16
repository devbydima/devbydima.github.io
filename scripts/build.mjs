// Builds css/style.css and points every page at it with a content hash (?v=...),
// so browsers only refetch the stylesheet when it really changed.
// Run with: npm run build
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CSS = 'css/style.css';

execFileSync('npx', ['--no-install', 'tailwindcss', '-i', 'src/input.css', '-o', CSS, '--minify'], { stdio: 'inherit' });

const hash = createHash('sha256').update(readFileSync(CSS)).digest('hex').slice(0, 8);

const pages = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === 'node_modules' || e.name.startsWith('.')) return [];
    const path = join(dir, e.name);
    return e.isDirectory() ? pages(path) : e.name.endsWith('.html') ? [path] : [];
  });

for (const page of pages('.')) {
  const html = readFileSync(page, 'utf8');
  const next = html.replace(/(css\/style\.css)\?v=\w+/g, `$1?v=${hash}`);
  if (next !== html) {
    writeFileSync(page, next);
    console.log(`${page}: ?v=${hash}`);
  }
}
