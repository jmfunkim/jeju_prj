import { listRelics } from '../server/jejugo.js'

// GET /api/stonepark?keyword=&material=&age=   — 제주돌문화공원 소장 유물(제주도청)
export default async function handler(req, res) {
  try {
    res.status(200).json(await listRelics({ keyword: req.query.keyword, material: req.query.material, age: req.query.age }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
