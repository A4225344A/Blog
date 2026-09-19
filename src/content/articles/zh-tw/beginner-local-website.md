---
id: beginner-local-website-zh-tw
slug: beginner-local-website
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
updatedAt: 2026-09-20
status: published
---

這一篇從空專案建立 Astro 部落格的骨架。重點是理解檔案與建置流程，讓後續文章、版型與專案頁有清楚的位置。

範例使用 Node.js 24.x、pnpm 10.32.1 與 Astro 5.18.2。Astro 版本固定是為了讓範例可重現，不代表推薦追逐某個最新版。若工具已備妥，可直接進入專案結構；安裝與指令輸入位置放在文末。

## 先看檔案責任

<figure class="learning-diagram">
<figcaption>架構圖：開發時的檔案與瀏覽器</figcaption>
<ol role="list">
<li><strong>1. 原始檔</strong><span>src/pages 定義頁面；package.json 定義工具與工作。</span></li>
<li><strong>2. Astro dev</strong><span>pnpm run dev 啟動本機服務，讀取原始檔。</span></li>
<li><strong>3. 瀏覽器</strong><span>向 localhost 請求頁面，顯示處理後的結果。</span></li>
</ol>
<p>編輯器負責儲存檔案；終端機負責啟動工作。瀏覽器不會直接執行 .astro 檔案。</p>
</figure>

## 從空資料夾建立專案

在你選定的位置建立 `engineering-blog` 空資料夾，用編輯器開啟。先建立 `package.json`：

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

`scripts` 定義三種不同目的的工作：dev 邊開發邊檢視，build 產生網站檔案，preview 檢視已建置的結果。`dependencies` 則宣告專案要使用的 Astro 版本。

在**此資料夾的終端機**執行：

```bash
pnpm install
```

首次安裝會建立 `pnpm-lock.yaml`，所以此時不使用 `--frozen-lockfile`。把產生的 lockfile 納入 Git，後續 CI 才能按既有解析結果安裝。不要提交 `node_modules`、`dist` 或 `.astro`，可將三者加入 `.gitignore`。

建立 `tsconfig.json`：

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

strict 設定為之後的版型程式提供型別約束；它不會代替 runtime 資料驗證，也不代表執行 build 就已完成全部型別檢查。

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

最上面的兩條 `---` 之間是在 Astro 執行的程式碼。這裡先取得部署 base，下一篇連結文章時會使用它。下面的 HTML 定義讀者看到的內容；首頁網址來自 `index.astro` 的位置，而不是 h1 的文字。

在同一個專案終端機執行：

```bash
pnpm run dev
```

用瀏覽器開啟終端機顯示的 Local 網址。成功時會看到 **Engineering notes**。修改段落後儲存，再觀察畫面；不需要重新安裝套件。

## 如何確認自己理解了？

只改 `title`，瀏覽器分頁名稱會改；只改 `h1`，頁面大標題才會改。檔名仍是 index.astro，因此路徑仍是首頁。

停止 dev 後檔案仍然存在，但 localhost 不再有服務回應。重新啟動 dev 就能繼續。這是本機服務的生命週期，與是否曾把程式放到 GitHub 是兩回事。

目前資料夾應有 package.json、pnpm-lock.yaml、tsconfig.json 與 src/pages/index.astro。下一篇會把文章內容與共用版型分開。

## 前置準備與常見問題

Windows 可用 [Node.js 官方下載頁](https://nodejs.org/en/download) 安裝 24.x，再透過 `npm.cmd install --global pnpm@10.32.1` 安裝本系列使用的 pnpm。編輯器可用 [VS Code](https://code.visualstudio.com/docs/setup/windows)。已經有自己的開發環境就不必重裝。

在 VS Code 用 File → Open Folder 開啟專案，再選 Terminal → New Terminal。Windows PowerShell 可將本文的 `pnpm` 寫成 `pnpm.cmd`，不需要放寬系統執行原則。

若找不到 package.json，先確認終端機的目前資料夾；404 則確認檔案真的是 src/pages/index.astro。pnpm 10 可能提示忽略部分安裝腳本，本系列純文字範例不需要直接批准所有腳本；若建置失敗，保留實際錯誤再處理。
