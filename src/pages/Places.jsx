import { useEffect, useMemo, useState } from 'react'
import { Badge, Form, Nav, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ApiState, KindBadge, LocateBar, SaveButton, distanceLabel } from '../components/ui'
import { fetchHeritage, fetchNearby, fetchWeather } from '../api/client'
import { KINDS, KIND_KEYS, PLACES } from '../data/places'
import { distanceKm, fmtKm } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'

export default function Places() {
  const [tab, setTab] = useState('curated')
  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">역사문화 위치정보</p>
        <h1>어디에 무엇이 있을까</h1>
        <p>돌빛 제주길이 고른 장소와, 내 주변 관광지·문화시설·국가유산을 한곳에서 볼 수 있어요.</p>
      </header>
      <Nav variant="pills" className="pill-nav mb-3" activeKey={tab} onSelect={setTab}>
        <Nav.Item><Nav.Link eventKey="curated">추천 장소 {PLACES.length}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="nearby">내 주변</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="heritage">국가유산</Nav.Link></Nav.Item>
      </Nav>
      {tab === 'curated' && <Curated />}
      {tab === 'nearby' && <Nearby />}
      {tab === 'heritage' && <Heritage />}
    </div>
  )
}

function Curated() {
  const { me, select } = useAppStore()
  const navigate = useNavigate()
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('name')

  const rows = useMemo(() => {
    let r = PLACES.filter((p) => (kind === 'all' || p.kind === kind) && (!q || (p.name + p.spot + p.title).includes(q)))
    if (sort === 'near' && me) r = [...r].sort((a, b) => distanceKm(me, a) - distanceKm(me, b))
    else r = [...r].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    return r
  }, [kind, q, sort, me])

  return (
    <>
      <div className="stone-card p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-5"><LocateBar /></div>
          <div className="col-md-3">
            <Form.Select size="sm" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="all">전체 종류</option>
              {KIND_KEYS.map((k) => <option key={k} value={k}>{KINDS[k].label}</option>)}
            </Form.Select>
          </div>
          <div className="col-md-2">
            <Form.Select size="sm" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">이름순</option>
              <option value="near" disabled={!me}>가까운 순{me ? '' : ' (위치 필요)'}</option>
            </Form.Select>
          </div>
          <div className="col-md-2"><Form.Control size="sm" placeholder="검색" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
      </div>

      <div className="stone-card p-0 overflow-hidden">
        <Table responsive hover className="mb-0 align-middle place-table">
          <thead><tr><th>장소</th><th>종류</th><th className="d-none d-md-table-cell">위치</th><th className="text-end">거리</th><th /></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><b>{p.name}</b><div className="small text-muted d-md-none">{p.spot}</div></td>
                <td><KindBadge kind={p.kind}>{p.tag}</KindBadge></td>
                <td className="d-none d-md-table-cell text-muted">{p.spot}</td>
                <td className="text-end">{distanceLabel(me, p) ?? <span className="text-muted">-</span>}</td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-dol me-1" onClick={() => { select(p.id); navigate('/map') }}>지도</button>
                  <SaveButton id={p.id} compact />
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">조건에 맞는 장소가 없어요.</td></tr>}
          </tbody>
        </Table>
      </div>
    </>
  )
}

const TYPES = [['', '전체'], ['12', '관광지'], ['14', '문화시설']]

function Nearby() {
  const { me } = useAppStore()
  const [type, setType] = useState('')
  const [state, setState] = useState({ loading: false, error: '', items: [] })

  useEffect(() => {
    if (!me) return
    let alive = true
    setState({ loading: true, error: '', items: [] })
    fetchNearby(me.lat, me.lng, 8000, type)
      .then((items) => alive && setState({ loading: false, error: '', items }))
      .catch((e) => alive && setState({ loading: false, error: e.message, items: [] }))
    return () => { alive = false }
  }, [me, type])

  return (
    <>
      <div className="stone-card p-3 mb-3 d-flex flex-wrap gap-3 align-items-center">
        <LocateBar />
        <Form.Select size="sm" style={{ maxWidth: 160 }} value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Form.Select>
        <span className="small text-muted">반경 8km 안 · 출처 한국관광공사</span>
      </div>
      {!me && <ApiState empty emptyText="먼저 '내 위치 찾기'나 '제주시청 기준으로 보기'를 눌러 주세요." />}
      {me && <ApiState loading={state.loading} error={state.error} empty={!state.loading && !state.error && state.items.length === 0} emptyText="주변에 조회된 장소가 없어요." />}
      <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-3">
        {state.items.map((p) => (
          <div className="col" key={p.id}>
            <article className="stone-card api-card">
              {p.image ? <img src={p.image} alt="" loading="lazy" /> : <div className="api-card__noimg"><i className="bi bi-image" /></div>}
              <div className="api-card__body">
                <h3>{p.title}</h3>
                <p className="text-muted small mb-1">{p.addr}</p>
                {p.distM != null && <Badge bg="info" text="dark" pill>{fmtKm(p.distM / 1000)}</Badge>}
              </div>
            </article>
          </div>
        ))}
      </div>
    </>
  )
}

function Heritage() {
  const [q, setQ] = useState('')
  const [state, setState] = useState({ loading: true, error: '', items: [] })
  const [weather, setWeather] = useState(null)

  useEffect(() => { fetchWeather('제주시').then((w) => setWeather(w[0])).catch(() => {}) }, [])
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: '' }))
    const t = setTimeout(() => {
      fetchHeritage(q)
        .then((items) => alive && setState({ loading: false, error: '', items }))
        .catch((e) => alive && setState({ loading: false, error: e.message, items: [] }))
    }, 250)
    return () => { alive = false; clearTimeout(t) }
  }, [q])

  return (
    <>
      <div className="stone-card p-3 mb-3 d-flex flex-wrap gap-3 align-items-center">
        <Form.Control style={{ maxWidth: 260 }} size="sm" placeholder="국가유산 이름 (예: 관덕정)" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="small text-muted">제주 국가유산 검색 · 출처 국가유산청</span>
        {weather && <span className="small ms-auto"><i className="bi bi-cloud-sun me-1" />제주시 {weather.temp}°C · {weather.sky}</span>}
      </div>
      <ApiState loading={state.loading} error={state.error} empty={!state.loading && !state.error && state.items.length === 0} />
      <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-3">
        {state.items.map((h, i) => (
          <div className="col" key={`${h.name}-${i}`}>
            <article className="stone-card place-card" style={{ '--k': '#3d5fa8' }}>
              <span className="mini-tag">{h.kind}</span>
              <h3>{h.name}</h3>
              <p className="text-muted mb-0"><i className="bi bi-geo-alt me-1" />{h.city}</p>
            </article>
          </div>
        ))}
      </div>
    </>
  )
}
