---
id: beginner-tools-zh-tw
slug: beginner-tools
title: 第一次做網站：認識工具，找到輸入指令的地方
description: 給完全沒有程式經驗的 Windows 使用者。先認識網站與工具，再安裝 Node.js、pnpm 和 VS Code，確認自己已準備好。
locale: zh-TW
translationKey: beginner-tools
contentType: tutorial
difficulty: beginner
topics: [web-foundations]
skills: [terminal-basics]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-19
status: published
---

你不需要先懂程式。這條路徑要帶你完成一件具體的事：把一個網站放到自己的電腦上，修改標題，再用瀏覽器看到它。

第一篇只做工具準備。完成時，你會有一個能輸入指令的視窗、一個編輯檔案的工具，以及兩個成功顯示的版本號。頁首的閱讀時間不包含下載、安裝與練習時間。

## 開始前，你需要什麼？

- 一台可安裝軟體、能上網的 Windows 電腦；以下以 Windows 11 的畫面名稱為例。
- 會下載檔案、開啟資料夾和使用瀏覽器。手機不適合跟做這組練習。
- 暫時不需要 GitHub 帳號、Git 指令，也不需要購買網域或主機。

如果你使用 macOS 或 Linux，可以先閱讀概念，但不要照抄本文的 `.cmd` 指令；這一批操作教學只涵蓋 Windows。

## 先認識我們要做的網站

你平常開啟網站時，瀏覽器會取得網頁檔案，再把它們顯示成畫面。先記住三個名稱就夠了：

| 名稱 | 用白話說 | 例子 |
| --- | --- | --- |
| HTML | 說明網頁有哪些內容 | 標題、段落、連結 |
| CSS | 決定內容看起來如何 | 顏色、字體、間距 |
| JavaScript | 讓頁面能對操作作出反應 | 點按按鈕後切換外觀 |

我們使用的 **Astro** 是製作網站的工具。它把你寫的頁面與內容整理成瀏覽器能讀取的檔案。現在先使用準備好的範例，還不用自己從空白開始寫。

**GitHub** 是放置與分享程式檔案的網站；一組專案檔案放在一個 **repository（儲存庫）** 中。**Git** 則是記錄檔案修改歷史的工具，與 GitHub 不是同一件事。這次用下載 ZIP 的方式取得範例，所以可以先不安裝 Git。

**GitHub Pages** 能把網站檔案提供給網路上的訪客。這次先在自己的電腦練習，還不會發布到 GitHub Pages。

## 第一步：安裝 Node.js

Astro 需要在電腦上執行一些 JavaScript 工作。**Node.js** 就是讓這些程式能在瀏覽器外執行的工具；在這裡，它用來製作與預覽網站。

1. 用瀏覽器開啟 [Node.js 官方下載頁](https://nodejs.org/en/download)。
2. 選擇 **24.x LTS**、**Windows** 與 **Windows Installer（.msi）**。LTS 表示長期支援版本。本範例需要 Node.js 22.12 以上，這條路徑統一使用 24.x。
3. 一般 Intel／AMD 電腦選 x64；若不確定，在 Windows「設定 → 系統 → 系統資訊 → 系統類型」確認。ARM 電腦選 ARM64。
4. 開啟下載的安裝檔，依照安裝精靈完成。保留預設的 npm 與加入 PATH 選項；PATH 讓指令視窗找得到工具。這個範例不需要額外勾選原生模組的編譯工具。
5. 如果原本開著 PowerShell 或 VS Code，先關閉，再重新開啟，讓它們讀取新的工具位置。

使用學校或公司的電腦而沒有安裝權限時，請找管理者協助；先停在這裡即可。

## 第二步：指令到底要輸入在哪裡？

按 Windows 開始選單，搜尋 **PowerShell**，開啟「Windows PowerShell」。不用選「以系統管理員身分執行」。如果它顯示在 Windows Terminal 的分頁裡也正常：Terminal 是視窗，PowerShell 是其中接收指令的程式。

你可能看到這樣的提示：

```text
PS C:\Users\你的名稱>
```

這表示 PowerShell 正在等你輸入。不要把這行提示一起貼上。下面每個指令框都只複製框內的指令，一次一行，按 Enter 執行。

**輸入位置：剛開啟的 PowerShell；目前在哪個資料夾都可以。**

```powershell
node --version
```

`--version` 是詢問版本。成功時會顯示以 `v24.` 開頭的數字，例如 `v24.15.0`；最後幾位不必完全相同。這表示 PowerShell 找得到 Node.js。

接著輸入：

```powershell
npm.cmd --version
```

**npm** 是隨 Node.js 安裝的套件管理工具。「套件」就是專案會使用的現成程式零件。這裡先借 npm 安裝另一個套件管理工具 pnpm。成功時 npm 也會印出一組版本號。

## 第三步：安裝 pnpm

**pnpm** 會依專案清單下載 Astro 等需要的零件，並執行專案提供的工作。這個網站指定使用 pnpm 10.32.1。

**輸入位置：同一個 PowerShell；任意資料夾。**

```powershell
npm.cmd install --global pnpm@10.32.1
```

`install` 是安裝；`--global` 表示把指令工具安裝到可供不同專案使用的位置；`@10.32.1` 固定版本。這一步會連線下載。等待完成、重新出現 `PS ...>` 提示後，再輸入：

```powershell
pnpm.cmd --version
```

成功時應顯示 `10.32.1`。本文使用 `.cmd` 明確選擇 Windows 的命令檔，避免 PowerShell 誤選受到執行原則限制的 `.ps1` 檔案。你之後看到的 `pnpm` 指令，與這裡的 `pnpm.cmd` 是同一個工具。

這種安裝方式依據 [pnpm 10 的官方安裝說明](https://pnpm.io/10.x/installation)。現在不需要安裝最新版，也不用執行 `npm install` 來安裝網站本身的套件。

## 第四步：安裝編輯器 VS Code

**Visual Studio Code（VS Code）** 是用來編輯文字與程式檔案的工具，不是瀏覽器，也不是另一款叫 Visual Studio 的產品。

從 [VS Code 官方 Windows 安裝說明](https://code.visualstudio.com/docs/setup/windows) 前往下載 **User Installer**，執行安裝檔並完成安裝，然後開啟 VS Code。這次不用登入帳號、購買服務或安裝 AI 功能。下一篇才會用它開啟範例資料夾。

## 如果沒有成功，先看這裡

| 你看到的狀況 | 可以怎麼做 |
| --- | --- |
| `node` 或 `npm.cmd`「無法辨識」 | 關閉 PowerShell 再開啟。如果仍失敗，回到 Node.js 安裝程式，確認安裝完成且包含 npm／PATH，再重開視窗。 |
| `pnpm.cmd`「無法辨識」 | 先確認上一個安裝指令是否成功，重開 PowerShell 後再試。仍失敗時保留完整錯誤，不要一直重複安裝。 |
| 顯示禁止執行 `npm.ps1` 或 `pnpm.ps1` | 確認用了本文的 `npm.cmd`、`pnpm.cmd`，不必修改整台電腦的執行原則。 |
| 出現 `EACCES`、`EPERM` 或拒絕存取 | 表示工具無法寫入目標位置。停止安裝並請管理者協助，不要直接加 `--force` 覆蓋既有工具。 |
| 出現連線失敗或 `ERR_...` | 確認網路可連線；若是受管理的網路，請管理者檢查限制。保存錯誤文字，不要把錯誤訊息當作下一個指令。 |

需要求助時，附上「你輸入的指令、完整錯誤、Node.js 版本」；個人資料夾路徑中的使用者名稱可以先遮住。

## 完成檢查

繼續前，確認三件事：

1. `node --version` 顯示 `v24.` 開頭的版本。
2. `pnpm.cmd --version` 顯示 `10.32.1`。
3. VS Code 能開啟。

你現在已知道在哪裡輸入指令。下一篇會下載網站檔案，找到正確的資料夾，讓瀏覽器第一次顯示本機網站。使用下方學習路徑的「下一篇」繼續。
