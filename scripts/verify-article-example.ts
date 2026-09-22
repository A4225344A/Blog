import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, basename } from 'node:path';
import { parse } from 'yaml';

// Build the actual published snippets, so prose and a separate fixture cannot drift.
const workspace = resolve('.');
const fixture = await mkdtemp(join(workspace, '.article-example-'));
function blocks(source: string, language: string): string[] {
  return [...source.matchAll(new RegExp('```' + language + '\\r?\\n([\\s\\S]*?)```', 'g'))].map(match => match[1]!.trim());
}
async function write(path: string, content: string) {
  const target = join(fixture, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}
try {
  let previousWorkflow: string | undefined;
  for (const locale of ['en', 'zh-tw']) {
    const setup = await readFile(`src/content/articles/${locale}/astro-project-setup.md`, 'utf8');
    const delivery = await readFile(`src/content/articles/${locale}/astro-content-and-deployment.md`, 'utf8');
    const [manifest, tsconfig] = blocks(setup, 'json');
    const [home] = blocks(setup, 'astro');
    const [layout, link] = blocks(delivery, 'astro');
    const [article] = blocks(delivery, 'markdown');
    const [config] = blocks(delivery, 'js');
    const [workflow] = blocks(delivery, 'yaml');
    assert.ok(manifest && tsconfig && home && layout && link && article && config && workflow);
    assert.equal(JSON.parse(manifest).dependencies.astro, JSON.parse(await readFile('node_modules/astro/package.json', 'utf8')).version);
    if (previousWorkflow) assert.equal(workflow, previousWorkflow, 'Both locales publish the same workflow');
    previousWorkflow = workflow;
    const parsed: unknown = parse(workflow);
    assert.ok(parsed && typeof parsed === 'object', 'Workflow parses as YAML');
    const pins = JSON.parse(await readFile('.github/action-pins.json', 'utf8')) as Record<string, { commit: string }>;
    for (const match of workflow.matchAll(/uses: ([\w/-]+)@([a-f0-9]+)/g)) assert.equal(match[2], pins[match[1]!]!.commit);
    await write('package.json', manifest);
    await write('tsconfig.json', tsconfig);
    await write('src/pages/index.astro', home.replace('</body>', `${link}\n</body>`));
    await write('src/layouts/PostLayout.astro', layout);
    await write('src/pages/posts/build-notes.md', article);
    await write('astro.config.mjs', config);
    execFileSync(process.execPath, [join(workspace, 'node_modules/astro/bin/astro.mjs'), 'check', '--root', fixture], {
      cwd: fixture, stdio: 'pipe', env: { ...process.env, CI: 'true' },
    });
    for (const base of ['/', '/Blog/']) {
      execFileSync(process.execPath, [join(workspace, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', fixture], {
        cwd: fixture, stdio: 'pipe', env: { ...process.env, SITE_URL: 'https://example.github.io', SITE_BASE: base, PUBLIC_GA_MEASUREMENT_ID: '' },
      });
      const index = await readFile(join(fixture, 'dist/index.html'), 'utf8');
      const post = await readFile(join(fixture, 'dist/posts/build-notes/index.html'), 'utf8');
      assert.ok(index.includes(`href="${base}posts/build-notes/"`));
      assert.ok(post.includes(`href="${base}"`));
      assert.match(post, /<h1[ >]/, 'Layout title renders');
      assert.match(post, /<h2[ >]/, 'Markdown body renders');
      console.log(`Article example passed: ${locale} ${base}`);
    }
  }
} finally {
  assert.equal(dirname(resolve(fixture)), workspace);
  assert.ok(basename(fixture).startsWith('.article-example-'));
  await rm(fixture, { recursive: true, force: true });
}
