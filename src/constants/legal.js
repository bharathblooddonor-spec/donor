/**
 * Legal and support URLs.
 *
 * Both stores require a working, publicly reachable privacy policy URL, and
 * Apple requires it to be reachable from inside the app. These point at Google
 * Docs published via File > Share > Publish to web, which serve as plain public
 * pages with no sign-in prompt.
 *
 * Source text for all three lives in legal/*.txt in this repo — edit there
 * first, then paste into the Doc, so the repo stays the source of truth.
 *
 * These URLs are baked into the app bundle at build time. Changing a URL means
 * shipping an app update, so if you ever move to a custom domain, do it before
 * a release rather than after.
 */

export const PRIVACY_POLICY_URL =
  'https://docs.google.com/document/d/e/2PACX-1vTeKx70Xt4hB7SVm5LImjYxpJDRMcmuIxJVZCNt1iAu_oPKp2jpsr6xGvJ6WS1WYfpZdCwC9tOtSUCx/pub';

export const TERMS_URL =
  'https://docs.google.com/document/d/e/2PACX-1vQjbq3ztjnvJ1Z-z7fCgbs2k5Ig9AshRGMFplqMtTOiogTm-QN0sKcn7SklCXVlxpcQD6FCUrQ5rVv7/pub';

/**
 * Support page. Carries the Grievance Officer details required by the IT
 * (Intermediary Guidelines) Rules 2021, which is why the About screen links
 * here rather than opening a bare mailto:.
 */
export const SUPPORT_URL =
  'https://docs.google.com/document/d/e/2PACX-1vRT6wkEMcYk33R4sRXALlYum7HzhZyj-dSCbq4ZYfYyzac96Gt36YNO0mu45gC4fZrvClxg2dHeelyt/pub';

export const SUPPORT_EMAIL = 'bharathblooddonor@gmail.com';

/** Nationwide emergency ambulance number in India. */
export const EMERGENCY_NUMBER = '108';
