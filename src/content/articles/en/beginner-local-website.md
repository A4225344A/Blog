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

Set aside article lists, search and language switching for a moment. Which files does an Astro project with just a home page need?

Start with an empty `engineering-blog` folder and add the configuration and page one at a time. The example uses Node.js 24.x, pnpm 10.32.1 and Astro 5.18.2. Windows setup notes are at the end.

## Where Astro sits during development

<figure class="learning-diagram">
<figcaption>Architecture: files and the browser during development</figcaption>
<ol role="list">
<li><strong>1. Source files</strong><span>src/pages defines pages; package.json defines tools and tasks.</span></li>
<li><strong>2. Astro dev</strong><span>pnpm run dev starts a local server that reads the sources.</span></li>
<li><strong>3. Browser</strong><span>Requests localhost and displays the processed result.</span></li>
</ol>
<p>The browser receives the page Astro has processed. The development server updates it when the source changes.</p>
</figure>

## Create an empty project

Create the folder, open it in your editor and add `package.json`. This configuration installs only Astro and provides three commands for development, building and previewing:

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

Use `dev` while editing pages. To inspect what will be published, run `build` to generate files, then serve that output with `preview`. Keeping the commands separate helps distinguish a working development page from the output that will go live.

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

I use strict TypeScript here and keep that setting for the layout props added later. Type checking requires a separate command; `astro build` generates the site without running a full type check.

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

Most of this file is HTML. Astro adds the opening `---` block for code that runs while producing the page. Here it reads the deployment `base` for the article link added next. Placing the file at `src/pages/index.astro` gives it the home route.

In the same project terminal, run:

```bash
pnpm run dev
```

Open the Local URL printed in the terminal; it should show **Engineering notes**. Edit the paragraph and save to see the page update. Astro dev, shown in the diagram, is running and reading the source files.

Press Ctrl+C to stop dev and localhost stops responding. The files remain in the project; run `pnpm run dev` again to continue editing.

For now, the home page keeps all its HTML in one file. Adding an article would start duplicating headings, navigation and styles. Those shared parts are what the next layout will hold.

## Windows setup notes

On Windows, install Node.js 24.x from its [official download page](https://nodejs.org/en/download), then install the chosen pnpm version with `npm.cmd install --global pnpm@10.32.1`. [VS Code](https://code.visualstudio.com/docs/setup/windows) is one editor option. Existing development environments do not need to be reinstalled.

Use File → Open Folder, then Terminal → New Terminal. In Windows PowerShell, use `pnpm.cmd` in place of `pnpm` to select its command wrapper without relaxing execution policy.

Run installation and dev from `engineering-blog`, the directory containing `package.json`.
