// 제주특별자치도(jeju.go.kr) 공공 API 두 가지 — 둘 다 인증키가 필요 없습니다.
//  · 제주 신화 콘텐츠  : XML  /rest/JejuMythContents/getJejuMythContentsList  (조건 파라미터를 무시하고 전체 182건을 줌 → 여기서 걸러요)
//    응답의 pdfUrl 은 직접 열면 404 라서 도청 문서뷰어 주소로 바꿔 쓰고, ebookUrl 은 모두 404 라 쓰지 않습니다.
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

// 응답의 pdfUrl(files/board/<uuid>.pdf)은 직접 열면 404 라서, 도청 문서뷰어로 엽니다.
// 뷰어는 변환본을 /files/convert2020/201708/<uuid>.pdf.* 에서 읽어 와요 (182건 모두 201708 폴더에 있음을 확인).
const VIEWER = 'https://www.jeju.go.kr/pub/skin/skin_2022.25.10.2/doc.html'
const pdfView = (v) => {
  const m = /\/([0-9a-f-]{36}\.pdf)$/i.exec(String(v ?? '').trim())
  return m ? `${VIEWER}?fn=${m[1]}&rs=/files/convert2020/201708/` : ''
}

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
      pdf: pdfView(i.pdfUrl),
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
// 끝에 / 가 없으면 307 로 한 번 되돌려 보내므로 처음부터 붙입니다
const RELIC_URL = 'https://www.jeju.go.kr/api/jejustonepark/have/'

async function relicPage(page) {
  // 한 번 실패하면(일시 오류·차단 응답) 잠깐 뒤 한 번 더 시도해요
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await fetch(`${RELIC_URL}?page=${page}`, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; dolbit-jeju)', accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      })
      const text = await r.text()
      let data
      try { data = JSON.parse(text) } catch { throw new Error(`돌문화공원 API 응답이 JSON이 아니에요 (${r.status}).`) }
      if (data.error) throw new Error(data.errorMsg || '돌문화공원 API 오류')
      return data
    } catch (e) {
      if (attempt >= 1) throw e
      await new Promise((ok) => setTimeout(ok, 400))
    }
  }
}

// 도청 API 를 읽지 못하면 저장본(server/data/relics.js)으로 대신 답해서 화면이 비지 않게 해요
function loadRelics() {
  return cached('relics', async () => {
    try {
      const first = await relicPage(1)
      const pages = Math.ceil(first.total / (first.pageSize || 9))
      const rest = []
      for (let p = 2; p <= pages; p += 3) {   // 도청 서버에 한꺼번에 몰리지 않게 세 쪽씩
        rest.push(...await Promise.all(Array.from({ length: Math.min(3, pages - p + 1) }, (_, i) => relicPage(p + i))))
      }
      const items = [first, ...rest].flatMap((p) => p.items).map((i) => ({
        name: i.name, age: i.historicAge, material: i.material, source: i.source, desc: i.desc,
      }))
      return { items, snapshot: false }
    } catch (e) {
      console.warn('[stonepark] 도청 API 실패, 저장본 사용:', e.message)
      const { default: items } = await import('./data/relics.js')
      return { items, snapshot: true }
    }
  })
}

export async function listRelics({ keyword = '', material = '', age = '' } = {}) {
  const { items: all, snapshot } = await loadRelics()
  const k = keyword.trim()
  const items = all.filter((r) => (!material || r.material === material) && (!age || r.age === age) && (!k || r.name.includes(k) || (r.desc ?? '').includes(k)))
  const uniq = (key) => [...new Set(all.map((r) => r[key]).filter(Boolean))]
  return { total: all.length, matched: items.length, snapshot, materials: uniq('material'), ages: uniq('age'), items }
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
