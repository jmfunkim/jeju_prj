import { dataKey } from './key.js'

// 제주특별자치도_제주역사문화일반정보 (공공데이터포털 odcloud, 데이터 15109587)
// 장소마다 제목·부제목·초록·내용 같은 '설명 글'이 들어 있어, 위치정보(15109570)의 이름·주소만으로는 모자란 부분을 채웁니다.
// 인증은 위치정보와 같은 DATA_GO_KR_KEY. (활용신청이 따로 필요할 수 있어요)
const URL_BASE = 'https://api.odcloud.kr/api/15109587/v1/uddi:56c2b3a4-4b4b-46cd-a1fa-f928ef731ffb'
const TTL = 6 * 60 * 60 * 1000
let cache = null

// HTML 태그·엔티티를 걷어 내고 공백을 정리합니다
const clean = (s) => String(s ?? '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim()

// 데이터 제작자가 빈 칸에 적어 둔 자리표시 값('해당없음' 등)은 빈 값으로 봅니다
const EMPTY = /^(해당\s*없음|없음|미상|n\/?a|null|-+)$/i
const text = (s) => { const v = clean(s); return EMPTY.test(v) ? '' : v }

// 링크는 http(s) 로 시작하는 것만 — 다른 값(폴더 이름 등)이 들어 있어도 버튼으로 만들지 않습니다
const url = (s) => (/^https?:\/\//i.test(String(s ?? '').trim()) ? String(s).trim() : '')

async function page(n, perPage) {
  const params = new URLSearchParams({ page: String(n), perPage: String(perPage), serviceKey: dataKey() })
  const r = await fetch(`${URL_BASE}?${params}`, { signal: AbortSignal.timeout(20000) })
  const text = await r.text()
  let data
  try { data = JSON.parse(text) } catch { throw new Error('역사문화일반정보 응답이 JSON이 아님: ' + text.slice(0, 100)) }
  if (!r.ok) throw new Error(`역사문화일반정보 응답 ${r.status}: ${data.msg || '알 수 없는 오류'}${r.status === 401 ? ' — 인증키가 맞는지, 제주역사문화일반정보(15109587) 활용신청이 승인됐는지 확인하세요' : ''}`)
  return data
}

export async function historyInfo({ force = false } = {}) {
  if (!dataKey()) throw new Error('DATA_GO_KR_KEY 가 설정되지 않았어요 (.env.local 확인)')
  if (!force && cache && Date.now() - cache.at < TTL) return cache.value
  const PER = 500
  const rows = []
  let total = Infinity
  for (let n = 1; rows.length < total && n <= 10; n += 1) {
    const d = await page(n, PER)
    total = d.totalCount ?? 0
    rows.push(...(d.data ?? []))
    if (!(d.data ?? []).length) break
  }
  const items = rows
    .map((d) => ({
      name: text(d['장소명']),
      title: text(d['제목']),
      subtitle: text(d['부제목']),
      category: text(d['분류']),
      summary: text(d['초록']),
      content: text(d['내용']),
      source: text(d['출처']) || text(d['발행자']),
      link: url(d['링크']),
      lat: Number(d['위도']),
      lng: Number(d['경도']),
    }))
    .filter((p) => (p.name || p.title) && (p.summary || p.content))
  const value = { total: rows.length, matched: items.length, items }
  cache = { at: Date.now(), value }
  return value
}
