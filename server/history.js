import { dataKey } from './key.js'

// 제주특별자치도_제주역사문화위치정보 (공공데이터포털 odcloud, 데이터 15109570)
// 인증: DATA_GO_KR_KEY(Decoding 키)를 serviceKey 쿼리로 보냅니다.
const URL_BASE = 'https://api.odcloud.kr/api/15109570/v1/uddi:8781448b-81a8-487c-bc95-d26335bafa82'

export async function historyPlaces({ page = 1, perPage = 100 } = {}) {
  if (!dataKey()) throw new Error('DATA_GO_KR_KEY 가 설정되지 않았어요 (.env.local 확인)')
  const params = new URLSearchParams({ page: String(page), perPage: String(Math.min(500, perPage)), serviceKey: dataKey() })
  const r = await fetch(`${URL_BASE}?${params}`, { signal: AbortSignal.timeout(20000) })
  const text = await r.text()
  let data
  try { data = JSON.parse(text) } catch { throw new Error('역사문화위치정보 응답이 JSON이 아님: ' + text.slice(0, 100)) }
  if (!r.ok) throw new Error(`역사문화위치정보 응답 ${r.status}: ${data.msg || '알 수 없는 오류'}${r.status === 401 ? ' — 인증키가 맞는지, 공공데이터포털에서 제주역사문화위치정보(15109570) 활용신청이 승인됐는지 확인하세요' : ''}`)
  const items = (data.data ?? [])
    .map((d) => ({
      id: d['데이터 고유번호'], name: d['장소명'], addr: d['위치'], url: d['데이터 상세보기 URL'],
      lat: Number(d['위도']), lng: Number(d['경도']),
    }))
    // 좌표가 비었거나 제주 밖이면 지도에 못 그리므로 걸러냅니다.
    .filter((p) => p.name && p.lat > 33 && p.lat < 34 && p.lng > 126 && p.lng < 127.2)
  return { total: data.totalCount ?? items.length, page: data.page ?? page, items }
}
