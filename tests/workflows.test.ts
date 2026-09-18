import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDocument } from 'yaml';
import { z } from 'zod';
const stepSchema = z.object({ run: z.string().optional(), uses: z.string().optional(), if: z.string().optional(), with: z.record(z.unknown()).optional() }).passthrough();
const workflowSchema = z.object({
  name: z.string(), on: z.record(z.unknown()), permissions: z.record(z.string()),
  jobs: z.record(z.object({ if: z.string().optional(), permissions: z.record(z.string()).optional(), steps: z.array(stepSchema) }).passthrough()),
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
test('deployment accepts only successful same-repository main pushes and downloads that run', () => {
  const deploy = workflow('.github/workflows/deploy.yml');
  assert.deepEqual(Object.keys(deploy.on), ['workflow_run']);
  const job = deploy.jobs.deploy!;
  for (const expression of ["conclusion == 'success'", "event == 'push'", "head_branch == 'main'", 'head_repository.full_name == github.repository']) assert.ok(job.if?.includes(expression));
  assert.equal(job.permissions?.pages, 'write');
  assert.equal(job.permissions?.['id-token'], 'write');
  assert.ok(!job.steps.some(s => s.uses?.startsWith('actions/checkout')));
  const download = job.steps.find(s => s.uses?.startsWith('actions/download-artifact@'));
  assert.equal(download?.with?.['run-id'], '${{ github.event.workflow_run.id }}');
  assert.ok(job.steps.some(s => typeof s.with?.script === 'string' && s.with.script.includes('workflow_run.head_sha')));
});
test('workflow action hashes match the reviewed commit allowlist', () => {
  const pins = z.record(z.object({ commit: z.string().regex(/^[a-f0-9]{40}$/), version: z.string().regex(/^v\d+$/) }).strict()).parse(JSON.parse(readFileSync('.github/action-pins.json', 'utf8')));
  for (const file of ['.github/workflows/ci.yml', '.github/workflows/deploy.yml'])
    for (const job of Object.values(workflow(file).jobs)) for (const step of job.steps)
      if (step.uses) {
        const [action, sha] = step.uses.split('@');
        assert.ok(action && pins[action], `Unreviewed action: ${step.uses}`);
        assert.equal(sha, pins[action]?.commit, `Unreviewed commit: ${step.uses}`);
      }
});
