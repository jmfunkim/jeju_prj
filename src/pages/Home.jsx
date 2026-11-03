import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Doli, { DoliSay } from '../components/Doli'
import JejuMapView from '../components/JejuMapView'
import { LocateBar } from '../components/ui'
import { fetchWeather } from '../api/client'
import { KINDS, KIND_KEYS, placesOf } from '../data/places'
import { DOLI, DOLI_HELLO, WORLD } from '../data/world'
import { buildCourse, fmtMin } from '../lib/course'
import { DEMO_ME } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'

const STEPS = [
  { n: 1, icon: 'crosshair', title: '위치 켜기', sub: '내 위치나 제주시청 기준으로 출발' },
  { n: 2, icon: 'clock', title: '시간 고르기', sub: '1시간부터 반나절까지, 비 오는 날·아이 동반' },
  { n: 3, icon: 'patch-check', title: '걷고 도장 받기', sub: '이야기를 읽고 장소마다 도장 찍기' },
]
const LINKS = { myth: '/myth', stone: '/stone', history: '/history' }

export default function Home() {
  const me = useAppStore((s) => s.me)
  const [weather, setWeather] = useState(null)

  useEffect(() => { fetchWeather('제주시').then((w) => setWeather(w[0])).catch(() => {}) }, [])

  const start = me ?? DEMO_ME
  const today = buildCourse({ start, minutes: 120, mode: 'car' })
  const real = me && !me.demo

  return (
    <div className="page">
      <section className="row g-4 align-items-center home-hero">
        <div className="col-lg-6 order-2 order-lg-1">
          <p className="stamp">제주 신화 · 돌문화 · 역사문화</p>
          <h1 className="display-title">돌이 말하고<br />바람이 전하는<br /><span>오늘의 이야기 길</span></h1>
          <p className="intent">
            신화와 돌, 역사가 남은 장소를 지도에 모으고, 내 위치와 쓸 수 있는 시간에 맞춰 걸을 코스를 짜 드려요.
          </p>
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <Link to="/walk" className="btn btn-dol btn-lg px-4">산책 코스 만들기</Link>
            <Link to="/guide" className="btn btn-outline-dark btn-lg">AI 가이드에게 묻기</Link>
            <Link to="/map" className="home-link">지도로 둘러보기 <i className="bi bi-arrow-right" /></Link>
          </div>
          <DoliSay mood="hi" className="mb-3">{DOLI_HELLO}</DoliSay>
          {weather && (
            <p className="weather"><i className="bi bi-cloud-sun me-1" />지금 제주시 {weather.temp}°C · {weather.sky} <small>(기상청 예보)</small></p>
          )}
        </div>
        <div className="col-lg-6 order-1 order-lg-2">
          <div className="blob-frame">
            <JejuMapView autoRotate camera={{ position: [0, 17, 26], fov: 48 }} />
            <Link to="/map" className="blob-frame__cta">지도에서 24곳 보기 <i className="bi bi-arrow-right" /></Link>
          </div>
        </div>
      </section>

      {today.stops.length > 0 && (
        <>
          <section className="today">
            <div className="today__head">
              <p className="stamp">오늘의 코스</p>
              <h2>{real ? '내 위치에서' : '제주시청에서'} 2시간, {today.stops.length}곳</h2>
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
          <div className="today__locate">
            <span><i className="bi bi-geo-alt me-1" />출발지를 바꾸면 코스도 바뀌어요</span>
            <LocateBar />
          </div>
        </>
      )}

      <div className="section-title"><h2>이렇게 써요</h2><small>세 걸음</small></div>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.n}><i className={`bi bi-${s.icon}`} /><span><b>{s.n}. {s.title}</b><small>{s.sub}</small></span></li>
        ))}
      </ol>

      <div className="section-title"><h2>세 가지 이야기</h2><small>신화·돌·역사</small></div>
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

      <section className="world world--compact">
        <div className="world__doli"><Doli size={130} mood="hi" glow={0.9} /></div>
        <div className="world__text">
          <p className="stamp">돌빛 세계</p>
          <h2>{WORLD.title}</h2>
          <p>{WORLD.lines[0]}</p>
          <details className="world__more">
            <summary>돌이와 돌빛 이야기 더 보기</summary>
            {WORLD.lines.slice(1).map((l) => <p key={l}>{l}</p>)}
            <div className="world__who">
              <b>{DOLI.name}</b> · {DOLI.who}
              <small>{DOLI.intro}</small>
              <span>{DOLI.likes.map((x) => <i key={x}>{x}</i>)}</span>
            </div>
            <p className="world__note">{WORLD.note}</p>
          </details>
        </div>
      </section>

      <p className="legend-line"><span className="legend-line__row">“설문대할망이 치마폭으로 흙을 날라 한라산을 쌓고,</span><span className="legend-line__row">흘린 흙이 오름 삼백예순여덟 개가 되었다.”</span><small>— 제주 설화 중에서</small></p>
    </div>
  )
}
