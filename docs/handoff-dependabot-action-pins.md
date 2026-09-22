# Dependabot failures: diagnosis and Action pin synchronization

Status: IMPLEMENTED_PENDING_INDEPENDENT_REVIEW.
Branch: `fix/dependabot-action-pins`, based on the existing Dependabot PR #21
branch `dependabot/github_actions/actions-monthly-7e8a4d40b5`.
Review the combined diff against main `c7f8c89`, not only the follow-up edits.

## Observed failures (2026-09-23 Taiwan time)

1. [PR #21 CI](https://github.com/A4225344A/Blog/actions/runs/35777094614)
   failed during unit tests with `Unreviewed commit: actions/checkout@...`.
   Dependabot changed eight workflow pins without updating the separate approved
   manifest. This is the intended fail-closed gate, not a failing site build.
2. [npm Dependabot job](https://github.com/A4225344A/Blog/actions/runs/35776771461)
   failed while resolving updates to four unrelated dependencies. Each failure
   reports `ERR_PNPM_NO_MATURE_MATCHING_VERSION` for pinned `tsx@4.23.15`.
   The command explicitly sets `--config.minimumReleaseAge=4320` (72 hours).
   Registry publication time is `2026-09-20T07:22:17.792Z`; the age threshold ends
   at `2026-09-23T07:22:17.792Z`, or 15:22:17 Taiwan time. No age-policy bypass,
   exception, downgrade or additional dependency upgrade was introduced. Retry
   the update check after that time; success still needs live confirmation.
3. [Current main run](https://github.com/A4225344A/Blog/actions/runs/35776767132)
   passed validate and has a pending deploy job. The older
   [run 35728234968](https://github.com/A4225344A/Blog/actions/runs/35728234968)
   is waiting for `github-pages` approval (API returned one required reviewer).
   Deployment concurrency prevents the newer job from proceeding. The maintainer
   can cancel the obsolete waiting run, then review/approve the latest main
   deployment. Approving the old run would hit the stale-main guard.
   No deployment was approved or cancelled by Codex.

## Changes

Retained the SHA allowlist test and least-privilege/artifact deployment behavior.
Synchronized `.github/action-pins.json` and both published tutorial workflow
snippets with the eight existing Dependabot changes. Corrected the stale pnpm
version comment. Updated architecture/security documentation; added this handoff.
No new dependencies, content relationships, runtime code or analytics changes.

## Upstream verification

Each exact tag was read from the upstream GitHub API and peeled through tag
objects where necessary, then compared to the proposed 40-character workflow SHA.
Release notes and relevant README/action inputs were inspected.

| Action | Verified tag |
| --- | --- |
| actions/checkout | v7.0.1 |
| pnpm/action-setup | v6.1.0 |
| actions/setup-node | v7.0.0 |
| actions/upload-artifact | v7.0.1 |
| actions/download-artifact | v8.0.1 |
| actions/upload-pages-artifact | v5.0.0 |
| actions/deploy-pages | v5.0.1 |
| actions/github-script | v9.0.0 |

Node 24 Actions require a sufficiently new runner; the actual failure log shows
GitHub-hosted runner 2.337.0, above the documented 2.327.1 minimum. The checkout,
pnpm and Node setup steps already succeeded on that runner. The github-script
v9 ESM-related breaking change affects scripts requiring `@actions/github`; this
repository uses the injected `github`, `context` and `core` objects instead.
Upload-artifact still defaults to archived uploads. Pages upload/deploy are paired
with the proposed supported versions. Local tests cannot execute these hosted
artifact APIs, so independent review and GitHub CI are still required.

## Validation

Frozen offline install, content validation (0 errors/8 existing warnings),
security guard, 65/65 unit tests, Astro/TypeScript check (63 files, 0/0/0), and
build/test:build passed. Published tutorial examples passed in en/zh-TW at both
`/` and `/Blog/`. Final build/test:build runs cover both bases with GA4 disabled.
The checks retain the exact SHA gate and actual stale-SHA deployment guard.
No always-passing tests or exclusions were added.

Browser tests were not repeated: runtime code, dependencies and navigation did
not change. Neither a live npm retry after cooldown nor a successful full run
of the updated Actions on GitHub is claimed. No PR was merged or deployment made.

## Reviewer focus / next steps

Confirm upstream tag/SHA provenance, Action major-version compatibility, all
workflow/manifest/tutorial hashes and comments, and that permissions, artifact
identity, human approval and stale-SHA rejection remain intact. Review against
main and PR #21. After approval, the fix can be applied to PR #21 or a replacement
PR; this local branch alone does not repair the existing remote failed run.
Future Action update PRs still need explicit pin-manifest review by design.
