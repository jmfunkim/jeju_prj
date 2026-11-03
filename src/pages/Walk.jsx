import { useMemo, useState } from 'react'
import { Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { Link, useSearchParams } from 'react-router-dom'
import RealMap from '../components/RealMap'
import { DoliSay } from '../components/Doli'
import { KindBadge, LocateBar, NearbyTour, PlacePhoto, SaveButton, VisitNote, routeUrl } from '../components/ui'
import { KINDS, KIND_KEYS, PLACES, placeById } from '../data/places'
import { MODES, TIME_OPTIONS, buildCourse, fmtMin, planFromIds } from '../lib/course'
import { doliSays, doliStamped } from '../data/world'
import { DEMO_ME, distanceKm, fmtKm } from '../lib/geo'
import { courseName, courseUrl, shareCourse } from '../lib/share'
import { DRAFT_MAX, useAppStore } from '../store/useAppStore'

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
        <small className="stop__approx" title="직선거리에 우회 계수를 곱한 어림값이에요. 실제 길찾기는 아래 길찾기 버튼을 쓰세요.">어림값</small>
      </div>
      <PlacePhoto id={place.id} name={place.name} photoOnly />
      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
        <KindBadge kind={place.kind}>{place.tag}</KindBadge>
        <span className="stop__stay"><i className="bi bi-clock me-1" />머무는 시간 약 {fmtMin(s.stay)}</span>
      </div>
      <h3 className="stop__name">{place.name} <small>{place.spot}</small></h3>
      <p className="place-sum">{place.summary}</p>
      {info.look && <p className="stop__look"><b>현장에서 볼 것</b> {info.look}</p>}
      {info.tip && <p className="stop__tip"><i className="bi bi-lightbulb me-1" />{info.tip}</p>}
      <VisitNote place={place} />
      <DoliSay mood={stamp ? 'happy' : 'hi'} glow={stamp ? 1 : 0.5} className="mb-2">{stamp ? doliStamped(place) : doliSays(place)}</DoliSay>
      <details className="stop__story">
        <summary>이야기 전문 읽기</summary>
        <h4>{place.title}</h4>
        {place.story.map((t, i) => <p key={i}>{t}</p>)}
      </details>
      <div className="d-flex flex-wrap gap-2 align-items-center">
        {stamp ? (
          <span className={`stamp-done ${stamp.verified ? 'is-verified' : ''}`}>
            <i className="bi bi-patch-check-fill me-1" />{stamp.verified ? '현장 돌빛' : '멀리서 켠 돌빛'} · {new Date(stamp.at).toLocaleDateString('ko-KR')} · {stampCount}/{PLACES.length}
          </span>
        ) : (
          <button className="btn btn-sm btn-dol" onClick={() => doStamp(place.id, verified)}>
            <i className="bi bi-patch-check me-1" />도장 찍기
          </button>
        )}
        <SaveButton id={place.id} />
        <a className="btn btn-sm btn-outline-dark" href={routeUrl(place)} target="_blank" rel="noreferrer"><i className="bi bi-signpost-2 me-1" />길찾기</a>
      </div>
      {!stamp && <p className="stop__hint">{verified ? '지금 이 장소 500m 안이에요. 현장 돌빛으로 남아요.' : '장소 500m 안에서 누르면 현장 돌빛, 멀리서 누르면 멀리서 켠 돌빛으로 남아요.'}</p>}
      <div className="mt-2"><NearbyTour place={place} /></div>
    </article>
  )
}

// 출발지에서 가까운 곳부터 차례로 늘어놓기 (코스 순서를 한 번에 정리할 때)
function nearestOrder(start, ids) {
  const left = ids.map(placeById).filter(Boolean)
  const out = []
  let pos = start
  while (left.length) {
    let k = 0
    for (let i = 1; i < left.length; i++) if (distanceKm(pos, left[i]) < distanceKm(pos, left[k])) k = i
    const [p] = left.splice(k, 1)
    out.push(p.id)
    pos = p
  }
  return out
}

// 내가 직접 짜는 코스: 담은 장소(순서 바꾸기·빼기) + 장소 고르기
function CourseBuilder({ ids, mode, setMode, start }) {
  const addToDraft = useAppStore((s) => s.addToDraft)
  const removeFromDraft = useAppStore((s) => s.removeFromDraft)
  const moveInDraft = useAppStore((s) => s.moveInDraft)
  const setDraft = useAppStore((s) => s.setDraft)
  const clearDraft = useAppStore((s) => s.clearDraft)
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('')
  const full = ids.length >= DRAFT_MAX
  const key = q.trim()
  const list = PLACES.filter((p) => (!kind || p.kind === kind) && (!key || `${p.name} ${p.spot} ${p.tag} ${p.keywords.join(' ')}`.includes(key)))

  return (
    <div className="builder">
      <div className="row g-3">
        <div className="col-lg-5">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
            <h2 className="h6 fw-bold mb-0">내 코스 <small className="text-muted">{ids.length}/{DRAFT_MAX}곳</small></h2>
            <div className="d-flex gap-1">
              <button type="button" className="btn btn-sm btn-outline-dark" disabled={ids.length < 2} onClick={() => setDraft(nearestOrder(start, ids))} title="출발지에서 가까운 곳부터 순서를 다시 정해요">
                <i className="bi bi-sort-numeric-down me-1" />가까운 순 정리
              </button>
              <button type="button" className="btn btn-sm btn-outline-dark" disabled={ids.length === 0} onClick={clearDraft}><i className="bi bi-trash3 me-1" />비우기</button>
            </div>
          </div>
          {ids.length === 0 ? (
            <p className="builder__empty">아직 담은 장소가 없어요. 오른쪽에서 장소를 눌러 담거나, 지도에서 <b>코스에 추가</b>를 눌러 보세요.</p>
          ) : (
            <ol className="draft-list">
              {ids.map((id, i) => {
                const p = placeById(id)
                return (
                  <li key={id} className="draft-item" style={{ '--k': KINDS[p.kind].color }}>
                    <span className="draft-item__no">{i + 1}</span>
                    <span className="draft-item__name"><b>{p.name}</b><small>{KINDS[p.kind].label} · {p.spot}</small></span>
                    <span className="draft-item__btns">
                      <button type="button" aria-label={`${p.name} 위로`} disabled={i === 0} onClick={() => moveInDraft(id, -1)}><i className="bi bi-chevron-up" /></button>
                      <button type="button" aria-label={`${p.name} 아래로`} disabled={i === ids.length - 1} onClick={() => moveInDraft(id, 1)}><i className="bi bi-chevron-down" /></button>
                      <button type="button" aria-label={`${p.name} 빼기`} onClick={() => removeFromDraft(id)}><i className="bi bi-x-lg" /></button>
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
          <Form.Label className="mt-3 mb-1 fw-bold">이동 수단</Form.Label>
          <ToggleButtonGroup type="radio" name="mine-mode" value={mode} onChange={setMode} size="sm" className="d-flex">
            {Object.entries(MODES).map(([k, m]) => <ToggleButton key={k} id={`mm-${k}`} value={k} variant="outline-dark">{m.label}</ToggleButton>)}
          </ToggleButtonGroup>
        </div>

        <div className="col-lg-7">
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Form.Control size="sm" className="builder__search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="장소 이름·키워드 찾기" aria-label="장소 찾기" />
            <div className="d-flex flex-wrap gap-1">
              <button type="button" className={`btn btn-sm ${kind === '' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setKind('')}>전체</button>
              {KIND_KEYS.map((k) => (
                <button key={k} type="button" className={`btn btn-sm layer-btn ${kind === k ? 'btn-dark' : 'btn-outline-dark'}`} style={{ '--k': KINDS[k].color }} onClick={() => setKind(kind === k ? '' : k)}>
                  <i className={`bi bi-${KINDS[k].icon} me-1`} />{KINDS[k].label}
                </button>
              ))}
            </div>
          </div>
          {full && <p className="small text-muted mb-2">코스에는 {DRAFT_MAX}곳까지 담을 수 있어요. 하나를 빼면 더 담을 수 있어요.</p>}
          <div className="draft-picks">
            {list.map((p) => {
              const on = ids.includes(p.id)
              return (
                <button key={p.id} type="button" className={`draft-pick ${on ? 'on' : ''}`} style={{ '--k': KINDS[p.kind].color }} aria-pressed={on}
                  disabled={!on && full} onClick={() => (on ? removeFromDraft(p.id) : addToDraft(p.id))}>
                  <i className={`bi bi-${on ? 'check2-circle' : 'plus-circle'}`} />
                  <span><b>{p.name}</b><small>{p.spot}</small></span>
                </button>
              )
            })}
            {list.length === 0 && <p className="text-muted small mb-0">맞는 장소가 없어요.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Walk() {
  const me = useAppStore((s) => s.me)
  const courses = useAppStore((s) => s.courses)
  const saveCourse = useAppStore((s) => s.saveCourse)
  const removeCourse = useAppStore((s) => s.removeCourse)
  const [note, setNote] = useState('')
  const [params, setParams] = useSearchParams()
  const [minutes, setMinutes] = useState(120)
  const [mode, setMode] = useState(params.get('mode') === 'walk' ? 'walk' : 'car')
  const [kinds, setKinds] = useState(KIND_KEYS)
  const [rainy, setRainy] = useState(false)
  const [kids, setKids] = useState(false)

  const draft = useAppStore((s) => s.draft)
  const setDraft = useAppStore((s) => s.setDraft)

  const start = me ?? DEMO_ME
  // 코스를 어디서 가져오는지: link(링크·AI 가이드가 정한 순서) · mine(내가 직접 짜는 코스) · auto(조건으로 자동)
  const linkIds = (params.get('ids') ?? '').split(',').filter((id) => placeById(id))
  const draftIds = draft.filter((id) => placeById(id))
  const view = linkIds.length > 0 ? 'link' : params.get('tab') === 'mine' ? 'mine' : 'auto'
  const custom = view !== 'auto'
  const ids = view === 'link' ? linkIds : draftIds
  const goView = (v) => setParams(v === 'mine' ? { tab: 'mine' } : {})

  const plan = useMemo(
    () => (custom ? planFromIds(start, ids, mode) : buildCourse({ start, minutes, mode, kinds, rainy, kids })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, ids.join(','), start.lat, start.lng, minutes, mode, kinds, rainy, kids],
  )
  const stops = plan.stops.map((s) => ({ ...s, legMode: MODES[mode].label }))
  const numbers = Object.fromEntries(stops.map((s, i) => [s.place.id, i + 1]))

  // 코스 저장·공유 — 코스는 장소 순서(ids)와 이동수단(mode)만 있으면 어디서든 다시 열려요
  const stopIds = stops.map((s) => s.place.id)
  const courseId = `${mode}:${stopIds.join(',')}`
  const savedCourse = courses.find((c) => c.id === courseId)
  const flash = (msg) => { setNote(msg); setTimeout(() => setNote(''), 3000) }
  const toggleSave = () => {
    if (savedCourse) {
      removeCourse(courseId)
      flash('저장한 코스에서 뺐어요.')
    } else {
      saveCourse({ name: courseName(stops.map((s) => s.place)), ids: stopIds, mode })
      flash('내 수첩에 저장했어요.')
    }
  }
  // 지금 보는 코스(자동·링크)를 내 코스로 옮겨 순서를 고치거나 장소를 더하고 빼기
  const editAsMine = () => {
    // 이미 짜던 코스가 있으면 덮어쓰기 전에 한 번 물어요
    if (draftIds.length > 0 && draftIds.join(',') !== stopIds.join(',') && !window.confirm(`지금 짜고 있는 코스(${draftIds.length}곳)를 이 코스로 바꿀까요?`)) return
    setDraft(stopIds)
    setParams({ tab: 'mine' })
    flash('내 코스로 가져왔어요. 순서를 바꾸거나 장소를 더해 보세요.')
  }
  const share = async () => {
    const names = stops.map((s) => s.place.name).join(' → ')
    const r = await shareCourse({ title: '돌빛 제주길 이야기 산책', text: `돌빛 제주길 이야기 산책 코스예요 (${fmtMin(plan.total)}): ${names}`, url: courseUrl(stopIds, mode) })
    if (r === 'copied') flash('링크를 복사했어요. 붙여 넣어 보내 주세요.')
    if (r === 'shared') flash('공유했어요.')
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">이야기 산책</p>
        <h1>오늘 걸을 이야기 길</h1>
        <p>출발지와 시간을 정하면 가까운 곳부터 순서대로 묶어 드려요. 마음에 드는 장소를 직접 골라 나만의 코스를 짤 수도 있어요.</p>
      </header>

      <div className="stone-card walk-controls mb-3">
        <LocateBar className="mb-3" />
        {view !== 'link' && (
          <ToggleButtonGroup type="radio" name="walk-view" value={view} onChange={goView} size="sm" className="mb-3">
            <ToggleButton id="v-auto" value="auto" variant="outline-dark"><i className="bi bi-magic me-1" />자동으로 짜기</ToggleButton>
            <ToggleButton id="v-mine" value="mine" variant="outline-dark">
              <i className="bi bi-pencil-square me-1" />내가 직접 짜기{draftIds.length > 0 && <span className="walk-count">{draftIds.length}</span>}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
        {view === 'link' ? (
          <div className="walk-banner">
            <i className="bi bi-link-45deg me-2" />링크로 받았거나 AI 가이드가 만든 코스를 보고 있어요.
            <button className="btn btn-sm btn-outline-dark ms-2" onClick={() => setParams({})}>자동으로 짜기로 돌아가기</button>
          </div>
        ) : view === 'mine' ? (
          <CourseBuilder ids={draftIds} mode={mode} setMode={setMode} start={start} />
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
        <div className="stone-card p-4 text-center text-muted">
          {view === 'mine' ? '장소를 담으면 이동 시간과 이야기가 여기에 이어져요.' : '조건에 맞는 장소가 없어요. 분야를 늘리거나 비 오는 날 옵션을 꺼 보세요.'}
        </div>
      ) : (
        <div className="row g-3">
          <div className="col-xl-5 order-xl-2">
            <div className="stone-card p-2 walk-side">
              <RealMap places={stops.map((s) => s.place)} numbers={numbers} me={start} route={stops.map((s) => s.place)} />
              <ul className="walk-sum">
                <li><b>{stops.length}곳</b>코스</li>
                <li><b>{fmtMin(plan.total)}</b>이동 약 {fmtMin(plan.travel)} + 머묾 약 {fmtMin(plan.stay)}</li>
                <li><b>{fmtKm(plan.km)}</b>직선거리 합</li>
              </ul>
              {plan.over && <p className="small text-danger px-2">정한 시간 안에는 한 곳도 다 못 봐서 가장 가까운 곳 하나만 골랐어요.</p>}
              {!custom && plan.total > minutes && <p className="small text-danger px-2">시간이 조금 모자라요.</p>}
              {!me && <p className="small text-muted px-2 mb-1">출발지는 제주시청 부근이에요. 위치를 찾으면 내 위치 기준으로 다시 짜요.</p>}
            </div>
          </div>
          <div className="col-xl-7 order-xl-1">
            <div className="walk-actions">
              <button type="button" className={`btn btn-sm ${savedCourse ? 'btn-dark' : 'btn-outline-dark'}`} onClick={toggleSave} aria-pressed={!!savedCourse}>
                <i className={`bi bi-bookmark-heart${savedCourse ? '-fill' : ''} me-1`} />{savedCourse ? '저장한 코스' : '이 코스 저장'}
              </button>
              <button type="button" className="btn btn-sm btn-dol" onClick={share}><i className="bi bi-share me-1" />친구에게 공유</button>
              {view !== 'mine' && (
                <button type="button" className="btn btn-sm btn-outline-dark" onClick={editAsMine}><i className="bi bi-pencil-square me-1" />내 코스로 가져와 고치기</button>
              )}
              {note && <span className="walk-actions__note" role="status">{note}</span>}
            </div>
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
