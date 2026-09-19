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

寫第二篇文章時，我不想再複製一份 HTML，然後逐個修改 title、標題和正文。頁面外框應該共用，文章檔案裡留下要寫的內容就好。

延續前面的 `engineering-blog`，先用一份 Markdown 和一個 Astro 版型試這件事。文末再把本機產物接到本站的發布流程；範例專案和本站的差異，也會在用到的地方交代。

## 把重複的 HTML 留給版型

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

用 Ctrl+S 儲存，啟動 dev 後從首頁點進文章。標題、描述和正文會一起出現，但它們來自兩個檔案：Markdown 提供文字，版型負責把它們放進頁面。回首頁的連結也放在版型裡，以後新增文章可以共用。

## 文章多了以後，檔案位置也要考慮

上面的 Markdown 位於 pages，檔案直接對應網址，適合看清內容與版型關係。**本站正式文章放在 src/content/articles**，透過 Content Collections 與 schema 驗證，再由路由統一渲染。

本站還要把同一篇文章放進主題、文章系列和專案頁。這些頁面都連回同一份正文。系列的順序記在 LearningPath，專案收錄哪些文章則記在 Project，建置時再算出文章被哪些地方引用。

因此，內容的固定 ID 和網址用的 slug 也分開存放。修改網址時，系列與專案仍用原本的 ID 找文章。眼前只有一篇 Markdown 的範例，先不加這套關聯模型。

## 本機能連到文章，放到 /Blog/ 呢？

剛才的連結用了 `base`。原因在這裡：本站部署在 `/Blog/`，文章網址也要從這個子路徑開始。如果把連結寫死成 `/posts/build-notes/`，瀏覽器會直接去網域根目錄找，跳過 `/Blog/`。

在範例新增 `astro.config.mjs`，讓建置時可以指定這個路徑：

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

## 發布的是哪一份檔案

本機看過結果之後，部署還有一個要確認的地方：最後上線的檔案，是否就是通過檢查的那一份？本站把流程安排成下面這樣。

<figure class="learning-diagram">
<figcaption>架構圖：從寫文章到讀者收到頁面</figcaption>
<ol role="list">
<li><strong>1. Markdown ＋版型</strong><span>文章寫內容，版型統一標題、導覽與樣式。</span></li>
<li><strong>2. Astro build</strong><span>把內容與版型組合成 dist 靜態檔案。</span></li>
<li><strong>3. CI 驗證與人工批准</strong><span>本站先驗證，main 通過後等待部署審批。</span></li>
<li><strong>4. GitHub Pages</strong><span>發布已驗證的產物，不在正式站重新建置。</span></li>
</ol>
<p>CI 與審批需要儲存庫的 workflow 和 environment 設定；前面的本機範例還沒有加入這些設定。</p>
</figure>

這個儲存庫的單一 CI workflow 把驗證和部署分成兩個 job：

1. PR 與 main 都執行 frozen install、內容驗證、測試、型別檢查及建置；PR 不部署。
2. main 通過後，上傳該次驗證過的產物。
3. deploy 等待 github-pages environment 的人工批准。
4. 批准後再次確認 main SHA，部署同一次 CI 的產物，不另做一份建置。

在自己的新儲存庫，需先提交原始檔與 lockfile、建立 GitHub Actions workflow，將 Pages 來源選為 GitHub Actions，並為 github-pages environment 設定 Required reviewers。YAML 只引用 environment，不能自己建立審批人。

完整設定可以對照 [本站 workflow](https://github.com/A4225344A/Blog/blob/main/.github/workflows/ci.yml) 和 [Astro GitHub Pages 部署說明](https://docs.astro.build/en/guides/deploy/github/)。範例目前只有 dev、build、preview 三個腳本；要搬用本站的驗證流程，還需要補上對應的內容驗證與測試腳本。

我在意的是批准與產物之間的對應：看過一份結果、批准它，最後就部署那一份。如果批准後又重新建置，前面確認過的結果就不足以說明這次到底發布了什麼。這也是本站讓部署 job 直接取用同一次 CI 產物的原因。
