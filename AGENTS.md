# AGENTS.md

## Role

Codex is the **Primary Builder** for this repository. Claude Code is the **Independent Reviewer**. The human maintainer is the final merge authority.

Responsibilities:
- inspect the repository before editing
- read `docs/architecture.md`
- plan scoped changes
- implement
- test
- document
- fix confirmed review findings
- stop and hand off for independent review

Do not act as the final reviewer of your own implementation.

## Product Definition

This repository is a **bilingual engineering knowledge platform** combining:
- structured Learning Paths
- technical references
- troubleshooting Case Studies
- Project showcases
- long-form engineering Articles
- Topic-based discovery
- static search

The product is **Knowledge-first, Portfolio-second**.

Public positioning:

> Engineering knowledge, built from real systems.

Traditional Chinese:

> 從實作、排障到架構，建立可循序學習的工程知識。

Primary domains:
- Cloud Native
- Platform Engineering
- SRE
- AI Engineering
- Backend Engineering

## Core Constraints

Use:
- Astro
- TypeScript
- Static Site Generation
- Astro Content Collections
- Markdown / MDX
- pnpm
- GitHub Actions
- GitHub Pages

Keep the architecture:
- static-first
- content-driven
- configuration-driven
- strongly typed
- Git-managed

Do NOT introduce without explicit approval:
- backend API
- database
- authentication
- server runtime
- paid infrastructure
- remote CMS
- full SPA
- user accounts
- cloud-synced progress

## AI Workflow

```text
Human Requirement
        ↓
Codex Builder
        ↓
Implementation
        ↓
Validation
        ↓
Commit / Pull Request
        ↓
Claude Independent Review
        ↓
Codex Fixes
        ↓
Claude Re-review
        ↓
Human Gate
        ↓
Merge
```

Do not let Builder and Reviewer edit the same working tree simultaneously.

## Source of Truth

Read `docs/architecture.md` before architectural changes. If implementation and architecture documentation disagree, resolve the mismatch in the same PR.

## Locales

Support:
- `zh-TW`
- `en`

Route prefixes:
- `/zh-tw/`
- `/en/`

Language switching should preserve equivalent content when a translation exists.

## Theme

Support exactly:
- `light`
- `dark`
- `system`

Rules:
- no saved preference → `system`
- explicit preference persists
- `system` follows OS theme and reacts to OS changes
- minimize wrong-theme flash
- controls must be accessible

## Site IA

Required localized sections:
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

Do not revert to a portfolio-first homepage.

## Core Content Entities

V1 has exactly five core entities:
1. Article
2. Skill
3. Topic
4. LearningPath
5. Project

These form the Content Graph.

## Article Model

Conceptual metadata:

```ts
type Locale = "zh-TW" | "en";

type Difficulty = "beginner" | "intermediate" | "advanced";

type ContentType =
  | "tutorial"
  | "concept"
  | "troubleshooting"
  | "case-study"
  | "reference"
  | "opinion";

type ContentStatus = "draft" | "published" | "archived";

interface ArticleMetadata {
  id: string;
  title: string;
  description: string;
  locale: Locale;
  translationKey: string;
  contentType: ContentType;
  difficulty: Difficulty;
  topics: string[];
  skills: string[];
  prerequisiteSkills: string[];
  recommendedArticles: string[];
  estimatedMinutesOverride?: number;
  publishedAt?: Date;
  updatedAt?: Date;
  status: ContentStatus;
}
```

Actual implementation should use Astro-supported schema validation.

### Forbidden Article fields

Article metadata must NOT contain:
- `order`
- `level`
- `learningPaths`
- `projects`
- `estimatedMinutes`

Reasons:
- ordering belongs to LearningPath
- Learning Path membership belongs to LearningPath
- Project membership belongs to Project
- reading time is build-time derived

## Stable Identity

Keep these distinct:
- `id` = stable physical content entity identity
- `translationKey` = translation grouping
- `slug` = routing/presentation concern

Do not use slug as the persistent entity key.

## Reading Time

Calculate reading time at build-time for Traditional Chinese and English. Only allow `estimatedMinutesOverride` as an exception.

## Skill Model

```ts
type SkillStatus = "active" | "deprecated";

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  aliases: string[];
  prerequisites: string[];
  status: SkillStatus;
  supersededBy?: string;
}
```

Skill = learning dependency node, not website taxonomy.

## Topic Model

```ts
interface Topic {
  id: string;
  name: string;
  description: string;
  parentId?: string;
}
```

Topic = human-facing classification. Keep taxonomy shallow, ideally max 2 levels.

## Topic vs Skill

```text
Topic
= browsing / information architecture

Skill
= learning dependency graph
```

Do not merge them.

## LearningPath Model

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

LearningPath owns membership and ordering. `articleIds[]` order is authoritative.

Do not reintroduce `Article.order`, `Article.level`, or `Article.learningPaths`.

## Project Model

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

Project owns project membership. Do not add `Article.projects`.

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

One authoritative owner per relationship. Reverse relationships are computed.

## Content Storage

Preferred:

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

Do not physically duplicate Article content into route-oriented folders.

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

Never render the same full Article under both routes. Topic, LearningPath, Project, and Search pages are aggregators that link to canonical Article URLs.

## Reverse Index

Reverse relationships are derived at build-time. Do not duplicate them in frontmatter.

Examples:

```ts
interface ArticleReverseIndex {
  learningPathIds: string[];
  projectIds: string[];
  incomingRecommendedArticleIds: string[];
}

interface SkillReverseIndex {
  articleIds: string[];
  dependentSkillIds: string[];
  projectIds: string[];
}
```

No runtime backend/API dependency.

## Content Graph Validation V1

Keep V1 intentionally minimal.

### Hard errors

Fail CI for:
- duplicate Article ID
- duplicate Topic ID
- duplicate Skill ID
- duplicate LearningPath ID
- duplicate Project ID
- Article → missing Topic
- Article → missing Skill
- Article → missing prerequisite Skill
- Article → missing recommended Article
- LearningPath → missing Article
- Project → missing Article
- Project → missing Skill
- Project → missing LearningPath
- forbidden `Article.learningPaths`
- forbidden `Article.projects`

Hard errors must return non-zero exit status.

### Warnings

Do NOT block CI for:
- Article has no Topic
- Article has no Skill
- published Article not referenced by LearningPath
- published Article not referenced by Project
- deprecated Skill still referenced
- translationKey has only one locale

Use clear warning IDs.

### Deferred validation

Do NOT make these V1 blockers:
- Skill dependency cycle detection
- Topic parent cycle detection
- `supersededBy` cycle detection
- LearningPath empty section validation
- complex translation graph validation
- full orphan graph validation

## First Complete Article

Traditional Chinese:

> 使用 Astro 建立零成本技術知識平台：從內容模型到 GitHub Pages

English:

> Building a Zero-Cost Engineering Knowledge Platform with Astro and GitHub Pages

It must describe the actual repository implementation. Do not document features that do not exist.

Initial featured Project: **AI SRE Platform**. It must remain a Project, not the first Article.

## Search

Use static search, preferably Pagefind. Index title, description, body, Topics, and Skills. No remote search API.

## SEO

Canonical Article pages should provide:
- title
- description
- canonical
- Open Graph
- hreflang
- JSON-LD
- static HTML content

Use `TechArticle` when semantically appropriate.

## Sitemap / RSS / robots.txt

Sitemap includes public pages and published Articles, excludes drafts.

RSS target:
- `/zh-tw/rss.xml`
- `/en/rss.xml`

robots.txt intent:

```text
User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

Sitemap: <correct production sitemap URL>
```

## React Islands Policy

Default to Astro. React is only for complex browser state.

Do not add React for:
- Article rendering
- Topics
- Learning Paths
- Projects
- SEO
- simple navigation
- simple TOC
- theme switching

Potential future React use:
- progress tracker
- interactive Skill Graph
- quiz
- advanced recommendation UI

## V1 Explicit Exclusions

Do NOT implement:
- AI recommendation
- AI chat
- interactive Skill Graph
- quiz
- learning dashboard
- cloud-synced progress
- user account
- authentication
- database
- backend API

## TypeScript Policy

Strict TypeScript is mandatory.

Forbidden:

```ts
any
as any
```

Unknown runtime values should use `unknown` and be narrowed safely.

## Accessibility

Maintain:
- semantic HTML
- logical heading hierarchy
- skip link
- keyboard navigation
- visible focus
- meaningful alt text
- sufficient contrast
- reduced motion
- accessible mobile navigation
- accessible theme selector
- accessible language selector

## Performance

Primary principle: **Static HTML first**.

Avoid:
- unnecessary hydration
- full SPA architecture
- client-side graph processing
- oversized dependencies
- unnecessary third-party scripts

## GitHub Pages

Support both:
- `https://username.github.io/`
- `https://username.github.io/repository-name/`

Handle Astro `site` and `base` deliberately. Verify navigation, localized links, assets, canonical URLs, sitemap, RSS, and robots.txt.

## CI Quality Gate

Expected:

```text
install
↓
schema/content validation
↓
Content Graph Validation V1
↓
tests
↓
Astro check
↓
production build
```

Expected commands:

```bash
pnpm install --frozen-lockfile
pnpm run content:validate
pnpm run test
pnpm run check
pnpm run build
```

PRs must not deploy production.

## Deployment Gate

CI and deployment share one workflow with separate jobs. Deploy only after CI succeeds on `main`, using the exact CI-verified artifact. The deploy job must use the `github-pages` environment with required human reviewers. Only the deploy job should receive GitHub Pages write/OIDC permissions.

## Testing

Create deterministic tests for useful pure logic, such as:
- ID uniqueness
- reference validation
- reading time
- locale mapping
- canonical route generation
- reverse-index generation

Do not create fake always-passing tests.

## Implementation Sequence

### Phase 1 — Architecture and Data Model
- architecture documentation
- five entity schemas
- ownership rules
- canonical routing strategy
- validation strategy

### Phase 2 — Foundation
- Astro
- strict TypeScript
- i18n
- theme
- layouts
- route helpers
- GitHub Pages config

### Phase 3 — Content Graph V1
- five entities
- reverse indexes
- V1 hard errors
- V1 warnings

### Phase 4 — Content Views
- Home
- Start
- Learn
- Topics
- Blog
- Cases
- Projects
- About

### Phase 5 — Search and SEO
- static search
- canonical
- hreflang
- JSON-LD
- sitemap
- RSS
- robots.txt

### Phase 6 — CI and Deployment
- CI
- content validation
- tests
- build
- GitHub Pages deploy

### Phase 7 — First Article
Create the Astro Knowledge Platform article from actual implementation.

## Validation Before Handoff

Run:

```bash
pnpm install --frozen-lockfile
pnpm run content:validate
pnpm run test
pnpm run check
pnpm run build
git status
git diff
```

Never claim success unless commands actually ran.

## Handoff Report

Provide:
- Summary
- Files Changed
- Architecture Decisions
- Content Graph Validation
- Commands Executed
- Tests
- Build Result
- Known Limitations
- Deferred Work
- Reviewer Focus

Then stop editing and hand control to Claude.

## Responding to Claude Review

For each finding:
1. inspect actual code
2. determine whether it is valid
3. do not blindly accept conclusions
4. fix the root cause when valid
5. reject with technical evidence when invalid
6. avoid unrelated refactoring

Allowed states:
- `FIXED`
- `PARTIALLY_FIXED`
- `REJECTED_WITH_REASON`
- `NEEDS_HUMAN_DECISION`

After fixes, rerun validation and return to Claude for re-review.

## Non-Negotiable Rules

Never:
- use `any`
- use `as any`
- introduce backend/database/auth without requirement
- require paid infrastructure
- duplicate Article content across routes
- reintroduce Article `order`
- reintroduce Article `level`
- reintroduce Article `learningPaths`
- reintroduce Article `projects`
- use slug as persistent identity
- implement V2 features in V1
- fabricate incidents, maturity, or metrics
- bypass validation to make CI green
