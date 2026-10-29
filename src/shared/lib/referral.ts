import Cookies from "js-cookie";

// Affiliate referral capture.
//
// proxy.ts stores ?ref= from ANY page in this cookie, so the code survives the
// visitor browsing around, closing the tab, or coming back days later before
// signing up. The latest link clicked wins. Sign-up (email or Google) sends it
// to the backend, which applies it only when a new account is created.
export const REFERRAL_COOKIE = "nv_ref";
export const REFERRAL_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Affiliate codes are `NV-` plus uppercase letters/digits (see
// generateUniqueCode in the backend). Anything else is not stored.
export const REFERRAL_CODE_PATTERN = /^NV-[A-Z0-9]{1,32}$/;

export function normalizeReferralCode(raw: string | null | undefined) {
  const code = raw?.trim().toUpperCase();
  return code && REFERRAL_CODE_PATTERN.test(code) ? code : undefined;
}

export function getReferralCode() {
  return normalizeReferralCode(Cookies.get(REFERRAL_COOKIE));
}

export function clearReferralCode() {
  Cookies.remove(REFERRAL_COOKIE, { path: "/" });
}
