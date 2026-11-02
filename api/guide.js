import { askGuide } from '../server/guide.js'

// GET /api/guide?q=질문&lat=&lng=   (lat/lng 가 없으면 제주시청 부근에서 출발)
export default async function handler(req, res) {
  try {
    const lat = Number(req.query.lat)
    const lng = Number(req.query.lng)
    const start = Number.isFinite(lat) && Number.isFinite(lng) && req.query.lat !== '' && req.query.lng !== ''
      ? { lat, lng }
      : { lat: 33.4996, lng: 126.5312, demo: true }
    res.status(200).json(await askGuide({ question: req.query.q, start }))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}
