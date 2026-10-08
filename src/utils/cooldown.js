/**
 * Donation Cooldown & Eligibility Utilities for Bharath Blood Donor
 *
 * Implements calendar-month calculations for male/female blood donation cooldowns:
 * - Male: 3 calendar months
 * - Female: 4 calendar months
 *
 * Handles leap years, month length variations, countdown remaining days,
 * and automatic availability state resolution.
 */

export const DEFAULT_COOLDOWN_SETTINGS = {
  maleCooldownMonths: 3,
  femaleCooldownMonths: 4,
};

export const MEDICAL_DISCLAIMER_TEXT =
  "Donor eligibility may depend on applicable medical guidelines, blood-bank requirements, " +
  "health conditions, and professional assessment. This app's availability timer is an application " +
  "rule and does not replace medical eligibility screening.";

/**
 * Calculates the exact cooldown until date using calendar months.
 *
 * Example:
 * 08 October 2026 + 3 male months = 08 January 2027
 * 08 October 2026 + 4 female months = 08 February 2027
 */
export function calculateCooldownUntil(donationDateInput, genderInput, maleMonths = 3, femaleMonths = 4) {
  const date = donationDateInput ? new Date(donationDateInput) : new Date();
  if (isNaN(date.getTime())) {
    throw new Error('Invalid donation date provided');
  }

  const gender = (genderInput || '').trim().toUpperCase();
  const monthsToAdd = gender === 'FEMALE' ? (femaleMonths || 4) : (maleMonths || 3);

  const result = new Date(date);
  const currentDay = result.getDate();

  // Set month adding the calendar months
  result.setMonth(result.getMonth() + monthsToAdd);

  // Handle month length overshoot (e.g. Jan 31 + 1 month -> Feb 28/29)
  if (result.getDate() !== currentDay) {
    result.setDate(0); // set to last day of previous month
  }

  return result.toISOString();
}

/**
 * Calculates remaining days until cooldown expiration.
 */
export function getRemainingCooldownDays(cooldownUntilInput) {
  if (!cooldownUntilInput) return 0;
  const until = new Date(cooldownUntilInput).getTime();
  const now = new Date().getTime();
  if (isNaN(until) || now >= until) return 0;
  const diffMs = until - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates a donor's status dynamically based on current date & cooldown.
 *
 * Possible returned states:
 * - 'AVAILABLE'
 * - 'DONATION_COOLDOWN'
 * - 'INACTIVE'
 * - 'SUSPENDED'
 */
export function evaluateDonorStatus(donor) {
  if (!donor) return 'AVAILABLE';

  // Explicit status overrides if suspended or inactive
  if (donor.status === 'SUSPENDED') return 'SUSPENDED';
  if (donor.status === 'INACTIVE' || donor.isActive === false && !donor.cooldownUntil) {
    return 'INACTIVE';
  }

  if (donor.cooldownUntil) {
    const cooldownTime = new Date(donor.cooldownUntil).getTime();
    const nowTime = new Date().getTime();

    if (!isNaN(cooldownTime) && nowTime < cooldownTime) {
      return 'DONATION_COOLDOWN';
    }
  }

  // If cooldown is expired or no cooldown exists
  if (donor.isActive === false) {
    return 'INACTIVE';
  }

  return 'AVAILABLE';
}

/**
 * Formats ISO date string into friendly readable format (e.g. "08 Jan 2027").
 */
export function formatReadableDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;

  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}
