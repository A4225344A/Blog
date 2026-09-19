---
id: beginner-tools-zh-tw
slug: beginner-tools
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
updatedAt: 2026-09-20
status: published
---

我是全端工程師。這個部落格用來放個人專案、實作筆記與架構選擇；建立它，是為內容選擇合適的交付方式。

這個系列從需求開始，再走到空專案、文章版型與部署。你可以已經熟悉前後端開發，但還沒用過 Astro；必要名詞會在使用時說明，架構圖則用來交代各部分的責任。

## 先決定部落格需要什麼

文章與專案介紹不需要在每次瀏覽時重新計算。這裡需要的是可閱讀的 HTML、穩定網址、雙語內容，以及能隨 Git 版本一起追蹤的文字。

因此，本次實作採用 Astro 靜態建置：發布前先把內容轉成網站檔案，讀者來訪時直接取得那些檔案。Node.js 在開發與建置階段使用；正式的 GitHub Pages 不必執行 Node.js 伺服器。

<figure class="learning-diagram">
<figcaption>架構圖：這個部落格的內容如何交付</figcaption>
<ol role="list">
<li><strong>1. Git 管理的內容</strong><span>Markdown 文章、專案資料與版型。</span></li>
<li><strong>2. Astro 建置</strong><span>驗證內容、產生頁面與靜態搜尋索引。</span></li>
<li><strong>3. GitHub Pages</strong><span>提供已驗證的 HTML、CSS 與必要 JavaScript。</span></li>
</ol>
<p>讀者取得的是建置結果。這張圖沒有資料庫查詢或登入服務。</p>
</figure>

## 為什麼選 Astro？

對這個部落格而言，Astro 讓內容與頁面結構能留在同一個 Git 專案，預先產生可直接閱讀的 HTML。簡單文章不需要先載入前端應用再取得正文。

這不表示全端框架不適合部落格。SSR、靜態輸出與客戶端互動都可以依需求組合；這次只是不需要把後端服務列入日常維護。若未來需求包含會員、私人資料或即時寫入，會重新評估架構，而不是把現在的選擇當成通用答案。

| 選擇 | 對這個部落格的好處 | 接受的限制 |
| --- | --- | --- |
| 靜態建置 | 交付的是明確的網站產物 | 文章更新後需要重新建置 |
| Git 管理 Markdown | 修改可追蹤、可審查 | 寫作流程需要基本 Git 操作 |
| 本機靜態搜尋 | 不依賴遠端搜尋 API | 新內容要建置後才進入索引 |
| GitHub Pages | 不用維護應用伺服器 | 需要注意專案子路徑與平台設定 |

## 與既有全端開發方式差在哪裡？

關鍵是**什麼時候產生頁面**。動態系統可以在請求進來後讀取資料並回應；這個部落格把資料讀取、關聯計算與頁面輸出移到建置階段。

因此排查問題也有不同順序：正文缺漏先看內容與建置，連結錯誤先看路由與 base，部署版本不對先看 CI 產物與 SHA。不是遇到每個問題都要去找 API。

## 個人專案與文章如何分工？

專案頁說明目標、成熟度、原始碼及相關文章；文章解釋某個實作或選擇的細節。AI SRE Platform 在這裡標示為 **lab**，用途是學習、展示與實驗，不宣稱是正式環境經驗。

系列把相關文章串成清楚的閱讀順序。讀者可以依序理解需求到交付的決策，也可以從關心的專案或技術問題開始閱讀。

## 接下來的實作範圍

下一篇會建立一個最小 Astro 部落格專案，理解檔案、路由與開發模式。第三篇加入 Markdown 與版型，再對照本站的交付流程。

最小範例用來看清責任邊界，不會一次複製本站全部功能。本站實際使用 Content Collections、五種內容實體與建置驗證；完整內容模型另有架構文章。
