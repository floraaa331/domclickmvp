/** Format number as Russian currency: 1 234 567 ₽ */
export function formatCurrency(amount: number): string {
  return Math.round(amount).toLocaleString("ru-RU") + " ₽";
}

/** Format number with spaces: 1 234 567 */
export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString("ru-RU");
}

/** Format percentage with one decimal */
export function formatPercent(value: number): string {
  return value.toFixed(1).replace(".", ",") + "%";
}

/** Generate a text progress bar */
export function progressBar(current: number, total: number): string {
  const filled = Math.round((current / total) * 10);
  const empty = 10 - filled;
  const percent = Math.round((current / total) * 100);
  return "█".repeat(filled) + "░".repeat(empty) + ` ${percent}% (${current}/${total})`;
}

/** Generate rating bar for district comparison */
export function ratingBar(score: number, maxScore: number = 10): string {
  const filled = Math.round((score / maxScore) * 10);
  const empty = 10 - filled;
  return "▓".repeat(filled) + "░".repeat(empty) + ` ${score}/${maxScore}`;
}

/** Pluralize Russian words for years */
export function pluralYears(n: number): string {
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${n} лет`;
  if (lastOne === 1) return `${n} год`;
  if (lastOne >= 2 && lastOne <= 4) return `${n} года`;
  return `${n} лет`;
}

/** Pluralize Russian words for months */
export function pluralMonths(n: number): string {
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${n} месяцев`;
  if (lastOne === 1) return `${n} месяц`;
  if (lastOne >= 2 && lastOne <= 4) return `${n} месяца`;
  return `${n} месяцев`;
}

/** Separator line for messages */
export const SEPARATOR = "━━━━━━━━━━━━━━━━━━━━";
