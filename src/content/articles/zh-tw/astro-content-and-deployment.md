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
updatedAt: 2026-09-23
status: published
---

上一篇已經有首頁了，接著加一篇文章。我把標題、導覽和樣式放進共用版型，正文用 Markdown 寫。以後改頁面外觀，就不用逐篇修改 HTML。

繼續使用 `engineering-blog` 資料夾。完成文章後，再設定 GitHub Actions，將它發布到 GitHub Pages。

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

## Writing in Markdown

I keep articles in Markdown and use a shared layout for the HTML around them.

## Publishing an edit

Astro builds the pages before I upload them. Changing an article means building again.
```

frontmatter 是兩條 `---` 中間的資料；layout 指向剛建立的共用版型。正文從二級標題開始，因為版型已經輸出 h1。這種用法對應 [Astro 的 Markdown 頁面與 layout 機制](https://docs.astro.build/en/guides/markdown-content/#frontmatter-layout-property)。

在首頁 `src/pages/index.astro` 的段落下加入：

```astro
<a href={`${base}posts/build-notes/`}>Read the build notes</a>
```

用 Ctrl+S 儲存，啟動 dev 後從首頁點進文章。標題、描述和正文會一起出現，但它們來自兩個檔案：Markdown 提供文字，版型負責把它們放進頁面。回首頁的連結也放在版型裡，以後新增文章可以共用。

## 從單篇文章到文章集合

放在 `src/pages` 的 Markdown 會直接產生頁面。一篇文章用這種方式就夠了。如果還要讓文章出現在主題頁、系列目錄，或提供中英切換，就需要另外管理這些關係。我把這個部落格的文章放在 `src/content/articles`，用 Content Collections 載入；第四篇會沿著實際檔案說明。

## 部署到子路徑 /Blog/

GitHub Pages 的專案網站會多一段儲存庫名稱，例如 `/Blog/`。如果把文章連結寫成 `/posts/build-notes/`，瀏覽器會去網域根目錄找，跳過 `/Blog/`。前面使用的 `base` 就是要補上這段路徑。

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

build 成功後會產生 `dist`，preview 開啟的就是這個目錄。修改文章後記得再 build；上傳則留給下面的 GitHub Actions。

## 回到本機開發前清除設定

同一個 PowerShell 視窗會保留剛才的 `/Blog/`。若直接再跑 dev，首頁也會位於 `/Blog/`。停止 preview 後執行：

```powershell
Remove-Item Env:SITE_URL, Env:SITE_BASE -ErrorAction SilentlyContinue
pnpm.cmd run dev
```

這時開發首頁恢復為 `http://localhost:4321/`。這個清除步驟只影響目前視窗。

## 建立可直接使用的 GitHub Pages workflow

GitHub Actions 的 workflow 是放在儲存庫裡的自動化工作清單。CI（持續整合）會在提交變更後建置並檢查結果。下面使用這個範例已有的 check 與 build 指令。

在 GitHub 建立名為 `Blog` 的空白公開儲存庫，不要預先建立 README。到 Settings → Pages 將 Source 選成 **GitHub Actions**。接著到 Settings → Environments：若 Pages 已自動建立 `github-pages` 就開啟它，沒有才新增。限制部署分支為 `main`，在 Required reviewers 選擇審查者或團隊；目前 GitHub 方案的公開儲存庫可使用這項規則。如果只有自己一位審查者，保持 Prevent self-review 不勾選，才能批准自己的部署。第一次 push 前先儲存保護規則。參考 [GitHub 環境設定](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)。

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
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7
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
          pnpm run check
          pnpm run build
          test -s dist/index.html
          test -s dist/posts/build-notes/index.html
      - uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5
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
      - uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9
        with:
          script: |
            const branch = await github.rest.repos.getBranch({ ...context.repo, branch: 'main' });
            if (branch.data.commit.sha !== context.sha) {
              core.setFailed('main changed; approve the latest run instead.');
            }
      - id: deployment
        uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5
```

最上層的 `concurrency` 依 PR 分支分組，同一個 PR 的新執行會取消舊執行；main 則用 run ID 分組，避免新的建置取消等待批准的執行。deploy 的另一個 concurrency 群組讓部署逐一進行，不取消正在進行的部署。

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

第一次透過 HTTPS push 時，Git Credential Manager 可能開啟瀏覽器要求登入 GitHub。完成授權後回到終端機；參考 [Git 認證設定](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git)。

到 Actions 開啟這次 run。build 成功後，在 Review deployments 核准 `github-pages`。部署完成後開啟工作顯示的網址，確認首頁能進入 **Read the build notes**，並確認文章中的 Home 連結會返回 `/Blog/`（或你設定的 base）首頁。若 CSS 或連結失效，先檢查它們是否包含儲存庫的 `/Blog/` 路徑。

後續修改用分支與 PR：先看 build 結果，合併 main 後再批准部署。

下一篇會打開這個部落格的原始碼，看看四篇文章的翻譯、分類和系列順序怎麼存放。

參考：[GitHub Pages 自訂 workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Astro 部署指南](https://docs.astro.build/en/guides/deploy/github/)。
