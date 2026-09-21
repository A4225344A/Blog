# Content consistency handoff — 2026-09-21

Status: IMPLEMENTED_PENDING_INDEPENDENT_REVIEW

Historical first handoff. Claude subsequently returned CHANGES_REQUIRED.
The current corrections, validation and remaining external blocker are recorded
in [handoff-content-review-fixes.md](handoff-content-review-fixes.md); that report
supersedes the canonical/indexing decisions and result counts below.

Branch: `fix/content-consistency`, created from `origin/main` at `8cb9ff2`.
Scope: the maintainer's site-wide editorial review, including bilingual content,
navigation, legacy URLs and runnable tutorial instructions. No merge or deployment.

## Summary and finding disposition

| Finding | Status | Result |
| --- | --- | --- |
| Beginner URLs now contain intermediate articles | FIXED | New descriptive slugs; old URLs explain the changed audience and link to the replacement. Stable Article IDs and translation keys are preserved. |
| Two overlapping Astro series | FIXED | Four articles in `knowledge-platform`; duplicate `first-website` retired with a migration notice. |
| About recommends empty cases | FIXED | Cases links in navigation and About, plus the homepage cases section, depend on published content in the current locale. About distinguishes available writing from future work. |
| Featured topics have no articles | FIXED | Homepage, Start and Topics list only topics with published local-language articles. Existing taxonomy and direct topic URLs remain. |
| Identity and site naming differ | FIXED | Full-stack engineer wording throughout; root uses the localized site title. Fourth article now explicitly describes this Astro blog. |
| Repeated tagline and overlapping Start/About | FIXED | Distinct hero, reading guide and author text; footer identifies the author; root asks readers to choose a language. |
| Setup instructions appear too late; Git setup missing | FIXED | Tool installation precedes use; Git initialization, ignore file and first commit are included. |
| PowerShell variables described incorrectly; base leaks into dev | FIXED | Session scope explained, with explicit variable removal before restarting dev. |
| Deployment tutorial cannot be followed independently | FIXED | Complete sample workflow uses the sample project's own build script, pinned actions, main-only artifact deployment, environment approval and stale-commit rejection. |
| Node/pnpm/preview instructions inconsistent | FIXED | Node 24.x, pnpm 10.32.1 and local `pnpm.cmd run` throughout; Linux workflow commands are explicitly distinguished. Repository minimum remains 22.12. |
| Formulaic headings, repetitive diagrams and missing alternatives | FIXED | Varied headings and paragraphs; only the useful publishing-flow illustration retained. Astro compared with Hugo, Next.js static export and self-hosted WordPress, with official references. |
| Internal reviewer status leaks into article four | FIXED | Article rewritten for readers; internal status stays in handoff documentation. Dense identity/SEO discussion split into smaller explanations. |
| Unexplained terminology and audience mismatch | FIXED | Basic HTML/programming prerequisite stated. Explain lockfile, frontmatter, Props, slot, site/base, CI, artifacts, SHA, environment and OIDC where used; skill descriptions updated. |
| Awkward equal-content/full-stack/second-article sentences | FIXED | Corrected in both languages. |
| Lack of real incidents, timings and screenshots in articles | PARTIALLY_FIXED | Examples are now actually build-verified and comparisons concrete. No incidents or timings invented. Browser screenshots are local validation artifacts, not claims of the author's historical experience. |

## Files changed

- Eight bilingual articles under `src/content/articles/`; first three renamed to
  `why-astro.md`, `astro-project-setup.md`, `astro-content-and-deployment.md`.
- LearningPath consolidation, three Skill descriptions, `src/i18n/content.ts`,
  `src/i18n/ui.ts`, `src/config/site.ts`.
- `src/config/legacy-routes.ts`, catalog helper, shared layout, home/root/section/
  detail pages and `AboutProfile.astro`.
- Build and collection checks, editorial/series/browser tests,
  `scripts/verify-article-example.ts`, package script and architecture documentation.

## Architecture decisions

The five-entity schema and relationship ownership are unchanged. Renaming a URL
does not rename Article identity. Migration pages are manual explanatory entry
points, not automatic redirects or duplicated articles. Their canonical points
to the replacement; `noindex,follow` and indexing exclusions keep them out of
sitemap, RSS and Pagefind. Both languages and both hosting bases are supported.

The Cases section and empty topic detail routes still exist for stable links.
Discovery avoids empty content; an integration fixture verifies that cases become
visible only in the locale where published cases exist. AI SRE Platform remains
a separate lab, with no fabricated related articles. No analytics policy changes.

## Validation

Commands ran through `corepack.cmd pnpm` with workspace-local `COREPACK_HOME`:

| Command / configuration | Result |
| --- | --- |
| `install --frozen-lockfile --store-dir .pnpm-store` | PASS; lockfile unchanged |
| `run content:validate` | PASS; 0 errors, 8 existing `W_ARTICLE_NO_PROJECT` warnings |
| `run test` | PASS; 60/60 |
| `run check` | PASS; 59 files, 0 errors/warnings/hints |
| `run test:article-example` | PASS; en and zh-tw, each at `/` and `/Blog/` |
| `run test:collections` at `/Blog/` | PASS; all five collections, published cases visible in English only, drafts/archives excluded |
| `run build` + `run test:build`, GA4 disabled, `/` and `/Blog/` | PASS; 51 HTML pages including 8 migration notices, 43 public inventory pages, 24 search pages; zero googletagmanager references |
| `run build` + `run test:build`, synthetic GA4, `/` and `/Blog/` | PASS |
| `run test:browser`, synthetic GA4, `/` | PASS; 11/11 |
| `run test:browser`, synthetic GA4, `/Blog/` | PASS; 11/11 |

Browser tests used only `G-123456ABCD`, with Google requests intercepted by the
existing analytics harness. Production ID was not supplied to browsers.
The first browser run found an outdated title assertion; it was corrected and
both complete suites passed afterward. Screenshots inspected include desktop
home and mobile About; viewport checks cover both languages and article layouts.

Local tooling: Node 24.15.0, pnpm 10.32.1, Astro 5.18.2. Pagefind's existing
zh-tw stemming notice remains. Analytics-disabled Vite builds may report an
empty Analytics script chunk; the full output scan still finds zero Google tags.

## Limitations and reviewer focus

- The example was built with the installed pinned Astro version; its GitHub
  workflow was parsed and pins checked, not executed on GitHub. External Pages
  settings and required reviewers remain maintainer configuration.
- This is an intermediate series. The original zero-experience course has not
  been restored. Check that the migration notice communicates this clearly.
- Review bilingual editorial voice, tutorial order, the example deployment
  workflow, stable identities, series ordering and noindex/canonical behavior.
- Confirm content-dependent navigation remains appropriate as content grows.
- Original experience reports or measured historical results require real source
  material; none were manufactured for this revision.

Builder validation is complete. Independent Claude review is pending.
