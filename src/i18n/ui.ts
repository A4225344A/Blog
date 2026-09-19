import type { Locale } from './index';
import type { Article, Project } from '../content/schemas';
export const difficultyLabels: Record<Locale, Record<Article['difficulty'], string>> = {
  en: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
  'zh-TW': { beginner: '初階', intermediate: '中階', advanced: '進階' },
};
export const maturityLabels: Record<Locale, Record<Project['maturity'], string>> = {
  en: { lab: 'Lab', prototype: 'Prototype', production: 'Production', experiment: 'Experiment' },
  'zh-TW': { lab: '實驗室（lab）', prototype: '原型', production: '正式環境', experiment: '實驗' },
};
export const sections = ['start', 'learn', 'topics', 'blog', 'cases', 'projects', 'about'] as const;
export type Section = typeof sections[number];
export const sectionDescriptions: Record<Locale, Record<Section, string>> = {
  en: {
    start: 'Meet the author, explore personal projects, or read how this blog is built.',
    learn: 'Read connected article series about implementation and architecture decisions.',
    topics: 'Browse engineering knowledge by Cloud Native, Platform Engineering, SRE, AI and Backend topics.',
    blog: 'Read engineering tutorials, concepts, references and implementation articles.',
    cases: 'Explore published troubleshooting investigations and engineering case studies.',
    projects: 'Explore engineering projects, their maturity, repositories and related knowledge.',
    about: 'Meet the full-stack engineer behind the projects and technical writing.',
  },
  'zh-TW': {
    start: '認識作者、探索個人專案，或閱讀這個部落格的建置過程。',
    learn: '依系列閱讀實作過程、架構設計與技術取捨。',
    topics: '依雲原生、平台工程、SRE、AI 與後端工程主題探索知識。',
    blog: '閱讀工程教學、概念解析、技術參考與實作文章。',
    cases: '探索已發布的排障過程與工程案例研究。',
    projects: '了解工程專案的成熟度、原始碼與相關知識。',
    about: '認識分享個人專案與技術文章的全端工程師。',
  },
};
const en = {
  start: 'About this blog', learn: 'Article series', topics: 'Topics', blog: 'Articles', cases: 'Case studies', projects: 'Projects', about: 'About', search: 'Search',
  empty: 'Nothing published here yet.', latestCases: 'Latest cases', latestArticles: 'Latest articles', featuredTopics: 'Featured topics', featuredProject: 'Featured project',
  explore: 'Explore projects and articles', minutes: 'min read', prerequisites: 'Prerequisite skills', skills: 'Skills', recommended: 'Recommended reading',
  maturity: 'Maturity', contents: 'On this page', audience: 'For', related: 'Related articles', paths: 'Related series', repository: 'Repository',
  startIntro: 'I am a full-stack engineer. This blog records personal projects, implementation choices and what I learn while building them.',
  blogEntry: 'How this blog is built', exploreEntry: 'Explore projects and articles',
  blogIntro: 'Read the Astro series for the requirements, implementation and delivery decisions behind a technical blog.',
  exploreIntro: 'Browse project context and maturity, technical articles, or the deeper content architecture series.',
  previousLesson: 'Previous article', nextLesson: 'Next article', pathNavigation: 'Continue this series', pathOverview: 'Back to the series',
  aboutIntro: 'I am a full-stack engineer sharing personal projects and technical writing. This blog documents implementation, troubleshooting and architecture decisions, with diagrams that make the reasoning easier to follow.',
  aboutEvidence: 'Articles explain concrete implementation decisions. Project maturity and operational claims are published only when supporting information is available.',
  experience: 'About the author', updated: 'Updated', published: 'Published', home: 'Home', all: 'View all',
};
const zh: typeof en = {
  start: '認識部落格', learn: '文章系列', topics: '主題', blog: '技術文章', cases: '排障案例', projects: '專案', about: '關於', search: '搜尋',
  empty: '此處尚無已發布內容。', latestCases: '最新案例', latestArticles: '最新文章', featuredTopics: '精選主題', featuredProject: '精選專案',
  explore: '探索專案與文章', minutes: '分鐘閱讀', prerequisites: '先備技能', skills: '技能', recommended: '延伸閱讀',
  maturity: '成熟度', contents: '本頁目錄', audience: '適合對象', related: '相關文章', paths: '相關系列', repository: '原始碼',
  startIntro: '我是全端工程師，這裡記錄我的個人專案、實作選擇，以及建置過程中的理解與取捨。',
  blogEntry: '這個部落格如何建立', exploreEntry: '探索專案與文章',
  blogIntro: '從 Astro 系列了解技術部落格的需求、建置方法與交付選擇。',
  exploreIntro: '查看專案背景與成熟度、技術文章，或深入閱讀內容架構系列。',
  previousLesson: '上一篇', nextLesson: '下一篇', pathNavigation: '繼續閱讀系列', pathOverview: '回到文章系列',
  aboutIntro: '我是全端工程師，在這裡分享個人專案與技術文章，記錄實作、排障與架構選擇，也用圖解說明背後的理由。',
  aboutEvidence: '文章說明具體的實作決策。專案成熟度與維運成果只會在有實際資料佐證時發布。',
  experience: '關於作者', updated: '更新日期', published: '發布日期', home: '首頁', all: '查看全部',
};
export const ui: Record<Locale, typeof en> = { en, 'zh-TW': zh };
