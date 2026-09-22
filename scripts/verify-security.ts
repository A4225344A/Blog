import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { publicFileRisks } from './security-rules';

// Includes ignored files if already tracked; ignored local .env files stay private.
const files = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' }).split('\0').filter(Boolean))];
let count = 0;
for (const file of files) {
  let bytes: Buffer;
  try {
    if (!statSync(file).isFile()) continue;
    bytes = readFileSync(file);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') continue;
    throw error;
  }
  const risks = publicFileRisks(file, bytes.includes(0) ? '' : bytes.toString('utf8'));
  for (const risk of risks) {
    // Never print the matching value, even in a failed public CI log.
    console.error(`[SECURITY] ${file}: ${risk}`);
    count++;
  }
}
console.log(`Public-file guard: ${files.length} files, ${count} findings (current working tree only).`);
if (count) process.exitCode = 1;
