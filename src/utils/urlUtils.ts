export const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX)
  return matches ? [...new Set(matches)] : []
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function formatMessageWithLinks(text: string): { text: string; urls: string[] } {
  const urls = extractUrls(text)
  return { text, urls }
}
