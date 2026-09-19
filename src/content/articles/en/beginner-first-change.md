---
id: beginner-first-change-en
slug: beginner-first-change
title: Your first website change — edit a heading, save and see the result
description: Find the language-selector page in VS Code, change only its heading, check the browser and undo the change. Learn why local editing does not publish anything.
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

This lesson changes one line of text. You will see the connection between a file, saving it, and the browser page, then learn to put the original text back.

Use the `website-practice` example folder from the previous lesson, not this public website. VS Code should have that folder open, with `pnpm.cmd run dev` running in its PowerShell terminal. If you stopped it, start it again and open the Local URL shown in the terminal.

## Step 1: Find the file for this page

**Where: VS Code's file Explorer on the left, not the terminal.**

Expand `src`, then `pages`, and open **`index.astro` directly inside `pages`**.

Its location is:

```text
website-practice/src/pages/index.astro
```

Do not select the other `index.astro` inside `[locale]`. That file handles localized pages; we are editing the outer language-selector page.

`.astro` is Astro's page-file format. In this example, `src/pages/index.astro` corresponds to the site's root `/`, the language selector you just opened. You do not need to understand every symbol in the file yet.

## Step 2: Change only the text inside the heading

**Where: the `index.astro` editor in the middle of VS Code.**

Find this line:

```html
<h1>Engineering Knowledge Platform</h1>
```

`<h1>` and `</h1>` are HTML tags marking the page's main heading. Keep both tags and replace only the text between them:

```html
<h1>This is my first website</h1>
```

Leave the other lines alone for now, particularly the `---` and `import` lines at the top. This is a file edit, not a command: do not paste that HTML into PowerShell.

Press **Ctrl+S** to save. An unsaved editor tab usually has a small dot beside its name; that dot disappears after saving.

## Step 3: Check the browser

Return to your browser. Use this development server's root address, for example `http://localhost:4321/`, not `/zh-tw/`, `/en/`, or the public GitHub website address.

In development mode, Astro normally updates the page after a save. If it does not, refresh once. See the [Astro 5 development guide](https://v5.docs.astro.build/en/develop-and-build/) for this behavior.

**Success means the large heading now reads “This is my first website.”** The language links should still be there. The browser tab title may still say “工程知識平台”; we changed the page's `h1`, not its tab title. That is expected.

You just edited a source file, saved it, and let Astro serve the result to the browser. This does not upload a change to the author's GitHub repository or change the public website other people see.

## If the page did not change

Check these in order:

1. **Did you save?** Return to VS Code and press Ctrl+S.
2. **Is it the right file?** Check `src/pages/index.astro`, not the file inside `[locale]` or another extracted copy.
3. **Is it the right URL?** Use the terminal's Local URL and root path `/`. If Astro chose another port number, follow that number.
4. **Is the server still running?** If it stopped, run `pnpm.cmd run dev` again in that project folder.
5. **Is there an error page?** Restore the complete original line, `<h1>Engineering Knowledge Platform</h1>`, and save. Check for missing `<`, `>` or the closing `/`.

If you still need help, record the full file location, browser URL and first error in the terminal. Those details make it easier to diagnose than “the website broke.”

## Step 4: Undo and restart

In the same file, replace the heading text with `Engineering Knowledge Platform` again. Keep both `h1` tags and press Ctrl+S.

Check that the browser heading also returns to the original. While the editor is still open, Ctrl+Z can also undo your edit, followed by saving. Typing the original line back does not depend on undo history.

Finally, focus the terminal and press Ctrl+C to stop the site. If asked to terminate the batch job, enter `Y`. Your files stay on your computer. Next time, reopen this folder and run `pnpm.cmd run dev` to continue.

## What you have completed

- Prepared the tools and found where commands go.
- Located a project folder and started a website on your computer.
- Edited, saved, checked and restored one line of page content.

This is your first complete exercise. You do not need content models, CI or SEO yet. Try changing the heading again until you can find the file and use the correct window without following each step.

This first set of lessons ends here. Markdown writing, Git history and publishing with GitHub Pages are future learning goals, not lessons already provided by this path. The existing engineering knowledge platform Article retains its intermediate depth. Build familiarity with basic HTML, JavaScript and project commands before moving on to it.
