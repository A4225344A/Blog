# Monthly Dependabot and merged-branch cleanup

Status: IMPLEMENTED_PENDING_INDEPENDENT_REVIEW.
Branch: `chore/monthly-dependabot`, based on main `def18be`.

## Summary and files

The maintainer requested monthly Dependabot checks, grouped updates and cleanup
of merged old branches. `.github/dependabot.yml` now schedules monthly version
updates, with one wildcard version-update group and one open version PR per
ecosystem (npm and GitHub Actions). Separate wildcard security-update groups
preserve prompt security fixes when enabled in GitHub; these do not wait for the
monthly schedule or share the version-update PR limit. `docs/security.md`
documents the behavior. No dependency versions, runtime code or CI permissions
changed. The settings take effect only after merging to the default branch.

Reference: [GitHub grouping options](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/optimizing-pr-creation-version-updates).

## Branch cleanup completed

Fetched origin with pruning. All 13 branches below were confirmed ancestors of
`origin/main` before deletion. Remote deletion used an atomic push with explicit
SHA leases for every target, protecting against concurrent remote changes. Local
counterparts were removed with `git branch -d`; all commits remain in main history.

| Deleted branch | Tip |
| --- | --- |
| ci/unified-pages-workflow | 71b922b |
| content/beginner-learning-path | 6ae3a3c |
| content/editorial-astro-series | c656c9f |
| content/fullstack-engineering-blog | cb95bfe |
| content/illustrated-beginner-guide | 46907b4 |
| feat/indigo-blog-security | def18be |
| feat/v1.1-analytics-security | b1d167f |
| fix/bilingual-editorial | 5d5ae10 |
| fix/content-consistency | 2789edd |
| fix/from-zero-tutorial | 75be053 |
| ui/personal-blog-layout | fc6bc64 |
| ui/simplify-article-reading | fa4f344 |
| v1/knowledge-platform | 0ef8f6e |

Main and the five unmerged Dependabot branches were preserved. No existing update
PR was merged or closed. The local main branch was not reset or moved.

## Validation

- Frozen offline install: PASS.
- Content validation: 0 errors, 8 existing W_ARTICLE_NO_PROJECT warnings.
- Public-file security guard: PASS.
- Unit tests: 65/65. Astro/TypeScript: 63 files, 0 errors/warnings/hints.
- Build: PASS, Pagefind 16 pages across two locales.
- YAML parsing with duplicate-key rejection plus assertions for ecosystems,
  monthly intervals, PR limits and separate version/security groups: PASS.
- git diff/check: PASS.

No new tests were added for this configuration-only change. Browser tests and
dependency audit were not repeated; their inputs and behavior are unchanged.
The content graph and static architecture are unaffected.

## Limitations and reviewer focus

Review the three-file diff against `def18be`. Confirm that version/security PRs
remain distinct and actions still need reviewed hash-manifest/tutorial updates.
Dependabot execution and regrouping of existing PRs cannot be proved locally;
five existing unmerged update branches remain. No automatic merge is configured.
No merge or deployment of this configuration was performed. Hand off to Claude.
