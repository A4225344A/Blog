---
id: beginner-local-website-zh-tw
slug: beginner-local-website
title: 把網站開在自己的電腦：下載範例、找到資料夾、啟動 Astro
description: 一步一步下載這個網站的教學版本，用 VS Code 的 PowerShell 終端機安裝套件，再用瀏覽器確認本機網站已啟動。
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

這一篇的成果是：在瀏覽器看到你電腦上的網站，而不是網路上的正式站。你還不用修改程式。

開始前，請先完成上一篇的工具準備：Node.js 24.x、pnpm 10.32.1 與 VS Code。若你還不知道 PowerShell 是什麼，先用文末的「上一篇」回去完成準備。

## 第一步：下載並解壓縮範例

我們使用 [這個網站的公開儲存庫](https://github.com/A4225344A/Blog)。為了讓你看到的檔案與教學一致，以下連結固定在已發布的範例版本，而不是一直變動的最新版本。

1. 在瀏覽器點選 [下載本次練習的 ZIP](https://github.com/A4225344A/Blog/archive/8974f88ce3d6d5fb24009e4844405caa5af13b17.zip)。不需要登入 GitHub。
2. 開啟 Windows 檔案總管，進入「下載」資料夾。
3. 對下載的 `.zip` 檔按右鍵，選「解壓縮全部」，完成解壓縮。不要直接在 ZIP 視窗裡編輯。
4. 打開解壓縮後的資料夾。可能還要再打開一層名稱以 `Blog-` 開頭的資料夾，直到你同時看到 `package.json`、`pnpm-lock.yaml` 與 `src`。
5. 把**包含這三個項目**的資料夾重新命名為 `website-practice`，保留在你找得到的位置。這是本次的「專案資料夾」。若名稱已存在，選另一個新名稱，不要覆蓋舊檔案。

資料夾應大致長這樣，還會有其他檔案：

```text
website-practice/
  package.json
  pnpm-lock.yaml
  src/
    pages/
      index.astro
```

ZIP 是某個時間點的檔案副本，不會包含 Git 的修改歷史，也不會自動更新成正式站的最新版本。這是 GitHub 提供的 [原始碼壓縮檔下載方式](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives)。

## 第二步：用 VS Code 開啟正確資料夾

1. 開啟 VS Code。
2. 選上方 **File → Open Folder（檔案 → 開啟資料夾）**。
3. 選剛才的 `website-practice` 資料夾，按「選取資料夾」。
4. 如果出現 Workspace Trust 提示，先確認你開啟的是上方公開範例，再決定信任該資料夾。不要對不明來源的下載照做。

**成功檢查：** 左側 Explorer（檔案總管）應直接列出 `package.json`、`pnpm-lock.yaml` 和 `src`。若只看到另一個 `Blog-...` 資料夾，代表開啟的位置太外層，重新選擇內層資料夾。

`package.json` 是專案的工具與工作清單；`pnpm-lock.yaml` 記錄要安裝的套件版本。你現在只需要找到它們，不用修改。

## 第三步：在這個資料夾打開 PowerShell

在 VS Code 選 **Terminal → New Terminal（終端機 → 新增終端機）**。下方會出現輸入指令的區域。

確認終端機分頁是 **PowerShell**。如果是其他程式，點終端機旁的下拉箭頭，選 PowerShell 開啟新分頁。不要把指令打進中間的檔案編輯區，也不要打進瀏覽器網址列。

**輸入位置：VS Code 下方的 PowerShell 終端機。** 一次輸入一行並按 Enter：

```powershell
Get-Location
```

這個指令顯示「現在所在的資料夾」，通常應以 `website-practice` 結尾。再確認：

```powershell
Test-Path .\package.json
```

成功時顯示 `True`。`.\` 表示目前的資料夾。若是 `False`，先不要安裝：重新用 File → Open Folder 選正確資料夾，關閉舊終端機分頁，再新增一個終端機。

## 第四步：安裝網站需要的套件

**輸入位置：同一個終端機，且上一個檢查已顯示 `True`。**

```powershell
pnpm.cmd install --frozen-lockfile
```

這會依清單下載 Astro 等工具，放入 `node_modules` 等由工具管理的位置。`--frozen-lockfile` 表示依照範例既有的版本清單安裝，不擅自改寫它。

第一次需要上網，可能要等一段時間。完成後通常會看到 `Done in ...`，並回到 `PS ...>` 提示。接著輸入：

```powershell
$LASTEXITCODE
```

應顯示 `0`，表示剛才的安裝指令成功。不要把下載中的訊息或 `ERR_...` 當成已完成；如果不是 `0`，先處理下方的錯誤，不要繼續啟動。

此練習用 pnpm 管理網站套件，不要再在同一份專案執行 `npm install`。也不用手動編輯 `node_modules`。

## 第五步：啟動，再用瀏覽器開啟

**輸入位置：同一個專案資料夾的 PowerShell。**

```powershell
pnpm.cmd run dev
```

`run dev` 是執行 `package.json` 裡名為 `dev` 的工作；這個範例用它啟動 Astro 的本機預覽。你可能看到類似：

```text
Local  http://localhost:4321/
```

**這次不要等指令結束。** 網站正在執行，所以終端機暫時不會回到 `PS ...>`。保持視窗開著，複製它實際顯示的網址，貼到瀏覽器的網址列，再按 Enter。

`localhost` 是「這台電腦」；`4321` 是這個服務使用的埠號，可以把它想成在電腦內找服務的門牌。如果 4321 已被使用，Astro 可能顯示另一個數字；請使用畫面實際列出的網址。這符合 [Astro 5 的開發流程](https://v5.docs.astro.build/en/develop-and-build/)。

**成功檢查：** 你應看到 **Engineering Knowledge Platform** 標題，以及「繁體中文」與「English」連結。這是語言入口頁。先停在這一頁，下一篇會改它的標題。

網址應該以 `http://localhost:` 開頭，不是 `https://a4225344a.github.io/Blog/`。後者是公開網站，不會顯示你稍後在自己電腦做的修改。

## 常見卡關與復原方式

| 狀況 | 原因與下一步 |
| --- | --- |
| 找不到 `package.json`、顯示 `ERR_PNPM_NO_PKG_MANIFEST` | 位置不對。回到第二、三步，確認左側檔案及 `Test-Path`。 |
| 套件版本或 lockfile 不相符 | 先確認 `pnpm.cmd --version` 是 `10.32.1`。如果曾修改下載的檔案，重新解壓縮到另一個空資料夾試一次；保留原本的工作，不要刪 lockfile 或加 `--force`。 |
| 下載失敗 | 確認網路，保留錯誤訊息。網路恢復後，可以在同一資料夾重新執行安裝指令。 |
| 瀏覽器顯示無法連線 | 確認 `run dev` 還在執行，並使用終端機顯示的 Local 網址與埠號。 |
| 終端機只有兩個 `W_ARTICLE_NO_PROJECT` 警告 | 範例的兩篇文章沒有掛到專案，這是已知內容警告，不是安裝失敗。若有 `E_...` 或 `ERR_...` 則先停下來查看。 |
| 點到搜尋卻沒有結果 | 開發模式還沒產生搜尋索引；不影響本次練習。搜尋需要正式建置後才可測試，先回語言入口。 |

要停止網站：點回正在執行的終端機，按 **Ctrl+C**；如果詢問是否終止批次工作，輸入 `Y` 再按 Enter。回到 `PS ...>` 後就停止了。下次在同一資料夾再次執行 `pnpm.cmd run dev` 即可，不用每次重裝套件。

## 完成檢查

你能在 `localhost` 的瀏覽器頁面看到語言入口，知道是哪一個資料夾啟動它，也知道如何停止與重新啟動。下一篇會修改檔案，讓畫面真的改變。
