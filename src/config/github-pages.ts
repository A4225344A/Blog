import { hosting } from './hosting';
export function githubPagesHosting(repository: string) {
  const match = /^([A-Za-z0-9-]+)\/([A-Za-z0-9_.-]+)$/.exec(repository);
  if (!match?.[1] || !match[2]) throw new Error('Expected owner/repository');
  const owner = match[1].toLowerCase();
  const name = match[2];
  return hosting(`https://${owner}.github.io`, name.toLowerCase() === `${owner}.github.io` ? '/' : `/${name}/`);
}
