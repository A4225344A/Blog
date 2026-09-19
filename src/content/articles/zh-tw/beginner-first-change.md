---
id: beginner-first-change-zh-tw
slug: beginner-first-change
title: 第一次修改網站：改一行標題，儲存，再看見結果
description: 在 VS Code 找到語言入口頁，只修改標題文字，用瀏覽器確認結果，並練習還原。清楚區分本機修改與公開發布。
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

這篇只改一行文字。完成後，你會知道「檔案 → 儲存 → 瀏覽器畫面」之間的關係，並能把它改回來。

請使用上一篇下載的 `website-practice` 範例資料夾，不是在這個線上網站直接編輯。VS Code 應已開啟該資料夾，`pnpm.cmd run dev` 應正在它的 PowerShell 終端機執行。如果已停止，重新啟動，再用瀏覽器開啟終端機列出的 Local 網址。

## 第一步：找到控制這一頁的檔案

**操作位置：VS Code 左側的檔案總管，不是終端機。**

依序展開 `src`、`pages`，點選直接放在 `pages` 裡的 **`index.astro`**。

完整位置是：

```text
website-practice/src/pages/index.astro
```

不要選 `[locale]` 資料夾裡的另一個 `index.astro`。那是其他語言頁面的檔案；這次要改的是最外層的語言入口。

`.astro` 是 Astro 的頁面檔案格式。這個範例的 `src/pages/index.astro` 對應網站最外層的 `/`，也就是你剛看到的語言入口。現在不需要理解檔案裡每一個符號。

## 第二步：只改標題中間的文字

**操作位置：VS Code 中間的 `index.astro` 編輯區。**

找到這一行：

```html
<h1>Engineering Knowledge Platform</h1>
```

`<h1>` 與 `</h1>` 是 HTML 標籤，告訴瀏覽器「這裡是頁面的主要標題」。這次保留兩端標籤，只把中間文字改成：

```html
<h1>這是我的第一個網站</h1>
```

其他行先不要動，尤其是最上方的 `---` 與 `import`。這一步是在編輯檔案，不是在執行指令；不要把上面的 HTML 貼進 PowerShell。

按 **Ctrl+S** 儲存。目前還沒儲存的檔案通常會在分頁旁顯示一個小圓點；儲存後它會消失。

## 第三步：到瀏覽器確認

回到瀏覽器，確認網址是這次開發伺服器的根網址，例如 `http://localhost:4321/`，而不是 `/zh-tw/`、`/en/`，也不是公開站的 GitHub 網址。

在開發模式下，Astro 通常會在你儲存後自動更新畫面。如果沒有更新，手動重新整理一次。這個行為可參考 [Astro 5 的開發說明](https://v5.docs.astro.build/en/develop-and-build/)。

**成功時，大標題應變成「這是我的第一個網站」。** 其他語言連結仍然存在。瀏覽器分頁的標題可能仍是「工程知識平台」；我們改的是頁面裡的 `h1`，不是分頁標題，這是正常的。

你剛完成了一次真正的修改：編輯原始檔、儲存，再由 Astro 把結果交給瀏覽器。修改不會自動傳到作者的 GitHub，也不會改變其他人正在看的公開站。

## 沒看到變化時，照順序檢查

1. **是否已儲存？** 回 VS Code 按 Ctrl+S。
2. **檔案是否正確？** 確認正在編輯 `src/pages/index.astro`，不是 `[locale]` 裡的同名檔案，也不是 ZIP 中另一份副本。
3. **網址是否正確？** 用終端機的 Local 網址，回到根路徑 `/`；如果改用其他埠號，跟著終端機的數字。
4. **開發伺服器是否還在？** 如果終端機已停止，在該專案資料夾重新執行 `pnpm.cmd run dev`。
5. **畫面是否出現錯誤？** 先把整行恢復成原本的 `<h1>Engineering Knowledge Platform</h1>`，儲存再看一次。確認沒有漏掉 `<`、`>` 或結尾的 `/`。

如果仍然失敗，記下「編輯的完整檔案位置、瀏覽器網址、終端機的第一段錯誤」，這些資訊比只說「網站壞了」更容易讓人協助。

## 第四步：練習還原與重新開始

在同一個檔案，把文字改回原本的 `Engineering Knowledge Platform`，保留兩端的 `h1` 標籤，再按 Ctrl+S。

確認瀏覽器大標題也變回原文。你也可以在尚未關閉編輯器時使用 Ctrl+Z 撤銷剛才的修改，再儲存；直接改回原文則不依賴撤銷歷史。

最後回終端機按 Ctrl+C 停止網站；若詢問是否終止批次工作，輸入 `Y`。檔案仍會留在你的電腦，下次重新開啟這個資料夾並執行 `pnpm.cmd run dev` 就能繼續。

## 你現在完成了什麼？

- 準備了工具，知道在哪裡輸入指令。
- 找到專案資料夾，在自己的電腦啟動網站。
- 修改、儲存、觀察並還原一行網頁內容。

這是第一個完整練習，不表示你已經需要理解內容模型、CI 或 SEO。可以先再改一次標題，直到你不看步驟也知道要開哪個檔案、在哪個視窗操作。

這一批教學到此為止。Markdown 寫作、Git 的修改紀錄與 GitHub Pages 公開發布是後續學習目標，目前不列為本路徑已完成的教學。現有「建立工程知識平台」文章保留中階深度；先熟悉基本 HTML、JavaScript 與專案指令，再閱讀它會比較容易。
