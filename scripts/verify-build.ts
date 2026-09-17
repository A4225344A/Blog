import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normalizeBase } from '../src/config/hosting';

const base = normalizeBase(process.env.SITE_BASE);
for (const route of ['', 'en/', 'zh-tw/']) {
  const html = await readFile(resolve('dist', route, 'index.html'), 'utf8');
  assert.ok(html.includes(`lang="${route === 'en/' ? 'en' : 'zh-TW'}"`));
  assert.ok(html.includes(`href="${base}en/"`));
  assert.ok(html.includes(`href="${base}zh-tw/"`));
  assert.ok(html.includes('id="main"'));
  assert.ok(html.includes('value="system"'));
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const url = match[1];
    assert.ok(url);
    if (/^https?:/.test(url)) continue;
    assert.ok(url.startsWith(base), `Unprefixed link: ${url}`);
    const relative = url.slice(base.length);
    await access(resolve('dist', relative, relative.endsWith('/') || relative === '' ? 'index.html' : ''));
  }
}
console.log(`Verified static language links and assets for base ${base}`);
