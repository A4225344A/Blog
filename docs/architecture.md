# Architecture — Knowledge Platform V1

## Purpose

This document is the shared architecture source of truth for:
- Human maintainers
- Codex
- Claude Code

It describes only implemented or explicitly approved architecture.

## Implementation Status — V1 Phase 1–7

Implemented: Astro static foundation, strict TypeScript, five shared Zod schemas,
raw-file schema/graph validation, build-time reverse indexes and reading estimates,
locale/URL utilities, bilingual foundation pages and light/dark/system controls.
The remaining sections describe the approved V1 target unless marked implemented.
Content views (Phase 4), search/SEO (Phase 5), CI/deployment workflows (Phase 6),
and the complete bilingual implementation article (Phase 7) are implemented.
Status for the unified CI/deployment change: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.
The preceding V1 version received Claude's READY_WITH_MINOR_NOTES and was deployed.
The new workflow change requires its own independent review.

Implementation details:

- `src/content/schemas.ts` is the shared schema/type source for the CLI and Astro
  Content Collections. Strict schemas reject unknown fields, including all five
  forbidden Article fields. Article `slug` is explicit presentation metadata;
  `id` is the loader key and every graph relationship uses stable IDs.
- Articles use `.md` with YAML frontmatter under the locale directories. Other
  entities use one JSON object per file. MDX/YAML entity files are rejected in
  V1; MDX integration is not installed. Synthetic entities live only in tests.
  AI SRE Platform is the featured Project with maintainer-confirmed `lab` maturity,
  description and repository URL; no production claims are made.
- `content:validate` reads raw files before Astro ingestion, catches duplicate IDs
  within each entity type (even if a duplicate has invalid metadata), then validates
  schemas and graph references. Errors return exit code 1. `build` runs this command
  first; Content Collections also preflight raw files before loader deduplication.
- Hard diagnostic IDs: `E_CONTENT_READ`, `E_SCHEMA`, `E_DUPLICATE_ID`,
  `E_FORBIDDEN_ARTICLE_FIELD`, `E_MISSING_REFERENCE`, `E_ROUTE_COLLISION`,
  `E_UNKNOWN_ENTITY_TRANSLATION`. Missing-reference messages name
  the owning entity, field, target collection and target ID.
- Nonblocking warning IDs: `W_ARTICLE_NO_TOPIC`, `W_ARTICLE_NO_SKILL`,
  `W_ARTICLE_NO_PATH`, `W_ARTICLE_NO_PROJECT`, `W_DEPRECATED_SKILL`,
  `W_TRANSLATION_SINGLE_LOCALE`, `W_MISSING_ENTITY_TRANSLATION`. Translation warnings count distinct locales.
  Membership warnings apply only to published Articles. Deprecated Skill warnings
  include Article skills/prerequisites, Project skills, Skill prerequisites and
  supersession references.
- V1 validates the eight specified Article/LearningPath/Project reference types.
  Skill prerequisite/supersession and Topic parent integrity/cycle checks are deferred;
  empty LearningPath sections remain valid. No additional graph blockers are added.
  Route uniqueness and editorial translation-key integrity are separate validation
  boundaries: colliding published Article URLs report both source files; stale
  translation keys fail, while missing translations warn. The normal repository CLI
  and Astro preflight validate the editorial catalog; CLI custom content roots omit
  that repository-specific catalog unless supplied directly to `validateContent`.
- `getContentGraph()` loads the five typed collections during the static build,
  validates them, and derives in-memory reverse indexes and reading times. Skill
  `articleIds` includes both taught and prerequisite references. Index membership
  is deduplicated without changing authoritative LearningPath section order.
- Reading time sums Han characters / 400 and other words / 200, rounds up and has
  a one-minute floor. Fenced code, HTML tags and Markdown image/link destinations
  are excluded. A positive integer `estimatedMinutesOverride` replaces the estimate.
  This is a documented heuristic, not a Markdown rendering or NLP subsystem.
- `SITE_URL` is an HTTP(S) origin, defaulting to `http://localhost:4321` for local
  builds. `SITE_BASE` defaults to `/` and normalizes repository paths to `/name/`.
  Set both for production. Astro uses static directory output and trailing slashes.
  Internal page links and assets use the configured base. Absolute URL helpers
  reuse that path for canonical, Open Graph, sitemap, RSS and robots.txt output.
- Localized Home, Start, Learn, Topics, Blog, Cases, Projects and About views are
  implemented, with Topic/Path/Project detail aggregators and canonical Article pages.
  Only published Articles appear publicly. LearningPath article order is preserved
  while filtering by locale/status. The root is a language chooser. Shared entities
  keep a single stable ID; Chinese display labels live in `src/i18n/content.ts`,
  namespaced by collection and, for sections, by owning LearningPath. Audience text
  is localized there; difficulty/maturity labels are exhaustive typed UI maps.
  Missing translations fall back to source text with a diagnostic. Translation helpers select published
  equivalents by translationKey and target locale, falling back to localized home.
  Optional relationship sections disappear when no public entries remain. Featured
  Topic order follows the configured ID array, not collection enumeration order.
- A small inline head script resolves the theme before styles paint; the bundled
  controller persists explicit choices, follows OS changes in system mode, and
  handles blocked storage. CSS follows OS preference when JavaScript is disabled.
  No React, hydration framework, remote service or browser graph computation is used.

- Pagefind indexes canonical Articles and Topic/LearningPath/Project detail pages
  after every production build. Homes, section indexes and the language chooser
  are not indexed. Main content
  includes title, description, body and rendered Topic/Skill labels; navigation and
  search UI are excluded. Language detection uses document lang. The localized
  search page loads its local UI bundle with explicit base/bundle paths. Use build
  plus preview for search; the dev server does not generate an index.
- All public pages have canonical, description and Open Graph metadata. Article
  hreflang lists only published equivalents (language navigation still falls back
  to home). Articles emit escaped JSON-LD (`TechArticle`, or `Article` for opinion).
  The language chooser and both homes share one reciprocal three-entry hreflang
  cluster with the base root as `x-default`. Other pages keep their own equivalent
  cluster; the unrelated home is not their x-default. Section descriptions are localized.
- Static `sitemap.xml`, localized `rss.xml`, and `robots.txt` are generated by Astro
  build-time endpoints. They require no deployed server. RSS GUIDs use stable IDs,
  localized channel titles and absolute Atom self URLs. Published Article collisions
  fail raw content validation; the sitemap retains a final route uniqueness guard. Draft and
  archived Articles are excluded from all routes, aggregations, feeds and search.
  For project hosting, `/Blog/robots.txt` is a generated reference file, not the
  origin-root crawler configuration. Sitemap discovery and crawler policy require
  the maintainer to configure `https://a4225344a.github.io/robots.txt` in the owner-site
  repository and include `https://a4225344a.github.io/Blog/sitemap.xml`. Search Console
  submission is another discovery mechanism, but does not configure crawler policy.
  Local output checks cannot prove either external step.
- CI validates PRs and main pushes with read-only repository permissions. It runs
  frozen install, content validation, tests, Astro/TypeScript checks and both root
  and production-base builds, HTML checks and Chromium tests. The production base
  derives from GITHUB_REPOSITORY, handling owner.github.io repositories specially.
- One workflow, `.github/workflows/ci.yml` (name `CI`), contains `validate` and
  `deploy`. Only successful main push CI uploads `verified-site`. Deployment uses
  `needs: validate`, requires a successful main push, and waits for required human
  reviewers on the `github-pages` environment. After approval it checks the current
  main SHA against `context.sha`, downloads the same run's artifact, and repackages
  and deploys it without rebuilding or checking out code. The old `workflow_run`
  workflow is removed. Main runs have distinct concurrency groups, so new validation
  can proceed while an earlier deployment waits for approval. They do not cancel active deployments; PR runs can
  supersede earlier PR validation, and deployment jobs share a serialized group.
  Only the deploy job has Pages write/OIDC permissions. All
  external actions are pinned to resolved commit hashes, recorded in
  `.github/action-pins.json`. The pnpm v4 annotated tag was peeled upstream to
  `b906affcce14559ad1aafd4ab0e942779e9f58b1`; tests verify allowlist consistency,
  not live upstream object types. Human review/protection
  rules must be configured in GitHub; local validation is not independent review.
- The first complete bilingual Article describes this repository, including its
  validation boundary, routes, theme, Pagefind, SEO and artifact deployment. The
  `knowledge-platform` LearningPath owns its ordered Article membership. It is not
  falsely attached to AI SRE Platform, so two `W_ARTICLE_NO_PROJECT` warnings remain.
  Six initial Skills describe platform modeling/delivery and the confirmed lab
  domains. Cases remain an honest empty state until actual case content is authored.

## V1 Validation and Operational Boundary

- `pnpm run test` runs deterministic Node tests; `pnpm run check` checks Astro and
  all TypeScript. `pnpm run build` validates content, builds static output and runs
  Pagefind. `pnpm run test:build` verifies every public HTML path and local resource,
  canonical URLs, reciprocal/self hreflang (including the home x-default cluster),
  search indexing markers, featured order, section descriptions, sitemap, RSS,
  generated robots text and Article JSON-LD presence. It does not inspect live robots.
  `scripts/validate-all.ps1` runs the required commands plus `test:build`; collection
  integration and browser checks are additional explicit commands.
- `pnpm run test:collections` exclusively creates temporary test files, exercises
  actual Astro rendering for all entities and case/draft/archive visibility, and
  removes exactly those files. Run the regular build afterward. CI does this before
  building the production artifact. Do not run content editors concurrently.
- `pnpm run test:browser` uses locally installed Chromium against Astro preview to
  check theme, denied storage, narrow-screen navigation, search and Article language
  equivalence. Tests run at root and production base in CI. `PLAYWRIGHT_BROWSERS_PATH`
  defaults to `.playwright`; install Chromium there before local browser tests.
- GitHub-hosted workflow execution, environment protection and public deployment
  cannot be proven by local tests. Enable Pages with GitHub Actions, require CI on
  main PRs, and configure human approval on the `github-pages` environment before
  the first push to main. These are hard preconditions, not optional follow-up work.
  The preceding two-workflow version has deployed successfully. Local tests of this
  replacement do not prove its hosted execution or that an approval was enforced.
- Shared entity translations are presentation data, not additional graph entities.
  New entities fall back to source-language names until editorial translations are
  added. Reading time is heuristic. Pagefind reports no stemming for `zh-tw`;
  actual Traditional Chinese queries are covered by browser tests.

Reference: [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
and [configuration](https://docs.astro.build/en/reference/configuration-reference/).

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
Human deployment approval (github-pages environment)
      ↓
Deploy job in the same CI workflow
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
astro.config.ts
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
The same workflow must wait for the `github-pages` environment's required reviewers
before starting its deploy job. YAML references the environment; GitHub repository
settings enforce the approval. Keep required reviewers enabled. The workflow name
`CI` and job ID `validate` remain unchanged for existing required-check settings.

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
