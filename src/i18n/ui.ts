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
    start: 'Choose a starting point in the Astro series and check its prerequisites.',
    learn: 'Read connected article series about implementation and architecture decisions.',
    topics: 'Browse topics that have published articles in this language.',
    blog: 'Read engineering tutorials, concepts, references and implementation articles.',
    cases: 'Explore published troubleshooting investigations and engineering case studies.',
    projects: 'Explore engineering projects, their maturity, repositories and related knowledge.',
    about: 'Meet the full-stack engineer behind the projects and technical writing.',
  },
  'zh-TW': {
    start: '依照需求選擇 Astro 系列的起點，並確認閱讀前需要的基礎。',
    learn: '依系列閱讀實作過程、架構設計與技術取捨。',
    topics: '依主題瀏覽目前已有繁體中文文章的內容。',
    blog: '閱讀工程教學、概念解析、技術參考與實作文章。',
    cases: '探索已發布的排障過程與工程案例研究。',
    projects: '了解工程專案的成熟度、原始碼與相關知識。',
    about: '認識分享個人專案與技術文章的全端工程師。',
  },
};
const en = {
  start: 'Reading guide', learn: 'Article series', topics: 'Topics', blog: 'Articles', cases: 'Case studies', projects: 'Projects', about: 'About', search: 'Search',
  heroTitle: 'Building a blog, one decision at a time', heroLabel: 'Engineering notes', projectLabel: 'Project lab',
  empty: 'Nothing published here yet.', latestCases: 'Latest cases', latestArticles: 'Latest articles', featuredTopics: 'Featured topics', featuredProject: 'Featured project',
  explore: 'Explore projects and articles', minutes: 'min read', prerequisites: 'Prerequisite skills', skills: 'Skills', recommended: 'Recommended reading',
  maturity: 'Maturity', contents: 'On this page', audience: 'For', related: 'Related articles', paths: 'Related series', repository: 'Repository',
  startIntro: 'The published articles currently focus on building this Astro blog. Start with the series if you know basic HTML and programming; installation steps come before the hands-on work.',
  blogEntry: 'How this blog is built', exploreEntry: 'Explore projects and articles',
  blogIntro: 'Read the Astro series for the requirements, implementation and delivery decisions behind a technical blog.',
  exploreIntro: 'Already familiar with Astro? Browse individual articles or visit the AI SRE Platform lab overview.',
  previousLesson: 'Previous article', nextLesson: 'Next article', pathNavigation: 'Continue this series', pathOverview: 'Back to the series',
  aboutIntro: 'I am a full-stack engineer with a background in healthcare systems, semiconductor CIM and manufacturing MES. I am now exploring cloud native and platform engineering.',
  aboutEvidence: 'Articles explain concrete implementation decisions. Project maturity and operational claims are published only when supporting information is available.',
  experience: 'About the author', updated: 'Updated', published: 'Published', home: 'Home', all: 'View all',
};
const zh: typeof en = {
  start: '閱讀指南', learn: '文章系列', topics: '主題', blog: '技術文章', cases: '排障案例', projects: '專案', about: '關於', search: '搜尋',
  heroTitle: '從一個部落格，記下工程選擇', heroLabel: '全端工程師的實作筆記', projectLabel: '專案實驗室',
  empty: '此處尚無已發布內容。', latestCases: '最新案例', latestArticles: '最新文章', featuredTopics: '精選主題', featuredProject: '精選專案',
  explore: '探索專案與文章', minutes: '分鐘閱讀', prerequisites: '先備技能', skills: '技能', recommended: '延伸閱讀',
  maturity: '成熟度', contents: '本頁目錄', audience: '適合對象', related: '相關文章', paths: '相關系列', repository: '原始碼',
  startIntro: '目前文章集中在 Astro 部落格建置。具備基本 HTML 與程式經驗，可以從系列第一篇開始；操作篇會先介紹工具安裝。',
  blogEntry: '這個部落格如何建立', exploreEntry: '探索專案與文章',
  blogIntro: '從 Astro 系列了解技術部落格的需求、建置方法與交付選擇。',
  exploreIntro: '已熟悉 Astro，可以直接挑選文章，或查看 AI SRE Platform 實驗室的專案介紹。',
  previousLesson: '上一篇', nextLesson: '下一篇', pathNavigation: '繼續閱讀系列', pathOverview: '回到文章系列',
  aboutIntro: '我的全端開發背景涵蓋醫療系統、半導體 CIM 與製造業 MES，目前正探索雲原生與平台工程。',
  aboutEvidence: '文章說明具體的實作決策。專案成熟度與維運成果只會在有實際資料佐證時發布。',
  experience: '關於作者', updated: '更新日期', published: '發布日期', home: '首頁', all: '查看全部',
};
export const ui: Record<Locale, typeof en> = { en, 'zh-TW': zh };
