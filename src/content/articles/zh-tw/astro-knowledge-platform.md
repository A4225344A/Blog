---
id: astro-knowledge-platform-zh-tw
slug: astro-knowledge-platform
title: "本站 Astro 部落格的內容模型與交付設計"
description: "從四篇文章共用的內容模型出發，說明雙語路由、靜態搜尋與 GitHub Pages 產物交付。"
locale: zh-TW
translationKey: astro-knowledge-platform
contentType: tutorial
difficulty: intermediate
topics: [platform-engineering, backend-engineering]
skills: [astro-content-modeling, static-site-delivery]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-18
updatedAt: 2026-09-21
status: published
---

這篇說明「全端工程師的技術部落格」如何管理內容。前三篇做出能部署的小網站；當文章需要雙語版本、系列順序與主題分類時，接下來要處理的是同一份內容如何被多個頁面找到。

本站使用 Astro 5、TypeScript、Markdown 與 Pagefind。它們在建置時產生頁面和搜尋索引，GitHub Pages 負責提供檔案。以下的檔案路徑都對應本站儲存庫。

## 在本機跑一次完整建置

沿用系列的 Node.js 24.x 與 pnpm 10.32.1。尚未安裝的讀者，先依第二篇準備 Node.js、Git，再用 PowerShell 執行 `npm.cmd install --global pnpm@10.32.1`。儲存庫的最低 Node 版本為 22.12，但本文操作統一使用 24.x。

```powershell
git clone https://github.com/A4225344A/Blog.git
cd Blog
pnpm.cmd install --frozen-lockfile
pnpm.cmd run content:validate
pnpm.cmd run test
pnpm.cmd run check
pnpm.cmd run build
pnpm.cmd run test:build
pnpm.cmd run preview
```

`--frozen-lockfile` 要求依照已提交的相依版本紀錄安裝。`check` 檢查 Astro 與 TypeScript；`build` 產生 `dist` 並建立 Pagefind 索引；`test:build` 再檢查產物中的連結與網址。

平常編輯可執行 `pnpm.cmd run dev`。搜尋索引只在 build 產生，因此要驗證搜尋，請先停止 dev，再 build 和 preview。Preview 顯示的是上次建置結果，修改文章後必須重新建置。

## 文章只存一次，閱讀入口分開產生

```text
src/content/
  articles/zh-tw/     繁體中文文章
  articles/en/        英文文章
  topics/            瀏覽分類
  skills/            技能與先備能力
  learning-paths/    有順序的文章系列
  projects/          專案資料
```

文章是 Markdown，檔案開頭兩條 `---` 之間的欄位稱為 frontmatter，用來描述標題、語言與發布狀態。其餘四種資料使用 JSON。`src/content/schemas.ts` 定義每種資料可接受的欄位與型別，這就是內容的 schema（資料規格）。

例如，同一篇文章可以出現在主題頁與系列頁，但這些入口只放連結，不複製正文。修改原始文章後，所有入口都指向更新後的同一頁。

### ID、翻譯群組與網址

三個欄位處理不同問題：

| 欄位 | 用途 | 改動的影響 |
| --- | --- | --- |
| `id` | 穩定的內容身分 | 系列與專案用它引用文章，不隨改標題更動 |
| `translationKey` | 將中英文版本配成一組 | 語言切換依它找到對應文章 |
| `slug` | 公開網址的最後一段 | 可更新網址，舊網址另保留改版說明 |

系列前三篇原本使用 `beginner-*` 網址，內容重寫後改用描述用途的網址。舊入口會說明改版與目前閱讀門檻，再提供新版連結；文章 ID 保留，避免改網址牽動所有引用。

### 誰決定文章的順序

LearningPath 代表文章系列，自己的 `sections[].articleIds` 決定閱讀順序。現在四篇文章收在同一個 Astro 系列：選型、專案、內容與部署、本站架構。建置時先依語言與發布狀態篩選，然後保留這份清單的順序。

Project 決定專案有哪些相關文章。Article 則記錄自己的 Topic 分類、Skill 技能與推薦文章。每種關聯只維護一個來源。要從文章回查所屬系列時，由 `src/utils/graph.ts` 算出反向索引，不再手寫另一份清單。

AI SRE Platform 是另一個實驗室專案，目前沒有相關文章。Astro 系列說明的是部落格本身，因此不屬於該專案。

## 在產生頁面之前找出資料錯誤

Astro 依 ID 載入內容。如果兩份檔案誤用相同 ID，等載入完才檢查可能已經看不到被覆蓋的那筆。本站先由 `src/utils/content-source.ts` 讀取原始檔案，保留來源路徑再驗證。

會中止建置的錯誤包括重複 ID、引用不存在的文章或分類、缺少必要欄位，以及使用禁止的文章欄位。例如文章不能自己填 `order`：順序已由系列決定。錯誤輸出會指出對應檔案，指令也會回傳失敗狀態，讓 CI 停止。

有些情況只適合提醒。文章尚未歸屬專案會得到 `W_ARTICLE_NO_PROJECT`，但仍能發布。本站目前的 Astro 文章就屬於這種情況。比起硬湊專案關聯，保留這個提醒比較符合內容現況。

技能依賴是否形成循環等進階檢查尚未加入。現有驗證先處理會讓頁面引用失效的問題。

## 雙語路由與搜尋引擎標記

繁體中文頁面位於 `/zh-tw/`，英文頁面位於 `/en/`。一般文章使用 `/blog/`，排障或案例文章使用 `/cases/`。只有 `published` 狀態會產生公開文章，草稿與封存內容不進入列表、RSS 或搜尋。

讀者切換語言時，程式用 `translationKey` 找對應文章，再使用該版本自己的網址。沒有翻譯時才回到目標語言首頁。

給搜尋引擎的 `canonical` 指定正文的主要網址；`hreflang` 列出實際存在的語言版本。語言入口另外使用 `x-default` 表示未指定語言時的入口。這些標記集中在版型產生，不需每篇文章自行填寫。

主題與專案是中英文共用的資料，翻譯放在 `src/i18n/content.ts`。這裡只翻譯顯示名稱，不另建兩份專案實體。

## 不靠後端的搜尋與閱讀介面

Pagefind 在 `dist` 的 HTML 中擷取文章與內容詳情頁，建立本地搜尋索引。首頁與導覽不加入索引，避免每次搜尋都重複命中選單文字。搜尋頁讀取部署目錄裡的索引檔，不呼叫遠端搜尋服務。

繁體中文可搜尋，但 Pagefind 不會替 `zh-tw` 做詞形還原，也就是不自動把不同詞形當作相同字詞。這和搜尋功能完全不能使用是兩回事。

文章正文與目錄是靜態 HTML。外觀選擇只有淺色、深色與跟隨系統；小段 JavaScript 負責記住選擇，沒有把整個網站改成 React 應用。鍵盤使用者可以用跳至正文連結略過導覽。

## GitHub Pages 的子路徑

`https://name.github.io` 是 origin（協定與主機名稱）；`/Blog/` 是 base（部署子路徑）。圖片、文章連結與搜尋結果都必須包含正確的 base。

下面設定只對目前 PowerShell 視窗有效：

```powershell
$env:SITE_URL = 'https://YOUR_USERNAME.github.io'
$env:SITE_BASE = '/Blog/'
pnpm.cmd run build
pnpm.cmd run test:build
pnpm.cmd run preview
```

停止 preview 後，回到一般本機開發先清除：

```powershell
Remove-Item Env:SITE_URL, Env:SITE_BASE -ErrorAction SilentlyContinue
pnpm.cmd run dev
```

`sitemap.xml` 列出公開網址，RSS 提供各語言的文章更新。專案路徑下的 `/Blog/robots.txt` 不是爬蟲使用的網域根目錄檔案；若要設定爬取政策，還需在 `https://name.github.io/robots.txt` 所屬的網站處理。

## 發布的是檢查過的那份產物

本站 `.github/workflows/ci.yml` 在 PR 和 main push 執行安裝、內容驗證、測試與建置。PR 不部署。main 建置成功後保存產物，deploy 工作只有在 `github-pages` 設定 Required reviewers 後才會等待批准，接著檢查 main 的 commit SHA（版本識別碼）是否仍相同。

部署時不重新建置，是因為我希望發布的就是先前檢查過的那份檔案。只有 deploy 取得 Pages 寫入與短效身分驗證權限。GitHub 上的必要審查者與分支限制必須另外設定，單靠 YAML 的環境名稱不會啟用它們。

本站也有選配 GA4。瀏覽器測試只使用合成 Measurement ID；最後的正式產物才讀取正式 ID，並做靜態產物檢查，不在測試瀏覽器中執行。這樣測試流量不會進入正式統計。GA4 不參與內容模型，也不提供網站上的公開瀏覽計數器。

前三篇的小部落格已足以發布幾個頁面。當頁面需要共用分類、系列順序與翻譯時，本站才加入這些內容關聯。規劃自己的部落格時，可以先想清楚要維護哪些關聯，以及哪些檢查能在讀者遇到斷鏈之前發現問題。
