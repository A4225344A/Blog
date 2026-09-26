---
id: astro-github-pages-en
slug: astro-github-pages
title: "Deploying an Astro blog to GitHub Pages"
description: "Configure the deployment path, check the local build and publish the same files with GitHub Actions."
locale: en
translationKey: astro-github-pages
contentType: tutorial
difficulty: intermediate
topics: [web-foundations]
skills: [static-site-delivery]
prerequisiteSkills: [astro-content-modeling]
recommendedArticles: []
publishedAt: 2026-09-24
updatedAt: 2026-09-26
status: published
---

Continue with `engineering-blog` from the previous tutorials: the home page links to an article, and Home returns from the article. We can now publish it to GitHub Pages. Commands use Windows PowerShell; complete the previous article and layout steps first if those pages are not ready.

<figure class="learning-diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 680" role="img" aria-label="PR and main deployment paths" style="display:block;max-width:100%;width:400px;height:auto;margin:auto;background:var(--soft);border-radius:8px">
<g fill="none" stroke="var(--link)" stroke-width="2"><path d="M200 80 V105 H100 V150 M200 105 H300 V150 M300 210 V250 H200 V280 M200 340 V365 M200 425 V450 M200 510 V535"/><path d="M94 144 l6 6 6-6 M294 144 l6 6 6-6 M194 274 l6 6 6-6 M194 359 l6 6 6-6 M194 444 l6 6 6-6 M194 529 l6 6 6-6"/></g>
<rect x="100" y="20" width="200" height="60" rx="8" fill="var(--surface)" stroke="var(--link)"/><text x="200" y="56" text-anchor="middle" font-family="sans-serif" font-size="16" fill="var(--fg)">Push changes</text>
<rect x="10" y="150" width="180" height="60" rx="8" fill="var(--surface)" stroke="var(--link)"/><text x="100" y="186" text-anchor="middle" font-family="sans-serif" font-size="16" fill="var(--fg)">Run checks only</text>
<rect x="210" y="150" width="180" height="60" rx="8" fill="var(--surface)" stroke="var(--link)"/><text x="300" y="186" text-anchor="middle" font-family="sans-serif" font-size="16" fill="var(--fg)">Check and build</text>
<rect x="30" y="280" width="340" height="60" rx="8" fill="var(--surface)" stroke="var(--link)"/><text x="200" y="316" text-anchor="middle" font-family="sans-serif" font-size="16" fill="var(--fg)">Upload verified artifact</text>
<rect x="30" y="365" width="340" height="60" rx="8" fill="var(--surface)" stroke="var(--link)"/><text x="200" y="401" text-anchor="middle" font-family="sans-serif" font-size="16" fill="var(--fg)">Wait for github-pages approval</text>
<rect x="30" y="450" width="340" height="60" rx="8" fill="var(--surface)" stroke="var(--link)"/><text x="200" y="486" text-anchor="middle" font-family="sans-serif" font-size="16" fill="var(--fg)">Deploy the same artifact</text>
<rect x="30" y="535" width="340" height="60" rx="8" fill="var(--surface)" stroke="var(--link)"/><text x="200" y="571" text-anchor="middle" font-family="sans-serif" font-size="16" fill="var(--fg)">GitHub Pages</text>
<g font-family="sans-serif" font-size="16" text-anchor="middle" fill="var(--fg)"><text x="70" y="135">PR</text><text x="335" y="135">main</text><text x="100" y="235">Stop — no deployment</text></g>
</svg>
<figcaption>Deployment flow: PRs do not deploy. Main publishes its artifact only after checks and human approval.</figcaption>
</figure>

## Deploy under /Blog/

A GitHub Pages project site includes the repository name in its path, such as `/Blog/`. A link to `/posts/build-notes/` sends the browser to the domain root and skips `/Blog/`. The `base` value in our links supplies that missing path.

Add `astro.config.mjs` to the example so the build can use that path:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.SITE_BASE ?? '/',
});
```

An account-site repository uses `/`; a project site named `Blog` uses `/Blog/`. Site contains the origin and base contains the path. Include leading and trailing slashes in the base value.

Stop dev with Ctrl+C first. Then, in Windows PowerShell:

```powershell
$env:SITE_URL = 'https://YOUR_USERNAME.github.io'
$env:SITE_BASE = '/Blog/'
pnpm.cmd run build
pnpm.cmd run preview
```

Replace YOUR_USERNAME and Blog with your account and repository. Open preview's URL, follow the article link from home, then click Home to return. `BASE_URL` keeps `/Blog/` in the links; include it in image paths too.

A successful build creates `dist`, which preview serves locally. Build again after editing an article; the GitHub Actions workflow below will handle uploading.

## Clear settings before returning to local development

`$env:SITE_URL` and `$env:SITE_BASE` affect the current PowerShell window and processes it starts, not permanent account settings. After stopping preview, clear both before returning to root-path development:

```powershell
Remove-Item Env:SITE_URL, Env:SITE_BASE -ErrorAction SilentlyContinue
pnpm.cmd run dev
```

Without this step, a later dev server in the same window still uses `/Blog/`.

## A complete GitHub Pages workflow

A workflow is an automation file in the repository. CI (continuous integration) builds and checks changes. This example uses the check and build scripts already present in the sample project.

Before the first push, complete these settings on GitHub:

1. Create an empty public repository named `Blog`, without a README.
2. Open **Settings → Pages** and select **GitHub Actions** as the source.
3. Open **Settings → Environments**, then `github-pages`. Create that environment if it does not exist yet.
4. Under **Deployment branches and tags**, select specific branches and add a branch rule for `main`.
5. Enable **Required reviewers** and select the people or teams allowed to approve deployments. This rule is available for public repositories.
6. If you are the only reviewer, leave **Prevent self-review** unchecked so you can approve your own deployment.
7. Save the protection rules and confirm that the reviewer appears in the list.

See [GitHub environment setup](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).

Create `.github/workflows/pages.yml`:

```yaml
name: Publish Astro blog
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
concurrency:
  group: pages-${{ github.workflow }}-${{ github.event_name == 'pull_request' && github.ref || github.run_id }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7
        with:
          node-version: '24'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Build for this repository
        shell: bash
        run: |
          owner="${GITHUB_REPOSITORY_OWNER,,}"
          repo="${GITHUB_REPOSITORY#*/}"
          export SITE_URL="https://${owner}.github.io"
          export SITE_BASE="/${repo}/"
          if [[ "${repo,,}" == "${owner}.github.io" ]]; then export SITE_BASE='/'; fi
          pnpm run check
          pnpm run build
          test -s dist/index.html
          test -s dist/posts/build-notes/index.html
      - uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        with:
          path: dist
  deploy:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    concurrency:
      group: github-pages
      cancel-in-progress: false
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9
        with:
          script: |
            const branch = await github.rest.repos.getBranch({ ...context.repo, branch: 'main' });
            if (branch.data.commit.sha !== context.sha) {
              core.setFailed('main changed; approve the latest run instead.');
            }
      - id: deployment
        uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5
```

`concurrency` decides what happens when runs overlap. Push several times to one PR and only the latest build stays active. New main builds do not cancel deployments waiting for approval. Deployments run one at a time.

PRs build without deploying. A successful main build uploads `dist` as an artifact (output shared with the next job). Deployment waits for environment approval and publishes that artifact without rebuilding.

A SHA is the commit’s version identifier. If main changes while a run waits, approving that old run will not publish it: the check stops it, and you can approve the latest run instead. If an old waiting run blocks the queue, cancel it before approving the new one.

`id-token: write` lets the deployment job obtain a short-lived identity credential from GitHub through OIDC. There is no separate deployment password to store. Only deploy gets this permission; PR builds do not.

The workflow runs on Linux, where the command is `pnpm`. Local PowerShell instructions consistently use `pnpm.cmd`.

## Push and verify the published site

Replace `YOUR_USERNAME` and, if necessary, the repository name. Continue in the Git repository initialized during project setup:

```powershell
git add .
git commit -m "Add article and Pages workflow"
git remote add origin https://github.com/YOUR_USERNAME/Blog.git
git push -u origin main
```

The first HTTPS push may open a browser login through Git Credential Manager. Complete GitHub authentication, then return to the terminal; see [credential setup](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git).

Open the run under Actions. After build succeeds, approve `github-pages` through Review deployments. Open the URL shown by the deployment job, follow **Read the build notes**, and confirm that Home returns to the `/Blog/` home page (or your configured base). For missing styles or broken links, check that resource paths include `/Blog/`.

Use branches and PRs for subsequent changes, then approve main deployments.

The next article opens up this blog’s source code to show where translations, categories and series order are stored.

References: [custom GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Astro deployment guide](https://docs.astro.build/en/guides/deploy/github/).
