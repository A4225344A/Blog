---
id: beginner-first-change-zh-tw
slug: astro-content-and-layout
title: "加入文章與共用版型"
description: "用 Astro 版型共用頁面外框，以 Markdown 寫第一篇文章，再從首頁連過去。"
locale: zh-TW
translationKey: beginner-first-change
contentType: tutorial
difficulty: intermediate
topics: [web-foundations]
skills: [astro-content-modeling]
prerequisiteSkills: [local-website-preview]
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-24
status: published
---

上一篇已經有首頁了，接著加一篇文章。我把標題、導覽和樣式放進共用版型，正文用 Markdown 寫。以後改頁面外觀，就不用逐篇修改 HTML。

繼續使用 `engineering-blog` 資料夾，這篇先把文章在本機跑起來。

## 把重複的 HTML 留給版型

先建立 `src/layouts/PostLayout.astro`。版型是共用的頁面外框，文章正文放進 slot：

```astro
---
interface Props {
  frontmatter: { title: string; description: string };
}
const { frontmatter } = Astro.props;
const base = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{frontmatter.title}</title>
    <meta name="description" content={frontmatter.description} />
  </head>
  <body>
    <main>
      <a href={base}>Home</a>
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>
      <slot />
    </main>
  </body>
</html>
<style>
  main { max-width: 70ch; margin: 3rem auto; padding: 0 1rem; line-height: 1.8; }
</style>
```

`Props` 宣告此版型預期收到的標題與描述。`slot` 是 Markdown 正文插入的位置；CSS 放在版型內，使用該版型的文章會共享這份版面。

接著建立 `src/pages/posts/build-notes.md`：

```markdown
---
layout: ../../layouts/PostLayout.astro
title: "Why this blog is static"
description: "How prebuilt pages fit the needs of a personal blog."
---

## Writing in Markdown

I keep articles in Markdown and use a shared layout for the HTML around them.

## Publishing an edit

Astro builds the pages before I upload them. Changing an article means building again.
```

frontmatter 是兩條 `---` 中間的資料；layout 指向剛建立的共用版型。正文從二級標題開始，因為版型已經輸出 h1。這種用法對應 [Astro 的 Markdown 頁面與 layout 機制](https://docs.astro.build/en/guides/markdown-content/#frontmatter-layout-property)。

把首頁 `src/pages/index.astro` 更新成下面的內容。這次要用到 `base`，所以在檔案開頭讀取部署路徑，再用它組出文章連結：

```astro
---
const base = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Engineering notes</title>
  </head>
  <body>
    <h1>Engineering notes</h1>
    <p>Projects, implementation and architecture decisions.</p>
    <a href={`${base}posts/build-notes/`}>Read the build notes</a>
  </body>
</html>
```

用 Ctrl+S 儲存，啟動 dev 後從首頁點進文章。標題、描述和正文會一起出現，但它們來自兩個檔案：Markdown 提供文字，版型負責把它們放進頁面。回首頁的連結也放在版型裡，以後新增文章可以共用。

## 從單篇文章到文章集合

放在 `src/pages` 的 Markdown 會直接產生頁面。一篇文章用這種方式就夠了。如果還要讓文章出現在主題頁、系列目錄，或提供中英切換，就需要另外管理這些關係。我把這個部落格的文章放在 `src/content/articles`，用 Content Collections 載入；系列最後一篇會沿著實際檔案說明。

下一篇會把這個專案部署到 GitHub Pages，處理 `/Blog/` 子路徑，並設定發布前的人工核准。
