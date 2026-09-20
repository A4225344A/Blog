# V1.1 re-review handoff

Status: Claude reported `READY_WITH_MINOR_NOTES` in the supplied re-review.
The R-01 documentation response below awaits reviewer acknowledgement. This is not
merge or deployment approval. No commit or deployment made.

## R-01 response — 2026-09-21

Builder disposition: `FIXED`. The traceability gap was valid: the reviewer did not
have the maintainer's conversation instruction. That instruction already exists;
no new maintainer decision is required. In the message beginning
"Address Claude findings F-01 through F-06", preceding the supplied re-review,
the maintainer wrote:

> Maintainer decision for F-03:
>
> Keep acquisition attribution.

The same message explicitly required preserving browser referrer behavior,
stripping arbitrary query parameters and fragments, allowing only utm_source,
utm_medium, utm_campaign, utm_term, utm_content and gclid, and documenting the policy
in docs/analytics-ga4.md. This is a transcription of the actual user instruction
in this conversation, not an inferred approval or a new reviewer verdict.

Only docs/analytics-ga4.md and this handoff changed in the R-01 response. The
specification now states requirements directly, without the transient finding ID
or "The maintainer decided" framing. Runtime behavior and architecture are unchanged.
Claude should reconcile this recorded instruction with the supplied conversation
and acknowledge R-01; final merge authority remains with the maintainer.

The specification and docs/security.md remain untracked pending the implementation
commit; no Git history or hosted approval is claimed. Include both in that commit
so future changes have a versioned baseline. External GA4/GitHub settings remain
unverified as listed below. No new product work is deferred by this document edit.

R-01 validation rerun: `corepack.cmd pnpm install --frozen-lockfile --store-dir
.pnpm-store`, `run content:validate`, `run test`, `run check`, `run build`, and
`run test:build` all passed. Content graph: 0 errors, 8 existing warnings; 59 tests
passed; Astro checked 56 files without diagnostics and TypeScript passed. Build:
45 pages, 26 Pagefind-indexed pages, analytics disabled at
https://example.github.io/ (SITE_BASE=/). This is the current dist configuration.
`git status --short`, `git diff` and `git diff --check` were run; no whitespace
errors. Browser tests were not rerun for this documentation-only response; the
implementation-pass evidence below and supplied Claude results remain historical.

## Summary

Addressed F-01 through F-06 against the actual working tree. The maintainer now
explicitly requires acquisition attribution. Removed referrer suppression and
added a six-parameter campaign filter. Guarded Analytics at its BaseLayout call
site and retained compile-time removal plus conditional output assertions.
Existing F-01/F-02 fixes were preserved and regression-tested. No custom events added.

## Finding Disposition

| Finding | State | Evidence / disposition |
| --- | --- | --- |
| F-01 | FIXED | Both CI browser builds use G-123456ABCD; only the final non-browser artifact build receives the production variable. A workflow regression test enforces the order and synthetic IDs. Browser collection rejects non-synthetic IDs and environment/artifact mismatches before navigation. Operations documentation matches. |
| F-02 | FIXED | buildMeasurementId rejects configured invalid IDs in rendering and test:build; unset/empty disables analytics. Runtime measurementId and bootstrap remain fail-open. Actual invalid-ID build and verification fail with the expected diagnostic. |
| F-03 | FIXED | page_referrer is omitted, preserving browser behavior. page_location retains only utm_source, utm_medium, utm_campaign, utm_term, utm_content and gclid on the canonical path; all other query parameters and fragments are removed. Policy and value restrictions documented in analytics-ga4.md. |
| F-04 | FIXED | BaseLayout validates the ID and conditionally renders Analytics. The component retains a compile-time guard for Astro's hoisted script. Disabled verification now scans every dist file for googletagmanager, in addition to retaining conditional per-page configuration/loader assertions. Both hosting modes pass. |
| F-05 | REJECTED_WITH_REASON | No implementation change required per maintainer and reviewer: optional adapter is staged, no UI emits custom events, no exercised custom-event integration is claimed. The observation is acknowledged; adding events is intentionally out of scope. |
| F-06 | FIXED | architecture.md points to v1.1-operations.md for operational setup and analytics-ga4.md for the specification. |

## Files Changed

Prior implementation pass (the R-01 documentation-only scope is listed above):

- `src/lib/analytics/location.ts`: pure campaign URL filter.
- `src/lib/analytics/bootstrap.ts`: filtered page_location; omit page_referrer.
- `src/layouts/BaseLayout.astro`, `src/components/Analytics.astro`: validate once
  at the call site, conditional component, pass the validated public ID as a prop.
- `scripts/verify-build.ts`: recursive disabled-output reference check; existing
  conditional configuration/loader assertions retained.
- `tests/analytics.test.ts`: attribution filtering and malformed-ID regressions.
- `tests/browser/analytics.spec.ts`: all six campaign parameters, excluded private
  query values/fragments, browser referrer and unchanged canonical SEO URL.
- `tests/workflows.test.ts`: synthetic browser builds precede the final artifact.
- `docs/analytics-ga4.md`, `docs/architecture.md`, `docs/v1.1-operations.md`,
  this report: policy, operational instructions and current validation evidence.

Preserved pre-existing V1.1 changes in `.github/workflows/ci.yml`, `.gitignore`,
`.env.example`, `src/content/schemas.ts`, other analytics modules and security docs.

## Architecture Decisions

The site remains static Astro MPA with five content entities and Pagefind.
No dependencies, deployment permissions, entity ownership, backend or UI events added.
Canonical/SEO URLs stay query-free; only analytics receives campaign parameters.

Campaign values are single, nonempty 1–128-character ASCII tokens, starting with
an alphanumeric and continuing with alphanumerics or `.`, `_`, `~`, `-`. Duplicate,
oversized, whitespace, email and URL-shaped values are dropped rather than truncated.
This restricts free-form text while preserving campaign labels and click IDs.
No search box, form, storage value or event payload feeds attribution. Publishers
must use non-sensitive campaign labels: syntax cannot detect sensitive meaning
hidden in an otherwise valid identifier. Browser referrers follow normal browser
policy and are not sanitized by this adapter, as explicitly requested.

Google's configuration reference confirms the default document.referrer and
page_location override; linked in the specification. Tests exercise locally queued
configuration with Google blocked, not live GA4 attribution processing.

## Commands Executed / Content Graph / Tests

Executed via `corepack.cmd pnpm` with the existing workspace `.corepack` cache:

- `install --frozen-lockfile --store-dir .pnpm-store`: passed, lockfile unchanged.
- `run content:validate`: 0 errors, 8 existing W_ARTICLE_NO_PROJECT warnings.
- `run test`: 59 passed, 0 failed.
- `run check`: 56 files, 0 Astro errors/warnings/hints; TypeScript passed.
- `run build` and `run test:build`: passed at SITE_URL=https://example.github.io
  for SITE_BASE=/ and SITE_BASE=/Blog/, each with disabled and synthetic ID modes.
- Negative `run build` and `run test:build` with ID `invalid`: nonzero exits with
  Invalid PUBLIC_GA_MEASUREMENT_ID, as expected. Temporary logs removed.
- `run test:browser` with G-123456ABCD: root 10 passed (12.5s); /Blog/ 10 passed
  (12.4s), zero skips. Both ran with approved escalation because of the previously
  established sandbox cleanup issue. Google requests were intercepted.
- Negative `run test:browser --list`: non-synthetic G-0000000000 fixture rejected;
  unset ID with a configured artifact also rejected before browser navigation.
  Neither negative check used a real production ID. Temporary log removed.
- `git status --short`, `git diff`, `git diff --check`: executed; no whitespace errors.

## Build Result

All four successful builds produced 45 pages, Pagefind indexed 26 pages in two
languages. Disabled output contains zero googletagmanager references across all
dist files. Enabled output has exactly one configuration and guarded loader per
page. Canonical, hreflang, assets, sitemap, RSS and base paths verified in both modes.
At the end of that implementation pass, dist was the synthetic /Blog/ fixture,
not a production deployment artifact.

## Known Limitations / Deferred Work

Live GA4 property/stream settings, Realtime delivery, consent approach and GitHub
environment protections remain externally unverified. Disable Enhanced Measurement
before activation. No consent banner, CSP or new custom events were introduced.
Token syntax cannot prove the absence of personal data in campaign labels, and
preserving browser referrer deliberately preserves its normal data boundary.
Disabled builds report an empty analytics-chunk warning; Pagefind retains its
zh-tw stemming note. Git reports pre-existing global-ignore access/line-ending notices.

## Reviewer Focus

Independently verify the six-parameter policy and value restrictions, absence of
page_referrer/ignore_referrer overrides, untouched canonical SEO metadata, call-site
guard plus disabled output, invalid-ID build failure, and synthetic-versus-production
artifact separation. Confirm no new events or unrelated implementation scope.

The supplied Claude re-review confirmed the implementation and accepted F-05;
its remaining R-01 traceability note is addressed above. Stop for Claude's
acknowledgement of this documentation response and the human merge gate.
