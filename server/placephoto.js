// 장소 사진 — 한국관광공사 국문 관광정보(TourAPI) 의 대표 이미지(firstimage)를 장소마다 찾아 줍니다.
// ① 장소 이름(PHOTO_QUERY)으로 키워드 검색 → ② 못 찾으면 장소 좌표 주변(위치기반)에서 찾습니다.
// 관광지·문화시설만, 제목이 장소 이름과 맞고 좌표가 가까운 것을 고릅니다. 결과는 6시간 보관합니다.
import { PLACES } from '../src/data/places.js'
import { PHOTO_QUERY } from '../src/data/photoQuery.js'
import { distanceKm } from '../src/lib/geo.js'
import { nearbyTour, searchTour } from './tour.js'

const MAX_KM = 8
const NEAR_M = 3000
const TTL = 6 * 60 * 60 * 1000
// 사진으로 쓸 종류: 12 관광지, 14 문화시설. (음식점 39, 숙박 32, 쇼핑 38 은 이름에 '성산일출봉'·'한라산'이 들어가도 장소 사진이 아니라서 제외)
const TYPES = ['12', '14']
let cache = null

const norm = (s) => String(s ?? '').replace(/[\s·()[\]\-.]/g, '')

// 후보 항목이 쓸 만한지: 종류·좌표·제목 조건. 이유를 돌려줘 진단에 씁니다.
function judge(place, it, kws) {
  if (!TYPES.includes(String(it.type))) return 'type'
  if (!Number.isFinite(it.lat) || !Number.isFinite(it.lng)) return 'coord'
  const km = distanceKm(place, it)
  if (km > MAX_KM) return 'far'
  if (!kws.some((kw) => norm(it.title).includes(norm(kw)))) return 'title'
  if (!it.image) return 'noimage'
  return { it, km }
}

async function findFor(place) {
  const kws = PHOTO_QUERY[place.id] ?? [place.name]
  const cands = []
  const seen = []                      // 진단: 검색에서 본 제목과 버려진 이유
  let ok = 0
  let lastErr = null
  const take = (list, via) => {
    for (const it of list) {
      const j = judge(place, it, kws)
      if (typeof j === 'string') { if (seen.length < 12) seen.push(`${it.title}(${j})`); continue }
      cands.push({ ...j, via })
    }
  }
  // 호출 횟수(일일 한도)를 아끼려고, 후보를 찾으면 거기서 멈춥니다
  search: for (const kw of kws) {
    for (const type of TYPES) {
      try {
        take(await searchTour({ keyword: kw, contentTypeId: type, rows: 30 }), 'keyword')
        ok += 1
      } catch (e) { lastErr = e }
      if (cands.length > 0) break search
    }
  }
  // 이름 검색으로 못 찾았으면 장소 좌표 주변에서 한 번 더 — 제목 조건은 그대로 지킵니다
  if (!cands.length) {
    for (const type of TYPES) {
      try {
        take(await nearbyTour({ lat: place.lat, lng: place.lng, radius: NEAR_M, contentTypeId: type, rows: 40 }), 'nearby')
        ok += 1
      } catch (e) { lastErr = e }
      if (cands.length > 0) break
    }
  }
  if (!ok && lastErr) throw lastErr          // 키가 없거나 호출이 막힌 경우는 '사진 없음'과 구분합니다
  cands.sort((a, b) => a.km - b.km)
  const best = cands[0]
  const photo = best ? { src: best.it.image, title: best.it.title, copyright: best.it.copyright || '', km: Math.round(best.km * 10) / 10 } : null
  return { photo, seen, via: best?.via }
}

export async function placePhotos({ force = false, debug = false } = {}) {
  if (!force && !debug && cache && Date.now() - cache.at < TTL) return cache.value
  const photos = {}
  const unmatched = {}
  const queue = [...PLACES]
  let firstError = null
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const p = queue.shift()
      try {
        const f = await findFor(p)
        if (f.photo) photos[p.id] = f.photo
        else unmatched[p.id] = f.seen
      } catch (e) { firstError ??= e }
    }
  }))
  if (firstError && Object.keys(photos).length === 0) throw firstError
  const value = { total: PLACES.length, matched: Object.keys(photos).length, photos }
  cache = { at: Date.now(), value }
  // 못 찾은 장소와, 검색에서 보인 제목·버려진 이유(type/far/title/noimage) — ?debug=1 로만 내보냅니다
  return debug ? { ...value, unmatched } : value
}
