# Phase 1–3 Builder Handoff

## Summary

Implemented Knowledge Platform V1 Phase 1–3 only. AGENTS.md and architecture.md
were read completely before edits. This is a Builder handoff for Claude's
independent review; it is not a merge recommendation or final review.

## Files Changed

- Foundation: `.gitignore`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`,
  `astro.config.ts`, `src/config/hosting.ts`.
- Content model: `src/content/schemas.ts`, `src/content.config.ts`, and `.gitkeep`
  files in the five content collection directories (Articles have both locales).
- Graph/utilities: `src/utils/{content-source,graph,build-graph,reading-time,routes,theme}.ts`.
- UI foundation: `src/i18n/index.ts`, `src/components/{ThemeInit,ThemeSelect}.astro`,
  `src/layouts/BaseLayout.astro`, `src/styles/global.css`,
  `src/pages/index.astro`, `src/pages/[locale]/index.astro`.
- Validation: `scripts/{validate-content,verify-build,verify-collections}.ts`,
  `tests/{fixtures,graph.test,utilities.test,content-cli.test}.ts`.
- Documentation: `README.md`, `docs/architecture.md`, this report.
- Governance instructions and existing PR template are unchanged.

## Architecture Decisions

- Static Astro 5, strict TypeScript, pnpm lockfile; no server adapter or React.
- Shared strict Zod schemas define exactly five core entities. IDs are separate
  from translation grouping and explicit routing slugs.
- LearningPath owns ordered Article membership; Project owns project membership;
  Articles own their Topic/Skill/prerequisite/recommendation references.
- Reverse indexes and mixed Han/English reading time are computed during build.
- Explicit `SITE_URL` origin and normalized `SITE_BASE`; local default is localhost.
- Three minimal holding pages exercise layout, i18n, theme and build graph without
  implementing Phase 4 content views.
- Production collections remain empty rather than inventing content or Project
  maturity. Tests provide synthetic examples of all entities.

## Content Graph Validation

- Duplicate IDs checked per entity type before Astro loader ingestion.
- All eight required missing-reference cases fail; all five forbidden Article
  fields fail. Schema/read failures also return nonzero status.
- All six specified warning categories have stable warning IDs and are nonblocking.
- Deferred graph checks remain deferred. Architecture documentation lists exact IDs
  and the reference-validation boundary.
- Repository content validation: 0 errors, 0 warnings (empty collections).

## Commands Executed

Windows does not expose pnpm directly on PATH, so commands were executed with
`corepack.cmd pnpm`, using repository-local `COREPACK_HOME`. Dependency download
needed sandbox network escalation. No global package-manager installation was made.

- `pnpm install` — generated the lockfile and installed dependencies.
- `pnpm install --frozen-lockfile` — passed.
- `pnpm run content:validate` — passed.
- `pnpm run test` — passed.
- `pnpm run check` — passed (Astro check plus TypeScript no-emit check).
- `pnpm run build` — passed.
- `pnpm run test:collections` — passed with populated versions of all five entities;
  temporary content files were removed.
- Builds and `pnpm run test:build` — passed for `/` and `/repository-name/`, with
  `SITE_URL=https://example.github.io` for the repository-path build.
- `git status`, `git diff`, and `git diff --check` — inspected; edits remain uncommitted.
- Source scan found no forbidden TypeScript escape types.

The first build attempt exposed a missing nested pnpm executable under Corepack.
The build script now invokes the validation entrypoint directly before Astro;
subsequent builds passed.

## Tests

32 deterministic tests pass: duplicate IDs across five entities, eight missing
reference cases, forbidden fields, warning policy, nonpublished membership policy,
reverse indexes/order preservation, deferred graph cases, schema failures, CLI
exit codes and YAML errors, reading time, locale mapping, canonical routes,
translation fallbacks, base/asset/absolute URLs, hosting validation and theme logic.
Additional integration checks exercise populated Astro loaders and verify built
HTML language links, script/CSS paths and the existence of their output targets.

## Build Result

Static build succeeds with three pages: `/`, `/zh-tw/`, `/en/`.
Both user-site and repository-site base modes pass generated-link/asset checks.
The final build output uses the default root base.

## Known Limitations

- Empty collections produce expected Astro loader/query warnings; these are not
  graph validation errors. No Articles or Project claims are published.
- UI theme behavior is covered by pure logic and generated markup checks, not a
  real browser interaction/accessibility audit. Claude should check keyboard use,
  storage-disabled behavior, OS theme changes and initial paint in a browser.
- Markdown is supported; MDX integration is not installed. Production origin/base
  must be configured before future deployment.
- Reading time is a documented heuristic, not full Markdown/MDX semantic parsing.
- Git reported inability to read the user's global ignore file and normal Windows
  line-ending notices. Repository status/diff commands still completed.

## Deferred Work

Phase 4 content views and homepage composition; Phase 5 search, SEO, sitemap, RSS,
robots.txt; Phase 6 CI and deployment; Phase 7 the first complete bilingual Article.
AI SRE Platform remains the intended featured Project pending factual metadata.
No V1.1/V2/V3 features were added.

## Reviewer Focus

1. Verify raw-file validation cannot lose duplicate IDs before loader ingestion.
2. Confirm schema/relationship ownership and the minimal V1 validation boundary.
3. Verify stable identity, translation fallbacks and canonical/base-path helpers.
4. Check theme persistence, system updates and accessibility in a real browser.
5. Confirm scope remains Phase 1–3, with later-phase requirements clearly deferred.

Builder editing stops at handoff. Claude reviews independently; the human remains
the final merge authority.
