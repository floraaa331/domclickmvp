import { District } from "../../data/districts";
import { formatCurrency, ratingBar, SEPARATOR } from "../../utils/formatter";
import type { Criterion } from "./districts.service";

const CRITERIA_LABELS: Record<Criterion, string> = {
  metro: "🚇 Близость метро",
  ecology: "🌳 Парки и экология",
  schools: "🏫 Школы и детсады",
  shops: "🛒 Магазины и ТЦ",
  quiet: "🤫 Тишина и спокойствие",
  prices: "💰 Доступные цены",
  newBuildings: "🏗 Новостройки",
};

const CRITERIA_ICONS: Record<Criterion, string> = {
  metro: "🚇",
  ecology: "🌳",
  schools: "🏫",
  shops: "🛒",
  quiet: "🤫",
  prices: "💰",
  newBuildings: "🏗",
};

const MEDAL_EMOJIS = ["🥇", "🥈", "🥉"];

function getCriterionDetail(district: District, criterion: Criterion): string {
  switch (criterion) {
    case "metro":
      return district.metroStations.join(", ");
    case "ecology":
      return district.parks[0] ? `рядом ${district.parks[0]}` : "есть парки";
    case "schools":
      return `${district.schoolsCount} школ в районе`;
    case "shops":
      return `инфраструктура ${district.ratings.shops}/10`;
    case "quiet":
      return `тишина ${district.ratings.quiet}/10`;
    case "prices":
      return `от ${formatCurrency(district.pricePerMeter)}/м²`;
    case "newBuildings":
      return `новостройки ${district.ratings.newBuildings}/10`;
  }
}

/**
 * Shows the criteria selection screen with checkmarks for selected items.
 */
export function criteriaSelectionMessage(selected: Criterion[]): string {
  const allCriteria: Criterion[] = [
    "metro",
    "ecology",
    "schools",
    "shops",
    "quiet",
    "prices",
    "newBuildings",
  ];

  const lines = allCriteria.map((c) => {
    const check = selected.includes(c) ? "✅" : "☐";
    return `${check} ${CRITERIA_LABELS[c]}`;
  });

  return [
    "🗺 Подбор района",
    "",
    "Что важно при выборе? Отметь критерии:",
    "",
    ...lines,
    "",
    `Выбрано: ${selected.length} из ${allCriteria.length}`,
  ].join("\n");
}

/**
 * Budget selection prompt.
 */
export function budgetMessage(): string {
  return [
    "💰 Какой у тебя бюджет?",
    "",
    "Выбери ценовой диапазон за м²:",
    "",
    "🟢 Эконом — до 250 000 ₽/м²",
    "🟡 Комфорт — до 350 000 ₽/м²",
    "🟠 Бизнес — до 500 000 ₽/м²",
    "🔴 Премиум — без ограничений",
  ].join("\n");
}

/**
 * Shows top 3 districts as result cards with rating bars
 * for the selected criteria.
 */
export function resultsMessage(
  resultDistricts: District[],
  criteria: Criterion[]
): string {
  if (resultDistricts.length === 0) {
    return [
      "😔 К сожалению, по твоим критериям ничего не нашлось.",
      "",
      "Попробуй изменить бюджет или выбрать другие критерии.",
    ].join("\n");
  }

  const cards = resultDistricts.map((district, index) => {
    const medal = MEDAL_EMOJIS[index] ?? `${index + 1}.`;

    const avgScore =
      criteria.reduce((sum, c) => sum + district.ratings[c], 0) /
      criteria.length;

    const ratingLines = criteria.map((c) => {
      const icon = CRITERIA_ICONS[c];
      const label = CRITERIA_LABELS[c].replace(/^[^\s]+\s/, "");
      const bar = ratingBar(district.ratings[c]);
      const detail = getCriterionDetail(district, c);
      return `${icon} ${label}: ${bar} — ${detail}`;
    });

    return [
      `${medal} Район: ${district.name}`,
      `⭐ Общий рейтинг: ${avgScore.toFixed(1)}/10`,
      "",
      ...ratingLines,
      `💰 Цена: от ${formatCurrency(district.pricePerMeter)}/м²`,
      "",
      `💡 Почему подходит: ${district.description}`,
    ].join("\n");
  });

  return [
    "🏆 Лучшие районы по твоим критериям:",
    "",
    cards.join(`\n${SEPARATOR}\n`),
  ].join("\n");
}

/**
 * Full details about a single district.
 */
export function districtDetailMessage(district: District): string {
  const allCriteria: Criterion[] = [
    "metro",
    "ecology",
    "schools",
    "shops",
    "quiet",
    "prices",
    "newBuildings",
  ];

  const ratingLines = allCriteria.map((c) => {
    const icon = CRITERIA_ICONS[c];
    const label = CRITERIA_LABELS[c].replace(/^[^\s]+\s/, "");
    return `${icon} ${label}: ${ratingBar(district.ratings[c])}`;
  });

  return [
    `🏙 ${district.name}`,
    SEPARATOR,
    "",
    `📝 ${district.description}`,
    "",
    "📊 Рейтинги:",
    ...ratingLines,
    "",
    `🚇 Метро: ${district.metroStations.join(", ")}`,
    `🌳 Парки: ${district.parks.join(", ")}`,
    `🏫 Школ в районе: ${district.schoolsCount}`,
    `💰 Цена: от ${formatCurrency(district.pricePerMeter)}/м²`,
    "",
    SEPARATOR,
  ].join("\n");
}

/**
 * Side-by-side comparison of two districts with rating bars for all categories.
 */
export function comparisonMessage(d1: District, d2: District): string {
  const allCriteria: Criterion[] = [
    "metro",
    "ecology",
    "schools",
    "shops",
    "quiet",
    "prices",
    "newBuildings",
  ];

  const comparisonLines = allCriteria.map((c) => {
    const icon = CRITERIA_ICONS[c];
    const label = CRITERIA_LABELS[c].replace(/^[^\s]+\s/, "");
    const bar1 = ratingBar(d1.ratings[c]);
    const bar2 = ratingBar(d2.ratings[c]);
    return [
      `${icon} ${label}:`,
      `  ${d1.name}: ${bar1}`,
      `  ${d2.name}: ${bar2}`,
    ].join("\n");
  });

  const avg1 =
    allCriteria.reduce((sum, c) => sum + d1.ratings[c], 0) /
    allCriteria.length;
  const avg2 =
    allCriteria.reduce((sum, c) => sum + d2.ratings[c], 0) /
    allCriteria.length;

  return [
    `⚖️ Сравнение районов`,
    SEPARATOR,
    "",
    `🏙 ${d1.name}  vs  🏙 ${d2.name}`,
    "",
    ...comparisonLines,
    "",
    SEPARATOR,
    "",
    `⭐ Средний рейтинг:`,
    `  ${d1.name}: ${avg1.toFixed(1)}/10`,
    `  ${d2.name}: ${avg2.toFixed(1)}/10`,
    "",
    `💰 Цена за м²:`,
    `  ${d1.name}: от ${formatCurrency(d1.pricePerMeter)}/м²`,
    `  ${d2.name}: от ${formatCurrency(d2.pricePerMeter)}/м²`,
    "",
    `🚇 Метро:`,
    `  ${d1.name}: ${d1.metroStations.join(", ")}`,
    `  ${d2.name}: ${d2.metroStations.join(", ")}`,
    "",
    SEPARATOR,
  ].join("\n");
}
