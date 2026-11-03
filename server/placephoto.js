// 장소 사진 — 한국관광공사 국문 관광정보(TourAPI) 의 대표 이미지(firstimage)를 장소마다 찾아 줍니다.
// 장소 이름(PHOTO_QUERY)으로 키워드 검색 → 관광지·문화시설만, 좌표가 가깝고 제목이 장소 이름과 맞는 것을 고릅니다. 결과는 6시간 보관합니다.
import { PLACES } from '../src/data/places.js'
import { PHOTO_QUERY } from '../src/data/photoQuery.js'
import { distanceKm } from '../src/lib/geo.js'
import { searchTour } from './tour.js'

const MAX_KM = 8
const TTL = 6 * 60 * 60 * 1000
// 사진으로 쓸 종류: 12 관광지, 14 문화시설. (음식점 39, 숙박 32, 쇼핑 38 은 이름에 '성산일출봉'·'한라산'이 들어가도 장소 사진이 아니라서 제외)
const TYPES = ['12', '14']
let cache = null

const norm = (s) => String(s ?? '').replace(/[\s·()[\]\-.]/g, '')

async function findFor(place) {
  const kws = PHOTO_QUERY[place.id] ?? [place.name]
  const cands = []
  let ok = 0
  let lastErr = null
  // 호출 횟수(일일 한도)를 아끼려고, 후보를 찾으면 거기서 멈춥니다
  search: for (const kw of kws) {
    for (const type of TYPES) {
      try {
        const list = await searchTour({ keyword: kw, contentTypeId: type, rows: 30 })
        ok += 1
        for (const it of list) {
          if (!TYPES.includes(String(it.type))) continue   // 서버가 종류 조건을 무시해도 음식점·숙박은 걸러요
          if (!it.image || !Number.isFinite(it.lat) || !Number.isFinite(it.lng)) continue
          const km = distanceKm(place, it)
          if (km > MAX_KM) continue
          if (!norm(it.title).includes(norm(kw))) continue   // 제목이 장소 이름과 맞는 항목만 — 근처의 다른 곳 사진은 쓰지 않아요
          cands.push({ it, km })
        }
      } catch (e) { lastErr = e }
      if (cands.length > 0) break search
    }
  }
  if (!ok && lastErr) throw lastErr          // 키가 없거나 호출이 막힌 경우는 '사진 없음'과 구분합니다
  cands.sort((a, b) => a.km - b.km)
  const best = cands[0]
  return best ? { src: best.it.image, title: best.it.title, copyright: best.it.copyright || '', km: Math.round(best.km * 10) / 10 } : null
}

export async function placePhotos({ force = false } = {}) {
  if (!force && cache && Date.now() - cache.at < TTL) return cache.value
  const photos = {}
  const queue = [...PLACES]
  let firstError = null
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const p = queue.shift()
      try {
        const f = await findFor(p)
        if (f) photos[p.id] = f
      } catch (e) { firstError ??= e }
    }
  }))
  if (firstError && Object.keys(photos).length === 0) throw firstError
  const value = { total: PLACES.length, matched: Object.keys(photos).length, photos }
  cache = { at: Date.now(), value }
  return value
}
