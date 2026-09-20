# Security — Static Knowledge Platform

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
optional manual deployment approval
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

Where GitHub plan/repository settings permit:

- restrict deployment branch to `main`
- configure Required Reviewers if manual deployment approval is desired
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
