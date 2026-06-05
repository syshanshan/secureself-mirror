export function computeAnxietyReduction(
  before: number,
  after: number
): number {
  return after - before;
}

export function averageAnxietyDrop(averageReduction: number): number {
  return Math.max(0, -averageReduction);
}

export function isValidAnxietyIntensity(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 10;
}
