/**
 * Normalize scientific and mathematical text for display and export.
 * Converts Unicode subscripts/superscripts/symbols to ASCII so they render correctly
 * in PDF (jsPDF Helvetica), Word, and browsers with limited font support.
 * Fixes: ₃→3, ⁻¹→^-1 (sin⁻¹→sin^-1), ∫→integral, ≤→<=, π→pi, etc.
 */
export function normalizeScientificText(text: string): string {
  if (!text || typeof text !== "string") return ""
  return text
    // Subscripts ₀-₉ -> 0-9
    .replace(/[\u2080-\u2089]/g, (c) => String.fromCharCode(0x30 + (c.charCodeAt(0) - 0x2080)))
    // Superscript minus (⁻) -> ^- so ⁻¹ becomes ^-1 (inverse: sin⁻¹ → sin^-1)
    .replace(/\u207B/g, "^-")
    // Superscript digits ⁰¹²³⁴-⁹ -> 0-9
    .replace(/[\u2070\u00B9\u00B2\u00B3\u2074-\u2079]/g, (c) => {
      const map: Record<string, string> = { "\u2070": "0", "\u00B9": "1", "\u00B2": "2", "\u00B3": "3" }
      if (map[c]) return map[c]
      return String.fromCharCode(0x30 + (c.charCodeAt(0) - 0x2070))
    })
    // Mathematical symbols (jsPDF Helvetica lacks these)
    .replace(/\u222B/g, "integral ")   // ∫
    .replace(/\u2211/g, "sum ")        // ∑
    .replace(/\u2264/g, "<=")          // ≤
    .replace(/\u2265/g, ">=")          // ≥
    .replace(/\u2260/g, "!=")          // ≠
    .replace(/\u2248/g, "~")           // ≈
    .replace(/\u03C0/g, "pi")          // π
    .replace(/\u00D7/g, "*")           // ×
    .replace(/\u00F7/g, "/")           // ÷
    .replace(/\u221E/g, "infinity")    // ∞
    .replace(/\u221A/g, "sqrt ")       // √
    // Dashes and arrows
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "-")
    .replace(/\u2192/g, "->")
    .replace(/\u2190/g, "<-")
    .replace(/\u2194/g, "<->")
}
