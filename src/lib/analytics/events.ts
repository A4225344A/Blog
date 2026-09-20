export const eventNames = ['search_used', 'language_changed', 'theme_changed', 'learning_path_opened', 'project_opened'] as const;
export type AnalyticsEventName = typeof eventNames[number];
// Deliberately no free-form parameters, search queries, IDs or user content.
export interface AnalyticsEvent { name: AnalyticsEventName }
