export const locales = ['zh-TW', 'en'] as const;
export type Locale = typeof locales[number];
export const localePrefix: Record<Locale, string> = { 'zh-TW': 'zh-tw', en: 'en' };
export function localeFromPrefix(prefix: string): Locale | undefined {
  return locales.find(locale => localePrefix[locale] === prefix);
}
export const messages = {
  'zh-TW': { title: '工程知識平台', tagline: '從實作、排障到架構，建立可循序學習的工程知識。',
    pending: '內容準備中。', skip: '跳至主要內容', language: '語言', theme: '外觀', light: '淺色', dark: '深色', system: '跟隨系統', home: '首頁' },
  en: { title: 'Engineering Knowledge Platform', tagline: 'Engineering knowledge, built from real systems.',
    pending: 'Content is being prepared.', skip: 'Skip to content', language: 'Language', theme: 'Appearance', light: 'Light', dark: 'Dark', system: 'System', home: 'Home' },
} satisfies Record<Locale, Record<string, string>>;
