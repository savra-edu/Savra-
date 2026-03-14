const DISPLAY_SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  n: "ⁿ",
  i: "ⁱ",
}

const PDF_SUPERSCRIPT_MAP: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁺": "+",
  "⁻": "-",
  "⁼": "=",
  "⁽": "(",
  "⁾": ")",
  "ⁿ": "n",
  "ⁱ": "i",
}

const CARET_EXPONENT_PATTERN = /\^(\([0-9A-Za-z+\-=]+\)|[+\-]?[0-9A-Za-z]+)/g

function convertCaretExponentsToSuperscript(text: string): string {
  return text.replace(CARET_EXPONENT_PATTERN, (match, exponent: string) => {
    const converted = exponent
      .split("")
      .map((char) => DISPLAY_SUPERSCRIPT_MAP[char] ?? "")
      .join("")

    return converted.length === exponent.length ? converted : match
  })
}

function convertUnicodeSuperscriptsToCaret(text: string): string {
  return text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ]+/g, (token) => {
    const converted = token
      .split("")
      .map((char) => PDF_SUPERSCRIPT_MAP[char] ?? char)
      .join("")
    return `^${converted}`
  })
}

function normalizeCommonCharacters(text: string): string {
  return text
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "-")
    .replace(/\u2192/g, "->")
    .replace(/\u2190/g, "<-")
    .replace(/\u2194/g, "<->")
}

export function normalizeScientificText(text: string): string {
  if (!text || typeof text !== "string") return ""

  return convertCaretExponentsToSuperscript(normalizeCommonCharacters(text))
}

export function normalizeScientificTextForPdf(text: string): string {
  if (!text || typeof text !== "string") return ""

  return convertUnicodeSuperscriptsToCaret(
    normalizeCommonCharacters(text)
      .replace(/[\u2080-\u2089]/g, (c) => String.fromCharCode(0x30 + (c.charCodeAt(0) - 0x2080)))
      .replace(/\u222B/g, "integral ")
      .replace(/\u2211/g, "sum ")
      .replace(/\u2264/g, "<=")
      .replace(/\u2265/g, ">=")
      .replace(/\u2260/g, "!=")
      .replace(/\u2248/g, "~")
      .replace(/\u03C0/g, "pi")
      .replace(/[μµ]/g, "mu")
      .replace(/\u00D7/g, " x ")
      .replace(/\u00F7/g, "/")
      .replace(/\u221E/g, "infinity")
      .replace(/\u221A/g, "sqrt ")
  )
}
