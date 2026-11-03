import { khsPhotos } from '../server/khsphoto.js'

// GET /api/khsphoto  — 국가유산청 국가유산 이미지(키 없음) { total, matched, photos: { 장소id: { src, title, heritage, nuri } } }
export default async function handler(req, res) {
  try {
    res.setHeader?.('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400')
    res.status(200).json(await khsPhotos({ force: req.query.refresh === '1' }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
