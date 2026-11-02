import { historyPlaces } from '../server/history.js'

// GET /api/history?page=&perPage=   — 제주역사문화위치정보(공공데이터포털)
export default async function handler(req, res) {
  try {
    res.status(200).json(await historyPlaces({ page: Number(req.query.page) || 1, perPage: Number(req.query.perPage) || 100 }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
