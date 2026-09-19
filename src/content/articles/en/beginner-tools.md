---
id: beginner-tools-en
slug: beginner-tools
title: "Why I use Astro for a technical blog"
description: "A full-stack engineer's perspective on personal projects, technical writing and the tradeoffs of static builds, Git and GitHub Pages."
locale: en
translationKey: beginner-tools
contentType: concept
difficulty: intermediate
topics: [web-foundations]
skills: [static-site-delivery]
prerequisiteSkills: []
recommendedArticles: []
publishedAt: 2026-09-19
updatedAt: 2026-09-20
status: published
---

This blog has a straightforward job: publish personal projects, implementation notes and technical decisions worth writing down. Readers opening an article see much the same content. The page needs to change when I edit and publish it.

Although I work as a full-stack engineer, this site has no application server to keep running. Astro generates the pages before publication, and GitHub Pages serves the files. That covers its current needs.

## Do the work at publication time

Take a project note: its title, body and related links already live in the repository. The build can read them, combine them with a layout and produce HTML. It also generates the static index that readers use to search the site.

Node.js handles development and building. What reaches GitHub Pages is HTML, CSS and the necessary JavaScript.

<figure class="learning-diagram">
<figcaption>Architecture: how this blog delivers content</figcaption>
<ol role="list">
<li><strong>1. Content in Git</strong><span>Markdown articles, project data and layouts.</span></li>
<li><strong>2. Astro build</strong><span>Validates content, generates pages and a static search index.</span></li>
<li><strong>3. GitHub Pages</strong><span>Serves verified HTML, CSS and necessary JavaScript.</span></li>
</ol>
<p>An article edit enters the published output after another build.</p>
</figure>

## Rebuilding is a tradeoff I can accept

What appeals to me here is keeping Markdown, layouts and code in the same Git project. I can review a writing diff and check how a layout change affects the text. The generated HTML already contains the article when the browser receives it.

The cost is straightforward too: even a typo correction goes through a build and publication. Search results wait for the index to update. For content that an author edits and approves before publishing, I can accept that delay.

GitHub Pages adds a detail to the URLs: this site lives under `/Blog/`. Links to home, articles and images need that prefix. Choosing this hosting setup means accounting for it in the code and tests.

## What changes when maintaining it?

Suppose the Markdown has changed but the live article still shows the old paragraph. I would follow the diagram: did the edit reach the commit used for the build? Does the generated HTML contain it? Which artifact was deployed?

That is a practical consequence of generating pages during the build. Content and layout issues can be inspected in local output; deployment follows the connection between a commit and its artifact. This repository keeps content validation, tests and human deployment approval as places to check the result before publication.

## Describe each project on its own terms

The blog has a simple deployment model. Its featured projects can be more involved. AI SRE Platform, for example, is a **lab** combining infrastructure, GitOps, observability and AI-assisted incident handling for learning, demonstration and experimentation. Its architecture is separate from the blog that describes it.

A project page holds the goal, maturity and repository link. An article can then examine one implementation detail. Readers get somewhere to find the broader context without having to read a whole project overview whenever they want to follow a specific decision.

These articles start with the blog itself. Next comes an empty folder, Astro and a home page, to see what the smallest project looks like in practice.
