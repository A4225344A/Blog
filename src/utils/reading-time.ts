/** Build-time estimate: 400 Han characters/minute plus 200 other words/minute. */
export function readingMinutes(body: string, override?: number): number {
  if (override !== undefined) {
    if (!Number.isInteger(override) || override <= 0) throw new Error('Invalid reading time override');
    return override;
  }
  const text = body.replace(/```[\s\S]*?```/g, ' ').replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ');
  const han = text.match(/\p{Script=Han}/gu)?.length ?? 0;
  const words = text.replace(/\p{Script=Han}/gu, ' ').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(han / 400 + words / 200));
}
