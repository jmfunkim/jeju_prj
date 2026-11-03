// 장소 이용 정보 — 한국관광공사 TourAPI 소개정보 조회(detailIntro2)의 쉬는 날·이용 시간·요금·문의.
// 전시·기념관처럼 운영 시간이 있는 장소(walk.js 의 visit: true)만 찾아요.
// ① 장소 이름(PHOTO_QUERY)으로 TourAPI 에서 같은 곳을 찾고(사진 찾기와 같은 조건, 이미지는 없어도 됨) ② 그 항목의 소개정보를 읽어요.
// 필드 이름이 종류마다 달라서(관광지 restdate·usetime, 문화시설 restdateculture·usetimeculture …) 이름의 앞부분으로 찾습니다.
// 결과는 24시간 보관합니다. ?debug=1 이면 못 찾은 장소와 응답에서 본 필드 이름을 함께 줘요.
import { PLACES } from '../src/data/places.js'
import { PHOTO_QUERY } from '../src/data/photoQuery.js'
import { walkInfo } from '../src/data/walk.js'
import { judge } from './placephoto.js'
import { introTour, nearbyTour, searchTour } from './tour.js'

const TTL = 24 * 60 * 60 * 1000
const TYPES = ['12', '14']
const NEAR_M = 3000
let cache = null

// HTML 줄바꿈·태그를 걷어 내고 읽기 좋게 — <br> 은 ' / ' 로
const text = (v) => String(v ?? '')
  .replace(/<br\s*\/?>/gi, ' / ').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s*\/\s*(\/\s*)+/g, ' / ').replace(/\s+/g, ' ').replace(/^[\s/]+|[\s/]+$/g, '').slice(0, 240)
const EMPTY = /^(없음|해당\s*없음|-+|null)$/i

// 이름이 prefix 로 시작하는 첫 번째 비어 있지 않은 값 (예: restdate / restdateculture)
function pick(intro, re) {
  for (const [k, v] of Object.entries(intro)) {
    if (re.test(k)) { const t = text(v); if (t && !EMPTY.test(t)) return t }
  }
  return ''
}

async function findItem(place) {
  const kws = PHOTO_QUERY[place.id] ?? [place.name]
  const cands = []
  const take = (list) => { for (const it of list) { const j = judge(place, it, kws, false); if (typeof j !== 'string') cands.push(j) } }
  let ok = 0
  let lastErr = null
  search: for (const kw of kws) {
    for (const type of TYPES) {
      try { take(await searchTour({ keyword: kw, contentTypeId: type, rows: 30 })); ok += 1 } catch (e) { lastErr = e }
      if (cands.length) break search
    }
  }
  if (!cands.length) {
    for (const type of TYPES) {
      try { take(await nearbyTour({ lat: place.lat, lng: place.lng, radius: NEAR_M, contentTypeId: type, rows: 40 })); ok += 1 } catch (e) { lastErr = e }
      if (cands.length) break
    }
  }
  if (!ok && lastErr) throw lastErr
  cands.sort((a, b) => a.km - b.km)
  return cands[0]?.it ?? null
}

export async function placeInfo({ force = false, debug = false } = {}) {
  if (!force && !debug && cache && Date.now() - cache.at < TTL) return cache.value
  const targets = PLACES.filter((p) => walkInfo(p.id).visit)
  const info = {}
  const unmatched = {}
  const fields = {}
  const queue = [...targets]
  let firstError = null
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const p = queue.shift()
      try {
        const it = await findItem(p)
        if (!it) { unmatched[p.id] = 'TourAPI 에서 같은 곳을 못 찾았어요'; continue }
        const intro = await introTour({ contentId: it.id, contentTypeId: it.type })
        if (!intro) { unmatched[p.id] = '소개정보가 비어 있어요'; continue }
        fields[p.id] = Object.keys(intro).filter((k) => String(intro[k] ?? '').trim())
        const out = {
          rest: pick(intro, /^restdate/i),
          hours: pick(intro, /^usetime(?!festival)/i),
          fee: pick(intro, /^usefee/i),
          tel: pick(intro, /^infocenter/i),
          title: it.title,
        }
        if (out.rest || out.hours || out.fee) info[p.id] = out
        else unmatched[p.id] = '쉬는 날·이용 시간이 비어 있어요'
      } catch (e) { firstError ??= e }
    }
  }))
  if (firstError && Object.keys(info).length === 0 && Object.keys(unmatched).length === 0) throw firstError
  const value = { total: targets.length, matched: Object.keys(info).length, info }
  cache = { at: Date.now(), value }
  return debug ? { ...value, unmatched, fields } : value
}
