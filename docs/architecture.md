# Architecture — Knowledge Platform V1

## Purpose

This document is the shared architecture source of truth for:
- Human maintainers
- Codex
- Claude Code

It describes only implemented or explicitly approved architecture.

## Product Definition

The system is a **bilingual engineering knowledge platform** combining:
- structured Learning Paths
- technical references
- troubleshooting Case Studies
- Project showcases
- long-form engineering Articles

The product is **Knowledge-first, Portfolio-second**.

Public direction:

> Engineering knowledge, built from real systems.

Traditional Chinese:

> 從實作、排障到架構，建立可循序學習的工程知識。

Primary domains:
- Cloud Native
- Platform Engineering
- SRE
- AI Engineering
- Backend Engineering

## Goals

V1 goals:
1. Publish bilingual technical content.
2. Support structured Learning Paths.
3. Support Topic-based navigation.
4. Support troubleshooting Case Studies.
5. Support Project aggregation.
6. Maintain strong SEO and AI-search crawlability.
7. Keep content static-first.
8. Keep hosting cost at or near zero.
9. Use Git as the primary publishing workflow.
10. Use Codex build + Claude independent review + human merge authority.

## Non-Goals

V1 does NOT include:
- authentication
- user accounts
- database-backed CMS
- backend API
- server runtime
- paid infrastructure
- AI recommendation
- AI chat
- interactive Skill Graph
- quiz
- learning dashboard
- cloud-synced progress

## High-Level Architecture

```text
Human Requirement
      ↓
Codex Builder
      ↓
Git / Pull Request
      ↓
CI Quality Gate
 ├─ schema/content validation
 ├─ Content Graph V1 validation
 ├─ tests
 ├─ Astro check
 └─ build
      ↓
Claude Independent Review
      ↓
Codex Fixes
      ↓
Claude Re-review
      ↓
Human Approval
      ↓
Merge to main
      ↓
CI on main
      ↓
Deploy workflow
      ↓
Astro static output
      ↓
GitHub Pages
```

## Technology Stack

Core:
- Astro
- TypeScript
- Static Site Generation
- Astro Content Collections
- Markdown / MDX
- pnpm

Deployment:
- GitHub Actions
- GitHub Pages

Search:
- Pagefind or equivalent static search

## Architecture Principles

### Static First
Static HTML is the default. JavaScript is added only for real browser interaction.

### Content as Data
Content is modeled as typed entities and references, not only folders of Markdown.

### Single Ownership
Each relationship has exactly one authoritative owner. Reverse relationships are computed.

### Git-Managed Publishing
All changes flow through Git and Pull Requests.

## Repository Shape

```text
.github/
  workflows/
  pull_request_template.md

docs/
  architecture.md

public/
  images/

src/
  components/
  config/
  content/
    articles/
      zh-tw/
      en/
    topics/
    skills/
    learning-paths/
    projects/
  i18n/
  layouts/
  pages/
  styles/
  utils/

AGENTS.md
CLAUDE.md
README.md
astro.config.mjs
package.json
pnpm-lock.yaml
tsconfig.json
```

## Locales

Supported:
- `zh-TW`
- `en`

URL prefixes:
- `/zh-tw/`
- `/en/`

Translated equivalents share a stable `translationKey`.

## Theme

Supported:
- `light`
- `dark`
- `system`

Default: `system`.

Explicit preference is stored locally. System mode follows and reacts to `prefers-color-scheme`.

## Core Entities

Exactly five core entities:
1. Article
2. Skill
3. Topic
4. LearningPath
5. Project

## Article

Conceptual model:

```ts
interface ArticleMetadata {
  id: string;
  title: string;
  description: string;
  locale: "zh-TW" | "en";
  translationKey: string;
  contentType:
    | "tutorial"
    | "concept"
    | "troubleshooting"
    | "case-study"
    | "reference"
    | "opinion";
  difficulty: "beginner" | "intermediate" | "advanced";
  topics: string[];
  skills: string[];
  prerequisiteSkills: string[];
  recommendedArticles: string[];
  estimatedMinutesOverride?: number;
  publishedAt?: Date;
  updatedAt?: Date;
  status: "draft" | "published" | "archived";
}
```

Forbidden Article fields:
- `order`
- `level`
- `learningPaths`
- `projects`
- `estimatedMinutes`

## Stable Identity

- `id` = stable content entity identity
- `translationKey` = translation grouping
- `slug` = routing/presentation concern

Slug must not be used as persistent identity.

## Reading Time

Calculated at build-time for Chinese and English. Only `estimatedMinutesOverride` is allowed as an exception.

## Skill

```ts
interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  aliases: string[];
  prerequisites: string[];
  status: "active" | "deprecated";
  supersededBy?: string;
}
```

Skill is a learning dependency node.

## Topic

```ts
interface Topic {
  id: string;
  name: string;
  description: string;
  parentId?: string;
}
```

Topic is human-facing taxonomy. Keep taxonomy shallow, ideally ≤ 2 levels.

## Topic vs Skill

```text
Topic
= browsing / information architecture

Skill
= dependency graph / prerequisite node
```

## LearningPath

```ts
interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetAudience: string[];
  sections: LearningPathSection[];
}

interface LearningPathSection {
  id: string;
  title: string;
  description?: string;
  articleIds: string[];
}
```

LearningPath owns Article membership and order.

## Project

```ts
interface Project {
  id: string;
  title: string;
  description: string;
  maturity: "lab" | "prototype" | "production" | "experiment";
  featuredSkills: string[];
  relatedArticles: string[];
  relatedLearningPaths: string[];
  repositoryUrl?: string;
}
```

Project owns project membership.

## Relationship Ownership

```text
LearningPath
→ owns ordered Article membership

Project
→ owns project-related Article membership

Article
→ owns Topic references
→ owns Skill references
→ owns prerequisiteSkills
→ owns recommendedArticles
```

Reverse relationships are derived.

## Content Graph

```text
Article
├─ Topic
├─ Skill
├─ Recommended Article
├─ Translation
├─ Learning Path
└─ Project

Skill
└─ prerequisite Skill
```

Astro renders the graph statically.

## Reverse Index

Reverse indexes are computed at build-time. They may live in memory, static JSON, or build utilities. No backend/API is required.

## Content Storage

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

One Article remains one canonical content entity.

## Canonical Routing

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

One Article must have one canonical content URL.

## Information Architecture

Main sections:
- `/start`
- `/learn`
- `/topics`
- `/blog`
- `/cases`
- `/projects`
- `/about`

Homepage order:
1. Hero
2. Start Here
3. Learning Paths
4. Featured Topics
5. Featured Project
6. Latest Cases
7. Latest Articles
8. About / Experience

## Content Graph Validation V1

### Hard Errors
Fail CI for:
- duplicate entity IDs
- missing Topic references
- missing Skill references
- missing prerequisite Skill references
- missing recommended Article references
- missing LearningPath Article references
- missing Project Article/Skill/LearningPath references
- forbidden `Article.learningPaths`
- forbidden `Article.projects`

### Warnings
Do not block CI for:
- Article without Topic
- Article without Skill
- published Article not referenced by LearningPath
- published Article not referenced by Project
- deprecated Skill still referenced
- incomplete translation pair

### Deferred
Do not make these V1 blockers:
- Skill dependency cycle detection
- Topic parent cycle detection
- `supersededBy` cycle detection
- LearningPath empty section validation
- complex translation graph validation
- full orphan graph validation

## First Article

Traditional Chinese:

> 使用 Astro 建立零成本技術知識平台：從內容模型到 GitHub Pages

English:

> Building a Zero-Cost Engineering Knowledge Platform with Astro and GitHub Pages

It must describe the actual implementation.

Initial featured Project: **AI SRE Platform**.

## Search

Static search only, preferably Pagefind.

## SEO

Canonical Articles should expose:
- title
- description
- canonical
- Open Graph
- hreflang
- JSON-LD
- static HTML body

## Sitemap / RSS / robots.txt

Sitemap includes public pages and published Articles, excludes drafts.

RSS:
- `/zh-tw/rss.xml`
- `/en/rss.xml`

robots.txt should allow standard crawling and point to the actual sitemap.

## React Islands

Default to Astro. React is reserved for complex future browser-state features.

## GitHub Pages

Support both user-site and repository-site hosting. Handle `site` and `base` deliberately.

## CI

PR/main CI:
1. install
2. content validation
3. tests
4. Astro check
5. build

PRs do not deploy.

## Deployment

Deploy only after successful CI on `main`, preferably using the exact verified SHA.

## AI Roles

- Codex = Primary Builder
- Claude Code = Independent Reviewer
- Human = Final Merge Authority

AI `READY` is evidence, not approval.

## V1 Included

- Astro
- strict TypeScript
- i18n
- Light/Dark/System
- five content entities
- Content Graph V1
- reverse indexes
- basic validator
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
- CI
- GitHub Pages

## V1 Excluded

- AI recommendation
- AI chat
- interactive Skill Graph
- quiz
- dashboard
- cloud-synced progress
- auth
- database
- backend

## ADRs

### ADR-001 — Astro Static Architecture
Status: Accepted.

### ADR-002 — GitHub Pages
Status: Accepted.

### ADR-003 — URL-Based i18n
Status: Accepted. Use `/zh-tw/` and `/en/`.

### ADR-004 — Three-State Theme
Status: Accepted. Use `light | dark | system`.

### ADR-005 — Content Graph
Status: Accepted. Use Article, Skill, Topic, LearningPath, Project.

### ADR-006 — Single Relationship Ownership
Status: Accepted. Reverse relationships are computed.

### ADR-007 — Canonical Routing
Status: Accepted. Cases use `/cases/`, other Articles use `/blog/`.

### ADR-008 — Minimal V1 Graph Validation
Status: Accepted. Advanced graph checks are deferred.

### ADR-009 — Codex Builder / Claude Reviewer
Status: Accepted.

### ADR-010 — CI-Gated Deployment
Status: Accepted.

## Future Considerations

Not V1 requirements:
- localStorage progress
- Skill pages
- Skill dependency visualization
- cycle detection
- interactive graph
- quiz
- learning dashboard
- AI recommendation
- AI chat
- custom domain
- analytics
- comments

## Updating This Document

Update this file in the same PR when materially changing:
- entity model
- ownership
- routing
- i18n
- theme
- hosting
- CI/CD
- graph validation
- SEO
- search
- AI workflow
