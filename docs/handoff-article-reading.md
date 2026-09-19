# Article Reading Presentation

Status: **IMPLEMENTED_PENDING_INDEPENDENT_REVIEW**

## Summary / Files Changed

The detail route omits reading time, difficulty, Topic/Skill/prerequisite panels
and the duplicate series card. ArticleList omits difficulty on cards. Dates, TOC,
prose and previous/next series navigation remain. Updated the bilingual architecture
Article to describe search attributes and the hidden reading estimates. Architecture and browser
assertions document and verify this presentation change in both locales.

## Architecture / Content Graph

No entity, ID, route, relationship owner or validation severity changes. Reading
time remains a tested build-time utility. Topic and Skill terms are localized
into a data attribute indexed with Pagefind's data-pagefind-index-attrs, keeping
search independent of visible taxonomy panels. No new client code or dependency.

## Validation

Passed frozen install, content:validate (zero errors, eight existing warnings),
test (52 passed), check (zero diagnostics), build (45 pages, 26 search entries),
test:build and test:browser (seven passed), using `/Blog/`. Diff checks passed.
Existing search tests still require the canonical Article to match Skill queries.

## Limitations / Deferred Work / Reviewer Focus

Review the less cluttered reading page and keyboard-accessible adjacent links.
Confirm hidden taxonomy remains searchable and aggregation pages still work.
No deployment, V2/V3 or independent-review approval is included.
