---
id: beginner-local-website-zh-tw
slug: astro-project-setup
title: "從空專案搭建 Astro 部落格"
description: "建立最小專案、理解檔案路由與開發流程，為文章與共用版型準備結構。"
locale: zh-TW
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

先把文章列表、搜尋和雙語切換放一邊。一個只有首頁的 Astro 專案，需要哪些檔案？

這裡從空的 `engineering-blog` 資料夾開始，逐一放進設定和首頁。範例固定使用 Node.js 24.x、pnpm 10.32.1、Astro 5.18.2。以下使用 PowerShell，所有 pnpm 指令統一寫為 `pnpm.cmd`。

## 先準備工具

Windows 可用 [Node.js 官方下載頁](https://nodejs.org/en/download) 安裝 24.x，再透過 `npm.cmd install --global pnpm@10.32.1` 安裝本系列使用的 pnpm。編輯器可用 [VS Code](https://code.visualstudio.com/docs/setup/windows)。已經有自己的開發環境就不必重裝。

本文使用 `pnpm.cmd`，不需要放寬 PowerShell 執行原則。

執行安裝和 dev 時，終端機的目前位置都要在 `engineering-blog`，也就是放著 `package.json` 的那一層。

## 從空資料夾建立專案

安裝 [Git](https://git-scm.com/downloads)，重新開啟終端機，確認 `git --version`。先執行：

```powershell
mkdir engineering-blog
cd engineering-blog
git init -b main
```

在 VS Code 用 File → Open Folder 開啟 `engineering-blog`，再選 Terminal → New Terminal。建立 `.gitignore`，讓版本控制忽略可重建的檔案與本機設定：

```text
node_modules/
dist/
.astro/
.env
.env.*
```

在同一個資料夾放入 `package.json`。這份設定只裝 Astro，並留下開發、建置和預覽三個入口：

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

平常改頁面會用到 `dev`。等要看發布結果時，再用 `build` 產生檔案，接著用 `preview` 開啟那份產物。把三個命令分開，才不會把開發畫面當成最後上線的結果。

在**此資料夾的終端機**執行：

```powershell
pnpm.cmd install
```

pnpm 10 可能顯示 esbuild 或 sharp 的「Ignored build scripts」提醒。本篇純文字範例不批准這些腳本也能建置；這項提醒不代表安裝失敗。

Lockfile（`pnpm-lock.yaml`）記下實際安裝的相依版本；`--frozen-lockfile` 會要求這份紀錄與 package.json 一致，不偷偷更新它。

首次安裝會建立 `pnpm-lock.yaml`，所以此時不使用 `--frozen-lockfile`。把產生的 lockfile 納入 Git，後續 CI 才能按既有解析結果安裝。

建立 `tsconfig.json`：

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

我把 TypeScript 設定選為 strict，之後寫版型的 props 就沿用這個設定。型別檢查要另外執行；`astro build` 負責產生網站，並不執行完整型別檢查。

## 建立首頁

建立 `src/pages/index.astro`，內容如下。程式碼中的英文是範例文案，可換成自己的文字：

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

這個檔案的大部分就是 HTML。Astro 多了最上面的 `---` 區塊，可以在產生頁面時執行程式；這裡先讀取部署路徑 `base`，留給下一篇的文章連結使用。放在 `src/pages/index.astro`，它就對應首頁。

在同一個專案終端機執行：

```powershell
pnpm.cmd run dev
```

用瀏覽器開啟終端機顯示的 Local 網址，應該會看到 **Engineering notes**。可以直接改下面的段落，儲存後看畫面更新。這時運作的是 Astro dev，它持續讀取原始檔。

按 Ctrl+C 結束 dev，localhost 就停止回應。檔案仍留在專案裡，下次執行 `pnpm.cmd run dev` 可以接著改。

首頁的 HTML 先留在這個檔案。如果再加一篇文章，標題、導覽和樣式就開始重複了；接下來會把這些共用部分抽成版型。

## 保存第一個版本

```powershell
git add package.json pnpm-lock.yaml tsconfig.json .gitignore src
git commit -m "Create Astro blog"
```

如果 Git 要求姓名與 email，依照提示設定自己的提交身分後重試。下一篇會從這個專案加入文章並發布。
