---
id: beginner-local-website-en
slug: beginner-local-website
title: "Build a website from an empty folder: create files and start Astro"
description: "Create your own project folder, package.json and first Astro page, then see your website in a browser."
locale: en
translationKey: beginner-local-website
contentType: tutorial
difficulty: beginner
topics: [web-foundations]
skills: [local-website-preview]
prerequisiteSkills: [terminal-basics]
recommendedArticles: []
publishedAt: 2026-09-19
status: published
---

Start with an empty folder and create each file yourself. Complete the previous lesson's Node.js 24.x, pnpm 10.32.1 and VS Code setup on Windows first.

## Step 1: Create an empty folder

In Windows File Explorer, open Documents and right-click → New → Folder. Name it `my-first-website`. If it already exists, choose a new name without overwriting files. In VS Code, choose **File → Open Folder** and select your new folder. If asked about trust, verify that it is the folder you created before trusting it.

**Success check:** Explorer shows your folder with no files inside. You need neither a GitHub account nor this site's source code.

## Step 2: Create package.json

**Where: VS Code's Explorer and central editor.**

Right-click the folder → **New File**, name it `package.json` without a `.txt` suffix, and paste this complete content into the editor. Press **Ctrl+S**:

```json
{
  "name": "my-first-website",
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

This is your tools list. `name` names the project; `private` prevents accidental package publication; `type` selects the JavaScript module format; `scripts` names available tasks; `dependencies` specifies Astro's version. Keep the braces, straight double quotes and commas. JSON cannot have a comma after the final item.

The lesson pins Astro 5.18.2 to make its behavior explicit; it does not claim this is the latest version.

## Step 3: Install Astro

Choose **Terminal → New Terminal**. Check that the tab is PowerShell; otherwise open PowerShell from the terminal dropdown.

**Where: VS Code's lower PowerShell terminal. Enter one command at a time and press Enter. Do not paste commands into the editor.**

```powershell
Get-Location
```

It should show your new folder. Then enter:

```powershell
Test-Path .\package.json
```

Expect `True`. If it says `False`, open the correct folder, close the old terminal and open a new one. Once confirmed, enter:

```powershell
pnpm.cmd install
```

This downloads Astro and its dependencies, creating `node_modules` and the version record `pnpm-lock.yaml`. There is no lockfile on this first install, so do not use `--frozen-lockfile` yet. Keep the generated lockfile; that option can be used when reinstalling recorded dependencies later.

Wait for the `PS ...>` prompt to return, then enter:

```powershell
$LASTEXITCODE
```

**Success check:** it prints `0` and Explorer contains `node_modules` and `pnpm-lock.yaml`. Address errors before continuing. Do not edit `node_modules` yourself.

## Step 4: Write your first page

**Where: VS Code's Explorer.**

Right-click your project folder → New Folder to create `src`. Inside it, create a `pages` folder. Inside `pages`, right-click → New File to create `index.astro`.

Its full location must be **`src/pages/index.astro`**. Paste this complete content and press **Ctrl+S**:

```astro
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>My first website</title>
  </head>
  <body>
    <h1>My first website</h1>
    <p>I am learning to build a website from scratch.</p>
  </body>
</html>
```

`html` wraps the page and `lang` identifies its language. In `head`, `title` names the browser tab and UTF-8 selects the text encoding. In `body`, `h1` is the visible main heading and `p` is a paragraph. Closing tags have a slash, such as `</p>`.

Astro uses `src/pages/index.astro` as the home page. This small site does not need other configuration files yet. See [Astro 5's manual setup guide](https://v5.docs.astro.build/en/install-and-setup/#manual-setup).

## Step 5: Start the website you wrote

**Where: the same project's PowerShell terminal.**

```powershell
pnpm.cmd run dev
```

This runs the `dev` task you defined in `scripts`. When the terminal shows something like `Local http://localhost:4321/`, copy its actual URL into your browser.

**Do not wait for the command to finish.** It keeps serving your local site. Leave the terminal open. `localhost` means your computer; the number is the service's port. If 4321 is occupied, use the number shown.

**Success check:** you see “My first website” and “I am learning to build a website from scratch.” Plain text is expected. Next you will add colors and a second page.

## Recover from common problems

| Symptom | Next step |
| --- | --- |
| Cannot find package.json | Return to step 3 and check the folder and `Test-Path`. |
| JSON parse error | Check the braces, straight quotes and commas in step 2. Do not paste the code fence's triple backticks into the file. |
| Download failure | Keep the error, check the connection and retry `pnpm.cmd install`. Do not add `--force`. |
| Ignored build scripts warning | pnpm 10 restricts dependency installation scripts. These text-only pages were successfully built with that restriction; do not approve all scripts automatically. If a later command fails, keep its error for investigation. |
| 404 page | Check the saved filename is `src/pages/index.astro`, not `index.astro.txt`. |
| Cannot connect | Keep dev running and use the terminal's actual URL and port. |
| Page syntax error | Restore the complete index.astro from step 4 and save. |

To stop, focus the terminal and press **Ctrl+C**; enter `Y` if asked to terminate the batch job. Run `pnpm.cmd run dev` from the same folder to restart, without reinstalling.

## Completion check

You created a tools list and home page from an empty folder and saw your own website. Keep dev running and use “Next lesson” below to build a second page.
