import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parseDocument } from 'yaml';
import { z } from 'zod';
const stepSchema = z.object({ run: z.string().optional(), uses: z.string().optional(), if: z.string().optional(), with: z.record(z.unknown()).optional() }).passthrough();
const workflowSchema = z.object({
  name: z.string(), on: z.record(z.unknown()), permissions: z.record(z.string()),
  concurrency: z.object({ group: z.string(), 'cancel-in-progress': z.union([z.boolean(), z.string()]) }),
  jobs: z.record(z.object({ if: z.string().optional(), needs: z.string().optional(), environment: z.object({ name: z.string(), url: z.string() }).optional(), permissions: z.record(z.string()).optional(), concurrency: z.object({ group: z.string(), 'cancel-in-progress': z.boolean() }).optional(), steps: z.array(stepSchema) }).passthrough()),
}).passthrough();
function workflow(file: string) {
  const parsed = parseDocument(readFileSync(file, 'utf8'), { uniqueKeys: true });
  assert.equal(parsed.errors.length, 0);
  const value: unknown = parsed.toJS();
  return workflowSchema.parse(value);
}
test('CI has read-only permissions and ordered quality gates; artifacts only from main pushes', () => {
  const ci = workflow('.github/workflows/ci.yml');
  assert.deepEqual(ci.permissions, { contents: 'read' });
  assert.ok(Object.hasOwn(ci.on, 'pull_request'));
  const steps = ci.jobs.validate!.steps;
  const runs = steps.flatMap(s => s.run ? [s.run] : []);
  const commands = ['pnpm install --frozen-lockfile', 'pnpm run content:validate', 'pnpm run test', 'pnpm run check'];
  assert.deepEqual(runs.slice(0, 4), commands);
  const upload = steps.find(s => s.uses?.startsWith('actions/upload-artifact@'));
  assert.match(upload?.if ?? '', /event_name == 'push'/);
  assert.match(upload?.if ?? '', /refs\/heads\/main/);
});
test('one workflow gates deployment on successful main CI and the protected environment', () => {
  assert.deepEqual(readdirSync('.github/workflows').filter(file => /\.ya?ml$/.test(file)), ['ci.yml']);
  const ci = workflow('.github/workflows/ci.yml');
  assert.deepEqual(Object.keys(ci.on).sort(), ['pull_request', 'push']);
  assert.deepEqual(ci.on.push, { branches: ['main'] });
  const job = ci.jobs.deploy!;
  assert.equal(job.needs, 'validate');
  assert.equal(job.if, "github.event_name == 'push' && github.ref == 'refs/heads/main' && needs.validate.result == 'success'");
  assert.equal(job.environment?.name, 'github-pages');
  assert.equal(job.environment.url, '${{ steps.deployment.outputs.page_url }}');
  assert.deepEqual(job.permissions, { contents: 'read', actions: 'read', pages: 'write', 'id-token': 'write' });
  assert.equal(ci.jobs.validate?.permissions, undefined);
  assert.equal(ci.jobs.validate?.environment, undefined);
  assert.equal(ci.concurrency['cancel-in-progress'], "${{ github.event_name == 'pull_request' }}");
  assert.equal(ci.concurrency.group, "ci-${{ github.workflow }}-${{ github.event_name == 'pull_request' && github.ref || github.run_id }}");
  assert.deepEqual(job.concurrency, { group: 'github-pages', 'cancel-in-progress': false });
  assert.ok(!job.steps.some(s => s.run || s.uses?.startsWith('actions/checkout')));
  const download = job.steps.find(s => s.uses?.startsWith('actions/download-artifact@'));
  assert.deepEqual(download?.with, { name: 'verified-site', path: 'site' });
  assert.equal(job.steps[0]?.uses?.split('@')[0], 'actions/github-script');
  assert.equal(job.steps.at(-1)?.uses?.split('@')[0], 'actions/deploy-pages');
});
test('the actual deployment guard rejects a stale SHA and accepts the validated current SHA', () => {
  const script = workflow('.github/workflows/ci.yml').jobs.deploy?.steps[0]?.with?.script;
  assert.equal(typeof script, 'string');
  for (const currentSha of ['validated-sha', 'newer-sha']) {
    const output = execFileSync(process.execPath, ['--input-type=module', '--eval', `
      const context = { repo: { owner: 'fixture', repo: 'fixture' }, sha: 'validated-sha' };
      const github = { rest: { repos: { getBranch: async ({ branch }) => {
        if (branch !== 'main') throw new Error('Wrong branch');
        return { data: { commit: { sha: ${JSON.stringify(currentSha)} } } };
      } } } };
      let failed = false;
      const core = { setFailed: () => { failed = true; } };
      ${script}
      process.stdout.write(JSON.stringify({ failed }));
    `], { encoding: 'utf8' });
    assert.deepEqual(JSON.parse(output), { failed: currentSha !== 'validated-sha' });
  }
});
test('workflow action hashes match the reviewed commit allowlist', () => {
  const pins = z.record(z.object({ commit: z.string().regex(/^[a-f0-9]{40}$/), version: z.string().regex(/^v\d+$/) }).strict()).parse(JSON.parse(readFileSync('.github/action-pins.json', 'utf8')));
  for (const file of ['.github/workflows/ci.yml'])
    for (const job of Object.values(workflow(file).jobs)) for (const step of job.steps)
      if (step.uses) {
        const [action, sha] = step.uses.split('@');
        assert.ok(action && pins[action], `Unreviewed action: ${step.uses}`);
        assert.equal(sha, pins[action]?.commit, `Unreviewed commit: ${step.uses}`);
      }
});
