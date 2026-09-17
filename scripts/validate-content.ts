import { resolve } from 'node:path';
import { readContent, validateContent } from '../src/utils/content-source';

try {
  const result = validateContent(await readContent(resolve(process.argv[2] ?? 'src/content')));
  for (const d of result.errors) console.error(`[${d.id}] ${d.entity}: ${d.message}`);
  for (const d of result.warnings) console.warn(`[${d.id}] ${d.entity}: ${d.message}`);
  console.log(`Content validation: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  if (result.errors.length) process.exitCode = 1;
} catch (error: unknown) {
  console.error(`[E_CONTENT_READ] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
