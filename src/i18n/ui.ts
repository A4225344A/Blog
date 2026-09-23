import type { Locale } from './index';
import { siteConfig } from '../config/site';
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
    learn: 'Follow a project from the first setup to deployment.',
    topics: 'Find articles by topic.',
    blog: 'Notes on building software and how it works.',
    cases: 'Problems, the steps used to investigate them, and what fixed them.',
    projects: 'Project notes, source code and current progress.',
    about: 'Meet the full-stack engineer moving toward cloud native and platform engineering.',
  },
  'zh-TW': {
    start: '依照需求選擇 Astro 系列的起點，並確認閱讀前需要的基礎。',
    learn: '從建立專案到部署，照順序一步步完成。',
    topics: '按主題找文章。',
    blog: '寫程式、建網站，以及弄懂它們怎麼運作的筆記。',
    cases: '記下問題怎麼查、原因在哪裡，最後怎麼修好。',
    projects: '專案介紹、原始碼與目前進度。',
    about: '認識作者：一位正從全端開發走向雲原生與平台工程的工程師。',
  },
};
const en = {
  start: 'Reading guide', learn: 'Article series', topics: 'Topics', blog: 'Articles', cases: 'Case studies', projects: 'Projects', about: 'About', search: 'Search',
  heroTitle: 'From full-stack development to cloud native', heroLabel: 'Development notes', projectLabel: 'Project lab',
  latestNote: 'Newest publications first. Use the series below to follow the tutorials in order.',
  empty: 'Nothing published here yet.', latestCases: 'Latest cases', latestArticles: 'Latest articles', featuredTopics: 'Featured topics', featuredProject: 'Featured project',
  explore: 'Explore projects and articles', minutes: 'min read', prerequisites: 'Prerequisite skills', skills: 'Skills', recommended: 'Recommended reading',
  maturity: 'Maturity', contents: 'On this page', audience: 'For', related: 'Related articles', paths: 'Related series', repository: 'Repository',
  startIntro: 'The first series is about building this blog with Astro. With some HTML and programming experience, you can follow it from an empty folder to GitHub Pages.',
  blogEntry: 'How this blog is built', exploreEntry: 'Explore projects and articles',
  blogIntro: 'Start with why I chose Astro, then build a home page, add an article and publish it.',
  exploreIntro: 'Already have an Astro project? Article four covers translations and series navigation. The Projects page introduces the AI SRE Platform lab.',
  previousLesson: 'Previous article', nextLesson: 'Next article', pathNavigation: 'Continue this series', pathOverview: 'Back to the series',
  aboutIntro: `I’m ${siteConfig.author.name}, a full-stack engineer moving toward cloud native and platform engineering. This blog records what I learn through implementation.`,

  experience: 'About the author', updated: 'Updated', published: 'Published', home: 'Home', all: 'View all',
};
const zh: typeof en = {
  start: '閱讀指南', learn: '文章系列', topics: '主題', blog: '技術文章', cases: '排障案例', projects: '專案', about: '關於', search: '搜尋',
  heroTitle: '從全端開發，走向雲原生', heroLabel: '開發與學習紀錄', projectLabel: '專案實驗室',
  latestNote: '新發表的文章放前面。想跟著操作，可以從下方的文章系列開始。',
  empty: '這裡還沒有文章。', latestCases: '最新案例', latestArticles: '最新文章', featuredTopics: '精選主題', featuredProject: '精選專案',
  explore: '探索專案與文章', minutes: '分鐘閱讀', prerequisites: '先備技能', skills: '技能', recommended: '延伸閱讀',
  maturity: '成熟度', contents: '本頁目錄', audience: '適合對象', related: '相關文章', paths: '相關系列', repository: '原始碼',
  startIntro: '第一個系列從這個部落格寫起。如果你會一些 HTML，也寫過程式，可以跟著用 Astro 從空資料夾做到 GitHub Pages 上線。',
  blogEntry: '這個部落格如何建立', exploreEntry: '探索專案與文章',
  blogIntro: '從為什麼選 Astro 開始，接著建立首頁、加入文章，最後發布。',
  exploreIntro: '已經有 Astro 專案，可以直接看第四篇的雙語文章與系列整理方式。專案頁另有 AI SRE Platform 實驗室的介紹。',
  previousLesson: '上一篇', nextLesson: '下一篇', pathNavigation: '繼續閱讀系列', pathOverview: '回到文章系列',
  aboutIntro: `我是 ${siteConfig.author.name}，一名全端工程師，正在走向雲原生與平台工程。這裡記錄我在實作中學到的事。`,

  experience: '關於作者', updated: '更新日期', published: '發布日期', home: '首頁', all: '查看全部',
};
export const ui: Record<Locale, typeof en> = { en, 'zh-TW': zh };
