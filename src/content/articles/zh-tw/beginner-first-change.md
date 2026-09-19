---
id: beginner-first-change-zh-tw
slug: beginner-first-change
title: "繼續建設自己的網站：樣式、第二個頁面與導覽"
description: "替自己建立的首頁加入內容與 CSS，親手建立關於頁、往返連結，再產生靜態網站檔案。"
locale: zh-TW
translationKey: beginner-first-change
contentType: tutorial
difficulty: beginner
topics: [web-foundations]
skills: [editing-web-pages]
prerequisiteSkills: [local-website-preview]
recommendedArticles: []
publishedAt: 2026-09-19
status: published
---

上一篇已從空資料夾建立首頁。現在繼續在自己的 `my-first-website` 專案工作，讓網站有自己的內容、顏色與第二個頁面。

在 VS Code 開啟該資料夾，從 PowerShell 執行 `pnpm.cmd run dev`，再開啟終端機列出的 Local 網址。以下程式碼都貼進檔案編輯區。

## 先看架構：原始檔、網址與建置結果

兩個頁面就像一本書的兩頁；連結是你安排的翻頁入口。Astro 用檔案位置決定網址，而不是用大標題決定：

| 你建立的檔案 | 本機網址路徑 | 角色 |
| --- | --- | --- |
| `src/pages/index.astro` | `/` | 首頁 |
| `src/pages/about.astro` | `/about/` | 關於頁 |
| 指向關於頁的 `a` 連結 | 導向 `/about/` | 連結目的地，不會建立新檔案 |

把 h1 改成「聯絡我」，網址仍是 `/about/`，因為檔名沒有改。如果只寫連結卻沒有建立 about.astro，就像門牌指向不存在的房間，會得到 404。

<figure class="learning-diagram">
<figcaption>圖 3：建置是把原始檔轉成一份可交付的網站</figcaption>
<ol>
<li><strong>1. src/pages/ 與樣式</strong><span>你持續修改的原始檔。</span></li>
<li><strong>2. pnpm run build</strong><span>Astro 讀取原始檔，產生靜態網站。</span></li>
<li><strong>3. dist/</strong><span>這次建置產生的 HTML、CSS 等檔案。</span></li>
<li><strong>4. pnpm run preview</strong><span>在本機提供 dist 的內容，供瀏覽器檢查。</span></li>
</ol>
<p>preview 不會自動重新建置。這條流程沒有上傳步驟；本機看到成果不代表已經公開。</p>
</figure>

**dev 像邊寫邊看的工作桌；build 像輸出一份成品；preview 像檢查剛輸出的成品。** 這個比喻的重點是：原始檔更新後，舊成品不會自己改變。

## 第一步：寫自己的內容

開啟 **`src/pages/index.astro`**。把 `body` 裡的段落改成你的介紹，例如：

```html
<p>你好，我正在記錄我的網站學習筆記。</p>
```

按 **Ctrl+S**。回瀏覽器確認新段落出現，沒更新就重新整理。這是你的內容，可以用自己的話重寫。`<p>` 與 `</p>` 要保留。

## 第二步：為首頁加入樣式

在同一個檔案最底部、`</html>` 之後，新增以下完整區塊：

```astro
<style>
  body {
    max-width: 42rem;
    margin: 3rem auto;
    padding: 0 1rem;
    font-family: system-ui, sans-serif;
    line-height: 1.7;
    color: #172b3a;
    background: #f5f7fa;
  }
  h1 {
    color: #075985;
  }
  a {
    color: #075985;
  }
</style>
```

CSS 用「選擇器」指定要改的元素，例如 `body` 是頁面內容、`h1` 是大標題。`max-width` 限制文字寬度，`margin` 是外側空間，`padding` 是內側留白，`line-height` 是行距；`color` 和 `background` 是文字及背景顏色。`rem` 是相對字體大小的單位。先照做，再一次改一個數值觀察差別。

**成功檢查：** 儲存後，首頁標題變藍、文字有留白、背景變淡。網站變化只在你的電腦，不會自動公開。

## 第三步：建立關於頁面

**操作位置：VS Code 左側 `src/pages` 資料夾。**

按右鍵 → New File，命名 `about.astro`。貼入以下完整內容並儲存：

```astro
<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>關於我</title>
  </head>
  <body>
    <h1>關於我</h1>
    <p>這是我從零建立的網站，我會在這裡分享學習過程。</p>
    <a href="/">回首頁</a>
  </body>
</html>
```

Astro 依檔名決定網址：`index.astro` 是 `/`，`about.astro` 是 `/about/`。在本機網址後加上 `about/`，例如 `http://localhost:4321/about/`。

**成功檢查：** 看到「關於我」及「回首頁」連結。這個頁面還沒有首頁的 CSS，所以外觀不同是正常的；Astro 頁面裡的樣式不會自動套用到別頁。之後學習共用版型時，再把重複結構集中管理。

## 第四步：把兩頁接起來

回到 **`src/pages/index.astro`**，在段落後、`</body>` 前新增：

```html
<a href="/about/">關於我</a>
```

`a` 是連結；`href` 指定目的地；標籤中間是讀者看到的文字。這裡的 `/` 從本機網站根目錄開始。未來放到 GitHub Pages 的專案子路徑時，需要再處理部署 base；目前先在本機根目錄練習。

**成功檢查：** 儲存後，從首頁點「關於我」到第二頁，再點「回首頁」回來。這就是你親手建立的導覽。

## 如果沒有成功

- 看不到變化：按 Ctrl+S，確認改的是正在執行的那份專案，瀏覽器用 Local 網址，必要時重新整理。
- 第二頁 404：檢查 `about.astro` 是否直接在 `src/pages` 裡，以及連結拼字。
- 樣式沒生效：檢查 `<style>`、`</style>`、大括號與分號是否完整，確認正在看首頁。
- 不小心改壞：可以 Ctrl+Z 撤銷後儲存；也可用上一篇的完整首頁重建，再一次加一個區塊。
- 終端機已停止：在相同資料夾重新執行 `pnpm.cmd run dev`。

## 第五步：產生可發布的檔案

回 PowerShell，先按 **Ctrl+C** 停止 dev；若詢問是否終止批次工作，輸入 `Y`。然後執行：

```powershell
pnpm.cmd run build
```

結束後輸入 `$LASTEXITCODE`，應顯示 `0`。VS Code 左側會多出 `dist` 資料夾，裡面是 Astro 產生的網站檔案；不要直接改它，下次 build 會重新產生。

再執行：

```powershell
pnpm.cmd run preview
```

保持終端機開啟，用它列出的網址檢查首頁、關於頁及往返連結。preview 顯示建置結果；若修改原始檔，先停止 preview、重新 build，再 preview 才會看到新結果。結束同樣按 Ctrl+C。

## 用小變更驗證你理解了流程

先只把首頁 CSS 的 `max-width: 42rem` 改成 `max-width: 30rem`。在較寬的瀏覽器視窗，你會看到文字區域變窄；窄手機上可能沒差別，因為畫面本來就小於這個上限。改回原值後，再試改文字顏色。一次只變更一個值，才能知道是哪個設定造成變化。

完成本篇的 build 與 preview 後，可以再觀察一次：改首頁段落並儲存，重新整理 preview，畫面仍是上次建置的內容。停止 preview、重新 build、再 preview，才會看到新段落。這正是上圖「原始檔 → 建置 → dist」的因果關係。

看到錯誤時，也可以沿圖找位置：404 先看檔名與連結；樣式不符先看選擇器與所在頁面；preview 內容過時先看是否重新建置。先找出問題在哪一段，再決定要執行哪個指令。

## 你完成了什麼？

你已從空資料夾建立自己的 Astro 網站：工具清單、首頁、CSS、關於頁、頁面連結，以及靜態建置。每個檔案都是自己建立的。

這一階段完成本機網站。Markdown 寫文章、Git 修改紀錄與 GitHub Pages 公開發布將是後續教學；本篇沒有讓網站自動上線。現有中階架構文章可留到熟悉這些基礎後再讀。
