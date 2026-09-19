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

I am a full-stack engineer. This blog holds personal projects, implementation notes and architecture decisions. Building it is an exercise in choosing a delivery model that fits the content.

This series moves from requirements to an empty project, article layouts and deployment. You may already know frontend and backend development while being new to Astro. Explanations and diagrams make the responsibilities explicit.

## What does this blog need?

Articles and project descriptions do not need to be recomputed on every visit. The requirements are readable HTML, stable URLs, bilingual content and text that can be tracked alongside code in Git.

This implementation therefore uses Astro's static build: content becomes website files before publication, and readers receive those files. Node.js is used during development and building; GitHub Pages does not need to run a Node.js application server.

<figure class="learning-diagram">
<figcaption>Architecture: how this blog delivers content</figcaption>
<ol role="list">
<li><strong>1. Content in Git</strong><span>Markdown articles, project data and layouts.</span></li>
<li><strong>2. Astro build</strong><span>Validates content, generates pages and a static search index.</span></li>
<li><strong>3. GitHub Pages</strong><span>Serves verified HTML, CSS and necessary JavaScript.</span></li>
</ol>
<p>Readers receive build output. This design has no database queries or authentication service.</p>
</figure>

## Why Astro for this site?

Astro keeps content and page structure in a Git project and produces readable HTML ahead of time. A simple article does not need to load a client application before obtaining its body.

Full-stack frameworks can also serve blogs. SSR, static output and client interaction are choices to combine around requirements. This site simply does not currently require an application backend. Accounts, private data or real-time writes would prompt a new architecture decision rather than being forced into the current design.

| Choice | Benefit for this blog | Accepted limit |
| --- | --- | --- |
| Static build | A concrete, inspectable website artifact | Content updates require rebuilding |
| Markdown in Git | Traceable and reviewable changes | Writing requires basic Git familiarity |
| Local static search | No remote search API dependency | New content enters the index after a build |
| GitHub Pages | No application server to maintain | Project base paths and hosting settings need care |

## How does this differ from a full-stack application?

The key question is **when pages are produced**. A dynamic system can read data after receiving a request. This blog moves content loading, relationship computation and page generation into the build.

That changes troubleshooting: inspect content and build output for missing prose, routes and base configuration for broken links, and the CI artifact and SHA for an unexpected deployed version. Not every problem belongs to an API.

## Projects and articles serve different purposes

A project page records its goal, maturity, repository and related writing. An article explains an implementation or decision in detail. AI SRE Platform is explicitly a **lab** for learning, demonstration and experimentation; it is not presented as production experience.

A series connects related articles in a clear reading order. Readers can follow the decisions from requirements through delivery, or start with a project or technical question that interests them.

## What the implementation covers next

The next article builds a minimal Astro blog project to explain files, routes and development mode. The third adds Markdown and layouts, then compares its delivery needs with this repository's workflow.

The small example isolates responsibilities rather than copying every feature of this site. The actual repository uses Content Collections, five content entities and build-time validation; the deeper architecture article covers that model.
