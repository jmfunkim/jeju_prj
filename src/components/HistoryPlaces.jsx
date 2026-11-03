import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { fetchHistoryInfo, fetchHistoryPlaces } from '../api/client'
import { PLACES } from '../data/places'
import { distanceKm, fmtKm } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'
import { DoliSay } from './Doli'
import RealMap from './RealMap'
import { LocateBar, PlacePhoto, routeUrl } from './ui'

// 돌빛 제주길이 고른 역사문화 장소 — 공공데이터 목록을 불러오지 못해도 이 탭이 비지 않게 하는 바탕
const CURATED = PLACES.filter((p) => p.kind === 'history').map((p) => ({ id: p.id, name: p.name, addr: p.spot, lat: p.lat, lng: p.lng, url: '', curated: true, kind: 'history' }))

const norm = (s) => String(s ?? '').replace(/[\s·()[\]\-.,]/g, '')

// 장소에 맞는 설명 글 찾기 — 이름이 같거나 한쪽이 다른 쪽을 품고 있으면(3글자 이상) 맞는 것으로, 아니면 300m 안의 가장 가까운 것
function findInfo(place, infos) {
  const n = norm(place.name)
  let best = null
  for (const it of infos) {
    for (const t of [norm(it.name), norm(it.title)]) {
      if (t.length >= 3 && n.length >= 3 && (t === n || t.includes(n) || n.includes(t))) return it
    }
    if (Number.isFinite(it.lat) && Number.isFinite(it.lng)) {
      const d = distanceKm(place, it)
      if (d < 0.3 && (!best || d < best.d)) best = { it, d }
    }
  }
  return best?.it ?? null
}

// 역사문화 장소 — 공공데이터포털 '제주역사문화위치정보'(제주특별자치도)를 지도와 목록으로 보여 줍니다.
// 목록을 못 불러오면(키 승인 전 등) 추천 장소를 대신 보여 주고, 연결되면 자동으로 전체 목록으로 바뀌어요.
export default function HistoryPlaces() {
  const me = useAppStore((s) => s.me)
  const select = useAppStore((s) => s.select)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('auto')
  const [shown, setShown] = useState(40)
  const [sel, setSel] = useState(null)
  const [st, setSt] = useState({ loading: true, data: null })

  useEffect(() => {
    let alive = true
    fetchHistoryPlaces()
      .then((data) => alive && setSt({ loading: false, data }))
      .catch(() => alive && setSt({ loading: false, data: null }))
    return () => { alive = false }
  }, [])

  // 설명 글(제주역사문화일반정보) — 못 불러와도 장소 목록은 그대로 보여 줍니다
  const [infos, setInfos] = useState([])
  useEffect(() => {
    let alive = true
    fetchHistoryInfo().then((d) => alive && setInfos(d.items ?? [])).catch(() => {})
    return () => { alive = false }
  }, [])
  const [more, setMore] = useState(false)

  const api = useMemo(() => (st.data?.items ?? []).map((p) => ({ ...p, id: String(p.id), kind: 'history' })), [st.data])
  const usingApi = api.length > 0
  const source = usingApi ? api : CURATED

  const list = useMemo(() => {
    const f = q.trim() ? source.filter((p) => (p.name + (p.addr ?? '')).includes(q.trim())) : source
    const byDistance = me && (sort === 'near' || (sort === 'auto' && me))
    return byDistance ? [...f].sort((a, b) => distanceKm(me, a) - distanceKm(me, b)) : [...f].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }, [source, q, sort, me])

  const cur = list.find((p) => p.id === sel)
  const info = useMemo(() => (cur ? findInfo(cur, infos) : null), [cur, infos])
  useEffect(() => { setMore(false) }, [sel])

  return (
    <>
      <div className="stone-card hist-head">
        <div>
          <h2>{usingApi ? `제주 역사문화 장소 ${api.length}곳` : `역사문화 추천 장소 ${CURATED.length}곳`}</h2>
          <p>
            {st.loading
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />불러오는 중…</>
              : usingApi ? '출처 제주특별자치도 · 제주역사문화위치정보' : '제주 전체 목록은 아직 불러오지 못했어요. 돌빛 제주길이 고른 장소를 먼저 보여 드려요.'}
          </p>
        </div>
        <div className="hist-tools">
          <Form.Control size="sm" placeholder="장소·주소 검색" value={q} onChange={(e) => { setQ(e.target.value); setShown(40) }} aria-label="장소 검색" />
          <Form.Select size="sm" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="정렬">
            <option value="auto">{me ? '가까운 순' : '이름순'}</option>
            <option value="name">이름순</option>
            {me && <option value="near">가까운 순</option>}
          </Form.Select>
          <LocateBar />
        </div>
      </div>

      {!usingApi && !st.loading && (
        <DoliSay mood="think" className="mb-3">전체 목록은 연결되면 자동으로 채워져요. 지금은 추천 장소부터 둘러봐요.</DoliSay>
      )}

      {list.length === 0 ? (
        <div className="stone-card text-center text-muted py-4">맞는 장소가 없어요. 검색어를 줄여 보세요.</div>
      ) : (
        <div className="row g-3">
          <div className="col-lg-7">
            <RealMap places={list} selectedId={sel} onPick={setSel} me={me} />
          </div>
          <div className="col-lg-5">
            {cur && (
              <article className="stone-card hist-sel">
                {cur.curated && <PlacePhoto id={cur.id} name={cur.name} />}
                <h3>{cur.name}</h3>
                <p className="hist-sel__addr"><i className="bi bi-geo-alt me-1" />{cur.addr || '주소 정보 없음'}{me && <b>{fmtKm(distanceKm(me, cur))}</b>}</p>
                {info && (
                  <div className="hist-info">
                    {(info.subtitle || info.title) && <h4>{info.subtitle || info.title}</h4>}
                    {info.summary && <p>{info.summary}</p>}
                    {info.content && info.content !== info.summary && (
                      more
                        ? <p className="hist-info__more">{info.content}</p>
                        : <button type="button" className="btn btn-link btn-sm p-0 mb-2" onClick={() => setMore(true)}>자세히 읽기</button>
                    )}
                    <small className="text-muted d-block mb-2">출처 {info.source || '제주특별자치도'} · 제주역사문화일반정보</small>
                  </div>
                )}
                <div className="d-flex flex-wrap gap-2">
                  <a className="btn btn-sm btn-dol" href={routeUrl(cur)} target="_blank" rel="noreferrer"><i className="bi bi-signpost-2 me-1" />길찾기</a>
                  {cur.curated && <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => { select(cur.id); navigate('/map') }}>이야기 보기</button>}
                  {info?.link && <a className="btn btn-sm btn-outline-dark" href={info.link} target="_blank" rel="noreferrer">자료 보기</a>}
                  {cur.url && <a className="btn btn-sm btn-outline-dark" href={cur.url} target="_blank" rel="noreferrer">상세 정보</a>}
                </div>
              </article>
            )}
            <ul className="hist-items">
              {list.slice(0, shown).map((p, i) => (
                <li key={p.id}>
                  <button type="button" className={p.id === sel ? 'on' : ''} onClick={() => setSel(p.id)}>
                    <span className="hist-num">{i + 1}</span>
                    <span className="hist-item__text"><b>{p.name}</b><small>{p.addr || '주소 정보 없음'}</small></span>
                    {me && <em>{fmtKm(distanceKm(me, p))}</em>}
                  </button>
                </li>
              ))}
            </ul>
            {shown < list.length && <button className="btn btn-sm btn-dol mt-2" onClick={() => setShown(shown + 40)}>더 보기 ({list.length - shown}곳 남음)</button>}
          </div>
        </div>
      )}
    </>
  )
}
