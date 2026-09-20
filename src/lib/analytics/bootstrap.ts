import { measurementId, productionLocation } from './config';
import type { Gtag } from './analytics';
import { analyticsLocation } from './location';

export function initializeAnalytics(id: string, canonical: string): void {
  try {
    if (!measurementId(true, id) || !productionLocation(window.location.href, canonical) || window.platformAnalyticsEnabled) return;
    window.dataLayer = window.dataLayer || [];
    const gtag: Gtag = function () { window.dataLayer?.push(arguments); };
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id, {
      page_location: analyticsLocation(window.location.href, canonical),
      allow_google_signals: false, allow_ad_personalization_signals: false,
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.append(script);
    window.platformAnalyticsEnabled = true;
  } catch { /* Rendering and navigation never depend on Google. */ }
}
