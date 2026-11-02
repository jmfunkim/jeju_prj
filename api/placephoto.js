import { placePhotos } from '../server/placephoto.js'

// GET /api/placephoto  — 장소별 한국관광공사 대표 사진 { total, matched, photos: { 장소id: { src, title, copyright } } }
export default async function handler(req, res) {
  try {
    res.status(200).json(await placePhotos({ force: req.query.refresh === '1' }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
