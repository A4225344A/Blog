---
id: beginner-first-change-zh-tw
slug: astro-content-and-deployment
title: "加入文章、版型與部署流程"
description: "從 Markdown 與共用版型開始，設定部署子路徑，使用完整 workflow 發布到 GitHub Pages。"
locale: zh-TW
translationKey: beginner-first-change
contentType: tutorial
difficulty: intermediate
topics: [web-foundations]
skills: [astro-content-modeling]
prerequisiteSkills: [local-website-preview]
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-21
status: published
---

準備新增第一篇文章時，我不想複製首頁的 HTML，再逐個修改 title、標題和正文。頁面外框應該共用，文章檔案裡留下要寫的內容就好。

延續前面的 `engineering-blog`，這篇會加入 Markdown 文章，再用一份完整 workflow 發布到 GitHub Pages。

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
description: "How prebuilt pages fit the needs of a personal blog."
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

## 部署到子路徑 /Blog/

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

個人首頁型儲存庫使用根路徑 `/`；例如名為 `Blog` 的專案型網站則使用 `/Blog/`。`site` 放網址的協定與主機名稱（例如 `https://name.github.io`，也稱 origin）；`base` 放部署子路徑，包含前後斜線。

先用 Ctrl+C 停止 dev，再於目前的 Windows PowerShell 工作階段設定以下值；只影響這個視窗及它啟動的程式，不會修改 Windows 帳號的永久環境變數：

```powershell
$env:SITE_URL = 'https://YOUR_USERNAME.github.io'
$env:SITE_BASE = '/Blog/'
pnpm.cmd run build
pnpm.cmd run preview
```

把 YOUR_USERNAME 與 Blog 換成自己的帳號和儲存庫。用 preview 顯示的網址檢查首頁和文章往返；連結使用 BASE_URL，所以不會固定指向網域根目錄。新增圖片時也要同樣考慮 base。

build 成功後會有 `dist`。preview 只提供這次的產物；修改原始檔後，要重新 build 才會更新。以上仍是本機檢查，沒有上傳動作。

## 回到本機開發前清除設定

同一個 PowerShell 視窗會保留剛才的 `/Blog/`。若直接再跑 dev，首頁也會位於 `/Blog/`。停止 preview 後執行：

```powershell
Remove-Item Env:SITE_URL, Env:SITE_BASE -ErrorAction SilentlyContinue
pnpm.cmd run dev
```

這時開發首頁恢復為 `http://localhost:4321/`。這個清除步驟只影響目前視窗。

## 建立可直接使用的 GitHub Pages workflow

GitHub Actions 的 workflow 是放在儲存庫裡的自動化工作清單。CI（持續整合）會在提交變更後建置並檢查結果。下面只使用這個範例已有的 build 指令，不依賴本站的內容驗證腳本。

在 GitHub 建立名為 `Blog` 的空白公開儲存庫，不要預先建立 README。到 Settings → Pages 將 Source 選成 **GitHub Actions**。接著在 Settings → Environments 建立 `github-pages`，限制部署分支為 `main`，並設定 Required reviewers。Environment 是 GitHub 的部署保護設定；YAML 中寫出名稱，不會自動設定審查者。

建立 `.github/workflows/pages.yml`：

```yaml
name: Publish Astro blog
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
concurrency:
  group: pages-${{ github.workflow }}-${{ github.event_name == 'pull_request' && github.ref || github.run_id }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@b906affcce14559ad1aafd4ab0e942779e9f58b1 # v4
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: '24'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Build for this repository
        shell: bash
        run: |
          owner="${GITHUB_REPOSITORY_OWNER,,}"
          repo="${GITHUB_REPOSITORY#*/}"
          export SITE_URL="https://${owner}.github.io"
          export SITE_BASE="/${repo}/"
          if [[ "${repo,,}" == "${owner}.github.io" ]]; then export SITE_BASE='/'; fi
          pnpm run build
          test -s dist/index.html
          test -s dist/posts/build-notes/index.html
      - uses: actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa # v3
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        with:
          path: dist
  deploy:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    concurrency:
      group: github-pages
      cancel-in-progress: false
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/github-script@f28e40c7f34bde8b3046d885e986cb6290c5673b # v7
        with:
          script: |
            const branch = await github.rest.repos.getBranch({ ...context.repo, branch: 'main' });
            if (branch.data.commit.sha !== context.sha) {
              core.setFailed('main changed; approve the latest run instead.');
            }
      - id: deployment
        uses: actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e # v4
```

這份流程在 PR 建置但不部署。main 建置成功後，上傳同一份 `dist` 作為 artifact（供下一個工作使用的產物）；deploy 等待 environment 核准，再發布它，不重新建置。

SHA 是 Git commit 的識別碼。核准後的檢查用它確認 main 沒有前進到另一個版本，避免較舊的待批准產物蓋掉新版。`id-token: write` 允許 deploy 透過 OIDC（短效身分驗證）向 Pages 證明它是授權工作，不必存放部署密碼。PR 工作沒有這項權限。

Actions 在 Linux runner 執行，所以 YAML 使用 `pnpm`；本機 PowerShell 指令一律使用 `pnpm.cmd`。

## 推送與確認上線結果

把 `YOUR_USERNAME` 換成 GitHub 帳號；若儲存庫不是 `Blog`，remote 也要改成該名稱。延續上一篇初始化的 Git 儲存庫：

```powershell
git add .
git commit -m "Add article and Pages workflow"
git remote add origin https://github.com/YOUR_USERNAME/Blog.git
git push -u origin main
```

到 Actions 開啟這次 run。build 成功後，在 Review deployments 核准 `github-pages`。部署完成後開啟工作顯示的網址，確認首頁能進入 **Read the build notes**，文章也能返回 Home。若 CSS 或連結失效，先檢查它們是否包含儲存庫的 `/Blog/` 路徑。

後續修改用分支與 PR：先看 build 結果，合併 main 後再批准部署。Required reviewers 若在你的儲存庫方案不可用，需先釐清 GitHub 的環境保護限制，不能把沒有設定的保護視為已啟用。

本站在相同交付原則上還加入內容驗證、搜尋與瀏覽器測試；下一篇會說明那一層內容模型。參考：[GitHub Pages 自訂 workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Astro 部署指南](https://docs.astro.build/en/guides/deploy/github/)。
