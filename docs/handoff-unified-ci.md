# Unified CI and Human-Gated Deployment

Status: **IMPLEMENTED_PENDING_INDEPENDENT_REVIEW**

## Summary

The requested change combines validation and deployment in `.github/workflows/ci.yml`.
PRs run validation only. Main pushes run validation, wait for the `github-pages`
environment's required reviewers, then deploy the same run's verified artifact.
The preceding V1 version received READY_WITH_MINOR_NOTES and was deployed; this
new change has not received independent review or hosted deployment verification.

## Files Changed

- `.github/workflows/ci.yml`: dependent deploy job, environment approval, same-run
  artifact download, post-approval SHA check and deployment concurrency.
- `.github/workflows/deploy.yml`: removed to eliminate the separate workflow_run flow.
- `tests/workflows.test.ts`: asserts a single workflow, main/success dependency,
  protected environment, permissions, artifact scope and concurrency. Executes the
  actual SHA guard with deterministic current/stale branch responses.
- `AGENTS.md`, `docs/architecture.md`, README and both implementation Articles:
  describe the single workflow and job-scoped deployment permissions.
- This handoff report.

## Architecture Decisions

- Keep workflow name `CI` and job ID `validate` to preserve the existing check name.
- `deploy` needs successful `validate` and only accepts a push to `main`.
- Required reviewers on the existing `github-pages` environment provide the human
  gate. YAML references that environment; repository settings enforce approval.
  GitHub documents this behavior in its
  [deployment controls](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments).
- Approval precedes every deploy step. The first step compares current main against
  this run's `context.sha`; a stale run fails rather than deploying older content.
- Download `verified-site` from the current run by default; no cross-run token or
  run ID is supplied. Deploy repackages that artifact without checkout or rebuilding.
- Only deploy receives Pages write/OIDC permissions; validation stays read-only.
- PR runs supersede older validation on the same PR. Main runs use unique workflow
  groups so newer validation is not blocked by an earlier approval wait. Deploy jobs
  share `github-pages` concurrency with cancellation disabled for active deployment.
- Content ownership, schema, routing and V1 scope are unchanged. No dependencies changed.

## Content Graph Validation

0 errors and 2 intentional `W_ARTICLE_NO_PROJECT` warnings for the Astro Article
translations. No graph validation was bypassed or weakened.

## Commands Executed / Tests / Build Result

All required commands ran using `corepack.cmd pnpm` and the existing workspace store.
Final build configuration: `SITE_URL=https://a4225344a.github.io`, `SITE_BASE=/Blog/`.

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit 0; lockfile unchanged |
| `pnpm run content:validate` | Exit 0; 0 errors, 2 expected warnings |
| `pnpm run test` | Exit 0; 50 passed |
| `pnpm run check` | Exit 0; 46 files, 0 errors/warnings/hints; TypeScript clean |
| `pnpm run build` | Exit 0; 35 pages, 16 indexed pages in 2 languages |
| `pnpm run test:build` | Exit 0; production-base output verified |
| `git diff --check`, `git diff`, `git status` | Inspected before handoff |

The initial install's optional pnpm update metadata request encountered a sandbox
network restriction; frozen installation itself completed. It was rerun with
network access and succeeded. The final full gate also completed successfully.
Browser and collection fixture suites were not rerun locally for this workflow-only
behavior change; both remain in the CI validation job at their existing positions.

## Known Limitations / Deferred Work

The maintainer confirmed environment reviewers were configured. Keep that protection
enabled; removing it would remove the human gate. Local tests cannot prove live
environment protection or GitHub scheduler behavior. After review and merge, confirm
that the main CI run displays a waiting deployment and use Review deployments →
github-pages → Approve and deploy. Do not approve an outdated run; use current main.
No merge or deployment is performed as part of this change. No V1.1/V2/V3 scope added.

## Reviewer Focus

Review job dependency and event guards, environment name, write-permission scope,
same-run artifact selection, stale-SHA rejection after approval, and concurrency.
Confirm the old workflow is removed and required-check naming remains compatible.
The Builder stops for independent review after committing this scoped change.
