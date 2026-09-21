---
id: beginner-tools-zh-tw
slug: why-astro
title: "為什麼我用 Astro 建立技術部落格"
description: "從全端工程師的角度，說明個人專案與技術文章的需求，以及靜態建置、Git 管理與 GitHub Pages 的取捨。"
locale: zh-TW
translationKey: beginner-tools
contentType: concept
difficulty: intermediate
topics: [web-foundations]
skills: [static-site-delivery]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-21
status: published
---

這個部落格要放的東西很單純：個人專案、實作筆記，還有一些值得寫下來的技術選擇。每位讀者打開同一篇文章，看到的正文都一樣；我改稿、發布，頁面才需要更新。

這個需求不需要常駐的應用伺服器。用 Astro 在發布前把頁面做好，再交給 GitHub Pages 提供檔案，就能處理目前的需求。

## 把工作留在發布的時候

拿一篇專案筆記來說，標題、正文、相關文章連結都已經寫在專案裡。這些資料可以在建置時讀完，連同版型一起產生 HTML。搜尋索引也在這時產生，讀者搜尋時使用站內的靜態索引。

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

以下比較的是本站需求，沒有做跨框架效能測試。

| 選擇 | 適合這個需求的地方 | 我需要考慮的事 |
| --- | --- | --- |
| Hugo | 直接從內容產生靜態網站 | 需要使用它的模板與內容組織方式 |
| Next.js 靜態匯出 | 可以沿用 React，產出靜態檔案 | 靜態匯出不能使用需要伺服器的功能；本站目前不需要以 React 組織整個頁面 |
| 自架 WordPress | 有瀏覽器編輯介面與外掛生態 | 標準自架環境需要 PHP 與資料庫，不符合這次只部署檔案的目標 |
| Astro | Markdown 與版型放在同一個專案，預設可產生靜態頁面 | 接受發布前重新建置，也要自己整理內容規則 |

我選 Astro，是因為想在同一個 Git 專案裡維護文章與版型。若目標改成讓不使用 Git 的作者共同編輯，WordPress 的編輯介面會更值得考慮。

參考：[Hugo 簡介](https://gohugo.io/about/introduction/)、[Next.js 靜態匯出限制](https://nextjs.org/docs/app/guides/static-exports)、[WordPress 執行環境](https://wordpress.org/about/requirements/)。

## 我願意接受重新建置這件事

Astro 對這裡的吸引力，是 Markdown、頁面版型和程式碼可以放在同一個 Git 專案。寫文章時能看 diff，改版型時也能一起確認正文的呈現。產出的 HTML 已經包含文章，瀏覽器拿到就能閱讀。

代價也很直接：改一個錯字，仍然得跑完建置與發布。搜尋結果同樣要等索引更新。對這種由作者編輯、確認後才公開的內容，我可以接受這段等待。

GitHub Pages 也讓網址多了一個要注意的地方。本站放在 `/Blog/` 下，首頁、文章、圖片的連結都得帶上這段路徑。這是選了這種部署方式之後，要在程式和測試裡處理的事。

## 從產物追查更新

假設 Markdown 已經改好，正式站卻還是舊文章，我會沿著上面那張圖查：修改有沒有進入建置使用的 commit？產出的 HTML 是否包含新段落？部署的又是哪一次產物？

這是把頁面生成移到建置階段後，很實際的差異。資料和版型的問題可以先在本機產物裡確認，部署則追蹤 commit 和產物之間的關係。本站會在部署前執行內容驗證與測試。若要加入人工批准，還必須在 github-pages 環境設定 Required reviewers；只在 YAML 指定環境名稱不會啟用這項保護。

## 專案本身，另外說清楚

部落格的部署很單純，放在裡面的專案未必如此。例如 AI SRE Platform 是整合基礎設施、GitOps、可觀測性與 AI 輔助事件處理的 **lab**，用於學習、展示與實驗。它的架構和這個部落格是兩件分開的事。

目前專案頁只有實驗室介紹，尚未發布相關實作文章。

這幾篇就先記錄部落格本身。接著從空資料夾放進 Astro 和一個首頁，看看最小的專案實際長什麼樣子。
