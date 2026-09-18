---
id: astro-knowledge-platform-zh-tw
slug: astro-knowledge-platform
title: 使用 Astro 建立零成本技術知識平台：從內容模型到 GitHub Pages
description: 以本儲存庫的實作說明五種內容實體、Astro 靜態頁面、雙語路由、內容圖譜驗證、Pagefind 搜尋與 CI 驗證後的 GitHub Pages 交付。
locale: zh-TW
translationKey: astro-knowledge-platform
contentType: tutorial
difficulty: intermediate
topics: [platform-engineering, backend-engineering]
skills: [astro-content-modeling, static-site-delivery]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-18
status: published
---

工程網站的讀者不一定從最新文章開始。有些人需要循序學習，有些人想查概念，也有人帶著具體錯誤尋找排障案例。本儲存庫把知識建模一次，再產生不同的靜態閱讀入口，讓文章不只是依日期排列的清單。

本文描述本儲存庫已實作的架構：Astro 5、嚴格 TypeScript、Markdown、pnpm、Pagefind 與 GitHub Actions。建置產物包含 HTML、CSS、少量瀏覽器 JavaScript、搜尋索引，以及 XML／文字格式的 feeds。不需要部署應用程式伺服器、資料庫、帳號系統或遠端搜尋服務。

標題中的「零成本」指以公開儲存庫搭配 GitHub Pages 為目標，不需要額外付費基礎設施；不代表所有 GitHub 使用情境、流量規模或其他雲端專案都免費。服務適用條件請參閱 [GitHub Pages 官方文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。網站展示的 AI SRE Platform 是獨立的 **lab 架構實驗室**，不能因此把這個知識平台描述成正式環境維運成果。

## 先取得可重現的本機建置

準備 Node.js 22.12 以上版本，以及 `package.json` 固定的 pnpm 10.32.1。取得儲存庫後執行：

```bash
pnpm install --frozen-lockfile
pnpm run content:validate
pnpm run test
pnpm run check
pnpm run build
pnpm run test:build
pnpm preview
```

Frozen install 使用已提交的 lockfile。內容驗證會在正式建置前執行；`check` 同時執行 Astro 診斷及 TypeScript no-emit 檢查。`build` 先產生 `dist/`，再讓 Pagefind 建立搜尋索引。`test:build` 檢查實際 HTML、連結與資源，以及 canonical、sitemap、RSS、robots.txt 是否符合設定的部署路徑。

編輯時可以使用 `pnpm dev`，但它不會建立 Pagefind 索引。搜尋測試應使用 build 後的 preview。Windows 若找不到 pnpm，可改用 `corepack.cmd pnpm`；`scripts/validate-all.ps1` 會透過 Corepack 執行五項必要指令與建置產物檢查。整合測試與 Chromium 測試需另外執行 `test:collections` 和 `test:browser`。

## 五種實體，共用一份文章來源

內容目錄如下：

```text
src/content/
  articles/en/                 英文 Markdown 與 YAML frontmatter
  articles/zh-tw/              繁體中文 Markdown
  topics/                     JSON 瀏覽分類
  skills/                     JSON 學習依賴節點
  learning-paths/             JSON 有序文章清單
  projects/                   JSON 專案與關聯
```

五種 schema 定義於 `src/content/schemas.ts`，命令列驗證器與 Astro Content Collections 共用它們。Schema 採嚴格模式，不認得的欄位會報錯，不會悄悄丟棄。目前文章使用 Markdown、其他實體使用 JSON，沒有安裝 MDX integration。

Article 的三種識別資訊各有用途：`id` 是單一實體的穩定身分；`translationKey` 把不同語言的對應內容分組；`slug` 決定公開網址。本文的兩個語言版本具有不同 ID，但共用 translation key。只改網址 slug 時，不應被迫修改所有 LearningPath 或 Project 引用。

Topic 是讓人瀏覽的分類，例如平台工程。Skill 則描述能力或學習依賴。把兩者分開，才不會把廣泛分類誤當作具體先備知識。初始 Topic 分類刻意維持淺層。

## 每個關聯只有一個權威來源

Article 擁有 Topic、Skill、先備 Skill 與推薦 Article 引用。LearningPath 擁有有序的文章成員清單；Project 擁有相關文章、精選技能及相關學習路徑。

例如 `knowledge-platform` 學習路徑的 section 包含本文的兩個語言 ID。頁面依語言與發布狀態篩選後保留原始順序，不會再依標題或日期排序。

Article 不得加入 `order`、`level`、`learningPaths`、`projects` 或 `estimatedMinutes`。前四者會造成重複權威來源或模糊語意；閱讀時間應由建置推導。只有需要例外時，才使用正整數 `estimatedMinutesOverride`。

`src/utils/graph.ts` 的 `reverseIndexes()` 計算反向關聯：從 Article ID 找到引用它的 LearningPath 與 Project，或從 Skill ID 找到引用文章、依賴技能與專案。反向清單會去重，但不改動來源的順序。內容圖譜留在建置時記憶體中，不會在瀏覽器執行整套圖譜運算。

## 在 Astro 載入前驗證原始檔案

Loader 以 ID 儲存內容。如果兩個檔案使用相同 ID，只檢查載入後的資料可能看不到重複。因此 `src/utils/content-source.ts` 先讀原始內容、保留每筆來源路徑，再進行 ID 與 schema 檢查。即使其中一筆 metadata 不合法，也不會讓重複 ID 消失。

V1 的 hard errors 包含：

- 五種實體各自出現重複 ID。
- Article 引用了不存在的 Topic、Skill、先備 Skill 或推薦 Article。
- LearningPath 引用了不存在的 Article。
- Project 引用了不存在的 Article、Skill 或 LearningPath。
- Article 使用禁止欄位、內容無法解析，或不符合 schema。

錯誤會讓 CLI 以非零狀態結束。警告則具有固定 ID，不阻擋指令：文章沒有 Topic／Skill、已發布文章不屬於 LearningPath／Project、已棄用 Skill 仍被引用，以及翻譯群組只有一個語言。

本文刻意不屬於 Project：說明知識平台的文章，不等於 AI SRE 實驗室的專案文件。`W_ARTICLE_NO_PROJECT` 是提醒，不應為了消除警告而建立不真實的關聯。

Skill 依賴循環、Topic 父層循環、supersession 循環、空 LearningPath section，以及複雜翻譯圖譜檢查，都不是 V1 阻擋條件。這個範圍同時記錄於架構文件與測試。

## 雙語頁面與單一 canonical Article

Astro 會靜態產生 `/zh-tw/` 與 `/en/`，以及 Start、Learn、Topics、Blog、Cases、Projects、About、Search 區段。Topic、LearningPath、Project 詳細頁只聚合文章連結，不複製完整文章內容。

`tutorial`、`concept`、`reference`、`opinion` 對應 `/blog/:slug/`；`troubleshooting`、`case-study` 對應 `/cases/:slug/`。路徑工具還會加入語言與部署 base。只有 `status: published` 的文章產生公開頁面；draft 與 archived 仍接受內容驗證，但不進入公開列表、feeds 或搜尋。

文章的語言切換依 translation key 尋找已發布對應版本，並使用目標自己的 slug 與內容類型路由。找不到時返回目標語言首頁；SEO 的 hreflang 只列出真正存在的已發布翻譯。語言入口與兩個首頁構成互相對應的群組，以語言入口作為 `x-default`。共用的非文章實體維持單一 ID，繁體中文顯示文字放在 `src/i18n/content.ts`，依 collection 與所屬學習路徑區分命名空間。缺少翻譯時會警告並使用來源文字，找不到對應實體的翻譯鍵則會報錯。適合對象、難度與成熟度的顯示文字也依語言切換，不改變關聯擁有權。

首頁依序呈現 Hero、Start Here、LearningPaths、精選 Topics、精選 Project、最新 Cases、最新 Articles、About／Experience。空清單會明確顯示尚無已發布內容，不會為了填版面而虛構事件或工作經歷。

## 主題控制與靜態搜尋

外觀只有 light、dark、system 三種選擇。沒有儲存偏好時使用 system。Head 中的小型 inline script 在初次繪製前決定色彩模式；瀏覽器控制程式儲存明確選擇、監聽作業系統變更，也能在 localStorage 被阻擋時繼續操作。停用 JavaScript 時，CSS 仍可跟隨作業系統偏好。

導覽使用語意化連結，在窄螢幕自動換行，不依賴 JavaScript 才能開啟。Layout 提供 skip link、可見的鍵盤焦點、語言標籤與原生 theme select。Article 標題產生靜態目錄，不需要 React hydration。

閱讀時間在建置時計算：漢字以每分鐘 400 字、其他詞語以每分鐘 200 詞估算，加總後向上取整且至少一分鐘。Fenced code、HTML tags、Markdown 連結／圖片目的網址不列入估算。這是可預期的近似值，不代表個別讀者的速度。

Pagefind 索引 canonical Article 與 Topic、LearningPath、Project 詳情頁的主要內容，包含標題、描述、內文及已顯示的 Topic／Skill 名稱。首頁、分類索引頁、語言入口、全站導覽與搜尋介面都排除。搜尋頁只載入本地 Pagefind 檔案，bundle 與結果網址都帶有部署 base。不同語言使用分開的索引。目前 Pagefind 對 `zh-tw` 不提供 stemming，因此不會跨詞根形式擴展匹配；瀏覽器測試會實際查詢兩種語言並開啟結果。

## 在建置階段產生 SEO 與 feeds

共用 Layout 輸出 title、description、canonical、Open Graph、分享圖片、語言 alternate links 與 RSS discovery link。技術文章使用 `TechArticle` JSON-LD，opinion 使用 `Article`。JSON 序列化會跳脫 `<`，避免文字終止 script element。

Astro 的 `sitemap.xml.ts`、`robots.txt.ts` 與語言目錄下的 `rss.xml.ts` 是建置時 endpoint，最後產生靜態檔案，不是部署後的 backend API。RSS 使用穩定 Article ID 作 GUID、canonical URL 作連結，並提供在地化頻道標題與絕對 Atom self URL。已發布文章的路由碰撞會在內容驗證階段列出兩個來源檔案；sitemap 另保留最終唯一性檢查。產生的 robots 文字允許一般 crawler 與 OAI-SearchBot，並指向設定好的 sitemap。儲存庫網站的 crawler 只採用 origin 根目錄的 robots，因此 `/Blog/robots.txt` 本身無法設定爬取政策或 sitemap discovery。維護者須在發布前設定使用者網站根目錄的 robots 與 sitemap 指令；本機驗證只檢查產生的文字。

## 分開設定 GitHub Pages 的 origin 與 base

使用者網站可使用 `https://username.github.io` 搭配 `/`；儲存庫網站則使用相同 origin 搭配 `/repository-name/`。只設定 origin 不夠，導覽、CSS、scripts、搜尋結果、feeds 與分享 metadata 都需要一致的 base。

PowerShell 範例：

```powershell
$env:SITE_URL = 'https://username.github.io'
$env:SITE_BASE = '/repository-name/'
corepack.cmd pnpm run build
corepack.cmd pnpm run test:build
```

`SITE_URL` 只接受 HTTP(S) origin，儲存庫路徑放入獨立的 `SITE_BASE`。本機預設是 `http://localhost:4321` 與 `/`。CI 的 `scripts/configure-pages.ts` 會從 `GITHUB_REPOSITORY` 推導設定，並處理 owner-site 的特殊名稱。本儲存庫的專案網站目標為 `https://a4225344a.github.io/Blog/`。

## 交付已驗證的同一份產物

CI 在 pull request 與 main push 時執行，儲存庫權限為 read-only。流程先 frozen install、內容驗證、確定性測試與 Astro／TypeScript 檢查，再建置根路徑及 production base 版本。每個版本都接受產物檢查與 Chromium 測試。

只有 main push 會上傳 `verified-site`。獨立部署 workflow 等待 CI 成功，確認它來自本 repository 的 main push，並拒絕已不是目前 main 的 SHA。部署從指定 run 下載該份產物，重新封裝供 Pages 使用，不 checkout 或重新建置原始碼。只有 deploy job 取得 Pages write 與 OIDC 權限，外部 Actions 固定至 commit hash。

維護者仍須在 GitHub 啟用 Actions 作為 Pages source，並設定 branch／environment protection 以落實人工 gate。本機成功不能證明遠端 workflow 或公開部署已執行。獨立審查仍待進行，目前實作狀態為 `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`。

## 讓 V1 保持小而可驗證

儲存庫包含 schema、引用、警告、順序、路徑、閱讀時間、feeds 與 hosting 設定的純邏輯測試，也檢查 workflow 結構與實際產物，並用 Chromium 測試主題、行動導覽與搜尋。這些是驗證證據，不是獨立 review。

V1 不實作帳號、資料庫、AI chat／推薦、quiz、progress tracking 或互動 Skill Graph。接下來最有價值的投入，是能符合既有模型的真實工程內容：文章只存一次，從正確的權威實體引用它的 ID，執行驗證，再由靜態頁面讓讀者找到它。
