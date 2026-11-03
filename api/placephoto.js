import { placePhotos } from '../server/placephoto.js'

// GET /api/placephoto  — 장소별 한국관광공사 대표 사진 { total, matched, photos: { 장소id: { src, title, copyright } } }
export default async function handler(req, res) {
  try {
    const out = await placePhotos({ force: req.query.refresh === '1', debug: req.query.debug === '1' })
    // Vercel 에서는 서버 함수가 여러 개로 떠서 메모리 보관이 서로 공유되지 않으므로, 응답 자체를 6시간 캐시해 일일 호출 한도를 아낍니다
    res.setHeader?.('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400')
    res.status(200).json(out)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
