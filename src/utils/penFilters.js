/** @typedef {{ id: number, type: string, brand: string, model: string, length: number, diameter: number, imageUrl: string, amazonUrl: string, rakutenUrl: string }} Pen */

/**
 * @param {Pen[]} pens
 * @param {{
 *   type: string[],
 *   brand: string[],
 *   lengthRange: [number, number],
 *   diameterRange: [number, number],
 *   searchQuery: string,
 * }} filters
 */
export function filterPens(pens, filters) {
  return pens.filter((pen) => {
    if (filters.type.length > 0 && !filters.type.includes(pen.type)) return false;
    if (filters.brand.length > 0 && !filters.brand.includes(pen.brand)) return false;
    if (pen.length < filters.lengthRange[0] || pen.length > filters.lengthRange[1]) return false;
    if (pen.diameter < filters.diameterRange[0] || pen.diameter > filters.diameterRange[1]) return false;
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const text = `${pen.brand} ${pen.model}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}

/** @param {Pen[]} pens */
export function getUniqueBrands(pens) {
  return Array.from(new Set(pens.map((p) => p.brand))).sort();
}

/** @param {Pen[]} pens */
export function getMinMaxLength(pens) {
  const lengths = pens.map((p) => p.length);
  return [Math.min(...lengths), Math.max(...lengths)];
}

/** @param {Pen[]} pens */
export function getMinMaxDiameter(pens) {
  const d = pens.map((p) => p.diameter);
  return [Math.min(...d), Math.max(...d)];
}
