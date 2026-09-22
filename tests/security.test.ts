import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicFileRisks } from '../scripts/security-rules';

test('public-file guard blocks credential files even without matching token content', () => {
  for (const path of ['.env', 'nested/.env.production', 'cert.key', 'id_ed25519'])
    assert.ok(publicFileRisks(path, '').includes('credential-file'));
  assert.deepEqual(publicFileRisks('.env.example', 'PUBLIC_GA_MEASUREMENT_ID=G-123456ABCD'), []);
});
test('public-file guard detects token shapes and private keys without returning their contents', () => {
  const tokens = ['ghp_' + 'x'.repeat(36), 'github_pat_' + 'x'.repeat(82),
    'AKIA' + 'A'.repeat(16), 'npm_' + 'x'.repeat(36), 'AIza' + 'x'.repeat(35),
    '-----BEGIN ' + 'PRIVATE KEY-----'];
  for (const token of tokens) {
    const risks = publicFileRisks('src/config.ts', token);
    assert.equal(risks.length, 1);
    assert.ok(!risks.join('').includes(token));
  }
});
