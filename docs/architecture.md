# Architecture — Knowledge Platform V1.1

## V1.1 Optional Analytics and Static Security

`BaseLayout` guards its single `Analytics` head component with the validated ID.
Production builds with a
valid `PUBLIC_GA_MEASUREMENT_ID` emit its public configuration. A small local
TypeScript bootstrap asynchronously inserts gtag.js only when the browser origin
matches the HTTPS canonical origin; localhost preview of production artifacts
does not load Google. Development and missing IDs emit no configuration. A non-empty
invalid ID fails the production build; disabled builds remove the Google bootstrap.
Normal MPA document loads each call GA4 config once for automatic page views.
No client router, backend, new dependencies or content graph changes are added.

The centralized typed adapter accepts only five named, parameter-free events;
no UI currently emits custom events. It drops extra payload properties and safely
no-ops when disabled, unavailable or throwing. Analytics page location uses the
canonical path plus only six approved campaign parameters with bounded token values;
all other query parameters and fragments are dropped. Browser referrer behavior is
preserved by leaving page_referrer unset. Google/ad personalization signals are
disabled. Stream Enhanced Measurement must be disabled by the maintainer to
avoid automatic search/form/outbound data outside this adapter. No consent banner
or Consent Mode is implemented; configure a consent strategy before enabling the
ID where required. See `docs/v1.1-operations.md` for operational setup and
`docs/analytics-ga4.md` for the specification and approved acquisition policy.

Environment variants are ignored except the placeholder-only `.env.example`.
Project repository URLs permit only HTTP(S) without embedded credentials. Trusted
Git-managed Markdown remains executable build input and requires human review;
the only raw injection API is escaped JSON-LD, covered by existing tests.
CSP is not introduced: existing inline theme code, Astro output and Pagefind need
a separately browser-verified policy. No custom GitHub Pages response-header
protections are claimed. Existing minimal Actions permissions, main-only artifact
deployment and the named environment remain intact. Human approval depends on
GitHub Required reviewers configuration, not YAML alone. Repository settings
must be checked separately; local tests cannot prove that a deployment waited.
The main production build
reads the public Measurement ID from repository Actions variables, not secrets.

## September 2026 presentation and dependency update

Public branding is **從全端到雲原生 / From Full-Stack to Cloud Native**.
The author is displayed as Jacky（謝宇逸） in Chinese and Jacky (謝宇逸) in English, a full-stack engineer moving toward cloud native and
platform engineering. Local reference screenshots inform indigo gradients, article cards and a
desktop sidebar with author, actual content counts, article TOC and recent posts.
Counts derive from published localized content; they are not visitor metrics.
On smaller screens the TOC appears before the article body; the desktop TOC is
hidden and the remaining sidebar stacks below content. Both TOCs share the same
build-time headings, use CSS visibility without JavaScript and are excluded from
Pagefind. The hidden copy is outside the accessibility tree and tab order.
Light/dark/system modes,
storage fallback, reduced motion and static navigation remain supported.
The article/layout tutorial and deployment tutorial are separate articles.
Article code blocks gain a client-side copy button using the Clipboard API.
Copy failures show a manual-copy hint; the original code stays selectable.
The copy button sits inside the code frame at the upper right, with reserved
space above the code; status messages appear below the frame.
Inline SVG learning diagrams have a native modal dialog for enlargement, with a
keyboard-focusable scroll region, Escape/Close dismissal and focus restoration.
Both controls are progressive enhancements: without JavaScript, code and diagrams
remain readable. No React, dependency, network request or analytics event is added.
Figure captions precede the content consistently; diagrams are added where they
explain a flow, not to meet a per-article quota.

Astro is pinned to 7.3.3 with Zod 4 shared schemas. CI uses Node 24, matching the
tutorial commands. Security controls and settings that still need external
verification are described in `docs/security.md`. The content graph, stable
identities, route ownership, static hosting and GA4 acquisition policy are unchanged.

## Purpose

Search indexes each page's own introduction and body, excluding ArticleList cards
(including related-article lists). Descriptions remain searchable prose and SEO
metadata, without a redundant Pagefind UI metadata row. Chinese excerpt boundaries
remain subject to Pagefind's tokenization.
A bilingual static `404.html` offers base-aware search, reading-guide and article
links without JavaScript. It is noindex and excluded from sitemap and Pagefind.

Empty case indexes remain reachable but are noindex and omitted from the sitemap,
canonical and hreflang output. A locale becomes indexable once it has published
cases; alternates only name populated locales. Empty topics omit ordering prose.
The chronological article list links directly to the first published article in
the configured introductory series, deriving its order from LearningPath.

This document is the shared architecture source of truth for:
- Maintainers
- Contributors
- Reviewers

It describes only implemented or explicitly approved architecture.

## Implementation Status — V1 Phase 1–7

Implemented: Astro static foundation, strict TypeScript, five shared Zod schemas,
raw-file schema/graph validation, build-time reverse indexes and reading estimates,
locale/URL utilities, bilingual foundation pages and light/dark/system controls.
The remaining sections describe the approved V1 target unless marked implemented.
Content views (Phase 4), search/SEO (Phase 5), CI/deployment workflows (Phase 6),
and the complete bilingual implementation article (Phase 7) are implemented.


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

- Pagefind indexes localized About pages, canonical Articles and populated Topic/LearningPath/Project detail pages
  after every production build. Homes, section indexes and the language chooser
  are not indexed. Main content
  includes title, description, body and localized Topic/Skill labels supplied by
  Article data attributes via `data-pagefind-index-attrs`; navigation and
  search UI are excluded. Language detection uses document lang. The localized
  search page loads its local UI bundle with explicit base/bundle paths. Use build
  plus preview for search; the dev server does not generate an index.
- Indexable public pages have canonical, description and Open Graph metadata.
  Noindex migration notices and empty topics omit canonical; their Open Graph URL
  identifies the page itself. Article
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
  About provides a Person JSON-LD entity with one shared author ID across locales,
  confirmed aliases Jacky and 謝宇逸, and the existing GitHub profile as sameAs.
  Articles reference that Person as author and publisher and show a linked byline.
  Shared pages emit meta author and og:site_name. RSS uses dc:creator for the public
  name without exposing an email address. Article sitemap lastmod comes from
  updatedAt, falling back to publishedAt; other routes omit it rather than use build time.
  Series cards omit dates because LearningPath determines reading order; article
  pages and chronological lists retain their real dates. Empty topics remain
  noindex with a link to the published Astro series. See docs/search-discovery.md
  for external verification and sitemap submission steps; metadata does not guarantee indexing.
- CI validates PRs and main pushes with read-only repository permissions. It runs
  frozen install, content validation, tests, Astro/TypeScript checks and both root
  and production-base builds, HTML checks and Chromium tests. The production base
  derives from GITHUB_REPOSITORY, handling owner.github.io repositories specially.
- One workflow, `.github/workflows/ci.yml` (name `CI`), contains `validate` and
  `deploy`. Only successful main push CI uploads `verified-site`. Deployment uses
  `needs: validate`, requires a successful main push, and waits for required human
  reviewers on the `github-pages` environment only when configured in GitHub.
  Once the job starts it checks the current
  main SHA against `context.sha`, downloads the same run's artifact, and repackages
  and deploys it without rebuilding or checking out code. The old `workflow_run`
  workflow is removed. Main runs have distinct concurrency groups, so new validation
  can proceed while an earlier deployment waits for approval. They do not cancel active deployments; PR runs can
  supersede earlier PR validation, and deployment jobs share a serialized group.
  Only the deploy job has Pages write/OIDC permissions. All
  external actions are pinned to resolved commit hashes, recorded in
  `.github/action-pins.json`. The current versions require Node 24-capable Actions
  runners (the observed GitHub-hosted runner is 2.337.0). Upstream tags were
  checked against the exact SHA, including peeling annotated tags. Tests verify allowlist consistency,
  not live upstream object types. Human review/protection
  rules must be configured in GitHub; local validation is not independent review.
- The first complete bilingual Article describes this repository, including its
  validation boundary, routes, theme, Pagefind, SEO and artifact deployment. The
  `knowledge-platform` LearningPath owns its ordered Article membership. It is not
  falsely attached to AI SRE Platform. The Astro series Articles are also independent
  of that lab, so ten `W_ARTICLE_NO_PROJECT` warnings remain. The six initial Skills
  are supplemented by terminal basics, local preview and editing web pages.
  Cases remain an honest empty state until actual case content is authored.

## Personal Blog Positioning Within V1

The Blog index lists all published non-case articles by publication date, newest
first regardless of series membership. Topic detail lists follow LearningPath
membership order, then show standalone articles chronologically. When multiple series match, stable path-ID
order breaks ties and each article appears once. Cards show localized topic links
and their positions in each complete published localized series, not positions in
the filtered subset. A topic navigation bar filters through existing canonical
topic pages using ordinary links, so it works without JavaScript. Empty topics
are not offered as filter options. Homepage latest articles remain chronological.
Blog/topic cards show labeled publication and available update dates; series-page
cards alone omit dates. Updating an article does not change publication ordering.
Topic cards omit the current topic chip while retaining other topic links. The
topic introduction names a shared series only when it covers all visible articles;
otherwise it describes the general grouping rule. Filter links use pill styling
with a border indicating the current page and retain keyboard focus indicators.
Discovery lists and topic filters receive the graph already loaded by their page.
ArticleList derives series membership only when details are requested; ordinary
latest/recommended/series-section lists do not reload or derive the content graph.

Home and the language chooser emit the same WebSite identity, bilingual names,
languages and the established Person publisher. This describes the project site;
it does not promise a distinct Google site-name result for a subdirectory.
The deployment SVG has separate labeled PR/main branches. The PR branch stops;
only main reaches artifact upload, human approval and deployment. Diagram fills,
text and connectors inherit the existing theme variables without JavaScript.

The maintainer approved replacing the zero-experience course positioning with a
Jacky's personal technical blog. Home prioritizes recent articles
and the featured project. Start introduces the blog and links to projects,
articles and the author's technical background. No employment history,
production experience or measured results are inferred. At the maintainer's
request, About describes technical interests and tools without industry history.

LearningPath is presented as an Article Series. The `knowledge-platform` entity
owns all five bilingual Astro articles, from selection and setup to publishing
and this blog's content model. The duplicate `first-website` entity is retired.
Article IDs and translation keys remain stable; public slugs now describe the
intermediate content: `why-astro`, `astro-project-setup`, `astro-content-and-layout`
and `astro-github-pages`. The former `astro-content-and-deployment` route explains
the split and links to both articles; its original ID belongs to the layout article.
The new deployment article has its own stable ID and translation key.
The old `beginner-*` and `learn/first-website` URLs link to current replacements,
not the revised article body. They are noindex, omit canonical and hreflang,
use their own URL for Open Graph, and are excluded from sitemap, RSS and Pagefind. This preserves shared links
without implying the former zero-experience course still exists.

The series assumes basic HTML and programming knowledge. Tool installation and
Git initialization precede their first use; Windows examples use Node.js 24.x,
pnpm 10.32.1 and `pnpm.cmd`. Article four includes a self-contained Pages workflow
for the minimal example. The final article describes the actual blog's five-entity
Content Graph, without internal handoff or review-status prose.
The bilingual tutorial pins Astro 7.3.3 for reproducibility and includes
`@astrojs/check`/TypeScript plus executable `check` commands. Windows PowerShell
is the documented shell; Unix readers are told which syntax needs adapting.
Original publication dates remain historical metadata; series order is owned by
LearningPath, not inferred from dates. The walkthrough keeps its original date
without a chronology explanation in the prose. Latest articles stay chronological
and link to the ordered series; publication dates are not fabricated to alter order.
Topic discovery shares configured ordering, with a stable ID fallback for new
topics. The walkthrough is classified under website and platform engineering.
The selection article uses a static publishing-flow illustration, and the
deployment article uses a branching SVG. Other articles use code examples where
a diagram would only repeat a short list.
Start is a reading guide, distinct from the author's About page. Discovery lists
only topics with published articles in the current locale. Empty topic detail
routes remain accessible but are noindex, without canonical/hreflang, and excluded
from sitemap and Pagefind. Populated topic hreflang includes only populated locales.
Navigation, About
entry links and the homepage omit cases until that locale has published cases;
the Cases section remains available with an honest noindex empty state until populated.
About distinguishes the published Astro series, the AI SRE lab introduction and
future cloud-native case writing. The lab has no related articles yet.
Article pages show dates, topic chips, a sidebar TOC, body and previous/next series
navigation. Reading time and difficulty are not displayed; Article cards omit
difficulty too. Skill, prerequisite and duplicate series panels are omitted.
Topic/Skill references remain searchable through build-time HTML attributes.
Reading estimates remain derived internally. No schema,
relationship ownership, backend or deployment permissions change.

## V1 Validation and Operational Boundary

The bilingual About page uses the maintainer's Chinese name in both locales, with
locale-appropriate parentheses, a
cloud-native exploration tagline, C#/Angular/React stack, and current exploration
of cloud native and platform engineering. Exploration is not represented as production
experience. Industry history is omitted at the maintainer's request. The page
introduces the writing motivation before the personal introduction. The GitHub
profile URL remains the existing account. The localized display names come from
siteConfig.author.name. Its
article count uses published Articles in the current locale at build
time, avoiding double-counting translations. No founding year or public view count is
shown without supplied evidence; no GA4 reporting API, credentials or scheduled job
is introduced. Reading entry links use the existing localized canonical sections.

The blog presentation uses a shared Author component on the homepage and Article
pages. Identity and GitHub URL come from siteConfig; the public GitHub avatar is
stored locally in public/images/avatar.png and served with the configured base.
Updating the GitHub avatar does not automatically update this snapshot. Avatar
links are ordinary keyboard-accessible links with localized accessible names.
The homepage retains its section order, with a sidebar author card, dated article cards,
a highlighted project and a compact topic directory. Mobile layouts stack through
CSS; there is no new client state, remote widget, font service or dependency.

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
- `pnpm run test:article-example` extracts the bilingual setup and deployment
  article snippets, runs in CI after `check`, builds at `/` and `/Blog/` with the installed Astro version,
  and checks the resulting navigation. It also parses the example workflow and
  checks its action pins and equality across locales. It does not execute GitHub
  Actions or perform a separate dependency installation for the example.
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

The system is **Jacky's bilingual personal technical blog, 從全端到雲原生 / From Full-Stack to Cloud Native**, combining:
- structured Learning Paths
- technical references
- troubleshooting Case Studies
- Project showcases
- long-form engineering Articles

The product shares personal projects, technical articles and architecture decisions.
Explain unfamiliar tools clearly without framing the author as a first-time developer.

Public direction:

> A full-stack engineer’s notes on implementation, troubleshooting and architecture decisions, while moving toward cloud native.

Traditional Chinese:

> 一位全端工程師走向雲原生的實作、排障與架構筆記。

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
10. Require independent review and maintainer approval before merging.

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
Content and source files
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
Independent review
      ↓
Maintainer approval
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
2. About This Blog
3. Latest Articles
4. Featured Project
5. Article Series (LearningPath entities)
6. Featured Topics
7. Latest Cases
8. About the Author

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

## Repository Walkthrough Article

Public prose uses direct instructions and concrete file examples. The September
editorial pass revises the localized articles and the public introductions;
it removes repetitive institutional phrasing and moves the detailed content-model
discussion to the final article. Tutorial commands and deployment safeguards
remain explicit. The Markdown sample uses prose headings instead of an ADR-style
Context/Decision/Tradeoff template. No invented incidents or measurements are added.

Traditional Chinese:

> 用 Astro 整理雙語文章、系列與搜尋

English:

> Organizing bilingual articles, series and search with Astro

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

## Review responsibility

Changes require independent review. The maintainer controls merging and deployment
approval; a review result alone does not authorize either operation.

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

### ADR-009 — Independent review and maintainer approval
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
- review and release workflow
