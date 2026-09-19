# Beginner Learning Path — From-Zero Correction

Status: **IMPLEMENTED_PENDING_INDEPENDENT_REVIEW**

## Summary

The maintainer clarified that readers should build their own website from zero.
The three bilingual lessons now cover tools, an empty folder with manually
written package.json/home page, then CSS, an About page, navigation and build.
The repository ZIP exercise has been removed.

Article pages now show the TOC and body before discovery metadata. LearningPath
previous/next navigation appears immediately after the body; Topic links and
Skill/prerequisite information follow. Topic classification remains available.

## Files Changed

- Six `src/content/articles/{en,zh-tw}/beginner-*.md` lessons.
- `src/content/learning-paths/first-website.json`, `topics/web-foundations.json`
  and `skills/editing-web-pages.json`: descriptions matching the new exercise.
- `src/i18n/content.ts`, `src/i18n/ui.ts`: matching localized entry copy.
- `src/pages/[locale]/[section]/[slug].astro`: move discovery below the lesson.
- `tests/browser/platform.spec.ts`: assert Topic headings appear below both
  lesson prose and LearningPath navigation in both languages.
- README, architecture and this handoff: replace the superseded exercise description.

## Architecture Decisions

Five entity types and all relationship ownership remain unchanged. IDs, slugs
and translation keys are retained, so existing inbound links continue to work.
LearningPath still owns sequence; Article still owns Topic and Skill references.
Search can still index rendered Topic/Skill labels. No new application features,
dependencies, backend or workflow changes were added.

The teaching project explicitly uses Astro 5.18.2 and pnpm 10.32.1. Its first
install uses `pnpm install` to create a lockfile, whereas this repository's CI
continues using `pnpm install --frozen-lockfile`. The exercise starts at the
local root; its lesson explains that a later project-site deployment needs
base-path handling. Manual setup references Astro's official version-5 guide.

## Content Graph Validation

Zero errors; eight intentional `W_ARTICLE_NO_PROJECT` warnings. Beginner lessons
and the architecture Article are not members of the unrelated AI SRE lab.
No ownership fields or validator severity rules were changed.

## Commands Executed, Tests and Build Result

The required frozen install, content validation, deterministic tests, Astro/
TypeScript check and production build are run through `corepack.cmd pnpm`.
All five required commands passed. Astro check reported zero errors, warnings
and hints; build produced 45 pages and 26 indexed entries in two languages.
Build-output verification passed for both root and `/Blog/` deployment paths.

The existing 52 deterministic tests cover ownership, navigation boundaries,
locale filtering, prerequisites, graph diagnostics, URLs, reading time and CI.
All 52 deterministic tests passed. The six browser tests passed at each base,
including the bilingual journey and new reading-order checks.

## Exercise Verification

Created two fresh temporary projects using the exact JSON, Astro, HTML and CSS
blocks extracted from the Chinese and English lessons. Installed dependencies
without a pre-existing lockfile and built each project successfully (two pages
each). Chromium verified the home heading, computed heading color, About page,
and return link using Astro preview. Temporary projects were removed afterward.

pnpm reported ignored dependency build scripts; these text-only sites built
successfully without approving them. Both lessons explain this observed warning.
This is Builder evidence, not independent review or a clean-machine installer test.

## Known Limitations

- Windows-only hands-on instructions. Node.js/VS Code installer interaction was
  not repeated on a clean machine.
- This stage builds a local two-page website. Markdown, Git history and public
  deployment remain future lessons.
- Astro itself is pinned in the teaching package, but first-time transitive
  resolution can change; the generated lockfile records each reader's install.
- Browser checks cover Chromium, not a complete accessibility/cross-browser audit.
- No production deployment or approval-setting change was performed.

## Deferred Work

Continue the from-zero course with Markdown, Git and publishing in a separately
scoped content change. No V2/V3 features, progress tracking or graph UI introduced.

## Reviewer Focus

1. Follow the files and commands from an empty folder in both languages.
2. Verify the reader remains in the lesson before seeing classification links.
3. Check search metadata, canonical URLs and LearningPath ownership are preserved.
4. Review novice explanations, recovery steps and local-versus-public boundaries.

Changes are committed on the existing beginner branch, separating lesson content
from reading-order/tests/documentation. The Builder stops for Claude review;
the human maintainer remains the final merge authority.
