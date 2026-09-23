---
id: astro-knowledge-platform-zh-tw
slug: astro-knowledge-platform
title: "用 Astro 整理雙語文章、系列與搜尋"
description: "四篇文章、兩種語言，怎麼管理網址和系列順序？從實際檔案看 Content Collections、Pagefind 與部署檢查。"
locale: zh-TW
translationKey: astro-knowledge-platform
contentType: tutorial
difficulty: intermediate
topics: [web-foundations, platform-engineering]
skills: [astro-content-modeling, static-site-delivery]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-18
updatedAt: 2026-09-23
status: published
---

四篇文章各有中英兩版，還要放進系列目錄和主題頁。我不想每次改標題或網址，都回頭找有哪些清單要一起改，所以把文章之間的關係也存成資料，交給建置程式產生連結。

這篇沿著部落格的檔案說明這個做法。它比操作教學更早發布，後來才排到系列第四篇；想從空專案開始，可以先看前面三篇。

程式使用 Astro 7.3.3 和 TypeScript，文章用 Markdown，搜尋交給 Pagefind。下面的路徑都能在 [GitHub 儲存庫](https://github.com/A4225344A/Blog) 找到。

## 在本機跑一次完整建置

準備 Node.js 24.x、Git 和 pnpm 10.32.1。還沒安裝的話，可以照第二篇設定，再用 PowerShell 執行 `npm.cmd install --global pnpm@10.32.1`。`package.json` 接受 Node 22.12 以上，以下沿用系列的 24.x。

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

## 一份正文，幾種入口

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

例如「為什麼我用 Astro」同時列在網站建置主題和 Astro 系列裡，兩邊都連到 `/Blog/zh-tw/blog/why-astro/`。正文只改一份 Markdown。

### ID、翻譯群組與網址

三個欄位處理不同問題：

| 欄位 | 用途 | 改動的影響 |
| --- | --- | --- |
| `id` | 穩定的內容身分 | 系列與專案用它引用文章，不隨改標題更動 |
| `translationKey` | 將中英文版本配成一組 | 語言切換依它找到對應文章 |
| `slug` | 公開網址的最後一段 | 可更新網址，舊網址另保留改版說明 |

前三篇改過網址：原本的 `beginner-*` 現在是改版說明頁，會連到新版文章。檔案裡的 ID 仍保留，例如 `beginner-tools-zh-tw` 的網址已是 `why-astro`，系列清單不必跟著換 ID。

### 誰決定文章的順序

`src/content/learning-paths/knowledge-platform.json` 裡的 `sections[].articleIds` 就是系列順序。建置時依語言和發布狀態篩選，保留清單原本的排列，所以中英文都會從選型、建立專案、發布文章，一路讀到這篇。

專案的相關文章記在 Project；分類、技能和推薦文章記在 Article。如果要知道一篇文章屬於哪個系列，`src/utils/graph.ts` 會從系列清單反查，文章裡不用再填一次。

## 在產生頁面之前找出資料錯誤

如果兩份檔案用了同一個 ID，Astro 載入時可能只留下其中一筆。我讓 `src/utils/content-source.ts` 先讀取原始檔案和路徑，這樣才能在資料被覆蓋前找出重複 ID。

會中止建置的錯誤包括重複 ID、引用不存在的文章或分類、缺少必要欄位，以及使用禁止的文章欄位。例如文章不能自己填 `order`：順序已由系列決定。錯誤輸出會指出對應檔案，指令也會回傳失敗狀態，讓 CI 停止。

執行驗證時，也會看到 `W_ARTICLE_NO_PROJECT`。四篇 Astro 文章的中英版本都沒有掛在 Project 下，因此會產生八個警告，但不會中止建置。

技能依賴是否形成循環等進階檢查尚未加入。現有驗證先處理會讓頁面引用失效的問題。

## 雙語路由與搜尋引擎標記

繁體中文頁面位於 `/zh-tw/`，英文頁面位於 `/en/`。一般文章使用 `/blog/`，排障或案例文章使用 `/cases/`。只有 `published` 狀態會產生公開文章，草稿與封存內容不進入列表、RSS 或搜尋。

點語言切換時，程式用 `translationKey` 找另一個版本，再開啟它的網址。沒有翻譯才回到該語言首頁。

給搜尋引擎的 `canonical` 指定正文的主要網址；`hreflang` 列出實際存在的語言版本。語言入口另外使用 `x-default` 表示未指定語言時的入口。這些標記集中在版型產生，不需每篇文章自行填寫。

主題與專案是中英文共用的資料，翻譯放在 `src/i18n/content.ts`。這裡只翻譯顯示名稱，不另建兩份專案實體。

## 不靠後端的搜尋與閱讀介面

Pagefind 在 `dist` 的 HTML 中擷取文章與內容詳情頁，建立本地搜尋索引。首頁與導覽不加入索引，避免每次搜尋都重複命中選單文字。搜尋頁讀取部署目錄裡的索引檔，不呼叫遠端搜尋服務。

繁體中文可搜尋，但 Pagefind 不會替 `zh-tw` 做詞形還原，也就是不自動把不同詞形當作相同字詞。

文章正文和目錄都是靜態 HTML，關閉 JavaScript 也能閱讀和跳段落。外觀切換則用一小段 JavaScript 記住淺色、深色或跟隨系統的選擇；鍵盤操作可以從「跳至主要內容」略過導覽。

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

打開 `.github/workflows/ci.yml`，可以看到驗證與部署分成兩個工作。PR 只做檢查；推送到 main 時，驗證成功後會保存建置產物。`github-pages` 環境設好 Required reviewers，部署才會等人工批准。核准後還會比對 main 的 commit SHA（版本識別碼），確認沒有更新的版本。

部署時不重新建置，是因為我希望發布的就是先前檢查過的那份檔案。只有 deploy 取得 Pages 寫入與短效身分驗證權限。

想試著調整系列順序，可以修改 `knowledge-platform.json` 的 `articleIds`，再跑一次 build。目錄與文章底下的上一篇、下一篇會一起更新，文章檔案本身不用移動。
