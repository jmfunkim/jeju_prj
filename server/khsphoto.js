// 장소 사진 — 국가유산청 '국가유산 이미지검색' OpenAPI (키 없음, XML)
//   목록 SearchKindOpenapiList.do 에서 국가유산을 찾고(종목코드·지정번호), SearchImageOpenapi.do 로 사진 목록을 받습니다.
// 이미지마다 공공누리 유형(imageNuri)이 달려 있어, 출처 표시만 하면 되는 A·B 유형만 씁니다 (변경·영리 금지가 아닌 것).
import { XMLParser } from 'fast-xml-parser'
import { KHS_PHOTO } from '../src/data/khsPhoto.js'

// 지정번호(ccbaAsno)는 앞의 0 이 의미 있어서 숫자로 바꾸지 않고 글자 그대로 읽습니다
const parser = new XMLParser({ parseTagValue: false })
const TTL = 24 * 60 * 60 * 1000
let cache = null

const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x])
const https = (u) => String(u ?? '').replace(/^http:\/\//, 'https://')

async function xml(url) {
  const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) })   // http → https 로 넘어가요
  return parser.parse(await r.text())
}

async function findFor(cfg) {
  const list = await xml(`https://www.khs.go.kr/cha/SearchKindOpenapiList.do?${new URLSearchParams({ ccbaCtcd: '50', pageUnit: '10', pageIndex: '1', ccbaMnm1: cfg.name })}`)
  const hits = arr(list?.result?.item).filter((x) => (cfg.exact ? x.ccbaMnm1 === cfg.name : String(x.ccbaMnm1).includes(cfg.name)))
  // 같은 이름의 지정(시도기념물·시도자연유산 등)이 여럿이면 사진이 있는 것이 나올 때까지 봅니다
  for (const h of hits) {
    const img = await xml(`https://www.khs.go.kr/cha/SearchImageOpenapi.do?${new URLSearchParams({ ccbaKdcd: h.ccbaKdcd, ccbaAsno: h.ccbaAsno, ccbaCtcd: '50' })}`)
    // 응답은 <item> 하나 안에 sn·imageUrl·ccimDesc 가 사진 수만큼 반복됩니다
    const it = arr(img?.result?.item)[0] ?? {}
    const urls = arr(it.imageUrl)
    const nuris = arr(it.imageNuri)
    const descs = arr(it.ccimDesc)
    const photos = urls
      .map((u, i) => ({ src: https(u), title: String(descs[i] ?? h.ccbaMnm1).trim(), nuri: String(nuris[i] ?? '') }))
      .filter((p) => /^[AB]/.test(p.nuri) && p.src)
    const pick = (cfg.prefer && photos.find((p) => cfg.prefer.test(p.title))) || photos[0]
    if (pick) return { ...pick, heritage: h.ccbaMnm1, first: !!cfg.first }
  }
  return null
}

export async function khsPhotos({ force = false } = {}) {
  if (!force && cache && Date.now() - cache.at < TTL) return cache.value
  const photos = {}
  const queue = Object.entries(KHS_PHOTO)
  let firstError = null
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const [id, cfg] = queue.shift()
      try {
        const f = await findFor(cfg)
        if (f) photos[id] = f
      } catch (e) { firstError ??= e }
    }
  }))
  if (firstError && Object.keys(photos).length === 0) throw firstError
  const value = { total: Object.keys(KHS_PHOTO).length, matched: Object.keys(photos).length, photos }
  cache = { at: Date.now(), value }
  return value
}
