---
id: beginner-tools-zh-tw
slug: why-astro
title: "為什麼我用 Astro 建立技術部落格"
description: "我想用 Markdown 寫文章、用 Git 管理修改，再把靜態檔案放上 GitHub Pages。這些需求讓我選了 Astro。"
locale: zh-TW
translationKey: beginner-tools
contentType: concept
difficulty: intermediate
topics: [web-foundations]
skills: [static-site-delivery]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-23
status: published
---

我想把專案裡的做法寫下來，文章和程式碼一起放進 Git。寫完可以看 diff，之後要改版型，也能在同一個專案裡處理。

文章只在改稿後更新，沒有登入或即時資料。我選擇讓 Astro 先產生 HTML，再把檔案放上 GitHub Pages，不另外維護應用伺服器。

## 先產生 HTML，再發布

執行 build 時，Astro 讀取 Markdown，把標題和正文放進版型，產生 HTML。Pagefind 接著掃描這些頁面，建立搜尋索引。開啟文章或搜尋時，瀏覽器直接讀取這批檔案。

整個流程裡，Node.js 負責開發與建置。到了 GitHub Pages，剩下的就是 HTML、CSS 和必要的 JavaScript。

<figure class="learning-diagram">
<figcaption>發布流程：從文章到靜態檔案</figcaption>
<ol role="list">
<li><strong>1. Git 管理的內容</strong><span>Markdown 文章、專案資料與版型。</span></li>
<li><strong>2. Astro 建置</strong><span>驗證內容、產生頁面與靜態搜尋索引。</span></li>
<li><strong>3. GitHub Pages</strong><span>提供已驗證的 HTML、CSS 與必要 JavaScript。</span></li>
</ol>
<p>改完文章後再建置一次，新的內容才會出現在發布產物裡。</p>
</figure>

## 我怎麼看其他選擇

我主要看兩件事：文章怎麼寫，以及上線後要維護什麼。

| 選擇 | 適合這個需求的地方 | 我需要考慮的事 |
| --- | --- | --- |
| Hugo | 直接從內容產生靜態網站 | 需要使用它的模板與內容組織方式 |
| Next.js 靜態匯出 | 可以沿用 React，產出靜態檔案 | 不能使用需要伺服器的功能；這個部落格也沒有需要 React 的複雜互動 |
| 自架 WordPress | 有瀏覽器編輯介面與外掛生態 | 標準自架環境需要 PHP 與資料庫，不符合這次只部署檔案的目標 |
| Astro | Markdown 與版型放在同一個專案，預設可產生靜態頁面 | 接受發布前重新建置，也要自己整理內容規則 |

我選 Astro，是因為想在同一個 Git 專案裡維護文章與版型。若目標改成讓不使用 Git 的作者共同編輯，WordPress 的編輯介面會更值得考慮。

參考：[Hugo 簡介](https://gohugo.io/about/introduction/)、[Next.js 靜態匯出限制](https://nextjs.org/docs/app/guides/static-exports)、[WordPress 執行環境](https://wordpress.org/about/requirements/)。

## 改一個錯字也要重新部署

這個做法有個麻煩：即使只修正一個錯字，也得重新建置、部署。搜尋索引同樣要更新。我不需要編輯後立刻對外顯示，這段等待可以接受。

另一個要處理的是 `/Blog/` 子路徑。首頁、文章和圖片的連結都得帶上它；漏掉這段，瀏覽器就會去網域根目錄找檔案。第三篇會實際設定和檢查這些連結。

## 文章改了，頁面卻沒更新

假設 Markdown 已經改好，正式站卻還是舊文章，我會沿著上面那張圖查：修改有沒有進入建置使用的 commit？產出的 HTML 是否包含新段落？部署的又是哪一次產物？

先看 `dist` 裡的 HTML，可以分辨問題出在建置還是部署。如果 HTML 已經有新段落，就往 GitHub Actions 查這次發布用了哪一份產物。

下一篇從空資料夾建立 Astro 專案與首頁。
