import { placeInfo } from '../server/placeinfo.js'

// GET /api/placeinfo  — 전시·기념관의 쉬는 날·이용 시간(한국관광공사 TourAPI) { total, matched, info: { 장소id: { rest, hours, fee, tel, title } } }
//   ?debug=1 : 못 찾은 장소(unmatched)와 응답 필드 이름(fields)도 함께
export default async function handler(req, res) {
  try {
    const out = await placeInfo({ force: req.query.refresh === '1', debug: req.query.debug === '1' })
    // Vercel 서버 함수는 메모리가 공유되지 않으니 응답 자체를 하루 캐시해 일일 호출 한도를 아낍니다
    res.setHeader?.('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400')
    res.status(200).json(out)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
