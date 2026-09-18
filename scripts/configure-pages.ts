import { appendFile } from 'node:fs/promises';
import { githubPagesHosting } from '../src/config/github-pages';
const config = githubPagesHosting(process.env.GITHUB_REPOSITORY ?? '');
if (!process.env.GITHUB_ENV) throw new Error('GITHUB_ENV is required');
await appendFile(process.env.GITHUB_ENV, `SITE_URL=${config.site}\nSITE_BASE=${config.base}\n`);
console.log(`GitHub Pages target: ${config.site}${config.base}`);
