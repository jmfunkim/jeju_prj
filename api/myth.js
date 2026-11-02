import { listMyth } from '../server/jejugo.js'

// GET /api/myth?keyword=&type=   — 제주 신화 콘텐츠(제주도청)
export default async function handler(req, res) {
  try {
    res.status(200).json(await listMyth({ keyword: req.query.keyword, type: req.query.type, limit: Number(req.query.limit) || 40 }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
