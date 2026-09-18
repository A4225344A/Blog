# Engineering Knowledge Platform

> Engineering knowledge, built from real systems.
>
> 從實作、排障到架構，建立可循序學習的工程知識。

**Status: IMPLEMENTED_PENDING_INDEPENDENT_REVIEW**

V1 Phase 1–7 received Claude's READY_WITH_MINOR_NOTES and was deployed. The new
unified CI/deployment change awaits independent review. Local validation is Builder
evidence; the human remains the final merge authority.

## What is implemented

- Astro 5 static output, strict TypeScript, Markdown and pnpm.
- Five content entities: Article, Topic, Skill, LearningPath and Project.
- Raw-file schema/graph validation, reverse indexes and build-time reading time.
- Traditional Chinese and English Home, Start, Learn, Topics, Blog, Cases,
  Projects, About and Search pages, with detail views and canonical Articles.
- Accessible wrapping navigation, language switching, static TOC and three-state theme.
- Local Pagefind search, canonical/hreflang/Open Graph/JSON-LD, sitemap, RSS and robots.
- One CI workflow with read-only validation and a deployment job using the same
  run's main CI artifact after human approval, with deployment-only Pages/OIDC permissions.
- The complete bilingual Astro implementation article and its LearningPath.
- AI SRE Platform as a **lab** Project, using maintainer-supplied metadata. It is
  for learning, demonstration and experimentation, not production deployment.

No backend, database, authentication, accounts, AI functionality, progress tracking,
quiz or interactive Skill Graph is implemented. The AI SRE lab is content about
an external project, not an AI feature in this website. Cases currently have no
published entries; About does not invent employment history or operational metrics.

## Local development

Use Node.js 22.12+ and pnpm 10.32.1, pinned in `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm run content:validate
pnpm run test
pnpm run check
pnpm run build
pnpm run test:build
pnpm preview
```

Use `pnpm dev` while editing. Search requires the generated Pagefind index, so use
build and preview to test it. On Windows, `corepack.cmd pnpm` works when pnpm is
not on PATH. `scripts/validate-all.ps1` runs the five required commands above plus
`test:build`. Collection integration and browser tests require the separate commands below.

Additional validation:

```bash
pnpm run test:collections
# This temporarily writes exclusive fixtures and removes them afterward.
pnpm run build
pnpm run test:build
```

Stop concurrent content editing during the collection fixture test. It covers
actual Markdown rendering, case canonical routing, and unpublished exclusion.

Browser tests require Chromium. On PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.playwright'
corepack.cmd pnpm exec playwright install chromium
corepack.cmd pnpm run test:browser
```

On Linux/macOS, use `PLAYWRIGHT_BROWSERS_PATH=.playwright pnpm exec playwright install chromium`
then `pnpm run test:browser`. CI installs browser system dependencies too.

## Content and ownership

```text
src/content/
  articles/{zh-tw,en}/       Markdown + YAML frontmatter
  topics/                   One JSON object per file
  skills/                   One JSON object per file
  learning-paths/            One JSON object per file
  projects/                 One JSON object per file
```

`src/content/schemas.ts` is authoritative for metadata types. `id` is stable entity
identity, `translationKey` groups Article translations, and `slug` is presentation.
Never use a slug as the persistent reference key.

- LearningPath owns Article membership and order.
- Project owns related Articles, featured Skills and related LearningPaths.
- Article owns Topic, Skill, prerequisite Skill and recommended Article references.
- Reverse relationships are derived during the build.

Article metadata rejects `order`, `level`, `learningPaths`, `projects` and
`estimatedMinutes`. Reading time is derived; only a positive integer
`estimatedMinutesOverride` is allowed as an exception. Markdown is supported;
MDX is not installed. Source files remain trusted Git-managed author content.

Only published Articles become public pages. Troubleshooting and case-study use
`/cases/:slug/`; other types use `/blog/:slug/`. Both include the locale and base.
Aggregators link to those canonical URLs. Shared entity Chinese labels are in
`src/i18n/content.ts`, namespaced by collection and owning path for sections.
Absent translations fall back to source text with `W_MISSING_ENTITY_TRANSLATION`;
stale translation keys fail with `E_UNKNOWN_ENTITY_TRANSLATION`. The normal CLI and
Astro preflight check these editorial mappings; custom CLI roots validate their own
content without applying this repository's translation catalog.

Content validation fails for duplicate entity IDs, required missing references,
forbidden fields, published Article route collisions (`E_ROUTE_COLLISION`), stale
translation keys and schema/read errors. The six V1 graph warning categories and
the editorial translation warning remain nonblocking.
The two initial Article-to-Project membership warnings are intentional: the Astro
implementation article is not part of the AI SRE lab. Advanced graph checks remain
deferred. See [architecture](docs/architecture.md) for exact diagnostic IDs.

## GitHub Pages

`SITE_URL` is an HTTP(S) origin; `SITE_BASE` is a separate path. Defaults are
`http://localhost:4321` and `/`. For the current repository:

```powershell
$env:SITE_URL = 'https://a4225344a.github.io'
$env:SITE_BASE = '/Blog/'
corepack.cmd pnpm run build
corepack.cmd pnpm run test:build
corepack.cmd pnpm run test:browser
```

A user-site repository such as `username/username.github.io` uses base `/`.
Other repositories use `/repository-name/`. CI derives both settings from
`GITHUB_REPOSITORY`. Production URLs, internal links, assets, search results and
feeds use these values. A repository-level robots.txt is generated under the base;
crawlers that only consult the origin-root robots.txt remain subject to that host's
root configuration, which this repository cannot replace. The project-base file
does not satisfy crawler configuration or sitemap discovery. Before production,
configure the owner-site repository's origin-root `https://a4225344a.github.io/robots.txt`
with the intended crawler policy and `Sitemap: https://a4225344a.github.io/Blog/sitemap.xml`.
Search Console submission can aid sitemap discovery; it cannot set crawler policy.
`test:build` verifies generated text only, not this external configuration.

## CI, deployment and human gate

CI runs frozen install → content validation → tests → Astro/TypeScript checks →
collection integration test → root/production builds and browser/output checks.
PRs never deploy. Only a main push uploads `verified-site`.

`.github/workflows/ci.yml` keeps both jobs in one run:

```text
PR:         validate → deploy skipped
main push:  validate → human approval → deploy
```

The `deploy` job requires successful `validate` and references the `github-pages`
environment. With Required reviewers enabled, it waits for a human to select
**Review deployments → github-pages → Approve and deploy** in that CI run.
Keep this environment protection enabled: the YAML alone cannot create reviewers.
After approval, the job rejects stale SHAs, downloads that run's `verified-site`
artifact, and deploys without a source checkout or rebuild. Only `deploy` receives
Pages write/OIDC rights. The old separate deployment workflow is removed.
The workflow name `CI` and job ID `validate` stay unchanged for branch protections.

Before the first push to main, the maintainer must complete these hard preconditions:

1. Enable GitHub Actions as the repository's Pages source.
2. Require CI and human-approved PRs before merging to main.
3. Configure required human reviewers for the `github-pages` environment.
4. Obtain independent review and resolve its findings.
5. Configure the origin-root robots policy and sitemap directive described above.
6. Choose the code/content license before production publication.

These settings are not automatically configured by repository files. The previous
version has deployed successfully; this workflow replacement needs fresh hosted
verification, including observing the deployment wait for approval.

## Review and known limits

Read `AGENTS.md`, `CLAUDE.md`, `docs/architecture.md` and the latest V1 handoff.
The current change report is [Unified CI and Human-Gated Deployment](docs/handoff-unified-ci.md).
The earlier [V1 Claude Review Fixes](docs/handoff-review-fixes.md) records the previous findings.
The earlier Phase 1–3 handoff is historical. Review should focus on ownership,
publication filtering, base URLs, search/translation, theme accessibility and the
CI artifact trust boundary. Chromium tests do not replace a full accessibility or
cross-browser audit. Pagefind does not stem `zh-tw` terms; Chinese query behavior
is tested. Reading time is an estimate. No V2/V3 features were added.

An explicit license should be chosen before public reuse of the code/content.
