# Engineering Knowledge Platform

A bilingual engineering knowledge platform built with Astro.

> **Engineering knowledge, built from real systems.**

Traditional Chinese:

> **從實作、排障到架構，建立可循序學習的工程知識。**

## Overview

This project combines:
- structured Learning Paths
- technical references
- troubleshooting Case Studies
- Project showcases
- long-form engineering Articles
- Topic-based discovery
- static search

The platform is:
- static-first
- Git-managed
- strongly typed
- bilingual
- SEO-friendly
- AI-search-friendly
- deployable on GitHub Pages
- designed for near-zero infrastructure cost

## V1 Scope

Included:
- Astro
- strict TypeScript
- zh-TW / English
- Light / Dark / System
- Article
- Skill
- Topic
- LearningPath
- Project
- Content Graph V1
- reverse indexes
- basic content validation
- Home
- Start
- Learn
- Topics
- Blog
- Cases
- Projects
- About
- static search
- SEO
- Sitemap
- RSS
- robots.txt
- GitHub Actions
- GitHub Pages

Excluded:
- AI recommendation
- AI chat
- interactive Skill Graph
- quiz
- learning dashboard
- user accounts
- authentication
- database
- backend API

## Core Architecture

Five entities:

```text
Article
Skill
Topic
LearningPath
Project
```

Relationship ownership:

```text
LearningPath
→ owns ordered Article membership

Project
→ owns project-related Article membership

Article
→ owns Topic / Skill / prerequisite / recommendation references
```

Reverse relationships are derived at build-time.

See `docs/architecture.md`.

## Routes

Localized prefixes:
- `/zh-tw/`
- `/en/`

Main sections:
- `/start`
- `/learn`
- `/topics`
- `/blog`
- `/cases`
- `/projects`
- `/about`

Canonical Article routing:

```text
troubleshooting
case-study
→ /cases/:slug/
```

```text
tutorial
concept
reference
opinion
→ /blog/:slug/
```

## Content Structure

```text
src/content/
├─ articles/
│  ├─ zh-tw/
│  └─ en/
├─ topics/
├─ skills/
├─ learning-paths/
└─ projects/
```

One Article remains one canonical entity.

## First Article

Traditional Chinese:

> 使用 Astro 建立零成本技術知識平台：從內容模型到 GitHub Pages

English:

> Building a Zero-Cost Engineering Knowledge Platform with Astro and GitHub Pages

Initial featured Project: **AI SRE Platform**.

## Development Workflow

```text
Codex
= Primary Builder

Claude Code
= Independent Reviewer

Human
= Final Merge Authority
```

Workflow:

```text
Human Requirement
↓
Codex Build
↓
Validation
↓
Pull Request
↓
Claude Review
↓
Codex Fix
↓
Claude Re-review
↓
Human Gate
↓
Merge
```

Rules:
- `AGENTS.md`
- `CLAUDE.md`

## Local Development

V1 should expose at minimum:

```bash
pnpm install
pnpm dev
pnpm run content:validate
pnpm run test
pnpm run check
pnpm run build
```

Use `pnpm` consistently.

## Content Validation

Hard failures:
- duplicate IDs
- invalid Topic references
- invalid Skill references
- invalid prerequisite references
- invalid recommended Article references
- invalid LearningPath Article references
- invalid Project references
- forbidden Article `learningPaths`
- forbidden Article `projects`

Warnings:
- Article without Topic
- Article without Skill
- Article not used by LearningPath
- Article not used by Project
- deprecated Skill still referenced
- incomplete translation pair

Advanced graph checks are deferred.

## Theme

Support:
- `light`
- `dark`
- `system`

Default: `system`.

## Internationalization

Support:
- `zh-TW`
- `en`

Language switching should preserve equivalent page context when translations exist.

## Search

Preferred: Pagefind.

No backend search service is required.

## SEO

Canonical Article pages should provide:
- title
- description
- canonical
- Open Graph
- hreflang
- JSON-LD
- static HTML content

Published content should be discoverable through sitemap, RSS, robots.txt, and internal links.

## GitHub Pages

Hosting target: GitHub Pages.

Support both:
- `https://username.github.io/`
- `https://username.github.io/repository-name/`

Correct Astro `site` and `base` handling is required.

## CI / Deployment

Expected quality gate:

```text
install
↓
content validation
↓
tests
↓
Astro check
↓
build
```

Pull Requests do not deploy.

Deployment occurs only after successful CI on `main`.

## Governance Files

```text
AGENTS.md
CLAUDE.md
docs/architecture.md
.github/pull_request_template.md
README.md
```

Responsibilities:
- `AGENTS.md` → how Codex builds
- `CLAUDE.md` → how Claude reviews
- `docs/architecture.md` → what the system is
- PR template → human quality gate
- `README.md` → how humans understand and use the repository

## License

Choose an explicit license before public release if the repository will contain reusable code or learning content.
