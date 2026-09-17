import type { Locale } from './index';
export const sections = ['start', 'learn', 'topics', 'blog', 'cases', 'projects', 'about'] as const;
export type Section = typeof sections[number];
const en = {
  start: 'Start here', learn: 'Learning paths', topics: 'Topics', blog: 'Articles', cases: 'Case studies', projects: 'Projects', about: 'About', search: 'Search',
  empty: 'Nothing published here yet.', latestCases: 'Latest cases', latestArticles: 'Latest articles', featuredTopics: 'Featured topics', featuredProject: 'Featured project',
  explore: 'Explore the knowledge', minutes: 'min read', prerequisites: 'Prerequisite skills', skills: 'Skills', recommended: 'Recommended reading',
  contents: 'On this page', audience: 'For', related: 'Related articles', paths: 'Related learning paths', repository: 'Repository',
  startIntro: 'Begin with a learning path, browse a topic, or use a case study when you are troubleshooting a specific problem.',
  aboutIntro: 'This is a Git-managed engineering knowledge platform. It connects concepts, practical guides, troubleshooting and project context so that learning can follow a clear sequence.',
  aboutEvidence: 'Articles explain concrete implementation decisions. Project maturity and operational claims are published only when supporting information is available.',
  experience: 'About / Experience', updated: 'Updated', published: 'Published', home: 'Home', all: 'View all',
};
const zh: typeof en = {
  start: '從這裡開始', learn: '學習路徑', topics: '主題', blog: '技術文章', cases: '排障案例', projects: '專案', about: '關於', search: '搜尋',
  empty: '此處尚無已發布內容。', latestCases: '最新案例', latestArticles: '最新文章', featuredTopics: '精選主題', featuredProject: '精選專案',
  explore: '開始探索工程知識', minutes: '分鐘閱讀', prerequisites: '先備技能', skills: '技能', recommended: '延伸閱讀',
  contents: '本頁目錄', audience: '適合對象', related: '相關文章', paths: '相關學習路徑', repository: '原始碼',
  startIntro: '從學習路徑循序建立基礎，依主題探索知識，或在遇到具體問題時查閱排障案例。',
  aboutIntro: '這是一個以 Git 管理的工程知識平台，串接概念、實作教學、排障經驗與專案背景，讓學習有清楚的順序。',
  aboutEvidence: '文章說明具體的實作決策。專案成熟度與維運成果只會在有實際資料佐證時發布。',
  experience: '關於／經歷', updated: '更新日期', published: '發布日期', home: '首頁', all: '查看全部',
};
export const ui: Record<Locale, typeof en> = { en, 'zh-TW': zh };
