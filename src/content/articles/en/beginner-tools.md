---
id: beginner-tools-en
slug: beginner-tools
title: Your first website — understand the tools and where to type commands
description: A Windows guide for people with no coding experience. Learn what the tools do, install Node.js, pnpm and VS Code, then check that you are ready.
locale: en
translationKey: beginner-tools
contentType: tutorial
difficulty: beginner
topics: [web-foundations]
skills: [terminal-basics]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-19
status: published
---

You do not need to know how to code. This path has one concrete goal: open a website on your own computer, change a heading, and see your change in a browser.

This first lesson prepares the tools. By the end, you will have a window for commands, an editor for files, and two working version checks. The reading estimate above does not include installation or practice.

## What you need before starting

- A Windows computer with internet access and permission to install software. The instructions use Windows 11 interface names.
- The ability to download files, open folders and use a browser. A phone is not suitable for following these exercises.
- No GitHub account, Git commands, domain purchase or hosting purchase yet.

On macOS or Linux, you can read the concepts, but do not copy the Windows `.cmd` commands. This first set of hands-on instructions covers Windows only.

## What makes a website?

A browser gets page files and turns them into a screen you can read. Start with three names:

| Name | What it does | Example |
| --- | --- | --- |
| HTML | Describes the content of a page | Headings, paragraphs and links |
| CSS | Controls its appearance | Colors, fonts and spacing |
| JavaScript | Responds to interaction | Changing the theme when you use a control |

**Astro** is a tool for making websites. It turns your pages and content into files a browser can display. We will use a prepared example rather than ask you to write a website from a blank file.

**GitHub** is a website for storing and sharing code. A **repository** is a project's collection of files. **Git** records the history of file changes; it is not the same thing as GitHub. We will download a ZIP of the example, so installing Git can wait.

**GitHub Pages** serves website files to visitors on the internet. These exercises stay on your computer; they do not publish a website yet.

## Step 1: Install Node.js

Astro needs to run JavaScript work on your computer. **Node.js** makes that possible outside the browser. Here we use it to prepare and preview the site.

1. Open the [official Node.js download page](https://nodejs.org/en/download) in your browser.
2. Choose **24.x LTS**, **Windows**, and **Windows Installer (.msi)**. LTS means long-term support. This example requires Node.js 22.12 or later; this path uses 24.x consistently.
3. Choose x64 for a typical Intel/AMD computer. If unsure, check Windows **Settings → System → About → System type**. Choose ARM64 for an ARM computer.
4. Open the downloaded installer and finish its steps. Keep the default npm and PATH options; PATH helps command windows find installed tools. This example does not require the optional native-module compilation tools.
5. Close and reopen PowerShell or VS Code if either was already running, so they pick up the newly installed tools.

If a school or workplace computer requires permission to install software, ask its administrator for help before continuing.

## Step 2: Where do commands go?

Open the Windows Start menu, search for **PowerShell**, and open **Windows PowerShell**. You do not need “Run as administrator.” It may appear as a tab in Windows Terminal: Terminal is the window; PowerShell is the program receiving your commands.

You may see a prompt like this:

```text
PS C:\Users\YourName>
```

It means PowerShell is waiting for input. Do not copy that prompt. Copy only the command inside each command block below, one line at a time, and press Enter.

**Where: the PowerShell window you just opened. Any folder is fine for these checks.**

```powershell
node --version
```

`--version` asks for the version number. Success looks like a number beginning with `v24.`, for example `v24.15.0`; the last digits can differ. PowerShell can now find Node.js.

Next, enter:

```powershell
npm.cmd --version
```

**npm** is a package manager included with Node.js. A package is a ready-made piece of software that a project can use. We will use npm once to install another package manager, pnpm. A successful npm check also prints a version number.

## Step 3: Install pnpm

**pnpm** downloads the pieces a project needs, including Astro, and runs tasks defined by that project. This website specifies pnpm 10.32.1.

**Where: the same PowerShell window, in any folder.**

```powershell
npm.cmd install --global pnpm@10.32.1
```

`install` installs software; `--global` makes the command available for different projects; `@10.32.1` selects the version. This step downloads files. Wait until the `PS ...>` prompt returns, then enter:

```powershell
pnpm.cmd --version
```

The result should be `10.32.1`. We use `.cmd` to select the Windows command file explicitly instead of a `.ps1` file that PowerShell might block. When another guide says `pnpm`, it means the same tool.

This method follows the [pnpm 10 installation guide](https://pnpm.io/10.x/installation). You do not need to upgrade to the newest version or use `npm install` to install the website's packages.

## Step 4: Install the VS Code editor

**Visual Studio Code (VS Code)** edits text and code files. It is not a browser and is different from the product named Visual Studio.

Use the [official Windows installation guide](https://code.visualstudio.com/docs/setup/windows) to download the **User Installer**. Run it, complete installation, and open VS Code. You do not need to sign in, buy a service or install AI features. In the next lesson, you will use it to open the example folder.

## If something does not work

| What you see | What to try |
| --- | --- |
| `node` or `npm.cmd` is “not recognized” | Close and reopen PowerShell. If that does not help, check that Node.js installation finished with npm and PATH enabled, then reopen the window. |
| `pnpm.cmd` is “not recognized” | Check whether the installation command succeeded. Reopen PowerShell and try again. Keep the full error if it still fails rather than repeatedly reinstalling. |
| PowerShell refuses to run `npm.ps1` or `pnpm.ps1` | Use `npm.cmd` and `pnpm.cmd` as shown. You do not need to change the computer's execution policy. |
| `EACCES`, `EPERM` or access denied | Installation cannot write to its destination. Stop and ask the administrator for help; do not add `--force` to overwrite existing tools. |
| A connection error or an `ERR_...` message | Check internet access. On a managed network, ask its administrator about restrictions. Save the error text; it is not another command to run. |

When asking for help, include the command, the full error and your Node.js version. You can obscure your username in personal folder paths.

## Check before continuing

1. `node --version` prints a version beginning with `v24.`.
2. `pnpm.cmd --version` prints `10.32.1`.
3. VS Code opens.

You now know where commands go. Next, you will download the example, find the correct folder and open the website locally. Use **Next lesson** in the learning-path navigation below.
