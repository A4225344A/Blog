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

先把文章列表、搜尋和雙語切換放一邊。一個只有首頁的 Astro 專案，需要哪些檔案？

這裡從空的 `engineering-blog` 資料夾開始，逐一放進設定和首頁。範例固定使用 Node.js 24.x、pnpm 10.32.1、Astro 5.18.2；Windows 的安裝方式留在文末。

## 開發時，Astro 在中間做了什麼

<figure class="learning-diagram">
<figcaption>架構圖：開發時的檔案與瀏覽器</figcaption>
<ol role="list">
<li><strong>1. 原始檔</strong><span>src/pages 定義頁面；package.json 定義工具與工作。</span></li>
<li><strong>2. Astro dev</strong><span>pnpm run dev 啟動本機服務，讀取原始檔。</span></li>
<li><strong>3. 瀏覽器</strong><span>向 localhost 請求頁面，顯示處理後的結果。</span></li>
</ol>
<p>瀏覽器收到的是 Astro 處理後的頁面；修改原始檔後，開發服務會更新畫面。</p>
</figure>

## 從空資料夾建立專案

建立資料夾、用編輯器開啟後，先放入 `package.json`。這份設定只裝 Astro，並留下開發、建置和預覽三個入口：

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

```bash
pnpm run dev
```

用瀏覽器開啟終端機顯示的 Local 網址，應該會看到 **Engineering notes**。可以直接改下面的段落，儲存後看畫面更新。這時運作的是圖中的 Astro dev，它持續讀取原始檔。

按 Ctrl+C 結束 dev，localhost 就停止回應。檔案仍留在專案裡，下次執行 `pnpm run dev` 可以接著改。

首頁的 HTML 先留在這個檔案。如果再加一篇文章，標題、導覽和樣式就開始重複了；接下來會把這些共用部分抽成版型。

## Windows 環境補充

Windows 可用 [Node.js 官方下載頁](https://nodejs.org/en/download) 安裝 24.x，再透過 `npm.cmd install --global pnpm@10.32.1` 安裝本系列使用的 pnpm。編輯器可用 [VS Code](https://code.visualstudio.com/docs/setup/windows)。已經有自己的開發環境就不必重裝。

在 VS Code 用 File → Open Folder 開啟專案，再選 Terminal → New Terminal。Windows PowerShell 可將本文的 `pnpm` 寫成 `pnpm.cmd`，不需要放寬系統執行原則。

執行安裝和 dev 時，終端機的目前位置都要在 `engineering-blog`，也就是放著 `package.json` 的那一層。
