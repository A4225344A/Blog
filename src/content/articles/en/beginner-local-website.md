---
id: beginner-local-website-en
slug: beginner-local-website
title: "Building an Astro blog from an empty project"
description: "Create a minimal project and understand file routing and development before adding articles and shared layouts."
locale: en
translationKey: beginner-local-website
contentType: tutorial
difficulty: intermediate
topics: [web-foundations]
skills: [local-website-preview]
prerequisiteSkills: ["static-site-delivery"]
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-20
status: published
---

This article creates the skeleton of an Astro blog from an empty project. The purpose is to understand file responsibilities and the build workflow before adding articles and layouts.

The example uses Node.js 24.x, pnpm 10.32.1 and Astro 5.18.2. Astro is pinned to make the example explicit, not to claim it is the latest release. If your tools are ready, begin with the project; setup details are in the appendix.

## File responsibilities first

<figure class="learning-diagram">
<figcaption>Architecture: files and the browser during development</figcaption>
<ol role="list">
<li><strong>1. Source files</strong><span>src/pages defines pages; package.json defines tools and tasks.</span></li>
<li><strong>2. Astro dev</strong><span>pnpm run dev starts a local server that reads the sources.</span></li>
<li><strong>3. Browser</strong><span>Requests localhost and displays the processed result.</span></li>
</ol>
<p>The editor saves files and the terminal starts tasks. The browser does not execute .astro files directly.</p>
</figure>

## Create an empty project

Create an empty `engineering-blog` folder and open it in your editor. Add `package.json`:

```json
{
  "name": "engineering-blog",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "5.18.2"
  },
  "packageManager": "pnpm@10.32.1"
}
```

The three scripts have different purposes: dev provides development feedback, build generates website files, and preview serves the built output. Dependencies declare which Astro version the project uses.

Run this in **the project folder's terminal**:

```bash
pnpm install
```

The first install creates `pnpm-lock.yaml`, so do not use `--frozen-lockfile` yet. Commit the generated lockfile so CI can install the recorded resolution. Add `node_modules`, `dist` and `.astro` to `.gitignore` rather than committing generated files.

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

Strict configuration constrains later layout code. It does not replace runtime data validation or mean that a build performs all type checks.

## Create the home page

Create `src/pages/index.astro`:

```astro
---
const base = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Engineering notes</title>
  </head>
  <body>
    <h1>Engineering notes</h1>
    <p>Projects, implementation and architecture decisions.</p>
  </body>
</html>
```

The code between the opening `---` lines runs in Astro. It obtains the deployment base, which the next article will use for links. The HTML below defines the visible content. The file location determines the home route, not the h1 text.

In the same project terminal, run:

```bash
pnpm run dev
```

Open the Local URL printed in the terminal. Expect **Engineering notes**. Edit the paragraph, save and observe the result without reinstalling dependencies.

## Verify the model

Changing only `title` changes the browser tab. Changing `h1` changes the visible heading. The filename remains index.astro, so the route remains the home page.

Stopping dev leaves the files intact but removes the service answering localhost. Restart it to continue. That local process lifecycle is independent of whether the files have been uploaded to GitHub.

You now have package.json, pnpm-lock.yaml, tsconfig.json and src/pages/index.astro. Next, separate article content from its shared layout.

## Setup appendix and troubleshooting

On Windows, install Node.js 24.x from its [official download page](https://nodejs.org/en/download), then install the chosen pnpm version with `npm.cmd install --global pnpm@10.32.1`. [VS Code](https://code.visualstudio.com/docs/setup/windows) is one editor option. Existing development environments do not need to be reinstalled.

Use File → Open Folder, then Terminal → New Terminal. In Windows PowerShell, use `pnpm.cmd` in place of `pnpm` to select its command wrapper without relaxing execution policy.

If package.json is missing, inspect the terminal's current folder. For a 404, check the actual filename src/pages/index.astro. pnpm 10 may warn about ignored installation scripts; do not approve every script automatically for this text-only example. Keep the actual error if a later build fails.
