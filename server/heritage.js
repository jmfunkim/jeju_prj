// 국가유산청 국가유산 검색 오픈API (키 불필요, XML 응답) — 제주(ccbaCtcd 50)의 국가유산
// 목록(SearchKindOpenapiList)에는 '제주시' 같은 시 단위만 있어서, 지역명(읍·면·동)은 상세(SearchKindOpenapiDt)의
// 소재지(ccbaLcad)에서 뽑습니다. 상세는 항목마다 한 번씩 부르므로 하루 동안 보관해요.
import { XMLParser } from 'fast-xml-parser'
const parser = new XMLParser({ parseTagValue: false })

const BASE = 'https://www.khs.go.kr/cha'
const TTL = 24 * 60 * 60 * 1000
const regionCache = new Map()   // `${kdcd}:${asno}` → { at, region }

const text = async (url) => (await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000) })).text()

// 소재지 글에서 '제주시 삼도이동'·'서귀포시 대정읍 상모리' 같은 지역명만 뽑아요. 지번 주소가 있으면 그쪽이 더 믿을 만해요.
export function regionOf(lcad, fallback = '') {
  const s = String(lcad ?? '')
  const jibun = s.includes('(지번)') ? s.slice(s.indexOf('(지번)')) : ''
  for (const part of [jibun, s]) {
    const m = /(제주시|서귀포시)\s+([가-힣0-9]+(?:읍|면|동))(?:\s+([가-힣0-9]+리))?/.exec(part)
    if (m) return [m[1], m[2], m[3]].filter(Boolean).join(' ')
  }
  const paren = /\(([가-힣0-9]+(?:읍|면|동|리))\)/.exec(s)?.[1]   // '… (삼도이동)'
  return paren ? [fallback, paren].filter(Boolean).join(' ') : fallback
}

async function regionFor(h) {
  const key = `${h.ccbaKdcd}:${h.ccbaAsno}`
  const hit = regionCache.get(key)
  if (hit && Date.now() - hit.at < TTL) return hit.region
  let region = h.ccsiName ?? ''
  try {
    const q = new URLSearchParams({ ccbaKdcd: h.ccbaKdcd, ccbaAsno: h.ccbaAsno, ccbaCtcd: h.ccbaCtcd ?? '50' })
    const dt = parser.parse(await text(`${BASE}/SearchKindOpenapiDt.do?${q}`))
    region = regionOf(dt?.result?.item?.ccbaLcad, region)
  } catch { /* 상세가 안 되면 시 이름만 보여요 */ }
  regionCache.set(key, { at: Date.now(), region })
  return region
}

export async function searchHeritage({ keyword = '', rows = 12 } = {}) {
  const params = new URLSearchParams({ ccbaCtcd: '50', pageUnit: String(rows), pageIndex: '1' })
  if (keyword) params.set('ccbaMnm1', keyword)
  const data = parser.parse(await text(`${BASE}/SearchKindOpenapiList.do?${params}`))
  const item = data?.result?.item
  const list = !item ? [] : Array.isArray(item) ? item : [item]
  const regions = await Promise.all(list.map(regionFor))
  return list.map((h, i) => ({
    name: h.ccbaMnm1, kind: h.ccmaName, city: regions[i],
    lat: Number(h.latitude) || null, lng: Number(h.longitude) || null,
  }))
}
