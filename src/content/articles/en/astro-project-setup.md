---
id: beginner-local-website-en
slug: astro-project-setup
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
updatedAt: 2026-09-21
status: published
---

Set aside article lists, search and language switching for a moment. Which files does an Astro project with just a home page need?

Start with an empty `engineering-blog` folder and add the configuration and page one at a time. The example uses Node.js 24.x, pnpm 10.32.1 and Astro 7.3.3. These are Windows PowerShell instructions. macOS/Linux readers can use `pnpm` and `npm` without `.cmd`; the PowerShell environment-variable commands in later articles need shell-specific equivalents.

## Prepare the tools first

On Windows, install Node.js 24.x from its [official download page](https://nodejs.org/en/download), then install the chosen pnpm version with `npm.cmd install --global pnpm@10.32.1`. [VS Code](https://code.visualstudio.com/docs/setup/windows) is one editor option. Existing development environments do not need to be reinstalled.

Use `pnpm.cmd` on Windows to avoid changing PowerShell execution policy. Install [Git](https://git-scm.com/downloads), reopen the terminal and check `git --version`.

Astro 7.3.3 matches the version used to verify this series. An available-update notice is informational; keep the pinned version while following these examples, and test upgrades separately.

Run installation and dev from `engineering-blog`, the directory containing `package.json`.

## Create an empty project

Open PowerShell in the parent directory where you keep projects, such as your Documents folder. The commands create `engineering-blog` inside that directory:

```powershell
mkdir engineering-blog
cd engineering-blog
git init -b main
```

Use File → Open Folder to open `engineering-blog` in VS Code, then Terminal → New Terminal. Create `.gitignore` to exclude generated files and local configuration:

```text
node_modules/
dist/
.astro/
.env
.env.*
```

Add `package.json` in the same folder. This configuration includes Astro and its type-checking tools, with commands for development, building, previewing and checking:

```json
{
  "name": "engineering-blog",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "7.3.3"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.6",
    "typescript": "5.9.3"
  },
  "packageManager": "pnpm@10.32.1"
}
```

Use `dev` while editing pages. To inspect what will be published, run `build` to generate files, then serve that output with `preview`. Keeping the commands separate helps distinguish a working development page from the output that will go live.

Run this in **the project folder's terminal**:

```powershell
pnpm.cmd install
```

pnpm 10 may report “Ignored build scripts” for esbuild or sharp. This text-only example builds without approving those scripts; the warning is not an installation failure.

The first install creates `pnpm-lock.yaml`, a record of resolved dependency versions. Commit it to Git. Later, CI uses `--frozen-lockfile` to require that record to agree with package.json without updating it; do not use that option for this first install.

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

Most of this file is HTML. Astro adds the opening `---` block for code that runs while producing the page. Here it reads the deployment `base` for the article link added in the next article. Placing the file at `src/pages/index.astro` gives it the home route.

In the same project terminal, run:

```powershell
pnpm.cmd run dev
```

Open the Local URL printed in the terminal; it should show **Engineering notes**. Edit the paragraph and save to see the page update. Astro dev is running and reading the source files.

Press Ctrl+C to stop dev and localhost stops responding. The files remain in the project; run `pnpm.cmd run dev` again to continue editing.

For now, the home page keeps all its HTML in one file. Adding an article would start duplicating headings, navigation and styles. Those shared parts are what the next layout will hold.

## Check types before committing

After stopping dev, run the checker installed with the initial package.json:

```powershell
pnpm.cmd run check
```

This runs `astro check` using `@astrojs/check` and `typescript`; `astro build` alone does not check types. See [Astro’s TypeScript guide](https://v5.docs.astro.build/en/guides/typescript/).

## Save the first version

```powershell
git add package.json pnpm-lock.yaml tsconfig.json .gitignore src
git commit -m "Create Astro blog"
```

If Git asks for a name and email, configure your commit identity and retry. The next article adds content and publishes this project.
