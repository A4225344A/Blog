---
id: beginner-first-change-en
slug: beginner-first-change
title: "Adding articles, layouts and a deployment workflow"
description: "Separate Markdown from layouts, handle the GitHub Pages base and understand this repository's validated, human-approved delivery."
locale: en
translationKey: beginner-first-change
contentType: tutorial
difficulty: intermediate
topics: [web-foundations]
skills: [astro-content-modeling]
prerequisiteSkills: [local-website-preview]
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-20
status: published
---

For a second article, I do not want another copy of the HTML with its title, heading and body edited by hand. The page shell should be shared, leaving the article file for the writing.

Continue with `engineering-blog` and try this with one Markdown file and one Astro layout. Later, connect the local output to this site's publishing workflow, noting where the small example and the actual repository differ.

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
description: "A note on content delivery and maintenance."
---

## Context

This blog publishes articles and project notes.

## Decision

Generate pages before publishing and serve the static output.

## Tradeoff

Content changes need a new build.
```

Frontmatter is the data between the `---` lines. Its layout property points to the shared layout. The body starts at heading level two because the layout already supplies h1. This uses [Astro's Markdown page layout mechanism](https://v5.docs.astro.build/en/guides/markdown-content/#frontmatter-layout-property).

In `src/pages/index.astro`, add this below the paragraph:

```astro
<a href={`${base}posts/build-notes/`}>Read the build notes</a>
```

Save with Ctrl+S, run dev and follow the link from home. The title, description and body appear together, but come from two files: Markdown supplies the text and the layout places it on the page. The return link lives in the layout too, ready to share with later articles.

## Where articles live as the site grows

Markdown under pages directly creates routes, which makes the content/layout relationship easy to inspect. **This repository stores published articles under src/content/articles**, validates them with Content Collections and schemas, and renders them through canonical routes.

This site also lists the same article under topics, series and projects. Those pages link back to one body. LearningPath records the series order; Project records its related articles. The build then computes where each article is referenced.

That is also why content has a stable ID separate from its URL slug. When a URL changes, series and projects still refer to the original ID. The one-article example can stay small for now, without that relationship model.

## The link works locally. What about under /Blog/?

The link above uses `base` for a reason. This site is deployed under `/Blog/`, and article URLs must start there too. A link hardcoded to `/posts/build-notes/` sends the browser to the origin root, skipping `/Blog/`.

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

An account-site repository uses `/`; a project site named `Blog` uses `/Blog/`. Site contains the origin and base contains the path. This minimal configuration expects leading and trailing slashes in the environment value; it does not include the repository's full normalization checks.

For example, in Windows PowerShell:

```powershell
$env:SITE_URL = 'https://YOUR_USERNAME.github.io'
$env:SITE_BASE = '/Blog/'
pnpm.cmd run build
pnpm.cmd run preview
```

Replace YOUR_USERNAME and Blog with your account and repository. Stop dev with Ctrl+C first. Use preview's printed URL to test both directions between home and article. BASE_URL keeps links within the deployment path. Apply the same care to later image URLs.

A successful build creates `dist`. Preview serves that output; source changes require another build. These steps remain local and do not upload the site.

## Which files actually get published?

After inspecting the local result, there is another question for deployment: are the files going live the ones that passed the checks? This repository uses the following workflow.

<figure class="learning-diagram">
<figcaption>Architecture: from writing an article to delivering a page</figcaption>
<ol role="list">
<li><strong>1. Markdown and layout</strong><span>Content supplies the writing; a layout shares headings, navigation and styles.</span></li>
<li><strong>2. Astro build</strong><span>Combines both into static files in dist.</span></li>
<li><strong>3. CI and human approval</strong><span>This repository validates first; successful main CI waits for deployment approval.</span></li>
<li><strong>4. GitHub Pages</strong><span>Publishes the verified artifact without rebuilding on the live site.</span></li>
</ol>
<p>CI and approval require a repository workflow and environment settings. The local example above has not added them.</p>
</figure>

Its single CI workflow contains separate validation and deployment jobs:

1. PRs and main run frozen installation, content validation, tests, type checks and builds. PRs do not deploy.
2. Successful main CI uploads that run's verified artifact.
3. Deploy waits for human approval on the github-pages environment.
4. After approval, it checks the current main SHA and deploys that same artifact without another build.

A new repository needs source and lockfile commits, its own Actions workflow, GitHub Actions selected as the Pages source, and Required reviewers on the github-pages environment. Referencing the environment in YAML does not configure reviewers.

For the configuration, compare the [actual workflow](https://github.com/A4225344A/Blog/blob/main/.github/workflows/ci.yml) and [Astro's GitHub Pages guidance](https://docs.astro.build/en/guides/deploy/github/). The example currently has only dev, build and preview scripts. Adopting this repository's validation flow also requires implementing its content checks and test scripts.

What matters to me is the connection between approval and the artifact: inspect a result, approve it and publish that result. Rebuilding after approval would leave the inspected output insufficient to explain what was actually released. That is why the deployment job uses the artifact from the same CI run.
