// A small accidental-disclosure guard, not a replacement for GitHub secret scanning.
export function publicFileRisks(path: string, text: string): string[] {
  const risks: string[] = [];
  const name = path.replaceAll('\\', '/').split('/').at(-1) ?? '';
  if ((/^\.env(?:\.|$)/i.test(name) && name !== '.env.example') ||
      /^(?:id_rsa|id_ed25519|credentials)$/i.test(name) || /\.(?:p12|pfx|key)$/i.test(name)) {
    risks.push('credential-file');
  }
  const patterns: [string, RegExp][] = [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/],
    ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{80,})\b/],
    ['aws-access-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
    ['npm-token', /\bnpm_[A-Za-z0-9]{36,}\b/],
    ['google-api-key', /\bAIza[A-Za-z0-9_-]{35}\b/],
  ];
  for (const [label, pattern] of patterns) if (pattern.test(text)) risks.push(label);
  return risks;
}
