import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import JejuMapView from '../components/JejuMapView'
import { LocateBar, distanceLabel } from '../components/ui'
import { fetchWeather } from '../api/client'
import { KINDS, KIND_KEYS, PLACES, placesOf } from '../data/places'
import { buildCourse, fmtMin } from '../lib/course'
import { DEMO_ME, distanceKm } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'

const STEPS = [
  { n: 1, icon: 'crosshair', title: '위치 켜기', sub: '내 위치나 제주시청 기준으로 출발' },
  { n: 2, icon: 'clock', title: '시간 고르기', sub: '1시간부터 반나절까지, 비 오는 날·아이 동반' },
  { n: 3, icon: 'patch-check', title: '걷고 도장 받기', sub: '이야기를 읽고 장소마다 도장 찍기' },
]
const LINKS = { myth: '/myth', stone: '/stone', history: '/places' }
const QUICK = [
  { to: '/walk', icon: 'signpost-split', c: '#0f8b9d', title: '이야기 산책', sub: '시간에 맞춘 코스 만들기' },
  { to: '/guide', icon: 'chat-heart', c: '#ff8a1f', title: 'AI 가이드', sub: '비 오는 날, 아이와 함께?' },
  { to: '/map', icon: 'globe-asia-australia', c: '#3d5fa8', title: '문화 지도', sub: '2D · 3D로 24곳 보기' },
]

export default function Home() {
  const me = useAppStore((s) => s.me)
  const select = useAppStore((s) => s.select)
  const [weather, setWeather] = useState(null)

  useEffect(() => { fetchWeather('제주시').then((w) => setWeather(w[0])).catch(() => {}) }, [])

  const start = me ?? DEMO_ME
  const today = buildCourse({ start, minutes: 120, mode: 'car' })
  const nearest = me ? [...PLACES].sort((a, b) => distanceKm(me, a) - distanceKm(me, b)).slice(0, 3) : []

  return (
    <div className="page">
      <section className="row g-4 align-items-center home-hero">
        <div className="col-lg-6 order-2 order-lg-1">
          <p className="stamp">제주 신화 · 돌문화 · 역사문화</p>
          <h1 className="display-title">돌이 말하고<br />바람이 전하는<br /><span>오늘의 이야기 길</span></h1>
          <p className="intent">
            신화와 돌, 역사가 남은 장소를 지도에 모으고, 내 위치와 쓸 수 있는 시간에 맞춰 걸을 코스를 짜 드려요.
          </p>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Link to="/walk" className="btn btn-dol btn-lg px-4">산책 코스 만들기</Link>
            <Link to="/guide" className="btn btn-outline-dark btn-lg">AI 가이드에게 묻기</Link>
          </div>
          {weather && (
            <p className="weather"><i className="bi bi-cloud-sun me-1" />지금 제주시 {weather.temp}°C · {weather.sky} <small>(기상청 예보)</small></p>
          )}
        </div>
        <div className="col-lg-6 order-1 order-lg-2">
          <div className="blob-frame"><JejuMapView autoRotate camera={{ position: [0, 17, 26], fov: 48 }} /></div>
        </div>
      </section>

      <ul className="stats" aria-label="한눈에 보기">
        <li><b>{PLACES.length}</b>이야기 장소</li>
        <li><b>368</b>3D 오름</li>
        <li><b>6</b>공공데이터 API</li>
        <li><b>2D·3D</b>지도 보기</li>
      </ul>

      <section className="quick" aria-label="바로가기">
        {QUICK.map((q) => (
          <Link key={q.to} to={q.to} className="quick__item" style={{ '--c': q.c }}>
            <i className={`bi bi-${q.icon}`} />
            <span><b>{q.title}</b><small>{q.sub}</small></span>
          </Link>
        ))}
      </section>

      {today.stops.length > 0 && (
        <section className="today">
          <div className="today__head">
            <p className="stamp">오늘의 코스</p>
            <h2>{me && !me.demo ? '내 위치에서' : '제주시청에서'} 2시간, {today.stops.length}곳</h2>
            <p>이동 {fmtMin(today.travel)} + 머묾 {fmtMin(today.stay)}. 바로 걸어 볼 수 있는 코스예요.</p>
            <Link to={`/walk?ids=${today.stops.map((s) => s.place.id).join(',')}&mode=car`} className="btn btn-dol btn-lg px-4">이 코스로 걷기</Link>
          </div>
          <ol className="today__stops">
            {today.stops.map((s, i) => (
              <li key={s.place.id} style={{ '--k': KINDS[s.place.kind].color }}>
                <b>{i + 1}</b>
                <span><strong>{s.place.name}</strong><small>{KINDS[s.place.kind].label} · {fmtMin(s.stay)} 머물기</small></span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="section-title"><h2>이렇게 써요</h2><small>세 걸음</small></div>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.n}><i className={`bi bi-${s.icon}`} /><span><b>{s.n}. {s.title}</b><small>{s.sub}</small></span></li>
        ))}
      </ol>

      <div className="section-title"><h2>세 갈래 이야기</h2><small>신화·돌·역사</small></div>
      <section className="row g-3">
        {KIND_KEYS.map((k) => (
          <div className="col-md-4" key={k}>
            <Link to={LINKS[k]} className="stone-card kind-card" style={{ '--k': KINDS[k].color }}>
              <i className={`bi bi-${KINDS[k].icon}`} />
              <h2>{KINDS[k].label}</h2>
              <p>{KINDS[k].desc}</p>
              <strong>{placesOf(k).length}곳 →</strong>
            </Link>
          </div>
        ))}
      </section>

      <p className="legend-line"><span className="legend-line__row">“설문대할망이 치마폭으로 흙을 날라 한라산을 쌓고,</span><span className="legend-line__row">흘린 흙이 오름 삼백예순여덟 개가 되었다.”</span><small>— 제주 설화 중에서</small></p>

      <section className="stone-card near">
        <div className="row g-3 align-items-center">
          <div className="col-lg-5">
            <h2 className="h4 mb-1"><i className="bi bi-compass me-2 text-info" />내 위치에서 가까운 이야기</h2>
            <p className="text-muted mb-2">위치 권한을 허용하면 가장 가까운 장소 3곳을 알려 드려요.</p>
            <LocateBar />
          </div>
          <div className="col-lg-7">
            {nearest.length === 0 ? (
              <p className="text-muted mb-0">아직 위치를 모르는 상태예요.</p>
            ) : (
              <ol className="near-list">
                {nearest.map((p) => (
                  <li key={p.id}>
                    <Link to="/map" onClick={() => select(p.id)}>
                      <b>{p.name}</b> <small>{KINDS[p.kind].label}</small>
                      <span>{distanceLabel(me, p)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
