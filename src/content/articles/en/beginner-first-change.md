---
id: beginner-first-change-en
slug: beginner-first-change
title: "Build out your website: styles, a second page and navigation"
description: "Add content and CSS to your home page, create an About page and return links, then build static website files."
locale: en
translationKey: beginner-first-change
contentType: tutorial
difficulty: beginner
topics: [web-foundations]
skills: [editing-web-pages]
prerequisiteSkills: [local-website-preview]
recommendedArticles: []
publishedAt: 2026-09-19
status: published
---

Continue in your own `my-first-website` project, created from an empty folder in the previous lesson. Add personal content, colors and a second page.

Open the folder in VS Code, run `pnpm.cmd run dev` in PowerShell, then open the Local URL shown. Paste the following code into file editors.

## Step 1: Write your own content

Open **`src/pages/index.astro`**. Replace the paragraph inside `body` with your introduction, for example:

```html
<p>Hello, I am keeping notes about learning to build websites.</p>
```

Press **Ctrl+S** and check the new paragraph in your browser. Refresh if needed. Write it in your own words, keeping the `<p>` and `</p>` tags.

## Step 2: Style the home page

At the bottom of the same file, after `</html>`, add this complete block:

```astro
<style>
  body {
    max-width: 42rem;
    margin: 3rem auto;
    padding: 0 1rem;
    font-family: system-ui, sans-serif;
    line-height: 1.7;
    color: #172b3a;
    background: #f5f7fa;
  }
  h1 {
    color: #075985;
  }
  a {
    color: #075985;
  }
</style>
```

CSS selectors name the elements to style: `body` is the page body and `h1` is the main heading. `max-width` limits text width, `margin` sets outer space, `padding` adds inner space and `line-height` sets line spacing. `color` and `background` set text and background colors. `rem` is a unit relative to the root font size. Start with this example, then change one value at a time.

**Success check:** save and see a blue heading, spaced text and a pale background. These changes exist on your computer; they are not automatically published.

## Step 3: Create an About page

**Where: VS Code's `src/pages` folder.**

Right-click → New File and name it `about.astro`. Paste this complete content and save:

```astro
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>About me</title>
  </head>
  <body>
    <h1>About me</h1>
    <p>I built this website from scratch to share what I learn.</p>
    <a href="/">Home</a>
  </body>
</html>
```

Astro uses filenames for URLs: `index.astro` is `/` and `about.astro` is `/about/`. Add `about/` to your local URL, such as `http://localhost:4321/about/`.

**Success check:** see “About me” and a “Home” link. This page has no home-page CSS yet, so it looks different. Styles inside an Astro page do not automatically apply to other pages. Later, shared layouts can collect the repeated structure.

## Step 4: Connect the pages

Return to **`src/pages/index.astro`**. After the paragraph and before `</body>`, add:

```html
<a href="/about/">About me</a>
```

`a` creates a link; `href` gives its destination; the text between the tags is the label readers see. Here `/` begins at the local site's root. A future GitHub Pages project deployment will need base-path handling; this exercise runs locally at the root.

**Success check:** save, click “About me” on the home page, then “Home” on the second page. You built your own navigation.

## Recover when something does not work

- No visible change: press Ctrl+S, check that you edited the project running in the terminal and opened its Local URL, then refresh.
- Second page returns 404: check that `about.astro` is directly inside `src/pages` and that the link spelling matches.
- Styles are missing: check both style tags, braces and semicolons, and make sure you are viewing the home page.
- Accidental damage: use Ctrl+Z and save, or restore the complete home page from the previous lesson, then add one block at a time.
- Server stopped: run `pnpm.cmd run dev` again from the same folder.

## Step 5: Generate publishable files

In PowerShell, stop dev with **Ctrl+C**, entering `Y` if asked to terminate the batch job. Then run:

```powershell
pnpm.cmd run build
```

When it finishes, enter `$LASTEXITCODE`; expect `0`. Explorer should show a new `dist` folder containing generated website files. Do not edit those files directly: the next build recreates them.

Then run:

```powershell
pnpm.cmd run preview
```

Keep the terminal open and use its displayed URL to check both pages and their return links. Preview shows the build output. After editing source files, stop preview, rebuild and start preview again to see the changes. Stop with Ctrl+C when finished.

## What have you built?

From an empty folder, you created your own Astro website: a tools list, home page, CSS, About page, links and static build. You created every source file yourself.

This stage completes a local website. Markdown articles, Git history and GitHub Pages publication are future lessons; this exercise does not publish automatically. Keep the existing intermediate architecture article for after these foundations.
