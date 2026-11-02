import { nearbyTour, searchTour } from '../server/tour.js'

// /api/tour?lat=33.5&lng=126.5&radius=8000   → 내 주변(위치기반)
// /api/tour?keyword=돌담                      → 키워드 검색
export default async function handler(req, res) {
  try {
    const { lat, lng, radius, keyword, type = '' } = req.query
    const data = lat && lng
      ? await nearbyTour({ lat: Number(lat), lng: Number(lng), radius: Number(radius) || 10000, contentTypeId: type })
      : await searchTour({ keyword, contentTypeId: type })
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
