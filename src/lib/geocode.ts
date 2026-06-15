interface GeocodeResult {
  latitude: number
  longitude: number
  isRemote: boolean
}

export async function geocodeLocation(location: string | null): Promise<GeocodeResult | null> {
  if (!location) return null

  const trimmed = location.trim()

  // Detect remote
  if (/^remote$/i.test(trimmed) || /\bremote\b/i.test(trimmed) && trimmed.length < 12) {
    return { latitude: 0, longitude: 0, isRemote: true }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(trimmed)}`,
      {
        headers: {
          // Nominatim requires a User-Agent identifying the app
          'User-Agent': 'JobRadar/1.0 (job application tracker)',
        },
      }
    )

    if (!res.ok) return null
    const data = await res.json()
    if (!data?.length) return null

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      isRemote: false,
    }
  } catch {
    return null
  }
}