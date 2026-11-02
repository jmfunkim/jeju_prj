import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import WallDivider from '../components/WallDivider'
import JejuMapView from '../components/JejuMapView'
import { LocateBar, distanceLabel } from '../components/ui'
import { fetchWeather } from '../api/client'
import { KINDS, KIND_KEYS, PLACES, placesOf } from '../data/places'
import { distanceKm } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'

const LINKS = { myth: '/myth', stone: '/stone', history: '/places' }

export default function Home() {
  const me = useAppStore((s) => s.me)
  const select = useAppStore((s) => s.select)
  const [weather, setWeather] = useState(null)

  useEffect(() => { fetchWeather('제주시').then((w) => setWeather(w[0])).catch(() => {}) }, [])

  const nearest = me ? [...PLACES].sort((a, b) => distanceKm(me, a) - distanceKm(me, b)).slice(0, 3) : []

  return (
    <div className="page">
      <section className="row g-4 align-items-center home-hero">
        <div className="col-lg-6 order-2 order-lg-1">
          <p className="stamp">제주 신화 · 돌문화 · 역사문화 위치정보</p>
          <h1 className="display-title">돌이 말하고<br />바람이 전하는<br /><span>탐라의 지도</span></h1>
          <p className="intent">
            <b>기획 의도</b> 신화와 돌, 역사가 남은 장소를 3D 섬 위에 모으고, 지금 내 위치에서 가장 가까운 이야기부터 걸어 볼 수 있게 합니다.
          </p>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Link to="/map" className="btn btn-dol btn-lg">3D 지도 열기</Link>
            <Link to="/myth" className="btn btn-outline-dark btn-lg">이야기 읽기</Link>
          </div>
          {weather && (
            <p className="weather"><i className="bi bi-cloud-sun me-1" />지금 제주시 {weather.temp}°C · {weather.sky} <small className="text-muted">(기상청 예보)</small></p>
          )}
        </div>
        <div className="col-lg-6 order-1 order-lg-2">
          <div className="blob-frame"><JejuMapView autoRotate camera={{ position: [0, 17, 26], fov: 48 }} /></div>
        </div>
      </section>

      <WallDivider label="세 갈래 이야기" />

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

      <p className="legend-line">“설문대할망이 치마폭으로 흙을 날라 한라산을 쌓고, 흘린 흙이 오름 삼백예순여덟 개가 되었다.”<small>— 제주 설화 중에서</small></p>

      <WallDivider label="오늘의 발걸음" />

      <section className="stone-card near">
        <div className="row g-3 align-items-center">
          <div className="col-lg-5">
            <h2 className="h4 mb-1"><i className="bi bi-compass me-2" />내 위치에서 가까운 이야기</h2>
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
