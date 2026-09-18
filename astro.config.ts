import { defineConfig } from 'astro/config';
import { hosting } from './src/config/hosting';

export default defineConfig({
  ...hosting(process.env.SITE_URL, process.env.SITE_BASE),
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
