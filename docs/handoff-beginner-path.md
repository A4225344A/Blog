# Beginner Learning Path — Builder Handoff

Status: **IMPLEMENTED_PENDING_INDEPENDENT_REVIEW**

## Summary

Added a complete first exercise for readers with no coding experience: prepare
tools, run a downloaded website locally, edit a heading and restore it. Three
lessons are published in Traditional Chinese and English. Start offers separate
beginner and experienced-reader entries; the existing intermediate architecture
Article retains its depth.

Branch: `content/beginner-learning-path`, based on merged main `8974f88`.
The branch now integrates main `f001d48`, which includes the unified CI workflow.
README and architecture status conflicts were resolved by retaining both the
beginner content and the unified workflow with its human deployment gate.
No merge into main, production deployment or independent approval is claimed here.

## Files Changed

- `src/content/articles/{zh-tw,en}/beginner-{tools,local-website,first-change}.md`:
  six complete lessons, including command locations, success checks and recovery.
- `src/content/learning-paths/first-website.json`,
  `src/content/topics/web-foundations.json`, three new Skill JSON files:
  authoritative learning sequence, classification and taught capabilities.
- `src/content/learning-paths/knowledge-platform.json`, `src/i18n/content.ts`:
  localized new entities and explicit intermediate prerequisites.
- `src/config/site.ts`, `src/i18n/ui.ts`, section index route:
  experience-based Start entries referencing LearningPath IDs.
- `src/utils/catalog.ts`, Article detail route, `ArticleList.astro`:
  derived previous/next navigation and visible difficulty labels.
- `tests/learning-path.test.ts`, `tests/browser/platform.spec.ts`:
  deterministic ordering/prerequisite checks and bilingual reader journeys.
- `README.md`, `docs/architecture.md`, this report: scope, decisions and evidence.

## Architecture Decisions

- Exactly five core entity types remain. LearningPath owns Article ordering and
  membership; Article metadata gains no duplicate relationship fields.
- Adjacent lessons are computed from published, locale-filtered LearningPath
  sections, including section boundaries. Reverse indexes identify applicable
  paths. Links use existing base-aware canonical URL helpers.
- Start configuration contains path IDs only. Article cards expose existing
  difficulty metadata; the original Article remains intermediate.
- The Windows exercise uses a ZIP pinned to released commit
  `8974f88ce3d6d5fb24009e4844405caa5af13b17`, keeping the expected files and heading
  reproducible without requiring Git or an account.
- No backend, authentication, progress tracking, quiz, AI or Skill Graph UI added.
  AI SRE Platform remains a lab and does not own unrelated beginner content.

## Content Graph Validation

Zero errors; eight intentional `W_ARTICLE_NO_PROJECT` warnings (two existing
architecture Articles and six beginner Articles). No missing translation warnings.
V1 hard-error and warning behavior is unchanged. The beginner path teaches each
prerequisite before using it, and both locales share the same lesson sequence.

## Commands Executed and Validation Results

Commands use pnpm 10.32.1 through `corepack.cmd pnpm` in this Builder environment.
The required gate is also available as `scripts/validate-all.ps1`.

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed; lockfile unchanged |
| `pnpm run content:validate` | Passed; zero errors, eight warnings above |
| `pnpm run test` | 52 deterministic tests passed after main integration |
| `pnpm run check` | Passed; Astro and strict TypeScript |
| `pnpm run build` | Passed; 45 pages, 26 Pagefind entries across two languages |
| `pnpm run test:build` | Passed for `/` and `/Blog/` |
| `pnpm run test:collections` | Passed; temporary collection fixtures restored |
| `pnpm run test:browser` | Six Chromium tests passed for each base |

The generated-output checks cover canonical links, reciprocal hreflang, assets,
sitemap, RSS, search markers and generated robots text. Browser checks cover the
new three-lesson journey and language switching, plus existing theme, mobile
navigation, search and metadata behavior.

After integrating main, the five required commands, `test:build` and all six
browser tests were rerun successfully with `/Blog/`. Root-base and collection
results above are from the preceding beginner implementation validation.

## Teaching Exercise Verification

Exported the exact pinned commit with `git archive` into a temporary workspace
folder, installed its frozen dependencies from the local pnpm cache, and launched
its Astro dev server. Chromium observed the original heading, the Chinese edit,
the English edit and restoration after saving and refreshing. All temporary
exercise files were removed afterward.

An initial attempt inside ignored `test-results` did not trigger file updates;
the same exercise succeeded in an ordinary workspace folder. This does not claim
a clean-machine MSI/global-pnpm installation or a fresh network ZIP download was
tested. Installation instructions link to official Node.js, pnpm, VS Code, Astro
and GitHub documentation.

## Commits

Changes are separated into a content commit and a navigation/tests/documentation
commit. Use `git log --oneline origin/main..content/beginner-learning-path` for
their exact hashes; the final Builder response also records them.

## Known Limitations and Deferred Work

- Hands-on instructions currently cover Windows only. The first loop ends at a
  local edit; Markdown writing, Git history, public publishing and full advanced
  tracks are not advertised as delivered.
- No first-time-reader usability session, clean Windows installation, complete
  accessibility audit or cross-browser matrix was performed.
- The teaching snapshot is deliberately fixed. Future dependency or security
  updates require explicitly refreshing and rechecking that exercise version.
- The eight Project-membership warnings remain intentional; Pagefind's existing
  lack of Traditional Chinese stemming is unchanged.
- Hosted CI, GitHub environment approvals and live deployment are maintainer-side
  follow-up. The unified workflow is included from main; its human gate remains.

## Reviewer Focus

1. Can a zero-experience Windows reader follow each command location and success
   check? Are the two language versions equivalent?
2. Confirm the pinned example matches the lesson and installer directions remain
   appropriate on a clean machine.
3. Verify ownership, publication/locale filtering, cross-section navigation,
   first/last boundaries, and `/Blog/` links.
4. Confirm scope remains V1 content and static navigation, with no implied
   production maturity, completed publishing course or independent approval.

The Builder stops here for Claude independent review. The human maintainer
remains the final merge authority.
