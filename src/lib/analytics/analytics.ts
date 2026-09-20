import { eventNames, type AnalyticsEvent } from './events';

export type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { gtag?: Gtag; dataLayer?: unknown[]; platformAnalyticsEnabled?: boolean }
}

export function trackEvent(event: AnalyticsEvent): void {
  try {
    if (typeof window === 'undefined' || !window.platformAnalyticsEnabled || typeof window.gtag !== 'function') return;
    if (!eventNames.includes(event.name)) return;
    // Reconstruct the payload: extra properties from untyped callers never leave the site.
    window.gtag('event', event.name);
  } catch { /* Optional analytics must never interrupt a user action. */ }
}
