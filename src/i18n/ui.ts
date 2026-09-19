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
    start: 'Choose a starting point for learning engineering concepts, implementation and troubleshooting.',
    learn: 'Follow ordered learning paths from foundational concepts to working implementations.',
    topics: 'Browse engineering knowledge by Cloud Native, Platform Engineering, SRE, AI and Backend topics.',
    blog: 'Read engineering tutorials, concepts, references and implementation articles.',
    cases: 'Explore published troubleshooting investigations and engineering case studies.',
    projects: 'Explore engineering projects, their maturity, repositories and related knowledge.',
    about: 'Learn how this engineering knowledge platform connects practical work and structured learning.',
  },
  'zh-TW': {
    start: '選擇適合的起點，開始學習工程概念、實作方法與排障知識。',
    learn: '依照有順序的學習路徑，從基礎概念走向完整實作。',
    topics: '依雲原生、平台工程、SRE、AI 與後端工程主題探索知識。',
    blog: '閱讀工程教學、概念解析、技術參考與實作文章。',
    cases: '探索已發布的排障過程與工程案例研究。',
    projects: '了解工程專案的成熟度、原始碼與相關知識。',
    about: '了解這個工程知識平台如何串接實作經驗與循序學習。',
  },
};
const en = {
  start: 'Start here', learn: 'Learning paths', topics: 'Topics', blog: 'Articles', cases: 'Case studies', projects: 'Projects', about: 'About', search: 'Search',
  empty: 'Nothing published here yet.', latestCases: 'Latest cases', latestArticles: 'Latest articles', featuredTopics: 'Featured topics', featuredProject: 'Featured project',
  explore: 'Explore the knowledge', minutes: 'min read', prerequisites: 'Prerequisite skills', skills: 'Skills', recommended: 'Recommended reading',
  maturity: 'Maturity', contents: 'On this page', audience: 'For', related: 'Related articles', paths: 'Related learning paths', repository: 'Repository',
  startIntro: 'New to coding? Start by opening a website on your own computer. Already comfortable running a project? Explore the architecture path.',
  beginnerEntry: 'I have no coding experience', experiencedEntry: 'I already write code',
  beginnerIntro: 'Start here if you do not know where to type commands. The Windows guide explains each tool and helps you make one visible change.',
  experiencedIntro: 'Choose this if you can already run a Node.js project and edit HTML or JavaScript. This path explains architecture, content relationships and delivery.',
  previousLesson: 'Previous lesson', nextLesson: 'Next lesson', pathNavigation: 'Continue this learning path', pathOverview: 'Back to the learning path',
  aboutIntro: 'This is a Git-managed engineering knowledge platform. It connects concepts, practical guides, troubleshooting and project context so that learning can follow a clear sequence.',
  aboutEvidence: 'Articles explain concrete implementation decisions. Project maturity and operational claims are published only when supporting information is available.',
  experience: 'About / Experience', updated: 'Updated', published: 'Published', home: 'Home', all: 'View all',
};
const zh: typeof en = {
  start: '從這裡開始', learn: '學習路徑', topics: '主題', blog: '技術文章', cases: '排障案例', projects: '專案', about: '關於', search: '搜尋',
  empty: '此處尚無已發布內容。', latestCases: '最新案例', latestArticles: '最新文章', featuredTopics: '精選主題', featuredProject: '精選專案',
  explore: '開始探索工程知識', minutes: '分鐘閱讀', prerequisites: '先備技能', skills: '技能', recommended: '延伸閱讀',
  maturity: '成熟度', contents: '本頁目錄', audience: '適合對象', related: '相關文章', paths: '相關學習路徑', repository: '原始碼',
  startIntro: '還沒寫過程式？先在自己的電腦開啟一個網站。已經會執行專案？可以直接探索架構設計。',
  beginnerEntry: '我沒有開發經驗', experiencedEntry: '我已經會寫程式',
  beginnerIntro: '不知道指令要輸入在哪裡也沒關係。Windows 入門教學會解釋工具用途，帶你完成一次看得見的修改。',
  experiencedIntro: '適合已能執行 Node.js 專案、修改 HTML 或 JavaScript 的讀者，接著理解架構、內容關聯與交付流程。',
  previousLesson: '上一篇', nextLesson: '下一篇', pathNavigation: '繼續這條學習路徑', pathOverview: '回到學習路徑',
  aboutIntro: '這是一個以 Git 管理的工程知識平台，串接概念、實作教學、排障經驗與專案背景，讓學習有清楚的順序。',
  aboutEvidence: '文章說明具體的實作決策。專案成熟度與維運成果只會在有實際資料佐證時發布。',
  experience: '關於／經歷', updated: '更新日期', published: '發布日期', home: '首頁', all: '查看全部',
};
export const ui: Record<Locale, typeof en> = { en, 'zh-TW': zh };
