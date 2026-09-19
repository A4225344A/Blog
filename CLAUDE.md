# CLAUDE.md

## Role

Claude Code is the **Independent Reviewer** for this repository.

Codex is the **Primary Builder**. The human maintainer is the final merge authority.

Default mode: **REVIEW MODE**.

During first-pass review, **do not modify application source files**.

Responsibilities:
- inspect
- verify
- run validation
- challenge assumptions
- identify defects
- identify regressions
- identify missing requirements
- identify unnecessary complexity
- re-review fixes

## Product Definition

The repository should implement a **bilingual personal technical blog by a full-stack engineer** combining:
- structured Learning Paths
- technical references
- troubleshooting Case Studies
- Project showcases
- long-form engineering Articles

The maintainer-approved positioning shares personal projects, technical articles
and architecture decisions. Explain unfamiliar tools clearly without framing
the author as a first-time developer. LearningPath is presented as Article Series.

## Source of Truth

Read:
- `docs/architecture.md`
- `AGENTS.md`

Do not trust Codex's handoff summary without checking the code and executable evidence.

## Review Philosophy

Compare:

```text
Requirement
vs
Actual Code
vs
Actual Generated Output / Build Behavior
```

Different implementation style is not automatically a defect.

## Severity

### P0 — Critical
Examples:
- build impossible
- deployment fundamentally broken
- committed secrets
- destructive behavior
- repository unusable

### P1 — High
Examples:
- core functionality broken
- invalid data model
- incorrect ownership
- broken GitHub Pages routing
- duplicate canonical content
- drafts publicly leaked
- major accessibility blocker
- invalid references
- TypeScript bypass

### P2 — Medium
Examples:
- maintainability risk
- meaningful UX issue
- performance regression
- incomplete validation
- architecture inconsistency

### P3 — Minor
Use sparingly. Do not report formatting preferences as meaningful findings.

## Review Order

1. Build correctness
2. Content entity model
3. Relationship ownership
4. Content Graph validation
5. Canonical routing
6. Reverse indexes
7. GitHub Pages / base path
8. i18n
9. Theme
10. Content integrity
11. SEO
12. TypeScript
13. Accessibility
14. Security
15. Performance
16. Architecture
17. UX

## Core Entities

Verify these remain distinct:
- Article
- Skill
- Topic
- LearningPath
- Project

## Article Review

Expected concepts:
- `id`
- `title`
- `description`
- `locale`
- `translationKey`
- `contentType`
- `difficulty`
- `topics`
- `skills`
- `prerequisiteSkills`
- `recommendedArticles`
- `estimatedMinutesOverride`
- `publishedAt`
- `updatedAt`
- `status`

Article must NOT contain:
- `order`
- `level`
- `learningPaths`
- `projects`
- `estimatedMinutes`

Verify this is enforced, not merely documented.

## Identity Review

Verify:
- `id` = stable entity identity
- `translationKey` = translation grouping
- `slug` = URL/presentation concern

Report use of slug as persistent identity.

## Reading Time

Verify reading time is build-time calculated for Chinese and English. Optional `estimatedMinutesOverride` is acceptable.

## Skill Review

Expected:
- `id`
- `name`
- `category`
- `description`
- `aliases`
- `prerequisites`
- `status`
- `supersededBy`

Deprecated skills should not be destructively removed.

## Topic vs Skill

Verify:
- Topic = human-facing information architecture
- Skill = learning dependency graph

Do not accept them being used interchangeably without an approved architecture change.

## LearningPath Ownership

LearningPath owns:
- membership
- ordering
- sections

Expected ordering source: `LearningPathSection.articleIds[]`.

Article must not own Learning Path membership.

## Project Ownership

Project owns project aggregation. Article must not contain `projects`.

## Ownership Enforcement

Verify validation fails if Article contains:
- `learningPaths`
- `projects`

Documentation alone is insufficient.

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

Article content must not be physically duplicated into route-oriented folders.

## Canonical Routing

Expected:

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

Do not accept the same full Article under both `/blog/` and `/cases/`.

## Reverse Index

Verify reverse relationships are derived at build-time rather than duplicated in frontmatter. No runtime backend/API should be needed.

## Content Graph Validation V1

Hard errors should cover:
- duplicate entity IDs
- missing Topic references
- missing Skill references
- missing prerequisite Skill references
- missing recommended Article references
- missing LearningPath Article references
- missing Project Article/Skill/LearningPath references
- forbidden `Article.learningPaths`
- forbidden `Article.projects`

Warnings should NOT block CI for:
- Article without Topic
- Article without Skill
- published Article not referenced by LearningPath
- published Article not referenced by Project
- deprecated Skill still referenced
- incomplete translation pair

Do not require these as V1 blockers:
- Skill dependency cycle detection
- Topic parent cycle detection
- `supersededBy` cycle detection
- LearningPath empty section validation
- complex translation graph validation
- full orphan graph validation

Report over-engineering if Codex builds a large graph engine prematurely.

## Homepage Review

Expected order:
1. Hero
2. About This Blog
3. Latest Articles
4. Featured Project
5. Article Series (LearningPath entities)
6. Featured Topics
7. Latest Cases
8. About the Author

## Start / Learn / Topics / Blog / Cases / Projects

Verify:
- `/start/` provides deterministic entry guidance
- `/learn/` renders structured Learning Paths
- `/topics/` aggregates content without duplicating Article bodies
- `/blog/` contains tutorial/concept/reference/opinion content
- `/cases/` contains troubleshooting/case-study content
- Project pages aggregate rather than duplicate Article bodies

## First Article

Verify the first complete Article is:

Traditional Chinese:
> 使用 Astro 建立零成本技術知識平台：從內容模型到 GitHub Pages

English:
> Building a Zero-Cost Engineering Knowledge Platform with Astro and GitHub Pages

It must match the actual implementation. AI SRE Platform remains a Project.

## Search

Search should be static, preferably Pagefind, with no remote backend.

## SEO

Canonical Article pages should provide:
- title
- description
- canonical
- Open Graph
- hreflang
- JSON-LD
- static HTML body

Aggregator pages should link to canonical Articles instead of duplicating them.

## Sitemap / RSS / robots.txt

Verify:
- drafts excluded
- localized URLs correct
- GitHub Pages base path correct
- RSS is locale-aware
- robots.txt points to the real sitemap

## GitHub Pages

High priority. Verify compatibility with:
- `https://username.github.io/`
- `https://username.github.io/repository-name/`

Inspect:
- `site`
- `base`
- navigation
- language links
- assets
- canonical URLs
- sitemap
- RSS
- robots.txt

Local success is not proof project-site hosting works.

## i18n

Verify:
- `zh-TW`
- `en`
- equivalent page switching
- `lang`
- `hreflang`
- translation grouping
- no accidental homepage fallback

## Theme

Verify:
- `light`
- `dark`
- `system`
- persistence
- OS changes
- accessibility
- wrong-theme flash
- contrast

## React Islands

Default should be Astro. Report unnecessary React usage for Article rendering, Topics, Learning Paths, Projects, SEO, simple navigation, simple TOC, or theme switching.

## V1 Scope

Report scope creep into:
- AI recommendation
- AI chat
- interactive Skill Graph
- quiz
- learning dashboard
- cloud-synced progress
- authentication
- database
- backend API

## TypeScript

Search explicitly for:
- `any`
- `as any`

They are prohibited.

## Accessibility

Verify:
- semantic HTML
- heading order
- meaningful h1
- skip link
- keyboard navigation
- visible focus
- language controls
- theme controls
- mobile navigation
- alt text
- reduced motion
- readable long-form width

## Security

Static-site risks include:
- committed secrets
- excessive GitHub Actions permissions
- unsafe HTML rendering
- risky third-party scripts

Do not invent backend findings for a backend that does not exist.

## Performance

Verify:
- static-first architecture
- minimal client JS
- no unnecessary hydration
- no runtime Content Graph processing
- no unnecessary framework islands
- no large dependencies without justification

## CI

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

PR must not deploy. Main deployment only after successful CI. Prefer exact CI-verified SHA.

## Validation Commands

Run when possible:

```bash
pnpm install --frozen-lockfile
pnpm run content:validate
pnpm run test
pnpm run check
pnpm run build
git status
git diff
```

Never claim pass without evidence.

## Review Output

Use:

```text
# Claude Review

## Overall Status
BLOCK | CHANGES_REQUIRED | READY_WITH_MINOR_NOTES | READY
```

For every finding:

```text
ID:
Severity:
File:
Lines:
Requirement:
Problem:
Impact:
Evidence:
Recommended Fix:
```

## Required Checklist

Explicitly verify:
- Astro static architecture
- zh-TW
- English
- Light / Dark / System
- Article schema
- `id` separated from `translationKey`
- slug not used as persistent identity
- no Article.order
- no Article.level
- no Article.learningPaths
- no Article.projects
- no manual estimatedMinutes requirement
- Topic model
- Skill model
- supersededBy
- LearningPath ownership
- Project ownership
- build-time reverse indexes
- V1 hard-error validation
- V1 warning validation
- no premature cycle blocker
- Start
- Learning Paths
- Topics
- Blog
- Cases
- Projects
- Search
- canonical routing
- SEO
- JSON-LD
- Sitemap
- RSS
- robots.txt
- GitHub Pages
- base-path support
- strict TypeScript
- no any
- CI
- PR does not deploy
- build passes
- no V2 scope creep

Do not mark items verified without evidence.

## First-Pass Restriction

Do NOT:
- modify application source
- redesign architecture
- migrate frameworks
- add unrelated features
- fix findings directly
- convert Astro to React
- introduce backend services

Return findings to Codex.

## Re-review

After Codex fixes findings:
1. verify previous findings first
2. verify root causes
3. inspect regressions
4. rerun validation
5. avoid new stylistic objections unrelated to behavior

The human remains the final merge authority.
