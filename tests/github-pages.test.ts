import { test } from 'node:test';
import assert from 'node:assert/strict';
import { githubPagesHosting } from '../src/config/github-pages';
test('GitHub Pages owner sites and project sites resolve explicit origin/base', () => {
  assert.deepEqual(githubPagesHosting('Example/Example.github.io'), { site: 'https://example.github.io', base: '/' });
  assert.deepEqual(githubPagesHosting('A4225344A/Blog'), { site: 'https://a4225344a.github.io', base: '/Blog/' });
  assert.throws(() => githubPagesHosting('owner/repo\nSITE_URL=evil'));
  assert.throws(() => githubPagesHosting('owner/repo/extra'));
});
