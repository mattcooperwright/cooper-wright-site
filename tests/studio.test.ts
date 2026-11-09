import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = join(process.cwd(), 'public', 'mesh-gradient-studio');
const html = () => readFileSync(join(dir, 'index.html'), 'utf8');

describe('Mesh Gradient Studio build in public/', () => {
  it('has a prerendered index.html', () => {
    expect(existsSync(join(dir, 'index.html'))).toBe(true);
    expect(html()).toContain('Mesh Gradient Studio');
  });

  it('loads every local file from its own subfolder and that file exists', () => {
    const urls = [...html().matchAll(/(?:href|src)="(\/[^"]+)"/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url.startsWith('/mesh-gradient-studio/'), url).toBe(true);
      expect(existsSync(join(process.cwd(), 'public', url)), url).toBe(true);
    }
  });

  it('links no font host and keeps no OpenAI hosting URL', () => {
    const page = html();
    expect(page).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
    expect(page).not.toMatch(/chatgpt\.site|openai/i);
    expect(existsSync(join(process.cwd(), 'apps', 'mesh-gradient-studio', '.openai'))).toBe(false);
  });
});
