# Pull Request

## Summary

<!-- What changed and why? -->

## Change Type

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Content / Article
- [ ] Content Graph
- [ ] SEO
- [ ] Accessibility
- [ ] CI/CD
- [ ] Dependency update
- [ ] Other

## Scope

<!-- Main files/pages/entities/components affected. -->

## Architecture Impact

- [ ] No architecture change
- [ ] Architecture changed and `docs/architecture.md` was updated

If architecture changed:

```text
Decision:
Reason:
Alternatives considered:
Consequences:
```

## AI Workflow

Builder:
- [ ] Codex
- [ ] Human
- [ ] Other

Independent Reviewer:
- [ ] Claude Code
- [ ] Human
- [ ] Other

Review status:
- [ ] Not reviewed
- [ ] BLOCK
- [ ] CHANGES_REQUIRED
- [ ] READY_WITH_MINOR_NOTES
- [ ] READY

## Review Findings Resolution

| Finding ID | Severity | Decision | Resolution |
|---|---|---|---|
| | | | |

Allowed decisions:
- `FIXED`
- `PARTIALLY_FIXED`
- `REJECTED_WITH_REASON`
- `NEEDS_HUMAN_DECISION`

## Quality Gate

Mark only checks that actually passed:

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm run content:validate`
- [ ] `pnpm run test`
- [ ] `pnpm run check`
- [ ] `pnpm run build`

## Content Model

If content/schema changed:

- [ ] Article IDs unique
- [ ] Topic IDs unique
- [ ] Skill IDs unique
- [ ] LearningPath IDs unique
- [ ] Project IDs unique
- [ ] Article Topic references exist
- [ ] Article Skill references exist
- [ ] prerequisiteSkills exist
- [ ] recommendedArticles exist
- [ ] LearningPath Article references exist
- [ ] Project references exist
- [ ] Article does NOT contain `learningPaths`
- [ ] Article does NOT contain `projects`
- [ ] Article does NOT contain `order`
- [ ] Article does NOT contain `level`
- [ ] Article does NOT require manual `estimatedMinutes`

## Ownership

- [ ] LearningPath owns ordered Article membership
- [ ] Project owns project Article membership
- [ ] Article owns Topic/Skill/prerequisite/recommendation references
- [ ] Reverse indexes are derived, not duplicated

## Canonical Routing

- [ ] troubleshooting/case-study route under `/cases/`
- [ ] tutorial/concept/reference/opinion route under `/blog/`
- [ ] no Article duplicated fully under both routes
- [ ] aggregator pages link to canonical Article URLs

## i18n

- [ ] zh-TW routes work
- [ ] English routes work
- [ ] language switching preserves equivalent page
- [ ] `lang` correct
- [ ] `hreflang` correct
- [ ] translationKey mapping correct

## Theme

- [ ] Light works
- [ ] Dark works
- [ ] System works
- [ ] preference persists
- [ ] system mode follows OS changes
- [ ] no obvious wrong-theme flash

## Pages

- [ ] Home
- [ ] Start
- [ ] Learn
- [ ] Topics
- [ ] Blog
- [ ] Cases
- [ ] Projects
- [ ] About
- [ ] Search

## SEO

- [ ] title
- [ ] description
- [ ] canonical
- [ ] Open Graph
- [ ] hreflang
- [ ] JSON-LD where appropriate
- [ ] Sitemap
- [ ] RSS
- [ ] robots.txt
- [ ] drafts excluded

## GitHub Pages

- [ ] `site` correct
- [ ] `base` correct
- [ ] internal links work under repo base path
- [ ] assets work under repo base path
- [ ] canonical URLs correct
- [ ] Sitemap URLs correct
- [ ] RSS URLs correct
- [ ] robots.txt Sitemap URL correct

## Accessibility

- [ ] semantic HTML
- [ ] heading hierarchy
- [ ] appropriate h1
- [ ] skip link
- [ ] keyboard navigation
- [ ] visible focus
- [ ] alt text
- [ ] accessible language control
- [ ] accessible theme control
- [ ] reduced motion where applicable

## Security

- [ ] no credentials
- [ ] no API tokens
- [ ] no private keys
- [ ] Actions use least privilege
- [ ] no unsafe untrusted HTML rendering
- [ ] no unnecessary third-party scripts

## Performance

- [ ] static-first preserved
- [ ] no unnecessary hydration
- [ ] no unnecessary framework dependency
- [ ] no runtime Content Graph API
- [ ] images reasonably optimized

## Scope Control

V1 must not add without explicit approval:
- [ ] AI recommendation
- [ ] AI chat
- [ ] interactive Skill Graph
- [ ] quiz
- [ ] learning dashboard
- [ ] cloud-synced progress
- [ ] authentication
- [ ] database
- [ ] backend API

If any above is checked, explain the approved architecture change.

## Screenshots

### Light

<!-- attach -->

### Dark

<!-- attach -->

### Mobile

<!-- attach -->

## Human Gate

- [ ] I understand this PR.
- [ ] I reviewed relevant UI/UX.
- [ ] Technical claims are reasonable.
- [ ] Claude findings are resolved or explicitly accepted.
- [ ] No unresolved P0 remains.
- [ ] No unresolved P1 remains unless explicitly accepted.
- [ ] I approve production deployment.

Human notes:

```text

```

## Merge Decision

- [ ] Approved
- [ ] Changes requested
- [ ] Hold

> AI `READY` is evidence, not merge authority. Final merge authority belongs to the human maintainer.
