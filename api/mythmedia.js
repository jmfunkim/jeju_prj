import { listMythMedia } from '../server/jejugo.js'

// GET /api/mythmedia  — 제주신화정보의 사진·삽화·애니메이션/동영상 장면 { total, forms, items:[{ title, form, type, credit, date, image }] }
export default async function handler(req, res) {
  try {
    res.status(200).json(await listMythMedia())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
