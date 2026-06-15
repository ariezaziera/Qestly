// Haversine distance in km
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const DISTANCE_RANGES = [
  { value: 'all', label: 'Any distance', max: Infinity },
  { value: '10',  label: 'Within 10 km', max: 10  },
  { value: '25',  label: 'Within 25 km', max: 25  },
  { value: '50',  label: 'Within 50 km', max: 50  },
  { value: '100', label: 'Within 100 km', max: 100 },
] as const