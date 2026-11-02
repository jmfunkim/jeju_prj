// 제주특별자치도(jeju.go.kr) 공공 API 두 가지 — 둘 다 인증키가 필요 없습니다.
//  · 제주 신화 콘텐츠  : XML  /rest/JejuMythContents/getJejuMythContentsList  (조건 파라미터를 무시하고 전체 182건을 줌 → 여기서 걸러요)
//    응답의 ebookUrl·pdfUrl 은 모두 도청의 '페이지 없음' 화면으로 가서(364개 확인) 쓰지 않습니다.
//  · 돌문화공원 소장유물: JSON /api/jejustonepark/have                          (한 페이지 9건 고정 → 전체 페이지를 모아요)
import { XMLParser } from 'fast-xml-parser'

const HOUR = 60 * 60 * 1000
const cache = {}
async function cached(key, loader) {
  const hit = cache[key]
  if (hit && Date.now() - hit.at < HOUR) return hit.value
  const value = await loader()
  cache[key] = { at: Date.now(), value }
  return value
}

async function getText(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!r.ok) throw new Error(`제주도 API 응답 ${r.status}`)
  return r.text()
}

// ── 신화 ────────────────────────────────────────────────
const MYTH_URL = 'https://www.jeju.go.kr/rest/JejuMythContents/getJejuMythContentsList?pageSize=500'

function loadMyth() {
  return cached('myth', async () => {
    const xml = await getText(MYTH_URL)
    const api = new XMLParser({ parseTagValue: false }).parse(xml)?.jejunetApi
    if (!api || api.error === 'true') throw new Error('신화 API가 오류를 돌려줬어요.')
    const raw = api.items?.item
    const list = !raw ? [] : Array.isArray(raw) ? raw : [raw]
    return list.map((i) => ({
      code: i.codeNo, type: i.type, title: String(i.title ?? '').trim(),
      tags: String(i.tag ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    }))
  })
}

export async function listMyth({ keyword = '', type = '', limit = 40 } = {}) {
  const all = await loadMyth()
  const k = keyword.trim()
  const hit = all.filter((m) => (!type || m.type === type) && (!k || m.title.includes(k) || m.tags.some((t) => t.includes(k))))
  const types = [...new Set(all.map((m) => m.type))]
  return { total: all.length, matched: hit.length, types, items: hit.slice(0, Math.min(200, limit)) }
}

// ── 돌문화공원 소장유물 ─────────────────────────────────
const RELIC_URL = 'https://www.jeju.go.kr/api/jejustonepark/have'

async function relicPage(page) {
  const text = await getText(`${RELIC_URL}?page=${page}`)
  let data
  try { data = JSON.parse(text) } catch { throw new Error('돌문화공원 API 응답이 JSON이 아니에요.') }
  if (data.error) throw new Error(data.errorMsg || '돌문화공원 API 오류')
  return data
}

function loadRelics() {
  return cached('relics', async () => {
    const first = await relicPage(1)
    const pages = Math.ceil(first.total / (first.pageSize || 9))
    const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, i) => relicPage(i + 2)))
    return [first, ...rest].flatMap((p) => p.items).map((i) => ({
      name: i.name, age: i.historicAge, material: i.material, source: i.source, desc: i.desc,
    }))
  })
}

export async function listRelics({ keyword = '', material = '', age = '' } = {}) {
  const all = await loadRelics()
  const k = keyword.trim()
  const items = all.filter((r) => (!material || r.material === material) && (!age || r.age === age) && (!k || r.name.includes(k) || (r.desc ?? '').includes(k)))
  const uniq = (key) => [...new Set(all.map((r) => r[key]).filter(Boolean))]
  return { total: all.length, matched: items.length, materials: uniq('material'), ages: uniq('age'), items }
}

// ── 제주신화정보 이미지 자료 ─────────────────────────────
// 제주도청 OpenAPI 활용가이드 E09 '제주신화정보'(jejumythlist). 키 없이 쓰고, 사진·삽화·애니메이션 장면·동영상 장면의 이미지 주소(dataImageUrl)를 줍니다.
// 주소 끝에 / 가 없으면 307 로 한 번 되돌려 보내므로 처음부터 붙이고, pageSize 를 크게 줘서 182건을 한 번에 받아요.
// 전자책(책 표지)은 출판사 저작물이라 쓰지 않고, 도(제주특별자치도)가 낸 사진·삽화·애니메이션·동영상만 남깁니다.
const MEDIA_URL = 'https://www.jeju.go.kr/tool/openapi/jejumythservice/jejumythlist/?page=1&pageSize=500'
const MEDIA_FORMS = ['사진', '이미지', '애니메이션', '동영상']
const clean = (v) => String(v ?? '').trim()

function loadMythMedia() {
  return cached('mythmedia', async () => {
    const xml = await getText(MEDIA_URL)
    const res = new XMLParser({ parseTagValue: false }).parse(xml)?.response
    if (!res || clean(res.header?.resultCode) !== '0000') throw new Error('신화 이미지 자료가 오류를 돌려줬어요.')
    const raw = res.body?.items?.item
    const list = !raw ? [] : Array.isArray(raw) ? raw : [raw]
    return list
      .filter((i) => MEDIA_FORMS.includes(clean(i.dataForm)) && clean(i.dataImageUrl))
      .map((i) => ({
        title: clean(i.title), form: clean(i.dataForm), type: clean(i.dataType),
        credit: (clean(i.copyright) || clean(i.publisher)).replace('제주특벽', '제주특별'),   // 응답의 오타 하나를 바로잡음
        date: clean(i.recordDate),
        image: clean(i.dataImageUrl).replace(/^http:\/\//, 'https://'),
      }))
  })
}

export async function listMythMedia() {
  const items = await loadMythMedia()
  const forms = items.reduce((m, i) => ({ ...m, [i.form]: (m[i.form] ?? 0) + 1 }), {})
  return { total: items.length, forms, items }
}
