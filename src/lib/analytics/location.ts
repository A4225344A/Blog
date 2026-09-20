const campaignParameters = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'] as const;

/** Public canonical path plus campaign identifiers; never copy the raw visitor URL. */
export function analyticsLocation(current: string, canonical: string): string {
  const location = new URL(canonical);
  location.search = '';
  location.hash = '';
  const incoming = new URL(current);
  if (incoming.origin !== location.origin) return location.href;
  for (const name of campaignParameters) {
    const values = incoming.searchParams.getAll(name);
    const value = values[0];
    // Campaign labels are bounded tokens, not search text, email addresses or URLs.
    // Reject ambiguous duplicates rather than forwarding an arbitrary value.
    if (values.length === 1 && value && /^[A-Za-z0-9][A-Za-z0-9._~-]{0,127}$/.test(value)) {
      location.searchParams.set(name, value);
    }
  }
  return location.href;
}
