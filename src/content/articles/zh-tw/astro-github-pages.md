---
id: astro-github-pages-zh-tw
slug: astro-github-pages
title: "部署 Astro 部落格到 GitHub Pages"
description: "設定部署子路徑、檢查本機建置，再用 GitHub Actions 發布已檢查的檔案。"
locale: zh-TW
translationKey: astro-github-pages
contentType: tutorial
difficulty: intermediate
topics: [web-foundations]
skills: [static-site-delivery]
prerequisiteSkills: [astro-content-modeling]
recommendedArticles: []
publishedAt: 2026-09-24
updatedAt: 2026-09-24
status: published
---

沿用前兩篇建立的 `engineering-blog`：首頁已有文章連結，文章也能用 Home 返回首頁。接下來把它放上 GitHub Pages。指令使用 Windows PowerShell；如果還沒做出這兩個頁面，先完成上一篇的文章與版型。

<figure class="learning-diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 610" role="img" aria-label="PR 與 main 的部署分流" style="display:block;max-width:100%;width:400px;height:auto;margin:auto;background:#f5f6ff;border-radius:8px">
<g fill="none" stroke="#4857a5" stroke-width="2"><path d="M200 80 V110 M200 95 H25 V225 H45 M200 250 V280 M200 335 V365 M200 420 V450 M200 505 V535"/><path d="m194 104 6 6 6-6 M39 219 l6 6-6 6 m155 43 6 6 6-6 m-12 85 6 6 6-6 m-12 85 6 6 6-6 m-12 85 6 6 6-6"/></g>
<rect x="45" y="25" width="310" height="55" rx="8" fill="white" stroke="#4857a5"/><text x="200" y="58" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#26304b">推送修改</text>
<rect x="45" y="110" width="310" height="55" rx="8" fill="white" stroke="#4857a5"/><text x="200" y="143" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#26304b">PR：只檢查，不部署</text>
<rect x="45" y="195" width="310" height="55" rx="8" fill="white" stroke="#4857a5"/><text x="200" y="228" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#26304b">main：檢查與建置</text>
<rect x="45" y="280" width="310" height="55" rx="8" fill="white" stroke="#4857a5"/><text x="200" y="313" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#26304b">檢查通過後上傳產物</text>
<rect x="45" y="365" width="310" height="55" rx="8" fill="white" stroke="#4857a5"/><text x="200" y="398" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#26304b">等待 github-pages 人工核准</text>
<rect x="45" y="450" width="310" height="55" rx="8" fill="white" stroke="#4857a5"/><text x="200" y="483" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#26304b">部署同一份產物</text>
<rect x="45" y="535" width="310" height="55" rx="8" fill="white" stroke="#4857a5"/><text x="200" y="568" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#26304b">GitHub Pages</text>
</svg>
<figcaption>部署流程：PR 不部署；main 通過檢查並獲核准後，才發布產物。</figcaption>
</figure>

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

把 YOUR_USERNAME 與 Blog 換成自己的帳號和儲存庫。開啟 preview 顯示的網址，從首頁點進文章，再點 Home 回到首頁。連結使用 `BASE_URL`，因此會保留 `/Blog/`；新增圖片時也要帶上這段路徑。

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

第一次 push 前，先在 GitHub 完成以下設定：

1. 建立名為 `Blog` 的空白公開儲存庫，不要預先建立 README。
2. 到 **Settings → Pages**，將 Source 選成 **GitHub Actions**。
3. 到 **Settings → Environments**，開啟 `github-pages`。若還沒有這個環境，再新增。
4. 在 **Deployment branches and tags** 選擇指定分支，新增 `main` 分支規則。
5. 啟用 **Required reviewers**，選擇可以批准部署的人或團隊。公開儲存庫可使用這項規則。
6. 如果只有自己一位審查者，讓 **Prevent self-review** 保持未勾選，才能批准自己的部署。
7. 儲存保護規則，確認畫面已列出審查者。

參考 [GitHub 環境設定](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)。

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

`concurrency` 控制同時有多次執行時怎麼排隊。同一個 PR 連續 push，只保留最新那次建置；main 上等待核准的部署，不會被後來的建置取消。部署一次只跑一個。

這份流程在 PR 建置但不部署。main 建置成功後，上傳同一份 `dist` 作為 artifact（供下一個工作使用的產物）；deploy 等待 environment 核准，再發布它，不重新建置。

SHA 就是 commit 的版本編號。如果等待期間 main 又有新提交，核准舊的執行也不會發布：檢查會擋下它，改去核准最新那次即可。若舊執行一直卡在等待、擋住新的部署，可以先取消舊執行，再核准最新的。

`id-token: write` 讓部署工作向 GitHub 取得短效身分憑證，這套機制叫 OIDC。不需要另外存一組部署密碼，而且只有 deploy 工作有這項權限，PR 建置沒有。

Actions 在 Linux runner 執行，所以 YAML 使用 `pnpm`；本機 PowerShell 指令一律使用 `pnpm.cmd`。

## 推送與確認上線結果

把 `YOUR_USERNAME` 換成 GitHub 帳號；若儲存庫不是 `Blog`，remote 也要改成該名稱。在前面建立的 Git 儲存庫裡執行：

```powershell
git add .
git commit -m "Add article and Pages workflow"
git remote add origin https://github.com/YOUR_USERNAME/Blog.git
git push -u origin main
```

第一次透過 HTTPS push 時，Git Credential Manager 可能開啟瀏覽器要求登入 GitHub。完成授權後回到終端機；參考 [Git 認證設定](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git)。

到 Actions 開啟這次 run。build 成功後，在 Review deployments 核准 `github-pages`。部署完成後開啟工作顯示的網址，確認首頁能進入 **Read the build notes**，並確認文章中的 Home 連結會返回 `/Blog/`（或你設定的 base）首頁。若 CSS 或連結失效，先檢查它們是否包含儲存庫的 `/Blog/` 路徑。

後續修改用分支與 PR：先看 build 結果，合併 main 後再批准部署。

下一篇會打開這個部落格的原始碼，看看翻譯、分類和系列順序怎麼存放。

參考：[GitHub Pages 自訂 workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Astro 部署指南](https://docs.astro.build/en/guides/deploy/github/)。
