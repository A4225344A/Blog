---
id: beginner-tools-en
slug: why-astro
title: "Why I use Astro for a technical blog"
description: "Why I chose Astro to write in Markdown, track edits in Git and publish static files to GitHub Pages."
locale: en
translationKey: beginner-tools
contentType: concept
difficulty: intermediate
topics: [web-foundations]
skills: [static-site-delivery]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-24
status: published
---

I want to keep notes about my projects alongside the code in Git. I can review edits in a diff and change the page layout in the same project.

The articles only change when I edit them. There are no accounts or live data, so I chose to generate HTML with Astro and host the files on GitHub Pages. That leaves me without an application server to maintain.

## Generate the HTML before publishing

During a build, Astro reads the Markdown and places the title and body into a layout to produce HTML. Pagefind then scans those pages and creates a search index. The browser loads these files when you open an article or search.

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

I focused on how I would write articles and what I would need to maintain after publishing.

| Choice | Useful here | What I would need to consider |
| --- | --- | --- |
| Hugo | Generates a static site from content | Its template and content organization conventions |
| Next.js static export | Keeps React and produces static files | Server-dependent features are unavailable in an export; this blog does not need React throughout its pages |
| Self-hosted WordPress | Browser-based editing and plugins | A standard installation needs PHP and a database rather than file-only hosting |
| Astro | Markdown and layouts in one project, with static output | Rebuilding before publishing and maintaining my own content rules |

Astro fits how I want to maintain this blog: articles and layouts in the same Git project. If contributors needed to edit without Git, WordPress would be the better fit.

References: [Hugo introduction](https://gohugo.io/about/introduction/), [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), [WordPress requirements](https://wordpress.org/about/requirements/).

## Even a typo needs another deployment

There is an inconvenience: fixing a single typo still means building and deploying again. The search index needs updating too. I do not need edits to appear immediately, so I can live with that wait.

One local run on 2026-09-24 took about 3.8 seconds for a production build. It used Windows x64, Node 24.15.0, installed dependencies and an existing Astro cache, with five bilingual articles and `/Blog/` as the base. That includes content validation, Astro and Pagefind, but not installation, GitHub CI or time waiting to deploy. It is a measurement of that run, not a general build-time guarantee.

The `/Blog/` path also needs attention. Links to home, articles and images must include it; otherwise the browser looks at the domain root. The GitHub Pages deployment article walks through configuring and checking those links.

## When the live article still shows old text

Suppose the Markdown has changed but the live article still shows the old paragraph. I would check each stage: did the edit reach the commit used for the build? Does the generated HTML contain it? Which artifact was deployed?

Checking the HTML in `dist` helps separate a build problem from a deployment problem. If the new paragraph is already there, the next place to look is GitHub Actions: which output did that deployment publish?

Next, create an empty Astro project and a home page.
