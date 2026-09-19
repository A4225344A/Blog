# Personal Technical Blog — Builder Handoff

Status: **IMPLEMENTED_PENDING_INDEPENDENT_REVIEW**

## Summary

The maintainer confirmed that this is a full-stack engineer's personal blog for
projects and technical writing, not a first-website course. The homepage now
prioritizes articles and the featured project. Start introduces the blog and
offers project/article discovery. LearningPath is displayed as Article Series.

The bilingual Astro series explains selection rationale, an empty project, and
Markdown/layouts/delivery. Diagrams and practical explanations remain; tool setup
is an appendix. The actual repository and the small illustrative project are
explicitly distinguished. No professional history or production claims are added.

Branch: `content/fullstack-engineering-blog`, created from main `430fb66`.
This supersedes the unmerged illustrated-beginner branch for the maintainer's
current intent. Do not merge that earlier branch after this one.

## Files Changed

- AGENTS.md, CLAUDE.md, docs/architecture.md and README: approved positioning and
  homepage order, with Builder/Reviewer responsibilities unchanged.
- src/i18n, src/config/site.ts, root/Home/Start routes: bilingual identity, author
  introduction, article-series labels and discovery links.
- Six rewritten series Articles and two architecture Article corrections;
  LearningPath and Topic presentation: content aligned with the blog audience.
- src/styles/global.css: static responsive diagrams.
- tests/learning-path.test.ts and tests/browser/platform.spec.ts: bilingual
  series prerequisites, navigation, homepage priority and diagram behavior.

## Architecture Decisions

Exactly five entities remain. LearningPath owns ordered Article membership;
Project owns project relationships; Article owns Topic/Skill references.
Schema, graph severity, CI permissions and human deployment approval are unchanged.
Stable IDs, translation keys and slugs are retained, including legacy beginner-*
and first-website identifiers, to avoid breaking links and graph references.
RSS/SEO titles use the updated shared identity. AI SRE Platform stays a lab.

The minimal example uses Markdown under pages to illustrate Astro's layout
mechanism. Actual repository Articles stay in Content Collections and are not
duplicated. Diagrams are native HTML/CSS, with no client rendering dependency.

## Content Graph Validation

Zero errors and eight intentional W_ARTICLE_NO_PROJECT warnings. The blog series
is not falsely attached to the unrelated AI SRE lab. Prerequisites are taught in
series order, equally in both locales.

## Commands Executed and Tests

Required commands are run via corepack.cmd pnpm: frozen install, content:validate,
test, check and build. Additional verification covers test:build, test:browser,
git diff --check, git status and git diff.

Final validation passed: frozen install; graph validation with zero errors and
eight warnings; 52 unit tests; Astro check with zero errors, warnings or hints.
Production build and artifact assertions passed for both `/` and `/Blog/`.
All seven browser tests passed on each base, including JavaScript-disabled
diagrams, mobile overflow, bilingual series navigation, theme and search.
Search discovery now checks subsequent result pages instead of assuming the
architecture article always ranks within the first five results.

Both bilingual examples were extracted from their actual code blocks into empty
temporary folders, installed and built with /Blog/. Generated HTML assertions
verified the Markdown slot, title, shared CSS, single h1 and both base-prefixed
navigation links. Each example generated two pages. Temporary files were removed.

## Build Result

The public route inventory remains 45 pages and 26 indexed entries. No new
dependencies, backend or runtime service were added.

## Known Limitations and Deferred Work

- Existing URLs still carry legacy beginner names; public titles and navigation
  use the new positioning. A redirect migration can be scoped separately.
- The small example pins Astro but first-install transitive dependencies may
  change. The generated lockfile records the actual resolution.
- Reader account deployment is described, not performed. Hosted CI and production
  approval are not proven by local tests.
- No clean-machine installer test, full accessibility audit or reader study.
- Generic engineering social-card artwork is retained; no new personal logo or
  branding assets were commissioned.
- V2/V3 features remain excluded.

## Reviewer Focus

Confirm the author's full-stack role and personal-project positioning are clear;
check that readable explanations avoid assuming the author is new to development.
Review bilingual parity, the example/repository distinction, homepage order,
legacy URL preservation, base handling and unchanged relationship ownership.

The Builder stops for Claude independent review. The maintainer remains the
final merge and deployment authority.
