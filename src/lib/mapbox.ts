export interface CitySuggestion {
  id: string
  text: string
  city: string
  country: string
  countryCode?: string
  placeName: string
  longitude: number
  latitude: number
}

interface MapboxFeature {
  id: string
  place_name: string
  text: string
  center: [number, number]
  context?: Array<{ id: string; short_code?: string; text: string }>
}

const MAPBOX_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

// Simple in-memory cache for 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000
const queryCache = new Map<string, { ts: number; results: CitySuggestion[] }>()

let currentController: AbortController | null = null

const getSessionToken = (() => {
  let token: string | null = null
  return () => {
    if (!token) {
      token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    }
    return token
  }
})()

export async function searchCities(query: string, opts?: { country?: string; limit?: number }): Promise<CitySuggestion[]> {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  if (!token) {
    console.warn('Missing VITE_MAPBOX_ACCESS_TOKEN')
    return []
  }

  const q = query.trim()
  if (q.length < 2) return []

  const key = `${q}|${opts?.country ?? ''}|${opts?.limit ?? 8}`
  const cached = queryCache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.results

  // Cancel previous request
  if (currentController) {
    try { currentController.abort() } catch {}
  }
  currentController = new AbortController()

  const params = new URLSearchParams()
  params.set('access_token', token)
  params.set('autocomplete', 'true')
  params.set('types', 'place,locality')
  params.set('language', 'en')
  params.set('limit', String(opts?.limit ?? 8))
  params.set('session_token', getSessionToken())
  if (opts?.country) params.set('country', opts.country)

  const url = `${MAPBOX_BASE}/${encodeURIComponent(q)}.json?${params.toString()}`
  const res = await fetch(url, { signal: currentController.signal })
  if (!res.ok) return []
  const data: { features: MapboxFeature[] } = await res.json()

  const results: CitySuggestion[] = (data.features ?? []).map((f) => {
    const countryCtx = f.context?.find((c) => c.id.startsWith('country'))
    const countryCode = countryCtx?.short_code
    const country = countryCtx?.text || ''
    const [lng, lat] = f.center
    return {
      id: f.id,
      text: f.text,
      city: f.text,
      country,
      countryCode,
      placeName: f.place_name,
      longitude: lng,
      latitude: lat,
    }
  })

  // Deduplicate by placeName
  const unique = Array.from(new Map(results.map((r) => [r.placeName, r])).values())

  queryCache.set(key, { ts: Date.now(), results: unique })
  return unique
}
