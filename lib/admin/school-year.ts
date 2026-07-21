/** Année scolaire club : 1er juillet → 30 juin (inscriptions d’été = nouvelle saison). */

export function getSchoolYearFromDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  // Dès juillet : nouvelle année scolaire (ex. 19/07/2026 → 2026/2027)
  if (month >= 7) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}

export function getCurrentSchoolYear(): string {
  return getSchoolYearFromDate(new Date());
}

/** Année courante + saisons suivantes (jusqu’à +3 ans, ex. 2026/2027 → 2029/2030). */
export function listSchoolYearOptions(around: string = getCurrentSchoolYear()): string[] {
  const start = Number(around.slice(0, 4));
  if (!Number.isFinite(start)) {
    return [getCurrentSchoolYear()];
  }
  return [0, 1, 2, 3].map((offset) => `${start + offset}/${start + offset + 1}`);
}
