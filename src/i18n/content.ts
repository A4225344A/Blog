import type { Locale } from './index';
const chinese: Record<string, { title: string; description: string }> = {
  'platform-engineering': { title: '平台工程', description: '以可維護的工具、交付流程與文件支援工程團隊。' },
  'cloud-native': { title: '雲原生', description: '容器、宣告式基礎設施與分散式系統的設計。' },
  sre: { title: '網站可靠性工程', description: '從可觀測性、排障到可靠性實務。' },
  'ai-engineering': { title: 'AI 工程', description: 'AI 系統的工程設計、交付與維運。' },
  'backend-engineering': { title: '後端工程', description: '服務、介面與資料處理的工程基礎。' },
  'astro-content-modeling': { title: 'Astro 內容建模', description: '使用型別與 schema 管理靜態內容。' },
  'static-site-delivery': { title: '靜態網站交付', description: '驗證並交付可部署的靜態產物。' },
  'knowledge-platform': { title: '建立工程知識平台', description: '從內容模型、Astro 基礎到 GitHub Pages 交付。' },
  foundation: { title: '從完整範例開始', description: '先理解實際儲存庫，再調整自己的內容。' },
  'ai-sre-platform': { title: 'AI SRE Platform', description: '整合 AWS 基礎設施、Kubernetes GitOps、可觀測性與 AI 輔助事件處理的架構實驗室，用於學習、展示與實驗，不用於正式環境部署。' },
};
export function entityText(entity: { id: string; title?: string; name?: string; description?: string }, locale: Locale) {
  return (locale === 'zh-TW' ? chinese[entity.id] : undefined) ?? {
    title: entity.title ?? entity.name ?? entity.id, description: entity.description ?? '',
  };
}
