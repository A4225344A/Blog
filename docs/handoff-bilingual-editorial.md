# Bilingual editorial corrections — 2026-09-21

Status: IMPLEMENTED_PENDING_INDEPENDENT_REVIEW for the subsequent author-profile
update below. The preceding bilingual corrections received Claude READY on 2026-09-22.

Claude's first review returned CHANGES_REQUIRED with two findings. Both were
confirmed FIXED in the subsequent re-review, including source, rendered HTML
and browser assertions. Claude reports a clean full validation rerun, 63/63 unit
tests and 12/12 browser tests at each base, with no regressions. This records
the independent review report, not a new builder run or authorization to merge.
See the 2026-09-22 response below for the follow-up fixes and validation scope.

Branch: `fix/bilingual-editorial`, created from fetched `origin/main` at `2b98a15`.
That matches the maintainer's review baseline. No commit, push, merge or deployment.

## Summary and findings

Both language versions were edited together. The tutorial now includes executable
type checking, and public presentation more clearly distinguishes the current
Astro series from the author's learning interests.

| Review item | Status | Change |
| --- | --- | --- |
| English 1: example domains become external links | FIXED | Both example URLs are inline code; generated HTML and browser assertions prohibit links to name.github.io. |
| English 2: missing code formatting | FIXED | Format field names, routes, file paths, warnings, commands and metadata markers in the fourth article. |
| English 3: Home/site root ambiguity | FIXED | Explicit `/Blog/` home page, with the configured-base exception. |
| English 4: topic capitalization | FIXED | Website Engineering matches the other topic names. |
| English 5–8: awkward first-article wording | FIXED | Remove repeated straightforward, clarify the blog referent, simplify WordPress comparison and delete the unrelated lab section in both languages. |
| English 9–10: pnpm repetition and vague next | FIXED | Explain Windows wrapper purpose once; specify the link is added in the next article. |
| English 11: repeated origin explanation | FIXED | Keep origin/base explanation in the deployment-path section, with a separate settings-cleanup section. |
| English 12: abstract GA4/SHA prose | FIXED | Remove the unrelated GA4 paragraph from both articles; explain SHA in a separate sentence. Analytics implementation/policy unchanged. |
| Bilingual synchronization | FIXED | Publishing-flow caption, cleanup heading, blank line before headings, three-column identity table and inline-code formatting aligned. |
| Move article four's publication date to match reading order | REJECTED_WITH_REASON | Publication chronology is historical metadata: the walkthrough predates the tutorials and was subsequently placed fourth. Preserve publishedAt and RSS dates; explain this in both introductions and distinguish latest publication order from series order on home. |
| Backend topic classification | FIXED | Walkthrough now belongs to website and platform engineering; empty Backend topic remains accessible but unindexed under existing rules. |
| Reading-guide recommendation | FIXED | Specifically direct readers seeking the content model to article four. |
| Inconsistent topic order | FIXED | Shared topic selection applies configured order, with stable ID fallback for additional topics. Unit/browser checks cover ordering. |
| About promises unpublished troubleshooting | FIXED | Intro describes the current Astro series; cloud native is labeled as a learning direction, preserving the maintainer's stated interests. |
| Version pin not explained | FIXED | Explain Astro 5.18.2 as the verified example version, not a claim to be latest. |
| Missing type-checking instructions | FIXED | Both manifests include check, @astrojs/check 0.9.6 and TypeScript 5.9.3. Readers run check after stopping dev; example CI runs check before build. Snippet verifier also executes check. |
| Setup working directory and Git timing | FIXED | Git installation moved into tool setup; mkdir runs in a chosen parent directory such as Documents. |
| Pages environment, reviewers and login | FIXED | Open an existing environment or create it; explain public-repository reviewers and solo-maintainer self-review setting; mention possible first-push browser authentication. Official sources linked in articles. |
| Unexplained concurrency | FIXED | Explain PR cancellation, distinct main runs and serialized deploy jobs in both languages. |
| Windows-only commands | FIXED | Explicit Windows PowerShell scope and guidance on adapting .cmd commands and shell environment syntax. |
| Repeated disclaimers/lab separation | FIXED | Remove first-article lab section, repeated environment-name warnings, defensive search/project wording and fourth-article GA4 digression. Keep actionable reviewer setup and conditional approval wording. |
| Chinese hero repetition, punctuation, frozen-install order | FIXED | Reduce repeated notes wording; localized full-width labels; explain first install before CI frozen installation. |

## Files and architecture

- Eight Markdown articles; Website Engineering topic display name.
- About/Author components, shared UI copy, home and detail template labels.
- Catalog topic ordering; stable IDs, slugs, five-entity schema and relationship
  ownership are unchanged. No new backend, infrastructure or application dependency.
- Snippet verifier, build assertions, editorial unit and browser tests.
- Architecture document records tutorial check tools, ordering and date policy.

The sample project's extra devDependencies appear only in the tutorial, not in
this repository's package manifest or lockfile; the tools already exist locally.

## Validation

Commands executed via `corepack.cmd pnpm`, using workspace-local COREPACK_HOME:

| Command / configuration | Result |
| --- | --- |
| install --frozen-lockfile --offline --store-dir .pnpm-store | PASS; lockfile unchanged |
| content:validate | PASS; 0 errors, 8 existing W_ARTICLE_NO_PROJECT warnings |
| test | PASS; 63/63 |
| check | PASS; 59 files, 0 errors/warnings/hints |
| test:article-example | PASS; checks both assembled samples and builds each at `/` and `/Blog/` |
| test:collections at `/Blog/` | PASS |
| build + test:build, GA4 disabled | PASS at `/` and `/Blog/`; zero googletagmanager references |
| build + test:build, synthetic GA4 | PASS at `/` and `/Blog/` |
| test:browser, synthetic GA4 | PASS; 12/12 at each base |

Only synthetic `G-123456ABCD` was used in browser builds. No production ID.
Regular builds still produce 51 HTML pages, including migration notices. Pagefind
now indexes 16 pages because neither locale has articles classified as Backend
Engineering. Empty topic routes remain reachable but excluded from indexing.
Existing Pagefind zh-tw stemming and disabled-analytics empty-chunk notices remain.

## Limits and reviewer focus

The extracted samples use this workspace's installed tool versions; no fresh
isolated dependency installation or hosted example workflow was run in this pass.
GitHub settings were not changed or newly audited. The instructions explain
macOS/Linux adaptation, but those shells were not executed here.

Review bilingual editorial alignment, example URLs in generated HTML, the new
type-check instructions/workflow, topic ordering and the historical-date decision.
The maintainer's publication history is preserved rather than replaced with
invented dates. The subsequent independent Claude re-review returned READY for
this bilingual-editorial branch, separately from the earlier content-consistency review.

## Claude review response — 2026-09-22

| Finding | Builder status | Correction |
| --- | --- | --- |
| F-01 (P2) | FIXED | The Chinese deployment verification now explicitly says the article's Home link returns to `/Blog/` (or the configured base) home page, matching English. |
| F-02 (P3) | FIXED | Series navigation aria-label, overview, previous and next links all use the existing locale-aware separator: full-width Chinese colon, English colon plus space. |

Files changed in this follow-up: the Chinese deployment article, the detail-page
template, the existing browser series-navigation test and this handoff. The
browser test now checks both language versions of the Home clarification, the
navigation accessible name and overview label, and follows previous/next labels
with the correct locale-specific punctuation.

Claude reports that its preceding review independently installed and ran the
extracted tutorial in isolation, including type checking and both base builds.
That is attributed reviewer evidence; the builder did not repeat that isolated
installation in this narrow follow-up. Tutorial code and dependencies did not
change. The original validation table above records the initial implementation;
the follow-up reruns are recorded below.

| Follow-up validation | Result |
| --- | --- |
| content:validate | PASS; 0 errors, 8 existing warnings |
| test | PASS; 63/63 |
| check | PASS; 59 files, 0 errors/warnings/hints |
| build + test:build at `/` and `/Blog/` | PASS, synthetic GA4 only |
| test:browser at `/` and `/Blog/` | PASS; 12/12 each, including both findings |
| git diff --check | PASS |

Browser builds used `G-123456ABCD`, never the production Measurement ID.
Disabled-analytics, collection-fixture and isolated sample checks were not repeated
in this follow-up because their code paths and tutorial snippets were unchanged.

Independent re-review confirmed F-01 and F-02 FIXED and returned READY. Claude
also reran article-example, collection and disabled-GA4 checks in addition to the
builder's narrow follow-up checks above. Hosted Actions, live environment rules,
Unix shell adaptation and interactive editor behavior remain unverified in this
review. No commit, push or merge has been performed for this branch.

## Subsequent maintainer request — author profile

The maintainer requested Jacky as the display name, the exact Chinese tagline
「小小工程師探索雲原生世界」, and no industry history. Updated the shared Author
card/configuration, bilingual About and homepage author introduction. The GitHub
URL still points to A4225344A; this does not rename the external GitHub account.

The [reference About page](https://www.hwchiu.com/about) was read for its writing
motivation/personal-introduction structure. This revision places the blog's writing
motivation before About me; no credentials, career history or achievements from
the reference author were copied. Existing C#/Angular/React and learning interests
remain. Architecture documentation and the existing avatar-name assertion match.

This author-profile change is subsequent to Claude's READY and requires fresh
review. No commit, push or deployment has been performed.

Profile-update validation: content validation during build passed with the same
8 warnings; unit tests 63/63; Astro/TypeScript 0 errors/warnings/hints; build and
test:build passed at `/Blog/`; browser tests 12/12 with synthetic G-123456ABCD.
The mobile Chinese About screenshot was inspected. No industry-history terms
remain in `src`. Root-base and article-example checks were not repeated for this
copy-only update; their earlier results above are historical, not new runs.
