export const HISTORY_ROUTE = "/history"

const HISTORY_SOURCE = "history"

export function appendHistorySource(href: string): string {
  const separator = href.includes("?") ? "&" : "?"
  return `${href}${separator}from=${HISTORY_SOURCE}`
}

export function getHistoryAwareBackHref(from: string | null, fallbackHref: string): string {
  return from === HISTORY_SOURCE ? HISTORY_ROUTE : fallbackHref
}
