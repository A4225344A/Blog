---
id: beginner-local-website-zh-tw
slug: beginner-local-website
title: "從空資料夾建立網站：親手建立檔案，再啟動 Astro"
description: "自己建立專案資料夾、package.json 與第一個 Astro 頁面，安裝工具後在瀏覽器看到自己寫的網站。"
locale: zh-TW
translationKey: beginner-local-website
contentType: tutorial
difficulty: beginner
topics: [web-foundations]
skills: [local-website-preview]
prerequisiteSkills: [terminal-basics]
recommendedArticles: []
publishedAt: 2026-09-19
status: published
---

這次從空資料夾開始，親手建立每個檔案，完成能在瀏覽器看到的首頁。先完成上一篇的 Node.js 24.x、pnpm 10.32.1 與 VS Code 安裝。

## 第一步：建立空資料夾

在 Windows 檔案總管的「文件」中，按右鍵 → 新增 → 資料夾，命名為 `my-first-website`。如果已存在，另取新名稱，不要覆蓋。開啟 VS Code，選 **File → Open Folder（檔案 → 開啟資料夾）**，選取這個新資料夾。若出現信任提示，確認是自己剛建立的資料夾後再選擇信任。

**成功檢查：** 左側檔案總管顯示你的資料夾，裡面沒有檔案。不需要 GitHub 帳號或本站原始碼。

## 第二步：建立 package.json

**操作位置：VS Code 左側檔案總管與中間編輯區。**

在資料夾按右鍵 → **New File（新增檔案）**，命名為 `package.json`，不要加上 `.txt`。將以下完整內容貼入編輯區，按 **Ctrl+S**：

```json
{
  "name": "my-first-website",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "5.18.2"
  },
  "packageManager": "pnpm@10.32.1"
}
```

這是專案的工具清單。`name` 是名稱；`private` 避免誤發布為套件；`type` 指定 JavaScript 模組格式；`scripts` 是可執行的工作；`dependencies` 列出要安裝的 Astro 版本。JSON 的括號、英文雙引號與逗號都要保留，最後一個項目後面不能多逗號。

本教學固定 Astro 5.18.2，方便確認操作結果，不代表這是最新版。

## 第三步：安裝 Astro

選 **Terminal → New Terminal（終端機 → 新增終端機）**，確認分頁是 PowerShell；若不是，從終端機下拉選單開啟 PowerShell。

**輸入位置：VS Code 下方的 PowerShell。一次一行，按 Enter，不是貼進編輯區。**

```powershell
Get-Location
```

應顯示剛建立的資料夾路徑，再輸入：

```powershell
Test-Path .\package.json
```

應顯示 `True`。若是 `False`，重新開啟正確資料夾，關閉舊終端機並開啟新的。確認後輸入：

```powershell
pnpm.cmd install
```

這會下載 Astro 與它需要的套件，建立 `node_modules` 和記錄版本的 `pnpm-lock.yaml`。首次安裝沒有 lockfile，所以不用 `--frozen-lockfile`；保留產生的 lockfile，之後重裝相同依賴才可加上這個選項。

等待重新出現 `PS ...>` 提示，再輸入：

```powershell
$LASTEXITCODE
```

**成功檢查：** 顯示 `0`，且左側出現 `node_modules` 與 `pnpm-lock.yaml`。若安裝失敗，先處理錯誤。不要手動修改 `node_modules`。

## 第四步：寫第一個頁面

**操作位置：VS Code 左側檔案總管。**

在專案資料夾按右鍵 → New Folder 建立 `src`；在 `src` 裡建立 `pages` 資料夾；在 `pages` 按右鍵 → New File 建立 `index.astro`。

完整位置必須是 **`src/pages/index.astro`**。貼入以下完整內容，按 **Ctrl+S**：

```astro
<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>我的第一個網站</title>
  </head>
  <body>
    <h1>我的第一個網站</h1>
    <p>我正在學習從零建立網站。</p>
  </body>
</html>
```

`html` 包住整頁，`lang` 表示語言；`head` 裡的 `title` 是瀏覽器分頁名稱，UTF-8 讓中文正確顯示；`body` 裡的 `h1` 是畫面大標題，`p` 是段落。結束標籤有斜線，例如 `</p>`。

Astro 會把 `src/pages/index.astro` 當作首頁。這個小網站暫時不需要其他設定檔。手動建立流程可參考 [Astro 5 官方說明](https://v5.docs.astro.build/en/install-and-setup/#manual-setup)。

## 第五步：啟動自己寫的網站

**輸入位置：同一個專案的 PowerShell。**

```powershell
pnpm.cmd run dev
```

這會執行你在 `scripts` 定義的 `dev` 工作。終端機出現類似 `Local http://localhost:4321/` 後，把實際網址貼進瀏覽器網址列。

**這次不要等指令結束。** 它正在持續提供本機網站，保持終端機開著。`localhost` 是你的電腦，數字是服務的埠號；若 4321 被占用，使用畫面列出的其他數字。

**成功檢查：** 看到「我的第一個網站」與「我正在學習從零建立網站。」。現在只有文字很正常，下一篇會加入顏色與第二個頁面。

## 卡關與復原

| 狀況 | 下一步 |
| --- | --- |
| 找不到 package.json | 回第三步確認資料夾與 `Test-Path`。 |
| JSON 解析錯誤 | 檢查第二步的括號、英文雙引號、逗號；不要把程式碼框的三個反引號貼進檔案。 |
| 套件下載失敗 | 保留錯誤，確認網路後重試 `pnpm.cmd install`，不要加 `--force`。 |
| 顯示 Ignored build scripts 警告 | pnpm 10 預設限制套件安裝腳本。本教學的純文字頁面已在這個限制下建置成功；不要直接批准所有腳本。若後續真的出錯，保留錯誤再檢查。 |
| 顯示 404 | 確認檔案是 `src/pages/index.astro`，不是 `index.astro.txt`，並已儲存。 |
| 無法連線 | 確認 dev 還在執行，使用終端機的實際網址與埠號。 |
| 頁面語法錯誤 | 把 index.astro 還原為第四步完整內容，再儲存。 |

要停止：回終端機按 **Ctrl+C**；若詢問是否終止批次工作，輸入 `Y`。之後在同一資料夾執行 `pnpm.cmd run dev` 即可再啟動，不必重裝套件。

## 完成檢查

你已從空資料夾建立工具清單與首頁，看到自己寫的網站。保持 dev 執行，從下方「下一篇」繼續建立第二個頁面。
