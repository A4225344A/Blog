---
id: beginner-first-change-en
slug: astro-content-and-layout
title: "Adding articles and a shared layout"
description: "Create an Astro layout, write the first article in Markdown and link to it from the home page."
locale: en
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

With the home page in place, I can add an article. I put the heading, navigation and styles in a shared layout and write the body in Markdown. Later layout changes will not require editing every article’s HTML.

Keep working in the `engineering-blog` folder. This article gets the post running locally.

## Give the repeated HTML a layout

Create `src/layouts/PostLayout.astro`. A layout supplies the page shell; the slot receives the article body:

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

Props declares the title and description expected by the layout. The slot receives rendered Markdown. Articles using this layout share its CSS and structure.

Create `src/pages/posts/build-notes.md`:

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

Frontmatter is the data between the `---` lines. Its layout property points to the shared layout. The body starts at heading level two because the layout already supplies h1. This uses [Astro's Markdown page layout mechanism](https://docs.astro.build/en/guides/markdown-content/#frontmatter-layout-property).

Replace `src/pages/index.astro` with the following. The article link now needs `base`, so read the deployment path at the top of the file:

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

Save with Ctrl+S, run dev and follow the link from home. The title, description and body appear together, but come from two files: Markdown supplies the text and the layout places it on the page. The return link lives in the layout too, ready to share with later articles.

## From one article to a collection

Markdown in `src/pages` creates a page directly, which is enough for this example. Topic lists, series navigation and language switching need more information about each article. I keep this blog’s articles in `src/content/articles` and load them with Content Collections. The final article follows the actual files to explain that setup.

Next, deploy this project to GitHub Pages, handle the `/Blog/` path and configure approval before publishing.
