# Analytics — Google Analytics 4 (GA4)

## Purpose

This document defines the V1.1 analytics integration for the Engineering Knowledge Platform.

The site remains:

- Astro static-first
- GitHub Pages hosted
- backend-free
- database-free
- account-free

GA4 is an optional analytics layer. It must not become a dependency for core rendering, routing, search, content validation, or learning functionality.

---

# Scope

V1.1 analytics includes:

- one GA4 web data stream
- Google tag (`gtag.js`)
- page-view measurement
- optional custom events
- privacy-conscious loading policy
- environment-aware enable/disable behavior
- CSP compatibility
- production verification

V1.1 analytics does NOT include:

- Google Ads
- remarketing
- ad personalization
- user accounts
- server-side tagging
- Google Tag Manager unless separately approved
- personally identifiable information (PII) collection

---

# GA4 Property and Web Data Stream

Create one GA4 property for the public Knowledge Platform.

Create one Web data stream for the deployed website URL.

The Measurement ID has the form:

```text
G-XXXXXXXXXX
```

The Measurement ID is a public site identifier used by the Google tag.

It is NOT an API secret and does not need to be stored as a repository secret.

Do not confuse the GA4 Measurement ID with private credentials or API secrets.

---

# Recommended Configuration

Use an environment variable for configuration consistency:

```text
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Because Astro `PUBLIC_` variables are exposed to browser code, only public identifiers may be stored there.

Never place secret API credentials in `PUBLIC_*` variables.

---

# Astro Integration

The Google tag should be included in the shared site layout so it is present on every production page.

Google's current installation guidance places the Google tag immediately after the opening `<head>` element.

Conceptual implementation:

```astro
---
const measurementId = import.meta.env.PUBLIC_GA_MEASUREMENT_ID;
const analyticsEnabled =
  import.meta.env.PROD &&
  typeof measurementId === "string" &&
  measurementId.length > 0;
---

{analyticsEnabled && (
  <>
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
    ></script>

    <script is:inline define:vars={{ measurementId }}>
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag("js", new Date());
      gtag("config", measurementId);
    </script>
  </>
)}
```

The exact implementation may differ, but requirements remain:

- only load in intended environments
- never duplicate the tag
- use one central integration point
- keep the Measurement ID configurable
- do not scatter GA4 snippets across page components

---

# Production-Only Default

Recommended default:

```text
development
→ GA4 disabled

preview/local build
→ GA4 disabled unless explicitly enabled

production GitHub Pages
→ GA4 enabled when Measurement ID exists
```

This prevents local development traffic from contaminating production analytics.

---

# Page Views

Because the current site is Astro MPA/static-first, normal navigation causes full document loads.

GA4 page-view collection can therefore rely on standard page loads.

If the project later introduces Astro View Transitions/client-side navigation, page-view behavior must be revalidated.

---

# Custom Events

Keep V1.1 custom events minimal.

Good candidates:

```text
search_used
language_changed
theme_changed
learning_path_opened
project_opened
```

Every event should answer a real product question.

---

# Event Naming

Use lowercase snake_case.

Example:

```ts
type AnalyticsEventName =
  | "search_used"
  | "language_changed"
  | "theme_changed"
  | "learning_path_opened"
  | "project_opened";
```

Do not use `any`.

---

# Analytics Adapter

Do not call `window.gtag()` directly throughout the application.

Create one adapter, for example:

```text
src/lib/analytics/
├─ analytics.ts
└─ events.ts
```

Conceptual API:

```ts
interface AnalyticsEvent {
  name: AnalyticsEventName;
  params?: Record<string, string | number | boolean>;
}

function trackEvent(event: AnalyticsEvent): void;
```

The adapter should:

- no-op safely when GA4 is disabled
- avoid throwing if `gtag` is unavailable
- centralize event names
- centralize payload filtering

---

# Privacy Rules

## V1.1 acquisition policy

Preserve acquisition attribution under these requirements:

- Leave `page_referrer` unset so Google's normal browser referrer behavior applies.
- Build `page_location` from the public canonical origin/path, retaining only
  `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, and `gclid`
  from the same-origin visitor URL. Strip every other query parameter and fragments.
- Keep canonical/SEO metadata query-free; attribution affects analytics only.
- Disable Google signals and ad-personalization signals in the tag configuration.

Campaign values must be non-sensitive campaign identifiers, not site search terms
or user-entered text. The implementation accepts one value per exact lowercase
parameter name, 1–128 ASCII characters, starting with an alphanumeric character
and continuing with alphanumerics or `.`, `_`, `~`, `-`. Empty, duplicate, oversized,
whitespace-containing, email and URL-shaped values are dropped, not truncated.
Use labels such as `astro-guide` rather than free-form text. No form, search box,
storage value or custom-event payload is read into attribution. Parameters such
as `q`, `query`, `search`, `email`, `token`, `utm_id`, and `fbclid` are excluded.

This syntax filter cannot identify sensitive meaning disguised as a valid campaign
label. Campaign publishers must never encode personal data or secrets in approved
parameters. Browser referrers remain governed by the browser/source referrer policy;
they are not rewritten or sanitized by this adapter. Live GA4 processing is outside
the local stubbed-test boundary. See Google's
[configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
for the default `document.referrer` behavior and `page_location` override.

The stream's Enhanced Measurement settings must be disabled before activation;
that external setting is not enforced by this repository. See
`docs/v1.1-operations.md` for the operational runbook.

## Prohibited data

Never send:

- email address
- full name
- phone number
- passwords
- API keys
- private repository data
- free-form content that may contain sensitive data
- raw imported LearningState
- personally identifiable information

---

# Consent

If the site implements a consent banner, the analytics integration must respect the chosen consent strategy.

Google currently documents Basic and Advanced Consent Mode.

For the simplest privacy-preserving approach:

```text
No consent
→ do not load Google tag

Consent granted
→ load/enable analytics
```

Do not claim that Consent Mode itself is a consent banner.

A consent mechanism must exist before consent state can be passed to Google.

Local legal requirements vary by jurisdiction. This document defines technical behavior, not legal advice.

---

# CSP Requirements

If a Content Security Policy is enabled, GA4 requires compatible script/network sources.

Typical required sources may include:

```text
script-src
→ https://www.googletagmanager.com

connect-src
→ https://www.google-analytics.com
→ https://region1.google-analytics.com
```

Exact endpoints can change. Validate against browser DevTools and current Google documentation before tightening production CSP.

Do not use an unrestricted policy such as `*` merely to make analytics work.

---

# GitHub Pages

GA4 works with static GitHub Pages because the browser loads the Google tag directly.

No backend is required.

No GitHub Actions secret is required for the GA4 Measurement ID.

If the value is configured through build-time environment variables, treat it as public configuration.

---

# Verification

After deployment:

1. open the production site
2. use browser DevTools Network panel
3. confirm the Google tag loads once
4. confirm analytics requests are emitted
5. use GA4 Realtime report
6. verify the correct hostname/path is shown
7. confirm local development does not pollute production data

Google notes that initial data can take time to appear; Realtime is the preferred immediate verification path.

---

# Failure Behavior

GA4 must fail open with respect to site functionality.

```text
GA4 blocked
GA4 unavailable
ad blocker active
CSP blocks analytics
network failure

        ↓

site still works normally
```

Analytics must never block:

- page rendering
- search
- navigation
- i18n
- theme switching
- content loading

---

# Testing

Test at least:

```text
[ ] Production build with Measurement ID
[ ] Production build without Measurement ID
[ ] Development mode does not send production analytics
[ ] Google tag included only once
[ ] trackEvent safely no-ops when disabled
[ ] Custom event names are typed
[ ] No PII is included in test payloads
[ ] CSP still permits intended GA4 traffic
```

---

# Definition of Done

V1.1 Analytics is complete when:

```text
[ ] GA4 property exists
[ ] Web data stream exists
[ ] Measurement ID configured
[ ] Shared Astro integration implemented
[ ] Production-only behavior verified
[ ] Realtime page view verified
[ ] Analytics adapter implemented
[ ] Privacy rules documented
[ ] CSP reviewed
[ ] Site remains functional if GA4 is blocked
[ ] Build/check/test pass
```

---

# References

Use current official Google documentation before implementation:

- Google Analytics: Set up Analytics for a website
- Google Analytics: Measurement ID
- Google Analytics: Google tag installation
- Google Analytics: Consent Mode
