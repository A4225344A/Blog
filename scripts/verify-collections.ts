import { writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { graph } from '../tests/fixtures';

// Temporary test-only content exercises Astro's real loaders and build graph.
// Exclusive creation and per-file cleanup preserve all existing author content.
const created: string[] = [];
try {
  for (const [collection, entries] of Object.entries(graph())) {
    for (const entry of entries) {
      const article = collection === 'articles';
      const file = resolve('src/content', collection, `collection-smoke-${entry.id}.${article ? 'md' : 'json'}`);
      const json = JSON.stringify(entry, null, 2);
      await writeFile(file, article ? `---\n${json}\n---\nTest-only Markdown body.\n` : json, { flag: 'wx' });
      created.push(file);
    }
  }
  const result = spawnSync(process.execPath, [resolve('node_modules/astro/astro.js'), 'build'], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Collection fixture build exited ${result.status}`);
  console.log('All five populated Astro collections passed the static build.');
} finally {
  for (const file of created) await unlink(file);
}
