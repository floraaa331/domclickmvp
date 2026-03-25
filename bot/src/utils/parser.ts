/**
 * Smart number parser for Russian-style input.
 * Handles: "5000000", "5 000 000", "5млн", "5.5 млн", "5,5млн", "5kk", "500к", "500k"
 */
export function parseAmount(input: string): number | null {
  const cleaned = input.trim().toLowerCase().replace(/\s+/g, "");

  // Try "5.5млн" / "5,5млн" / "5млн"
  const mlnMatch = cleaned.match(/^(\d+[.,]?\d*)\s*(?:млн|мл)\.?$/);
  if (mlnMatch) {
    const num = parseFloat(mlnMatch[1].replace(",", "."));
    return isNaN(num) ? null : num * 1_000_000;
  }

  // Try "500к" / "500k" / "500тыс" / "500 тыс"
  const kMatch = cleaned.match(/^(\d+[.,]?\d*)\s*(?:к|k|тыс)\.?$/);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(",", "."));
    return isNaN(num) ? null : num * 1_000;
  }

  // Try "5kk" pattern (millions)
  const kkMatch = cleaned.match(/^(\d+[.,]?\d*)\s*(?:кк|kk)$/);
  if (kkMatch) {
    const num = parseFloat(kkMatch[1].replace(",", "."));
    return isNaN(num) ? null : num * 1_000_000;
  }

  // Plain number with possible spaces/dots/commas as thousand separators
  const plainCleaned = input.replace(/\s/g, "").replace(/[.,](?=\d{3})/g, "");
  const num = parseFloat(plainCleaned.replace(",", "."));

  if (isNaN(num) || num <= 0) return null;
  return num;
}

/** Parse floor input like "5/17" */
export function parseFloor(input: string): { floor: number; totalFloors: number } | null {
  const match = input.trim().match(/^(\d+)\s*[/\\]\s*(\d+)$/);
  if (!match) return null;
  const floor = parseInt(match[1], 10);
  const totalFloors = parseInt(match[2], 10);
  if (floor <= 0 || totalFloors <= 0 || floor > totalFloors) return null;
  return { floor, totalFloors };
}

/** Parse area in m² */
export function parseArea(input: string): number | null {
  const cleaned = input.trim().replace(/\s+/g, "").replace(/м²?|m2?|кв\.?м?/gi, "");
  const num = parseFloat(cleaned.replace(",", "."));
  if (isNaN(num) || num <= 0 || num > 10000) return null;
  return num;
}
