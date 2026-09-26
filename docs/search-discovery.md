# Search discovery setup

The static build includes author identity, bilingual canonical/hreflang links,
article dates in the sitemap, and an indexed About page. These make content
discoverable; they do not guarantee indexing, ranking, or inclusion in AI answers.
An empty `site:` search is not a complete inventory of an engine's index. Use the
verified site's URL inspection reports to establish indexing status.

The home pages and language chooser share WebSite structured data with bilingual
names and the confirmed publisher. Google's site-name feature supports domains
and subdomains, not a separate name for a subdirectory such as `/Blog/`. This
markup is descriptive and does not promise that Google will display the requested
name. See [Google's site-name documentation](https://developers.google.com/search/docs/appearance/site-names).

## Google Search Console

1. Add the URL-prefix property `https://a4225344a.github.io/Blog/`.
2. Download the exact HTML verification file supplied by Google. Keep its filename
   and contents unchanged in `public/`. Do not invent a verification token.
3. After normal review and deployment, verify the file is accessible under `/Blog/`
   and complete verification in Search Console. Retain the file afterward.
4. Submit `https://a4225344a.github.io/Blog/sitemap.xml`.
5. Inspect `/Blog/zh-tw/about/`, `/Blog/en/about/`, and a published article. Request
   indexing if appropriate and inspect reported crawl/indexing reasons later.

## Bing Webmaster Tools

Import the verified property from Google Search Console or use Bing's own
verification method. Place an issued verification file under `public/` only if
that method supports the selected URL-prefix property. Submit the same sitemap
and inspect the About/article URLs. Verification credentials are not available
in this repository; neither service has been submitted by this implementation.

## Origin-root robots.txt

`/Blog/robots.txt` is a reference, not the crawler policy for the origin.
Configure the owner site repository `A4225344A.github.io` to serve the following
at `https://a4225344a.github.io/robots.txt`. Inspect any existing owner-site setup
before changing it; creating files in this Blog repository cannot publish that URL.

```text
User-agent: *
Allow: /

Sitemap: https://a4225344a.github.io/Blog/sitemap.xml
```

This wildcard includes search crawlers. A missing robots.txt alone does not prove
that indexing is blocked. Inspect the actual HTTP response and any existing rules.
No owner-site repository has been created or deployed as part of this change.

## Public identity and links

Use the confirmed public name Jacky（謝宇逸） on the GitHub profile where desired.
Point the Blog repository's Website field to `https://a4225344a.github.io/Blog/`.
A profile README can link directly to the bilingual author pages:

```markdown
[Jacky（謝宇逸）的部落格](https://a4225344a.github.io/Blog/zh-tw/about/)
[About Jacky (謝宇逸)](https://a4225344a.github.io/Blog/en/about/)
```

Account profile changes and posting links on external services require maintainer
action. No unconfirmed romanized name, job history or social profile is added.
Historical Git authors remain unchanged; rewriting history is a separate operation.

## References

- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google robots.txt guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Bing site verification](https://www2.bing.com/webmasters/help/add-and-verify-site-12184f8b)
- [Bing sitemap submission](https://www2.bing.com/webmasters/help/sitemaps-3b5cf6ed)
- [RSS author names without email addresses](https://www.rssboard.org/rss-profile)
