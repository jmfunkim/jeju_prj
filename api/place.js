import { khsPhotos } from '../server/khsphoto.js'
import { placeInfo } from '../server/placeinfo.js'
import { placePhotos } from '../server/placephoto.js'

// 장소에 붙는 정보 세 가지를 한 서버 함수로 모았어요.
// Vercel 무료(Hobby) 플랜은 서버 함수를 배포당 12개까지만 허용해서, api/ 파일 수를 늘리지 않으려는 거예요.
//
//   GET /api/place?kind=photo  한국관광공사 대표 사진 { total, matched, photos: { 장소id: { src, title, copyright } } }   (기본값)
//   GET /api/place?kind=info   전시·기념관의 쉬는 날·이용 시간 { total, matched, info: { 장소id: { rest, hours, fee, tel, title } } }
//   GET /api/place?kind=khs    국가유산청 국가유산 이미지(키 없음) { total, matched, photos: { 장소id: { src, title, heritage, nuri } } }
//   공통: ?refresh=1 캐시 무시 · ?debug=1 (photo·info) 못 찾은 장소와 이유
const KINDS = {
  // Vercel 서버 함수는 메모리가 서로 공유되지 않아서, 응답 자체를 캐시해 일일 호출 한도를 아낍니다
  photo: { run: (q) => placePhotos({ force: q.refresh === '1', debug: q.debug === '1' }), maxAge: 6 * 3600 },
  info: { run: (q) => placeInfo({ force: q.refresh === '1', debug: q.debug === '1' }), maxAge: 24 * 3600 },
  khs: { run: (q) => khsPhotos({ force: q.refresh === '1' }), maxAge: 24 * 3600 },
}

export default async function handler(req, res) {
  const kind = KINDS[req.query.kind ?? 'photo']
  if (!kind) return res.status(400).json({ error: 'kind 는 photo · info · khs 중 하나예요.' })
  try {
    const out = await kind.run(req.query)
    res.setHeader?.('Cache-Control', `s-maxage=${kind.maxAge}, stale-while-revalidate=86400`)
    res.status(200).json(out)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
