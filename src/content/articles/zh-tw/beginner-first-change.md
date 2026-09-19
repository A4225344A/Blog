---
id: beginner-first-change-zh-tw
slug: beginner-first-change
title: "加入文章、版型與部署流程"
description: "將 Markdown 與共用版型分離，處理 GitHub Pages base，並理解本站驗證與人工批准的交付流程。"
locale: zh-TW
translationKey: beginner-first-change
contentType: tutorial
difficulty: intermediate
topics: [web-foundations]
skills: [astro-content-modeling]
prerequisiteSkills: [local-website-preview]
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-20
status: published
---

有首頁還不等於有方便維護的部落格。這一篇把文章內容與版型分開，產生可部署的網站，再說明本站如何驗證與發布它。

下面延續上一篇的小型 `engineering-blog` 專案。它是理解 Astro 的最小範例，並不是本站完整 Content Graph 的替代品。

## 內容、版型與交付的責任

<figure class="learning-diagram">
<figcaption>架構圖：從寫文章到讀者收到頁面</figcaption>
<ol role="list">
<li><strong>1. Markdown ＋版型</strong><span>文章寫內容，版型統一標題、導覽與樣式。</span></li>
<li><strong>2. Astro build</strong><span>把內容與版型組合成 dist 靜態檔案。</span></li>
<li><strong>3. CI 驗證與人工批准</strong><span>本站先驗證，main 通過後等待部署審批。</span></li>
<li><strong>4. GitHub Pages</strong><span>發布已驗證的產物，不在正式站重新建置。</span></li>
</ol>
<p>圖中的 CI 與審批是本站已實作的流程；在自己的新儲存庫仍需建立 workflow 並設定 environment。</p>
</figure>

## 用 Markdown 寫文章

先建立 `src/layouts/PostLayout.astro`。版型是共用的頁面外框，文章正文放進 slot：

```astro
---
interface Props {
  frontmatter: { title: string; description: string };
}
const { frontmatter } = Astro.props;
const base = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{frontmatter.title}</title>
    <meta name="description" content={frontmatter.description} />
  </head>
  <body>
    <main>
      <a href={base}>Home</a>
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>
      <slot />
    </main>
  </body>
</html>
<style>
  main { max-width: 70ch; margin: 3rem auto; padding: 0 1rem; line-height: 1.8; }
</style>
```

`Props` 宣告此版型預期收到的標題與描述。`slot` 是 Markdown 正文插入的位置；CSS 放在版型內，使用該版型的文章會共享這份版面。

接著建立 `src/pages/posts/build-notes.md`：

```markdown
---
layout: ../../layouts/PostLayout.astro
title: "Why this blog is static"
description: "A note on content delivery and maintenance."
---

## Context

This blog publishes articles and project notes.

## Decision

Generate pages before publishing and serve the static output.

## Tradeoff

Content changes need a new build.
```

frontmatter 是兩條 `---` 中間的資料；layout 指向剛建立的共用版型。正文從二級標題開始，因為版型已經輸出 h1。這種用法對應 [Astro 的 Markdown 頁面與 layout 機制](https://v5.docs.astro.build/en/guides/markdown-content/#frontmatter-layout-property)。

在首頁 `src/pages/index.astro` 的段落下加入：

```astro
<a href={`${base}posts/build-notes/`}>Read the build notes</a>
```

儲存並啟動 dev，確認首頁連得到文章、文章顯示標題與正文，也能回首頁。Windows 可用 Ctrl+S 儲存；終端機的 pnpm 可寫成 pnpm.cmd。

## 小範例與本站實作的差別

上面的 Markdown 位於 pages，檔案直接對應網址，適合看清內容與版型關係。**本站正式文章放在 src/content/articles**，透過 Content Collections 與 schema 驗證，再由路由統一渲染。

正式內容的 ID 是身分、slug 是網址，兩者分開。文章系列由 LearningPath 擁有排序，專案相關文章由 Project 擁有；反向關聯由建置計算。不要為了在兩個地方顯示同一篇文章，就複製兩份正文。

這裡採用簡單範例來說明 Astro，不會改動本站既有的內容 ownership。文章增加、需要雙語與關聯時，再使用已實作的完整模型。

## GitHub Pages 的 base 不能省略

建立 `astro.config.mjs`：

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.SITE_BASE ?? '/',
});
```

個人首頁型儲存庫使用根路徑 `/`；例如名為 `Blog` 的專案型網站則使用 `/Blog/`。site 放網域來源，base 放路徑。上面的環境變數設定預期包含前後斜線；這個最小範例沒有本站完整的 base 正規化驗證。

例如在 Windows PowerShell 為自己的帳號設定：

```powershell
$env:SITE_URL = 'https://YOUR_USERNAME.github.io'
$env:SITE_BASE = '/Blog/'
pnpm.cmd run build
pnpm.cmd run preview
```

把 YOUR_USERNAME 與 Blog 換成自己的帳號和儲存庫。先用 Ctrl+C 停止原本 dev，再執行這些指令。用 preview 顯示的網址檢查首頁和文章往返；連結使用 BASE_URL，所以不會固定指向網域根目錄。新增圖片時也要同樣考慮 base。

build 成功後會有 `dist`。preview 只提供這次的產物；修改原始檔後，要重新 build 才會更新。以上仍是本機檢查，沒有上傳動作。

## 本站如何發布：先驗證，再批准

這個儲存庫的單一 CI workflow 把驗證和部署分成兩個 job：

1. PR 與 main 都執行 frozen install、內容驗證、測試、型別檢查及建置；PR 不部署。
2. main 通過後，上傳該次驗證過的產物。
3. deploy 等待 github-pages environment 的人工批准。
4. 批准後再次確認 main SHA，部署同一次 CI 的產物，不另做一份建置。

在自己的新儲存庫，需先提交原始檔與 lockfile、建立 GitHub Actions workflow，將 Pages 來源選為 GitHub Actions，並為 github-pages environment 設定 Required reviewers。YAML 只引用 environment，不能自己建立審批人。

這個最小範例目前只有 dev、build、preview；**不能直接照搬本站的測試命令而不建立對應腳本**。部署設定可對照 [本站 workflow](https://github.com/A4225344A/Blog/blob/main/.github/workflows/ci.yml)，並參考 [Astro GitHub Pages 部署說明](https://docs.astro.build/en/guides/deploy/github/)。本文說明的是交付設計，不代表已替讀者的帳號完成部署。

## 寫作比增加功能更重要

到這裡，最小部落格有了首頁、文章、共用版型與可檢查的靜態產物。接著可以把自己的專案拆成「背景、決策、實作、驗證與限制」來寫。架構圖說明系統關係，程式碼說明如何落地，兩者互相補充。

正式站的搜尋、雙語、SEO 與內容關聯另由現有架構文章深入說明。這個系列的重點，是把全端工程師的實作經驗整理成可閱讀、可維護的部落格。
