import { districts, District } from "../../data/districts";

export type Criterion =
  | "metro"
  | "ecology"
  | "schools"
  | "shops"
  | "quiet"
  | "prices"
  | "newBuildings";

export type Budget = "low" | "medium" | "high" | "premium";

const BUDGET_PRICE_LIMITS: Record<Budget, number> = {
  low: 250_000,
  medium: 350_000,
  high: 500_000,
  premium: Infinity,
};

function matchesBudget(district: District, budget: Budget): boolean {
  if (budget === "premium") return true;
  return district.pricePerMeter < BUDGET_PRICE_LIMITS[budget];
}

function computeWeightedScore(
  district: District,
  criteria: Criterion[]
): number {
  if (criteria.length === 0) return 0;
  const sum = criteria.reduce(
    (acc, criterion) => acc + district.ratings[criterion],
    0
  );
  return sum / criteria.length;
}

/**
 * Returns top 3 districts sorted by weighted score of selected criteria,
 * filtered by budget category.
 */
export function findBestDistricts(
  criteria: Criterion[],
  budget: Budget
): District[] {
  const filtered = districts.filter((d) => matchesBudget(d, budget));

  const scored = filtered.map((district) => ({
    district,
    score: computeWeightedScore(district, criteria),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((entry) => entry.district);
}

/**
 * Returns a pair of districts for comparison, or null if either name is not found.
 */
export function compareDistricts(
  name1: string,
  name2: string
): [District, District] | null {
  const d1 = districts.find((d) => d.name === name1);
  const d2 = districts.find((d) => d.name === name2);
  if (!d1 || !d2) return null;
  return [d1, d2];
}

/**
 * Returns a single district by name, or null if not found.
 */
export function getDistrictDetails(name: string): District | null {
  return districts.find((d) => d.name === name) ?? null;
}
