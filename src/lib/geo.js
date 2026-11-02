// 두 좌표 사이의 거리(km) — 하버사인 공식
export function distanceKm(a, b) {
  const R = 6371
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const fmtKm = (km) => (km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`)

// 제주시청 부근 — 위치 권한이 없을 때 쓰는 체험용 기준점
export const DEMO_ME = { lat: 33.4996, lng: 126.5312, demo: true }
