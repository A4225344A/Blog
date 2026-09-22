# Indigo layout and public-repository security handoff

Status: **FOLLOW_UP_PENDING_CLAUDE_RE_REVIEW**. Claude reported
`READY_WITH_MINOR_NOTES` on the preceding working tree. The follow-up below is
new work and is not covered by that review. Neither status permits merge/deploy.

## Summary

Branch: `feat/indigo-blog-security`, based on `origin/main` at `83ed1bf`.
The maintainer requested the local `C:\Blog參考` design, the name 小小工程師,
and public-repository security. After the initial audit found vulnerable
dependencies, the maintainer also explicitly approved upgrading Astro and
updating/verifying both tutorial languages.

Adapted the supplied patch's card/sidebar layout and indigo palette. Kept
light/dark/system behavior and existing theme tests; did not adopt its article
split, extra diagrams, image zoom or removal of tests. White text gradients are
darker than the screenshot for readability. The header wraps rather than
remaining sticky over mobile content. Mobile TOCs precede the article body;
remaining sidebar widgets follow the main content.

Public names, About, footer, article references, metadata and RSS now use
小小工程師 / A Little Engineer’s Blog. Jacky's GitHub account remains unchanged.

## Files changed

- Presentation: `src/styles/global.css`, `src/layouts/BaseLayout.astro`,
  `src/components/{Sidebar,ArticleList,AboutProfile}.astro`, localized index/detail
  routes and the root language chooser; `src/i18n/{index,ui}.ts`.
- Dependency migration: `package.json`, `pnpm-lock.yaml`, `src/content/schemas.ts`,
  `playwright.config.ts`, example/collection verification scripts and workflow
  schema tests. Both setup articles now pin Astro 7.3.3; existing article names
  referring to the blog were updated in both languages.
- Security: `.github/{ci workflow,dependabot.yml,CODEOWNERS}`, `SECURITY.md`,
  `scripts/{security-rules,verify-security}.ts`, security tests and `.gitignore`.
- Documentation: README, architecture, security baseline and this handoff.

## Architecture decisions

Astro 7.3.3, Zod 4.6.5 and tsx 4.23.15 are pinned directly and in the lockfile.
Node 24 is used locally and in CI. Schemas retain strict unknown-field rejection
and safe repository URLs, using Zod 4's URL and record APIs. Astro's CLI moved to
`bin/astro.mjs`; Playwright explicitly disables automatic background preview so
it owns startup/shutdown and does not accidentally test an existing server.

No new runtime service, client framework, remote font/CDN or third-party script.
GA4 behavior and acquisition policy are unchanged. Sidebar counts are build-time
published localized content counts (currently 4 articles, 2 topics, 1 series),
not visit totals. The five entities, stable IDs, canonical URLs and series order
remain unchanged. Sidebar content is excluded from Pagefind.

## Security

Initial `pnpm audit --json`: 13 advisories (1 critical, 4 high, 5 moderate, 3 low).
Final audit: **0** at every severity, including development dependencies.
The critical image-processing advisory applies when untrusted AVIF input reaches
optimization; this report does not claim the static site was exploited.
See [Astro's advisory](https://github.com/advisories/GHSA-26w7-cxv4-gfx2).

CI preserves read-only PR permissions, pinned actions, no persisted checkout
credentials, main-only deployment, the protected environment and exact-artifact
deployment. It adds time limits, the public-file guard and a high-severity audit
gate. Dependabot proposes weekly changes; it does not auto-merge. CODEOWNERS
requires GitHub branch rules to enforce review. Action updates must also update
the reviewed hash manifest and tutorial workflow.

The public-file guard detects selected credential shapes and filenames without
logging values. It checks current tracked/unignored working files, not complete
Git history or binary content. It supplements rather than replaces GitHub secret
scanning. The reporting policy and settings checklist are in `docs/security.md`.

## Initial implementation validation

Commands used `corepack.cmd pnpm` with the local Corepack cache on Windows.

| Check | Result |
| --- | --- |
| Frozen install, offline existing store | PASS after final lockfile update |
| `content:validate` | PASS: 0 errors, 8 existing `W_ARTICLE_NO_PROJECT` warnings |
| `security:check` | PASS: no current-file findings |
| `test` | PASS: 65/65 |
| `check` | PASS: 63 files, 0 errors/warnings/hints |
| `test:article-example` | PASS: both languages, `/` and `/Blog/` |
| `test:collections` | PASS: five populated collections; fixtures cleaned up |
| Build + `test:build`, GA4 off | PASS at `/` and `/Blog/`; zero Google Tag Manager references |
| Build + `test:build`, synthetic GA4 | PASS at `/` and `/Blog/` |
| `test:browser`, synthetic GA4 | PASS: 12/12 at each base |
| `pnpm audit --json` | PASS: 0 known advisories |
| `git diff --check` | PASS |

Synthetic browser ID: `G-123456ABCD` only. No production analytics ID was used
in browser testing. Each normal build renders 51 HTML pages (43 public routes
plus migration notices), with 16 Pagefind pages in two languages. The final
local `dist` is the `/Blog/` synthetic build, not a deployment artifact.

The example verifier executes published snippets with installed repository tools;
this pass did not independently install an isolated tutorial dependency tree.
The remaining Pagefind zh-TW stemming notice and eight content warnings are known.
Initial migration failures (Zod types, old CLI paths, detached preview and an
ambiguous sidebar link selector) were fixed before the passing matrix.

Screenshots inspected: `test-results/blog-article-1280.png` and
`test-results/blog-home-375.png`; browser tests also capture About and desktop
home/mobile article views. Browser tests now verify sidebar counts, actual theme
foreground colors and the new public name in addition to existing navigation,
search, GA4, responsive, denied-storage and no-JavaScript coverage.

## Known limitations and deferred work

- GitHub-hosted Actions execution and current repository settings were not
  verified. Secret scanning/push protection, private reporting, Dependabot alerts,
  main rules and `github-pages` required reviewers need live maintainer checks.
  Historical reviewer confirmation is not substituted for a fresh audit.
- No complete Git-history secret audit, CSP or custom Pages response headers.
- macOS/Linux instructions were not executed; local validation used Windows.
- No commit, push, merge or deployment was performed for this branch.

## Reviewer focus

Inspect actual diff against `83ed1bf`, including new untracked files. Re-run the
matrix, check Zod schema invariants and tutorial outputs after the major upgrade,
and inspect mobile/dark/static rendering and sidebar TOC keyboard navigation.
Verify the security guard's fail behavior and limitations, CI least privilege and
the unchanged GA4 policy. Review external GitHub settings separately. Hand control
to Claude for independent review before deciding whether to merge.

## Follow-up to Claude's READY_WITH_MINOR_NOTES

The maintainer supplied Claude's report. Its independently reported validation,
including a fresh tutorial install and live credential-guard rejection, applies
to the working tree before this follow-up. It does not approve these new edits.

| Finding | Builder status | Action and evidence |
| --- | --- | --- |
| F-01 | FIXED | AGENTS.md and CLAUDE.md Product Definition now match Jacky and 小小工程師 / A Little Engineer’s Blog. The brand is a self-description, not a claim of zero experience; the existing rule against inventing beginner history remains. Architecture's Product Definition is synchronized too. The maintainer's existing rebrand request provides scope; no new product decision is inferred. |
| F-02 | FIXED (process documentation only) | Acknowledge that the identity/tagline changes in baseline commit 5d5ae10 were outside Claude's prior bilingual review. Verified that commit's src/config/site.ts diff. No baseline code is reverted and no earlier independent approval is claimed for it. AGENTS.md and CLAUDE.md now explicitly bind review outcomes to the inspected revision/files and require disclosure/re-review after later changes. This cannot retroactively review the earlier merge. |
| F-03 | FIXED | At widths up to 60rem, a TOC appears after metadata and before prose. The sidebar TOC is display:none. At wider widths the mobile TOC is display:none and the sidebar TOC remains visible. Both use the same filtered headings and static anchors; no JS, duplicate IDs or new dependencies. Both are excluded from Pagefind. |

Follow-up files only: `AGENTS.md`, `CLAUDE.md`, `docs/architecture.md`, this
handoff, `src/pages/[locale]/[section]/[slug].astro`, `src/styles/global.css`, and
`tests/browser/platform.spec.ts`. All earlier branch changes remain uncommitted;
review the full working tree and untracked files against `83ed1bf` as needed.

Follow-up validation actually rerun:

- Frozen offline install: PASS.
- `content:validate`: PASS, 0 errors and 8 existing warnings.
- `security:check`: PASS, no current-file findings.
- Unit tests: 65/65. Astro/TypeScript check: 63 files, 0/0/0.
- Build + `test:build`: PASS at `/` and `/Blog/`, both analytics disabled and
  synthetic `G-123456ABCD`. Disabled builds retain zero googletagmanager references.
- Browser suite: **13/13 at each base**. New no-JavaScript keyboard test covers
  both locales at 375, 960, 961 and 1280px, confirms one accessible TOC, verifies
  mobile placement above prose, and follows an anchor using Enter.
- Inspected `test-results/mobile-toc-zh-tw.png`; the TOC is before article text.
- `git diff --check`: PASS.

Dependencies, tutorial snippets, collection schemas and security implementation
did not change in this follow-up, so the audit, isolated tutorial install and
collection fixture matrix were not re-claimed as freshly executed here. Claude's
reported live settings/reference-file access limitations remain unchanged.

Stop here for Claude re-review. No commit, push, merge or deployment performed.
