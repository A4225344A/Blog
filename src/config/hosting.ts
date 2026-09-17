export function normalizeBase(input = '/'): string {
  const path = input.replace(/^\/+|\/+$/g, '');
  if (!path) return '/';
  if (!path.split('/').every(segment => /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(segment)))
    throw new Error('SITE_BASE must be a local path, such as /repository-name/');
  return `/${path}/`;
}
export function hosting(site = 'http://localhost:4321', base = '/') {
  const url = new URL(site);
  if (!['https:', 'http:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash || url.username || url.password)
    throw new Error('SITE_URL must be an HTTP(S) origin; set the repository path with SITE_BASE');
  return { site: url.origin, base: normalizeBase(base) };
}
