import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMeasurementId, measurementId, productionLocation } from '../src/lib/analytics/config';
import { initializeAnalytics } from '../src/lib/analytics/bootstrap';
import { analyticsLocation } from '../src/lib/analytics/location';
import { trackEvent } from '../src/lib/analytics/analytics';
import type { AnalyticsEvent } from '../src/lib/analytics/events';
import { projectSchema } from '../src/content/schemas';

test('GA4 requires production and a valid non-placeholder public ID', () => {
  assert.equal(measurementId(true, 'G-123456ABCD'), 'G-123456ABCD');
  for (const id of [undefined, '', 'G-XXXXXXXXXX', 'G-123', '<script>', 12]) assert.equal(measurementId(true, id), undefined);
  assert.equal(measurementId(false, 'G-123456ABCD'), undefined);
  assert.equal(productionLocation('http://localhost:4321/en/', 'https://example.com/en/'), false);
  assert.equal(productionLocation('https://example.com/en/?query=value', 'https://example.com/en/'), true);
});

test('production build rejects configured invalid IDs but accepts unset configuration', () => {
  for (const id of ['G-XXXXXXXXXX', 'G-123', 'g-123456abcd', ' G-123456ABCD', ' ', '<script>', 12]) {
    assert.throws(() => buildMeasurementId(true, id), /Invalid PUBLIC_GA_MEASUREMENT_ID/);
  }
  assert.equal(buildMeasurementId(true, undefined), undefined);
  assert.equal(buildMeasurementId(true, ''), undefined);
  assert.equal(buildMeasurementId(true, 'G-123456ABCD'), 'G-123456ABCD');
  assert.equal(buildMeasurementId(false, 'invalid'), undefined);
});

test('analytics location preserves only unambiguous campaign tokens on the canonical path', () => {
  const canonical = 'https://example.com/Blog/en/';
  const campaigns = 'utm_source=newsletter&utm_medium=email&utm_campaign=fall-2026&utm_term=astro&utm_content=hero_1&gclid=AbC-123_xyz';
  assert.equal(analyticsLocation(`${canonical}?${campaigns}&q=private&query=secret&search=personal&email=person%40example.com&token=credential&fbclid=unapproved&utm_id=unapproved#private`, canonical), `${canonical}?${campaigns}`);
  assert.equal(analyticsLocation(`${canonical}?utm_source=a&utm_source=b&utm_medium=&utm_campaign=private%20text&utm_term=person%40example.com&utm_content=https%3A%2F%2Fprivate.example&gclid=${'x'.repeat(129)}`, canonical), canonical);
  assert.equal(analyticsLocation(`${canonical}?utm_term=private%0Atext&UTM_SOURCE=wrong-case&utm_content=%253Cscript%253E`, canonical), canonical);
  assert.equal(analyticsLocation(`${canonical}?utm_source=newsletter#fragment`, `${canonical}?sensitive=secret#fragment`), `${canonical}?utm_source=newsletter`);
  assert.equal(analyticsLocation('https://other.example/?utm_source=untrusted', canonical), canonical);
});

test('adapter and bootstrap isolate failure, filter payloads, and inject only once', () => {
  assert.doesNotThrow(() => trackEvent({ name: 'search_used' }));
  const browser = { location: { href: 'https://example.com/en/?utm_source=newsletter&query=value#fragment' }, dataLayer: [] as unknown[], platformAnalyticsEnabled: false, gtag: undefined as ((...args: unknown[]) => void) | undefined };
  const scripts: { src?: string; async?: boolean }[] = [];
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => ({}), head: { append: (script: { src: string }) => scripts.push(script) } } });
  try {
    trackEvent({ name: 'search_used' });
    assert.equal(browser.dataLayer.length, 0);
    initializeAnalytics('', 'https://example.com/en/');
    initializeAnalytics('G-123456ABCD', 'https://other.example/en/');
    assert.equal(scripts.length, 0);
    initializeAnalytics('G-123456ABCD', 'https://example.com/en/');
    initializeAnalytics('G-123456ABCD', 'https://example.com/en/');
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0]?.src, 'https://www.googletagmanager.com/gtag/js?id=G-123456ABCD');
    const commands = browser.dataLayer.map(entry => Array.from(entry as IArguments));
    assert.equal(commands.filter(entry => entry[0] === 'config').length, 1);
    assert.deepEqual(commands[1]?.[2], { page_location: 'https://example.com/en/?utm_source=newsletter', allow_google_signals: false, allow_ad_personalization_signals: false });
    const event = { name: 'search_used' as const, params: { ignored: 'fixture' } };
    trackEvent(event);
    assert.deepEqual(Array.from(browser.dataLayer.at(-1) as IArguments), ['event', 'search_used']);
    browser.gtag = undefined;
    assert.doesNotThrow(() => trackEvent(event));
    browser.gtag = () => { throw new Error('blocked'); };
    assert.doesNotThrow(() => trackEvent(event));
    browser.platformAnalyticsEnabled = false;
    Object.defineProperty(browser, 'dataLayer', { get: () => { throw new Error('blocked'); } });
    assert.doesNotThrow(() => initializeAnalytics('G-123456ABCD', 'https://example.com/en/'));
  } finally {
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'document');
  }
});

test('event API rejects unapproved names and arbitrary payloads at type check', () => {
  const valid: AnalyticsEvent = { name: 'theme_changed' };
  // @ts-expect-error Unapproved event name.
  const invalid: AnalyticsEvent = { name: 'unknown_event' };
  // @ts-expect-error Free-form event parameters are deliberately unsupported.
  const parameters: AnalyticsEvent = { name: 'search_used', params: { query: 'fixture' } };
  assert.equal(valid.name, 'theme_changed');
  assert.ok(invalid && parameters);
});

test('project URLs reject executable schemes and embedded credentials', () => {
  const schema = projectSchema.shape.repositoryUrl;
  for (const value of ['not a URL', 'javascript:alert(1)', 'data:text/html,test', 'https://user:pass@example.com']) assert.equal(schema.safeParse(value).success, false);
  assert.equal(schema.safeParse('https://github.com/example/project').success, true);
});
