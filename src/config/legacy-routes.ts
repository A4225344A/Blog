/** Retired public URLs. IDs remain stable; these pages explain the editorial change. */
interface LegacyContentRoute { from: string; to: string; continuation?: string }
export const legacyContentRoutes: readonly LegacyContentRoute[] = [
  { from: 'blog/beginner-tools', to: 'blog/why-astro' },
  { from: 'blog/beginner-local-website', to: 'blog/astro-project-setup' },
  { from: 'blog/beginner-first-change', to: 'blog/astro-content-and-layout' },
  { from: 'blog/astro-content-and-deployment', to: 'blog/astro-content-and-layout', continuation: 'blog/astro-github-pages' },
  { from: 'learn/first-website', to: 'learn/knowledge-platform' },
] as const;
