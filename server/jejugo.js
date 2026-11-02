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
