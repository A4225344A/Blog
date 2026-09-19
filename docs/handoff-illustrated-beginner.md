# Illustrated Beginner Lessons — Builder Handoff

Status: **IMPLEMENTED_PENDING_INDEPENDENT_REVIEW**

## Summary

Readers previously had commands to follow but too little explanation of how the
pieces fit together. All three lessons now include a bilingual architecture
figure, tool/file responsibilities and guided observations of cause and effect.
The course still starts from an empty folder.

Branch: `content/illustrated-beginner-guide`, created from the latest fetched main.

## Files Changed

- Six `src/content/articles/{en,zh-tw}/beginner-*.md` files: three diagrams per
  language, explanatory tables and observations separating title/h1, editing from
  installing, file paths from URLs, and dev from build/preview.
- `src/styles/global.css`: responsive diagram boxes, arrows and existing theme
  colors. Text remains selectable and diagrams need no JavaScript.
- `tests/browser/platform.spec.ts`: all six diagrams tested at 375px dark and
  1280px light with JavaScript disabled, with captions and overflow checks.
- `docs/architecture.md`, README and this report: implementation and handoff.

## Architecture Decisions

Diagrams are native HTML figures with captions, ordered steps and surrounding
text explanations. CSS arranges the flow horizontally on desktop and vertically
on mobile. No rendering library, remote image, hydration or additional content
entity is needed. Figures are part of canonical Article bodies and static search.
Relationship ownership, routes and deployment approval remain unchanged.

The guided observations are prose exercises, not a quiz feature: there is no
grading, stored state or progress tracking. Existing lesson commands are retained.

## Content Graph Validation

Zero errors; eight intentional Article-to-Project membership warnings remain.
No graph validation rules were changed.

## Commands Executed and Tests

Required gate: `pnpm install --frozen-lockfile`, `pnpm run content:validate`,
`pnpm run test`, `pnpm run check`, `pnpm run build`, using `corepack.cmd pnpm`.
Additional checks: `pnpm run test:build`, `pnpm run test:browser`, `git diff --check`,
`git status` and `git diff`. All required commands passed: 52 core tests, zero
Astro/TypeScript errors, and seven browser tests at each of `/` and `/Blog/`.
Generated-output checks passed at both bases. Desktop/mobile screenshots were
visually inspected for text wrapping, contrast and arrow direction.

The 52 deterministic core tests are unchanged. Browser coverage adds a seventh
test for diagram rendering without JavaScript; existing reader journeys, search,
theme and localization checks continue to run.

## Build Result

The successful build produced 45 pages and 26 search entries across two
languages. The text-only changes do not add routes or dependencies.

## Known Limitations and Deferred Work

No first-time-reader usability study or full accessibility audit was performed.
The lessons remain Windows-focused and stop at local construction/build; public
publishing remains future content. No V2/V3 feature or production deployment is
included. Local checks do not establish independent approval.

## Reviewer Focus

Check the diagrams against actual Astro behavior, localized conceptual parity,
mobile reading order, and whether the observations help readers choose a command
based on its purpose. Confirm ownership and the manual deployment gate remain.

The Builder hands off to Claude; the human maintainer retains merge authority.
