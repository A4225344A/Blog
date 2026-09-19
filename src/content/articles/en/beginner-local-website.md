---
id: beginner-local-website-en
slug: beginner-local-website
title: Open a website on your computer — download, find the folder and start Astro
description: Download a fixed teaching version of this website, use the PowerShell terminal in VS Code to install its packages, and confirm that the local site works.
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

Your goal is to see the website running on your own computer, rather than visiting the public site. You do not need to edit code yet.

First complete the previous lesson: Node.js 24.x, pnpm 10.32.1 and VS Code should be ready. If PowerShell is still unfamiliar, use **Previous lesson** below to finish preparing your tools.

## Step 1: Download and extract the example

We will use [this website's public repository](https://github.com/A4225344A/Blog). The download below is fixed to a released example version, so the files match the instructions instead of changing whenever the site is updated.

1. In your browser, select [Download the exercise ZIP](https://github.com/A4225344A/Blog/archive/8974f88ce3d6d5fb24009e4844405caa5af13b17.zip). No GitHub sign-in is needed.
2. Open Windows File Explorer and find your Downloads folder.
3. Right-click the downloaded `.zip` and choose **Extract All**. Finish extraction; do not edit files inside the ZIP window.
4. Open the extracted folder. You may need to open another folder beginning with `Blog-` until you see `package.json`, `pnpm-lock.yaml` and `src` together.
5. Rename the folder **containing those three items** to `website-practice`. Keep it somewhere you can find. This is your project folder. If that name already exists, choose a new name rather than overwrite existing work.

The folder should look roughly like this, alongside other files:

```text
website-practice/
  package.json
  pnpm-lock.yaml
  src/
    pages/
      index.astro
```

A ZIP is a snapshot of files. It does not include Git history or automatically update to match the live site. GitHub explains this in its [source archive guide](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives).

## Step 2: Open the correct folder in VS Code

1. Open VS Code.
2. Select **File → Open Folder**.
3. Select `website-practice` and confirm the folder selection.
4. If a Workspace Trust prompt appears, verify that you opened the public example above before choosing to trust it. Do not do this automatically for downloads from unknown sources.

**Success check:** the Explorer on the left directly lists `package.json`, `pnpm-lock.yaml` and `src`. If it only lists another `Blog-...` folder, you opened the outer folder. Open the inner project folder instead.

`package.json` lists project tools and tasks; `pnpm-lock.yaml` records package versions. You only need to find them for now, not edit them.

## Step 3: Open PowerShell in the project

In VS Code, choose **Terminal → New Terminal**. A command area opens below the editor.

Check that the terminal tab says **PowerShell**. If it uses a different program, use the dropdown beside the terminal controls to open a PowerShell tab. Commands go there, not in a source file or the browser address bar.

**Where: the PowerShell terminal at the bottom of VS Code.** Run one line at a time:

```powershell
Get-Location
```

This shows the terminal's current folder, usually ending in `website-practice`. Then check:

```powershell
Test-Path .\package.json
```

The result should be `True`. `.\` means the current folder. If you get `False`, do not install yet: use File → Open Folder to select the correct folder, close the old terminal tab, and create a new one.

## Step 4: Install the website's packages

**Where: the same terminal, after the previous check returned `True`.**

```powershell
pnpm.cmd install --frozen-lockfile
```

This downloads Astro and other tools according to the project's list. They go into tool-managed locations such as `node_modules`. `--frozen-lockfile` means to follow the existing version list without rewriting it.

The first installation needs internet access and can take a while. When finished, you will normally see `Done in ...` and the `PS ...>` prompt again. Then enter:

```powershell
$LASTEXITCODE
```

It should print `0`, meaning the installation command succeeded. Download messages or `ERR_...` messages are not a success check. If the code is not `0`, resolve the problem below before starting the website.

Use pnpm for this project's packages. Do not also run `npm install` in the same project or manually edit `node_modules`.

## Step 5: Start the site and open your browser

**Where: PowerShell in the same project folder.**

```powershell
pnpm.cmd run dev
```

`run dev` runs the task called `dev` from `package.json`. This example uses that task to start Astro's local development server. You may see:

```text
Local  http://localhost:4321/
```

**Do not wait for this command to finish.** It stays running to serve the website, so the `PS ...>` prompt does not return yet. Leave it open, copy the actual Local URL shown, and open that address in your browser.

`localhost` means this computer. `4321` is the port number used to find the service on it. Astro may select a different number if that port is occupied; use the address it actually prints. This is the [Astro 5 development workflow](https://v5.docs.astro.build/en/develop-and-build/).

**Success check:** you should see **Engineering Knowledge Platform** with **繁體中文** and **English** links. This is the language-selector page. Stay on that page; the next lesson changes its heading.

The address should start with `http://localhost:`, not `https://a4225344a.github.io/Blog/`. The latter is the public website and will not show changes you make on your computer.

## Common problems and recovery

| What happens | What to do |
| --- | --- |
| No `package.json`, or `ERR_PNPM_NO_PKG_MANIFEST` | You are in the wrong folder. Repeat steps 2 and 3, including the `Test-Path` check. |
| Package version or lockfile mismatch | Check that `pnpm.cmd --version` is `10.32.1`. If you changed downloaded files, extract a fresh copy into another empty folder, preserving your work. Do not delete the lockfile or add `--force`. |
| Download failure | Check internet access and keep the error text. Once the connection works, rerun installation in the same folder. |
| Browser cannot connect | Confirm `run dev` is still running and use its actual Local address and port. |
| Two `W_ARTICLE_NO_PROJECT` warnings | The sample's two Articles are not attached to a Project. These are known content warnings, not an installation failure. Stop to investigate `E_...` or `ERR_...` messages. |
| Search has no results | Development mode has not generated a search index. That does not affect this exercise. Search needs a production build; return to the language selector for now. |

To stop the site, focus its terminal and press **Ctrl+C**. If asked to terminate the batch job, enter `Y` and press Enter. The `PS ...>` prompt returns when it stops. Next time, run `pnpm.cmd run dev` in the same folder; you do not need to reinstall packages every time.

## Check before continuing

You can see the language selector at a `localhost` address, identify the project folder that serves it, and stop or restart it. The next lesson changes a file so the page visibly changes too.
