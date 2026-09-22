---
id: beginner-tools-en
slug: why-astro
title: "Why I use Astro for a technical blog"
description: "An engineer's perspective on personal projects, technical writing and the tradeoffs of static builds, Git and GitHub Pages."
locale: en
translationKey: beginner-tools
contentType: concept
difficulty: intermediate
topics: [web-foundations]
skills: [static-site-delivery]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-21
status: published
---

I use this blog to publish personal projects, implementation notes and technical decisions worth writing down. Every reader opening the same article sees the same body. The page needs to change when I edit and publish it.

This requirement does not need an application server to keep running. Astro generates the pages before publication, and GitHub Pages serves the files. That is enough for the blog’s current publishing needs.

## Do the work at publication time

Take a project note: its title, body and related links already live in the repository. The build can read them, combine them with a layout and produce HTML. It also generates the static index that readers use to search the site.

Node.js handles development and building. What reaches GitHub Pages is HTML, CSS and the necessary JavaScript.

<figure class="learning-diagram">
<figcaption>Publishing flow: from articles to static files</figcaption>
<ol role="list">
<li><strong>1. Content in Git</strong><span>Markdown articles, project data and layouts.</span></li>
<li><strong>2. Astro build</strong><span>Validates content, generates pages and a static search index.</span></li>
<li><strong>3. GitHub Pages</strong><span>Serves verified HTML, CSS and necessary JavaScript.</span></li>
</ol>
<p>An article edit enters the published output after another build.</p>
</figure>

## The alternatives for this site

This is a requirements comparison, not a cross-framework performance benchmark.

| Choice | Useful here | What I would need to consider |
| --- | --- | --- |
| Hugo | Generates a static site from content | Its template and content organization conventions |
| Next.js static export | Keeps React and produces static files | Server-dependent features are unavailable in an export; this blog does not need React throughout its pages |
| Self-hosted WordPress | Browser-based editing and plugins | A standard installation needs PHP and a database rather than file-only hosting |
| Astro | Markdown and layouts in one project, with static output | Rebuilding before publishing and maintaining my own content rules |

Astro fits how I want to maintain this blog: articles and layouts in the same Git project. If contributors needed to edit without Git, WordPress would be the better fit.

References: [Hugo introduction](https://gohugo.io/about/introduction/), [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), [WordPress requirements](https://wordpress.org/about/requirements/).

## Rebuilding is a tradeoff I can accept

What appeals to me here is keeping Markdown, layouts and code in the same Git project. I can review a writing diff and check how a layout change affects the text. The generated HTML already contains the article when the browser receives it.

The cost: even a typo correction goes through a build and publication. Search results wait for the index to update. For content that an author edits and approves before publishing, I can accept that delay.

GitHub Pages adds a detail to the URLs: this site lives under `/Blog/`. Links to home, articles and images need that prefix. Choosing this hosting setup means accounting for it in the code and tests.

## Trace updates through the output

Suppose the Markdown has changed but the live article still shows the old paragraph. I would follow the diagram: did the edit reach the commit used for the build? Does the generated HTML contain it? Which artifact was deployed?

That is a practical consequence of generating pages during the build. Content and layout issues can be inspected in local output; deployment follows the connection between a commit and its artifact. This repository runs content validation and tests before deployment.

Next, create an empty Astro project and a home page.
