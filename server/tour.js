// 한국관광공사 TourAPI (국문 관광정보 서비스 KorService2)
// - nearbyTour : 위치기반 조회(locationBasedList2) — 내 좌표 주변의 관광지·문화시설
// - searchTour : 키워드 검색(searchKeyword2) — 제주(areaCode 39) 안에서
const BASE = 'https://apis.data.go.kr/B551011/KorService2'

function baseParams(rows) {
  return new URLSearchParams({
    serviceKey: process.env.DATA_GO_KR_KEY, // ★ Decoding 키
    MobileOS: 'ETC',
    MobileApp: 'TamnaNotebook',
    _type: 'json',
    numOfRows: String(rows),
    pageNo: '1',
  })
}

// 관광공사 이미지 주소는 http 로 오는 경우가 있어, https 로 열리는 화면에서 막히지 않게 바꿔 둡니다.
const secure = (u) => (String(u ?? '').startsWith('http://') ? 'https://' + String(u).slice(7) : String(u ?? ''))

async function call(op, params) {
  if (!process.env.DATA_GO_KR_KEY) throw new Error('DATA_GO_KR_KEY 가 설정되지 않았어요 (.env.local 확인)')
  const r = await fetch(`${BASE}/${op}?${params}`)
  const text = await r.text()
  let data
  try { data = JSON.parse(text) } catch { throw new Error('TourAPI 응답이 JSON이 아님: ' + text.slice(0, 120)) }
  const item = data?.response?.body?.items?.item
  const list = !item ? [] : Array.isArray(item) ? item : [item]
  return list.map((p) => ({
    id: p.contentid, title: p.title, addr: p.addr1, image: secure(p.firstimage), copyright: p.cpyrhtDivCd || '',
    lng: Number(p.mapx), lat: Number(p.mapy), type: p.contenttypeid,
    distM: p.dist ? Math.round(Number(p.dist)) : undefined,   // 위치기반 조회일 때만: 내 위치와의 거리(m)
  }))
}

export function nearbyTour({ lat, lng, radius = 10000, contentTypeId = '', rows = 12 } = {}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('lat, lng 가 필요해요')
  const params = baseParams(rows)
  params.set('mapX', String(lng))
  params.set('mapY', String(lat))
  params.set('radius', String(Math.min(20000, radius)))   // 최대 20km
  if (contentTypeId) params.set('contentTypeId', contentTypeId)
  return call('locationBasedList2', params)
}

export function searchTour({ keyword = '', contentTypeId = '', rows = 12 } = {}) {
  const params = baseParams(rows)
  params.set('areaCode', '39')   // 39 = 제주
  if (contentTypeId) params.set('contentTypeId', contentTypeId)
  params.set('keyword', keyword)
  return call('searchKeyword2', params)
}
