---
id: beginner-first-change-en
slug: astro-content-and-deployment
title: "Adding articles, layouts and a deployment workflow"
description: "Add Markdown and a shared layout, configure the deployment path, and publish with a complete GitHub Pages workflow."
locale: en
translationKey: beginner-first-change
contentType: tutorial
difficulty: intermediate
topics: [web-foundations]
skills: [astro-content-modeling]
prerequisiteSkills: [local-website-preview]
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-23
status: published
---

With the home page in place, I can add an article. I put the heading, navigation and styles in a shared layout and write the body in Markdown. Later layout changes will not require editing every article’s HTML.

Keep working in the `engineering-blog` folder. Once the article is ready, configure GitHub Actions to publish it to GitHub Pages.

## Give the repeated HTML a layout

Create `src/layouts/PostLayout.astro`. A layout supplies the page shell; the slot receives the article body:

```astro
---
interface Props {
  frontmatter: { title: string; description: string };
}
const { frontmatter } = Astro.props;
const base = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{frontmatter.title}</title>
    <meta name="description" content={frontmatter.description} />
  </head>
  <body>
    <main>
      <a href={base}>Home</a>
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>
      <slot />
    </main>
  </body>
</html>
<style>
  main { max-width: 70ch; margin: 3rem auto; padding: 0 1rem; line-height: 1.8; }
</style>
```

Props declares the title and description expected by the layout. The slot receives rendered Markdown. Articles using this layout share its CSS and structure.

Create `src/pages/posts/build-notes.md`:

```markdown
---
layout: ../../layouts/PostLayout.astro
title: "Why this blog is static"
description: "How prebuilt pages fit the needs of a personal blog."
---

## Writing in Markdown

I keep articles in Markdown and use a shared layout for the HTML around them.

## Publishing an edit

Astro builds the pages before I upload them. Changing an article means building again.
```

Frontmatter is the data between the `---` lines. Its layout property points to the shared layout. The body starts at heading level two because the layout already supplies h1. This uses [Astro's Markdown page layout mechanism](https://docs.astro.build/en/guides/markdown-content/#frontmatter-layout-property).

In `src/pages/index.astro`, add this below the paragraph:

```astro
<a href={`${base}posts/build-notes/`}>Read the build notes</a>
```

Save with Ctrl+S, run dev and follow the link from home. The title, description and body appear together, but come from two files: Markdown supplies the text and the layout places it on the page. The return link lives in the layout too, ready to share with later articles.

## From one article to a collection

Markdown in `src/pages` creates a page directly, which is enough for this example. Topic lists, series navigation and language switching need more information about each article. I keep this blog’s articles in `src/content/articles` and load them with Content Collections. Article four follows the actual files to explain that setup.

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

Replace YOUR_USERNAME and Blog with your account and repository. Use preview's printed URL to test both directions between home and article. BASE_URL keeps links within the deployment path. Apply the same care to later image URLs.

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

Create an empty public GitHub repository named `Blog`, without a README. Under Settings → Pages, select **GitHub Actions** as the source. Under Settings → Environments, open `github-pages` if Pages already created it, or create it if absent. Restrict deployment branches to `main` and choose the users or teams under Required reviewers. These rules are available for public repositories on current GitHub plans. If you are the only reviewer, leave Prevent self-review unchecked so you can approve your own deployment. Save the protection rules before the first push. See [GitHub environment setup](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).

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

The workflow-level `concurrency` groups runs by PR branch or, for main, by run ID. A newer PR run cancels the older one; main runs stay independent while awaiting approval. The deploy-level group serializes deployments without cancelling an active deployment.

PRs build without deploying. A successful main build uploads `dist` as an artifact (output shared with the next job). Deployment waits for environment approval and publishes that artifact without rebuilding.

A SHA identifies a Git commit. The post-approval check rejects an older build if main has moved. `id-token: write` allows the deployment job to use OIDC, short-lived identity verification with Pages, without storing a deployment password. PR builds do not receive this permission.

The workflow runs on Linux, where the command is `pnpm`. Local PowerShell instructions consistently use `pnpm.cmd`.

## Push and verify the published site

Replace `YOUR_USERNAME` and, if necessary, the repository name. Continue in the Git repository initialized in the previous article:

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
