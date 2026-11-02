// 화면이 우리 서버 함수(/api/...)를 부를 때 쓰는 함수 모음
// 공공데이터 API 는 브라우저에서 직접 부르지 않고 반드시 /api 를 거칩니다 (키 노출·CORS 방지).

async function get(path) {
  const r = await fetch(path)
  let data
  try { data = await r.json() } catch { throw new Error(`서버 응답이 JSON이 아님 (${r.status})`) }
  if (!r.ok) throw new Error(data.error || r.statusText)
  return data
}

export const ping = () => get('/api/hello')

// ① 한국관광공사 TourAPI — 내 주변(위치기반) / 키워드
export const fetchNearby = (lat, lng, radius = 10000, type = '') =>
  get(`/api/tour?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`)
export const fetchTourByKeyword = (keyword, type = '') =>
  get(`/api/tour?keyword=${encodeURIComponent(keyword)}&type=${type}`)

// ② 국가유산청 국가유산 (제주)
export const fetchHeritage = (keyword = '') => get(`/api/heritage?keyword=${encodeURIComponent(keyword)}`)

// ④ AI 가이드 (도구를 부르는 에이전트)
export const askGuide = (q, me) =>
  get(`/api/guide?q=${encodeURIComponent(q)}${me && !me.demo ? `&lat=${me.lat}&lng=${me.lng}` : ''}`)

// ⑤ 제주도청 공공 API (키 없음) — 신화 콘텐츠 / 돌문화공원 소장유물
export const fetchMyth = (keyword = '', type = '', limit = 40) =>
  get(`/api/myth?keyword=${encodeURIComponent(keyword)}&type=${encodeURIComponent(type)}&limit=${limit}`)
export const fetchRelics = (keyword = '', material = '', age = '') =>
  get(`/api/stonepark?keyword=${encodeURIComponent(keyword)}&material=${encodeURIComponent(material)}&age=${encodeURIComponent(age)}`)

// ⑥ 공공데이터포털 제주역사문화위치정보 (DATA_GO_KR_KEY 필요)
export const fetchHistoryPlaces = (page = 1, perPage = 300) => get(`/api/history?page=${page}&perPage=${perPage}`)

// ③ 기상청 단기예보
export const fetchWeather = (place = '제주시') => get(`/api/weather?place=${encodeURIComponent(place)}`)
