// Pure ad generation logic — no bot dependencies

import { formatCurrency } from "../../utils/formatter";

export interface AdParams {
  dealType: "sale" | "rent";
  propertyType: string;
  rooms: string;
  area: number;
  floor: number;
  totalFloors: number;
  district: string;
  features: string[];
  price: number;
}

/** Map room codes to short Russian labels */
function roomsShortLabel(rooms: string): string {
  switch (rooms) {
    case "studio":
      return "студии";
    case "1":
      return "1-комн. квартиры";
    case "2":
      return "2-комн. квартиры";
    case "3":
      return "3-комн. квартиры";
    case "4+":
      return "4+-комн. квартиры";
    default:
      return "квартиры";
  }
}

/** Map room codes to full Russian labels */
function roomsFullLabel(rooms: string): string {
  switch (rooms) {
    case "studio":
      return "квартира-студия";
    case "1":
      return "однокомнатная квартира";
    case "2":
      return "двухкомнатная квартира";
    case "3":
      return "трёхкомнатная квартира";
    case "4+":
      return "просторная многокомнатная квартира";
    default:
      return "квартира";
  }
}

/** Map deal type to Russian label */
function dealTypeLabel(dealType: "sale" | "rent"): string {
  return dealType === "sale" ? "Продажа" : "Аренда";
}

/** Join features with commas, lowercasing first letters */
function joinFeatures(features: string[]): string {
  if (features.length === 0) return "";
  return features.map((f) => f.charAt(0).toLowerCase() + f.slice(1)).join(", ");
}

/**
 * Generate a short, factual ad text.
 */
export function generateLaconicAd(params: AdParams): string {
  const { dealType, rooms, area, floor, totalFloors, district, features, price } = params;

  const parts: string[] = [
    `${dealTypeLabel(dealType)} ${roomsShortLabel(rooms)}, ${area} м², ${floor}/${totalFloors} этаж, район ${district}.`,
  ];

  if (features.length > 0) {
    parts.push(`${features.join(", ")}.`);
  }

  parts.push(formatCurrency(price));

  return parts.join(" ");
}

/**
 * Generate an emotional, lifestyle-oriented selling ad.
 */
export function generateSellingAd(params: AdParams): string {
  const { dealType, rooms, area, floor, totalFloors, district, features, price } = params;

  const fullLabel = roomsFullLabel(rooms);
  const isRent = dealType === "rent";
  const priceStr = formatCurrency(price);
  const featuresLower = joinFeatures(features);

  const hasView = features.some((f) => f.toLowerCase().includes("вид"));
  const hasRenovation = features.some((f) => f.toLowerCase().includes("ремонт"));
  const hasPanorama = features.some((f) => f.toLowerCase().includes("панорамн"));
  const hasParking = features.some((f) => f.toLowerCase().includes("парковк"));
  const hasFitness = features.some((f) => f.toLowerCase().includes("фитнес"));
  const hasPlayground = features.some((f) => f.toLowerCase().includes("детск"));
  const hasElevator = features.some((f) => f.toLowerCase().includes("лифт"));

  // Build opening line based on room count and features
  let opening: string;
  if (rooms === "studio") {
    opening = hasPanorama
      ? `Стильная студия с панорамными окнами и светлым пространством!`
      : `Уютная и функциональная студия для современной жизни!`;
  } else if (rooms === "1") {
    opening = hasView
      ? `Светлая однокомнатная квартира с потрясающим видом!`
      : `Уютная однокомнатная квартира в отличном районе!`;
  } else if (rooms === "2") {
    opening = hasPanorama
      ? `Просторная двухкомнатная квартира с панорамными окнами!`
      : `Идеальная двухкомнатная квартира для комфортной жизни!`;
  } else if (rooms === "3") {
    opening = `Великолепная трёхкомнатная квартира для большой семьи!`;
  } else {
    opening = `Роскошная многокомнатная квартира премиального уровня!`;
  }

  // Build description body
  const bodyParts: string[] = [];
  bodyParts.push(
    `${area} м² продуманного пространства на ${floor} этаже современного ${totalFloors}-этажного дома в ${isHighFloor(floor, totalFloors) ? "великолепном" : "уютном"} районе ${district}.`
  );

  // Feature-driven sentences
  const featureSentences: string[] = [];
  if (hasRenovation) {
    featureSentences.push("Свежий дизайнерский ремонт — заезжай и живи");
  }
  if (hasPanorama) {
    featureSentences.push("Панорамные окна наполняют пространство светом");
  }
  if (hasView) {
    featureSentences.push("Из окон открывается впечатляющий вид");
  }
  if (hasParking) {
    featureSentences.push("Собственная парковка для вашего авто");
  }
  if (hasElevator) {
    featureSentences.push("Скоростной лифт — никакого ожидания");
  }
  if (hasFitness) {
    featureSentences.push("Фитнес-зал прямо в доме — спорт без поездок");
  }
  if (hasPlayground) {
    featureSentences.push("Детская площадка во дворе — дети будут в восторге");
  }

  // Add remaining features not covered above
  const coveredKeywords = ["вид", "ремонт", "панорамн", "парковк", "фитнес", "детск", "лифт"];
  const uncoveredFeatures = features.filter(
    (f) => !coveredKeywords.some((kw) => f.toLowerCase().includes(kw))
  );
  if (uncoveredFeatures.length > 0) {
    featureSentences.push(uncoveredFeatures.join(", "));
  }

  if (featureSentences.length > 0) {
    bodyParts.push(featureSentences.join(". ") + ".");
  }

  // Closing line
  let closing: string;
  if (isRent) {
    closing = `Идеальный вариант для тех, кто ценит комфорт и удобное расположение. ${priceStr}/мес.`;
  } else if (rooms === "studio" || rooms === "1") {
    closing = `Отличный выбор для жизни или инвестиции. ${priceStr}`;
  } else if (hasFitness || hasPlayground) {
    closing = `Идеальный дом для семьи, которая ценит комфорт и инфраструктуру. ${priceStr}`;
  } else {
    closing = `Идеальный дом для тех, кто ценит комфорт и экологию. ${priceStr}`;
  }

  return [opening, ...bodyParts, closing].join(" ");
}

/** Check if the floor is in the upper third of the building */
function isHighFloor(floor: number, totalFloors: number): boolean {
  return floor >= totalFloors * 0.66;
}
