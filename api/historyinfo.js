import { historyInfo } from '../server/historyinfo.js'

// GET /api/historyinfo  — 제주역사문화일반정보(공공데이터포털): 장소별 설명 글
export default async function handler(req, res) {
  try {
    // Vercel 에서는 함수 메모리 보관이 공유되지 않으므로 응답 자체를 캐시해 호출 한도를 아낍니다
    res.setHeader?.('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400')
    res.status(200).json(await historyInfo({ force: req.query.refresh === '1' }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
