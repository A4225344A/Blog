---
id: beginner-local-website-zh-tw
slug: astro-project-setup
title: "從空專案搭建 Astro 部落格"
description: "從空資料夾開始，安裝 Astro、建立首頁，跑起本機開發環境並提交第一個版本。"
locale: zh-TW
translationKey: beginner-local-website
contentType: tutorial
difficulty: intermediate
topics: [web-foundations]
skills: [local-website-preview]
prerequisiteSkills: ["static-site-delivery"]
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-24
status: published
---

先做出一個能在瀏覽器開啟的首頁。需要的檔案不多：`package.json`、TypeScript 設定，以及一個 `.astro` 頁面。

這裡從空的 `engineering-blog` 資料夾開始，逐一放進設定和首頁。範例固定使用 Node.js 24.x、pnpm 10.32.1、Astro 7.3.3。本系列操作指令以 Windows PowerShell 為準。macOS／Linux 可將 `pnpm.cmd`、`npm.cmd` 改為 `pnpm`、`npm`；後續 PowerShell 的環境變數設定與清除指令，則需換成所用 shell 的語法。

## 先準備工具

Windows 可用 [Node.js 官方下載頁](https://nodejs.org/en/download) 安裝 24.x，再透過 `npm.cmd install --global pnpm@10.32.1` 安裝本系列使用的 pnpm。編輯器可用 [VS Code](https://code.visualstudio.com/docs/setup/windows)。已經有自己的開發環境就不必重裝。

Windows 使用 `pnpm.cmd`，不需要放寬 PowerShell 執行原則。另請安裝 [Git](https://git-scm.com/downloads)，重新開啟終端機並確認 `git --version`。

範例使用 Astro 7.3.3，方便重現相同結果。安裝時即使跳出新版提示，也先保留這個版本。

執行安裝和 dev 時，終端機的目前位置都要在 `engineering-blog`，也就是放著 `package.json` 的那一層。

## 從空資料夾建立專案

先在 VS Code 用 File → Open Folder 開啟預計存放專案的父資料夾，例如自己的「文件」資料夾。選 Terminal → New Terminal，終端機會從這個資料夾啟動；若不是 PowerShell，可從終端機旁的下拉選單選擇 PowerShell。以下會在目前位置建立 `engineering-blog`：

```powershell
mkdir engineering-blog
cd engineering-blog
git init -b main
```

在 VS Code 用 File → Open Folder 開啟 `engineering-blog`，再選 Terminal → New Terminal。在 VS Code 左側檔案總管選取專案根目錄，按「新增檔案」並輸入 `.gitignore`，讓版本控制忽略可重建的檔案與本機設定：

```text
node_modules/
dist/
.astro/
.env
.env.*
```

在同一個資料夾放入 `package.json`。這份設定包含 Astro 與型別檢查工具，提供開發、建置、預覽與檢查指令：

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

改頁面時用 `dev`，儲存後就能看到變化。要檢查上線的檔案，先跑 `build`，再用 `preview` 開啟建置結果。

在**此資料夾的終端機**執行：

```powershell
pnpm.cmd install
```

pnpm 10 可能顯示 esbuild 的「Ignored build scripts」提醒。本篇純文字範例不批准這些腳本也能建置；這項提醒不代表安裝失敗。

首次安裝會建立 `pnpm-lock.yaml`，記下實際安裝的相依版本；把它納入 Git。後續 CI 才使用 `--frozen-lockfile`，要求紀錄與 package.json 一致且不更新它。第一次安裝時不要加這個選項。

建立 `tsconfig.json`：

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

`strict` 會啟用較嚴格的 TypeScript 檢查，下一篇的版型參數也會用到。稍後會執行 `check` 檢查型別。

## 建立首頁

在 VS Code 左側檔案總管，先在專案根目錄新增 `src` 資料夾，再於其中新增 `pages` 資料夾，最後在 `pages` 裡新增 `index.astro`。完整路徑是 `src/pages/index.astro`，內容如下。程式碼中的英文是範例文案，可換成自己的文字：

```astro
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

這個頁面先用一般 HTML 就能完成。檔案放在 `src/pages/index.astro`，網址就對應首頁。

在同一個專案終端機執行：

```powershell
pnpm.cmd run dev
```

用瀏覽器開啟終端機顯示的 Local 網址，應該會看到 **Engineering notes**。可以直接改下面的段落，儲存後看畫面更新。這時運作的是 Astro dev，它持續讀取原始檔。

按 Ctrl+C 可以停止開發伺服器。下次要繼續修改，再執行 `pnpm.cmd run dev`。

## 提交前執行型別檢查

停止 dev 後，執行一開始隨 package.json 安裝的檢查工具：

```powershell
pnpm.cmd run check
```

這會透過 `@astrojs/check` 與 `typescript` 執行 `astro check`；只跑 `astro build` 不會檢查型別。參考 [Astro TypeScript 說明](https://docs.astro.build/en/guides/typescript/)。

## 保存第一個版本

```powershell
git add package.json pnpm-lock.yaml tsconfig.json .gitignore src
git commit -m "Create Astro blog"
```

如果 Git 要求姓名與 email，依照提示設定自己的提交身分後重試。下一篇會加入 Markdown 文章和共用版型。
