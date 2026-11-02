import { useMemo, useState } from 'react'
import { Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { Link, useSearchParams } from 'react-router-dom'
import RealMap from '../components/RealMap'
import { KindBadge, LocateBar, NearbyTour, PlacePhoto, SaveButton, routeUrl } from '../components/ui'
import { KINDS, KIND_KEYS, PLACES, placeById } from '../data/places'
import { MODES, TIME_OPTIONS, buildCourse, fmtMin, planFromIds } from '../lib/course'
import { DEMO_ME, distanceKm, fmtKm } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'

const NEAR_KM = 0.5   // 이 안에 있으면 '현장 확인' 도장

function StopCard({ n, s, me }) {
  const { place, info } = s
  const stamp = useAppStore((st) => st.stamps[place.id])
  const doStamp = useAppStore((st) => st.stamp)
  const stampCount = useAppStore((st) => Object.keys(st.stamps).length)
  const verified = !!me && !me.demo && distanceKm(me, place) <= NEAR_KM
  return (
    <article className="stone-card stop" style={{ '--k': KINDS[place.kind].color }}>
      <span className="stop__no">{n}</span>
      <div className="stop__leg">
        <i className="bi bi-arrow-down-short" />
        {n === 1 ? '출발지에서' : '앞 장소에서'} {fmtKm(s.km)} · {s.legMode} 약 {fmtMin(s.leg)}
      </div>
      <PlacePhoto id={place.id} name={place.name} />
      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
        <KindBadge kind={place.kind}>{place.tag}</KindBadge>
        <span className="stop__stay"><i className="bi bi-clock me-1" />머무는 시간 약 {fmtMin(s.stay)}</span>
      </div>
      <h3 className="stop__name">{place.name} <small>{place.spot}</small></h3>
      <p className="place-sum">{place.summary}</p>
      {info.look && <p className="stop__look"><b>현장에서 볼 것</b> {info.look}</p>}
      {info.tip && <p className="stop__tip"><i className="bi bi-lightbulb me-1" />{info.tip}</p>}
      <details className="stop__story">
        <summary>이야기 전문 읽기</summary>
        <h4>{place.title}</h4>
        {place.story.map((t, i) => <p key={i}>{t}</p>)}
      </details>
      <div className="d-flex flex-wrap gap-2 align-items-center">
        {stamp ? (
          <span className={`stamp-done ${stamp.verified ? 'is-verified' : ''}`}>
            <i className="bi bi-patch-check-fill me-1" />{stamp.verified ? '현장 도장' : '체험 도장'} · {new Date(stamp.at).toLocaleDateString('ko-KR')} · {stampCount}/{PLACES.length}
          </span>
        ) : (
          <button className="btn btn-sm btn-dol" onClick={() => doStamp(place.id, verified)}>
            <i className="bi bi-patch-check me-1" />도장 찍기
          </button>
        )}
        <SaveButton id={place.id} />
        <a className="btn btn-sm btn-outline-dark" href={routeUrl(place)} target="_blank" rel="noreferrer"><i className="bi bi-signpost-2 me-1" />길찾기</a>
      </div>
      {!stamp && <p className="stop__hint">{verified ? '지금 이 장소 500m 안이에요. 현장 도장으로 찍혀요.' : '현장(500m 이내)에서 누르면 현장 도장, 아니면 체험 도장으로 찍혀요.'}</p>}
      <div className="mt-2"><NearbyTour place={place} /></div>
    </article>
  )
}

export default function Walk() {
  const me = useAppStore((s) => s.me)
  const [params, setParams] = useSearchParams()
  const [minutes, setMinutes] = useState(120)
  const [mode, setMode] = useState(params.get('mode') === 'walk' ? 'walk' : 'car')
  const [kinds, setKinds] = useState(KIND_KEYS)
  const [rainy, setRainy] = useState(false)
  const [kids, setKids] = useState(false)

  const start = me ?? DEMO_ME
  const ids = (params.get('ids') ?? '').split(',').filter((id) => placeById(id))
  const custom = ids.length > 0

  const plan = useMemo(
    () => (custom ? planFromIds(start, ids, mode) : buildCourse({ start, minutes, mode, kinds, rainy, kids })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [custom, params.get('ids'), start.lat, start.lng, minutes, mode, kinds, rainy, kids],
  )
  const stops = plan.stops.map((s) => ({ ...s, legMode: MODES[mode].label }))
  const numbers = Object.fromEntries(stops.map((s, i) => [s.place.id, i + 1]))

  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">이야기 산책</p>
        <h1>오늘 걸을 이야기 길</h1>
        <p>출발지와 시간을 정하면 가까운 곳부터 순서대로 묶어 드려요. 장소마다 읽을 이야기와 가는 방법이 이어집니다.</p>
      </header>

      <div className="stone-card walk-controls mb-3">
        <LocateBar className="mb-3" />
        {custom ? (
          <div className="walk-banner">
            <i className="bi bi-robot me-2" />AI 가이드가 추천한 코스를 보고 있어요.
            <button className="btn btn-sm btn-outline-dark ms-2" onClick={() => setParams({})}>직접 만들기로 돌아가기</button>
          </div>
        ) : (
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <Form.Label className="mb-1 fw-bold">쓸 수 있는 시간</Form.Label>
              <ToggleButtonGroup type="radio" name="minutes" value={minutes} onChange={setMinutes} size="sm" className="d-flex">
                {TIME_OPTIONS.map((t) => <ToggleButton key={t.value} id={`t-${t.value}`} value={t.value} variant="outline-dark">{t.label}</ToggleButton>)}
              </ToggleButtonGroup>
            </div>
            <div className="col-md-3">
              <Form.Label className="mb-1 fw-bold">이동 수단</Form.Label>
              <ToggleButtonGroup type="radio" name="mode" value={mode} onChange={setMode} size="sm" className="d-flex">
                {Object.entries(MODES).map(([k, m]) => <ToggleButton key={k} id={`m-${k}`} value={k} variant="outline-dark">{m.label}</ToggleButton>)}
              </ToggleButtonGroup>
            </div>
            <div className="col-md-4 d-flex flex-wrap gap-3">
              <Form.Check type="switch" id="rainy" label="비 오는 날" checked={rainy} onChange={(e) => setRainy(e.target.checked)} />
              <Form.Check type="switch" id="kids" label="아이와 함께" checked={kids} onChange={(e) => setKids(e.target.checked)} />
            </div>
            <div className="col-12">
              <ToggleButtonGroup type="checkbox" value={kinds} onChange={(v) => v.length && setKinds(v)} size="sm">
                {KIND_KEYS.map((k) => (
                  <ToggleButton key={k} id={`k-${k}`} value={k} variant="outline-dark" className="layer-btn">
                    <i className={`bi bi-${KINDS[k].icon} me-1`} />{KINDS[k].label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
          </div>
        )}
      </div>

      {stops.length === 0 ? (
        <div className="stone-card p-4 text-center text-muted">조건에 맞는 장소가 없어요. 갈래를 늘리거나 비 오는 날 옵션을 꺼 보세요.</div>
      ) : (
        <div className="row g-3">
          <div className="col-xl-5 order-xl-2">
            <div className="stone-card p-2 walk-side">
              <RealMap places={stops.map((s) => s.place)} numbers={numbers} me={start} route={stops.map((s) => s.place)} />
              <ul className="walk-sum">
                <li><b>{stops.length}곳</b>코스</li>
                <li><b>{fmtMin(plan.total)}</b>이동 {fmtMin(plan.travel)} + 머묾 {fmtMin(plan.stay)}</li>
                <li><b>{fmtKm(plan.km)}</b>직선거리 합</li>
              </ul>
              {plan.over && <p className="small text-danger px-2">정한 시간 안에는 한 곳도 다 못 봐서 가장 가까운 곳 하나만 골랐어요.</p>}
              {!custom && plan.total > minutes && <p className="small text-danger px-2">시간이 조금 모자라요.</p>}
              {!me && <p className="small text-muted px-2 mb-1">출발지는 제주시청 부근이에요. 위치를 찾으면 내 위치 기준으로 다시 짜요.</p>}
            </div>
          </div>
          <div className="col-xl-7 order-xl-1">
            <div className="stops">
              {stops.map((s, i) => <StopCard key={s.place.id} n={i + 1} s={s} me={me} />)}
            </div>
            <p className="small text-muted mt-3">이동 시간은 직선거리에 우회 계수를 곱한 어림값이에요. 실제 길찾기는 각 장소의 길찾기 버튼을 쓰세요. <Link to="/guide">AI 가이드에게 물어보기</Link></p>
          </div>
        </div>
      )}
    </div>
  )
}
