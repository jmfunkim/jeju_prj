// 화면이 우리 서버 함수(/api/...)를 부를 때 쓰는 함수 모음
// 공공데이터 API 는 브라우저에서 직접 부르지 않고 반드시 /api 를 거칩니다 (키 노출·CORS 방지).

// 사용자에게는 개발자 문구(키 설정, 서버 오류)를 보여 주지 않고, 자세한 내용은 콘솔에만 남깁니다.
const NOT_READY = '이 정보는 아직 준비 중이에요. 곧 연결할게요.'
const GENERIC = '정보를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.'

async function get(path) {
  let r
  try { r = await fetch(path) } catch { throw new Error('인터넷 연결을 확인해 주세요.') }
  let data
  try { data = await r.json() } catch { console.warn('[api] JSON 아님', path, r.status); throw new Error(GENERIC) }
  if (!r.ok) {
    console.warn('[api]', path, data.error)
    if (r.status === 400 && data.error) throw new Error(data.error)   // 질문이 비었어요 같은, 사용자가 고칠 수 있는 안내
    throw new Error(/DATA_GO_KR_KEY|ANTHROPIC|인증키/.test(data.error ?? '') ? NOT_READY : GENERIC)
  }
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

// 제주신화정보(제주도청) — 신화·전설의 사진·삽화·장면 이미지 (키 없음)
export const fetchMythMedia = () => get('/api/mythmedia')

// 장소 사진 — 한국관광공사 TourAPI 의 대표 이미지
export const fetchPlacePhotos = () => get('/api/placephoto')

// 전시·기념관 이용 정보 — 한국관광공사 소개정보(쉬는 날·이용 시간)
export const fetchPlaceInfo = () => get('/api/placeinfo')

// 장소 사진 — 국가유산청 국가유산 이미지 (키 없음)
export const fetchKhsPhotos = () => get('/api/khsphoto')

// ⑥ 공공데이터포털 제주역사문화위치정보 (DATA_GO_KR_KEY 필요)
export const fetchHistoryPlaces = (page = 1, perPage = 300) => get(`/api/history?page=${page}&perPage=${perPage}`)

// 제주역사문화일반정보 — 장소별 설명 글 (DATA_GO_KR_KEY 필요)
export const fetchHistoryInfo = () => get('/api/historyinfo')

// ③ 기상청 단기예보
export const fetchWeather = (place = '제주시') => get(`/api/weather?place=${encodeURIComponent(place)}`)
