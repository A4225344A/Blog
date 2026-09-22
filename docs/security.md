# Security — Static Knowledge Platform

## Public repository controls (2026-09-22)

- `pnpm run security:check` checks tracked and non-ignored working files for
  credential filenames, private-key markers and common GitHub/AWS/npm/Google
  credential shapes. It prints paths and categories, never matched values.
  This is an accidental-disclosure guard, not a complete secret scanner: it
  does not inspect Git history, binary contents or all credential formats.
- CI runs this guard and `pnpm audit --audit-level=high`; audit service failures
  also fail the step. A clean audit only covers advisories known at run time.
- Dependabot checks monthly for version updates, grouping npm dependencies into
  one PR and GitHub Actions into another. Each ecosystem allows at most one open
  version-update PR. Security updates have separate groups per ecosystem and do
  not wait for the monthly schedule; the version-PR limit does not limit security
  PRs. Security updates still require enabling the relevant GitHub setting.
  Existing unmerged update branches are not part of merged-branch cleanup.
  The configuration takes effect after it reaches the default branch.
  Updates need CI
  and human review; action hash changes must also update `.github/action-pins.json`
  and the published example workflow after upstream verification.
  A Dependabot Action PR that changes only the workflow will deliberately fail
  `Unreviewed commit` until the verified SHA manifest and examples are synchronized.
  Keep this gate. An npm update job can also temporarily fail with
  `ERR_PNPM_NO_MATURE_MATCHING_VERSION` when its release-age policy rejects an
  already pinned recent package. Inspect the package/version and expiry time,
  then retry after the waiting period rather than globally disabling that policy.
- `CODEOWNERS` identifies the maintainer for security-sensitive changes.
  It does not itself enforce approval, and a solo owner cannot approve their
  own PR as another reviewer. Configure rules according to available reviewers.
- `SECURITY.md` documents private reporting. No secrets belong in public issues.

The following **GitHub settings are not enabled by these files and have not
been verified during this change**: secret scanning, repository push protection,
Dependabot alerts/security updates, private vulnerability reporting, main branch
rules, fork workflow approval, and current `github-pages` protection rules.
In Settings, enable the security features available for this public repository;
require PRs and successful `validate` checks before merging to main, block force
push/deletion, review fork workflow runs, and restrict `github-pages` to main with
required human reviewers. Do not grant PR code production secrets or write tokens.

Reference: [GitHub's repository security quickstart](https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository).
The historical environment review recorded elsewhere is not a fresh settings audit.

The current UI uses local CSS, fonts provided by the operating system and local
assets; it adds no remote CDN, image service or third-party script. Approved GA4
behavior remains governed by `analytics-ga4.md`. CSP remains deferred pending a
dedicated policy/browser validation; no response headers are claimed for Pages.

## Purpose

This document defines the V1.1 security baseline for the Astro + GitHub Pages Knowledge Platform.

The current architecture is:

```text
Astro static build
↓
GitHub Actions
↓
GitHub Pages
↓
Browser
```

There is no application backend, database, authentication service, or server-side session.

---

# Security Goals

1. Keep secrets out of the repository.
2. Keep secrets out of browser-exposed build variables.
3. Minimize third-party script/network access.
4. Prevent content from becoming executable by accident.
5. Preserve dependency and CI integrity.
6. Keep deployment restricted to intended branches.
7. Fail safely when optional third-party services are unavailable.
8. Maintain a clear boundary between public configuration and secrets.

---

# Public Configuration vs Secrets

Public configuration may include:

```text
GA4 Measurement ID
public site URL
GitHub repository URL
public feature flags
```

Secrets include:

```text
API keys
private tokens
private credentials
cloud access keys
private service credentials
```

Never place secrets in:

```text
src/
public/
Markdown
MDX
PUBLIC_* environment variables
client-side JavaScript
committed .env files
```

---

# GA4 Measurement ID

A GA4 Measurement ID such as:

```text
G-XXXXXXXXXX
```

is a public identifier, not an authentication secret.

It may be stored in:

```text
PUBLIC_GA_MEASUREMENT_ID
```

This does NOT mean arbitrary API keys may be stored in `PUBLIC_*`.

---

# Environment Files

Recommended:

```text
.env
.env.local
```

must not be committed when they contain secrets.

Provide:

```text
.env.example
```

with placeholders only.

---

# GitHub Actions

Use GitHub Actions only for:

- install
- validation
- tests
- Astro check
- build
- GitHub Pages deployment

Use minimum required permissions.

Grant additional deployment permissions only to the deploy job when required.

Do not give all jobs broad write permissions.

---

# GitHub Pages Deployment

Recommended deployment flow:

```text
Pull Request
↓
CI
↓
Human review
↓
Merge main
↓
Build
↓
github-pages Environment
↓
required manual deployment approval
↓
Deploy
```

Restrict the `github-pages` environment to:

```text
main
```

Do not allow feature branches to deploy to production.

---

# Environment Protection

Required for this public repository:

- restrict deployment branch to `main`
- configure Required Reviewers for the `github-pages` environment
- consider Prevent Self-Review when another reviewer exists
- avoid unnecessary administrator bypass for stricter environments

For a solo-maintained repository, self-review restrictions may make deployment impossible without a second collaborator.

---

# Content Security Policy

GitHub Pages does not provide the same custom response-header control as a self-managed application server.

If CSP is implemented in page HTML, use:

```html
<meta http-equiv="Content-Security-Policy" content="...">
```

but document the limitations of meta-delivered CSP.

Do not assume all header-only CSP capabilities are available.

---

# CSP Baseline

A strict CSP should be introduced incrementally.

Conceptual starting point:

```text
default-src 'self'
img-src 'self' data: https:
font-src 'self' data:
style-src 'self' 'unsafe-inline'
script-src 'self'
connect-src 'self'
object-src 'none'
base-uri 'self'
```

Then explicitly add required third-party domains.

Do not copy this blindly into production without testing Astro-generated assets and integrations.

---

# GA4 and CSP

If GA4 is enabled, the CSP may need to allow Google Analytics resources.

Typical categories:

```text
script-src
→ Google tag host

connect-src
→ Google Analytics collection hosts
```

Keep the allowlist narrow.

Validate using browser DevTools.

Never solve CSP errors by replacing a narrow allowlist with `*`.

---

# Meta CSP Limitations

A CSP delivered via `<meta http-equiv>` cannot provide every feature available through HTTP response headers.

Examples of capabilities that may require response headers or have restrictions include:

- Report-Only policy
- reporting endpoints
- some navigation/frame protections

Do not claim GitHub Pages offers a complete enterprise security-header configuration when it does not.

---

# External Links

For links using:

```html
target="_blank"
```

use safe rel attributes where appropriate:

```html
rel="noopener noreferrer"
```

---

# Markdown / MDX Safety

Do not allow untrusted users to inject arbitrary HTML/JavaScript into the build pipeline.

If future external/community content is accepted:

- sanitize input
- restrict raw HTML
- define trusted MDX components
- never execute arbitrary code from user content

---

# Raw HTML Injection

Avoid raw HTML injection APIs.

If an implementation truly requires HTML injection:

1. document why
2. ensure source is trusted or sanitized
3. add tests
4. review before merge

---

# URL Safety

Validate externally configurable URLs.

Do not render arbitrary schemes such as:

```text
javascript:
```

Prefer expected `https:`/`http:` URLs where appropriate.

---

# Browser Storage

Future storage boundaries:

```text
localStorage
→ non-secret persistent state

sessionStorage
→ temporary secrets such as BYOK API keys

memory
→ transient runtime state
```

Never store secrets in localStorage by default.

---

# Dependency Security

Use:

```bash
pnpm install --frozen-lockfile
```

in CI.

Commit the lockfile.

Avoid unnecessary dependencies.

Before adding a package, verify:

- active maintenance
- package identity
- required permissions
- dependency weight
- security history where relevant

---

# Dependency Updates

After dependency updates run:

```bash
pnpm run test
pnpm run check
pnpm run build
```

---

# TypeScript

Use strict TypeScript.

Forbidden:

```ts
any
as any
```

Use:

- explicit interfaces
- unions
- `unknown`
- type narrowing
- schema validation where external input exists

---

# CI Quality Gate

Recommended order:

```text
install
↓
content validation
↓
tests
↓
Astro check
↓
build
```

Pull requests should not deploy production.

---

# Sensitive Logging

Do not log:

- secrets
- tokens
- API keys
- private content
- full imported browser-state payloads

---

# Analytics Privacy

GA4 integration must not intentionally send PII.

Do not use:

- email
- username
- private IDs
- API keys
- free-form sensitive text

as Analytics event parameters.

---

# Third-Party Scripts

Every third-party script increases security/privacy surface.

Before adding one, document:

```text
Why is it needed?
What domain loads it?
What data can it receive?
Can the site work without it?
What CSP change is required?
```

GA4 is currently the explicitly approved V1.1 third-party analytics integration.

---

# Failure Isolation

Optional integrations must fail independently.

```text
GA4 unavailable
↓
site works

third-party script blocked
↓
core rendering still works
```

---

# Security Review Checklist

```text
[ ] No secrets committed
[ ] No secrets in PUBLIC_* variables
[ ] .env patterns ignored
[ ] .env.example contains placeholders only
[ ] GitHub Actions permissions are minimal
[ ] PR does not deploy production
[ ] github-pages restricted to main
[ ] Deployment approval configured as intended
[ ] CSP reviewed
[ ] GA4 domains narrowly allowed
[ ] No arbitrary raw HTML execution
[ ] No unsafe URL schemes
[ ] Dependencies reviewed
[ ] Lockfile committed
[ ] Strict TypeScript
[ ] No any
[ ] No as any
[ ] Analytics sends no intentional PII
[ ] Optional integrations fail safely
```

---

# Definition of Done

V1.1 Security is complete when:

```text
[ ] secret/public-config boundary documented
[ ] .gitignore/environment handling verified
[ ] GitHub Actions permissions reviewed
[ ] deployment branch protection reviewed
[ ] CSP policy documented/tested
[ ] GA4 CSP compatibility verified
[ ] dependency policy documented
[ ] unsafe HTML/URL behavior reviewed
[ ] analytics privacy boundary documented
[ ] tests/check/build pass
```

---

# Known Limitations

GitHub Pages is intentionally a static hosting target.

Therefore:

- arbitrary server response headers are not assumed
- no server-side secret storage exists
- no server-side authentication exists
- browser-visible configuration must be considered public
- security relies on static build integrity, browser policy, repository controls, and minimal third-party exposure
