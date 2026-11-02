import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { fetchHistoryPlaces } from '../api/client'
import { distanceKm, fmtKm } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'
import RealMap from './RealMap'
import { ApiState, LocateBar, routeUrl } from './ui'

// 공공데이터포털 '제주역사문화위치정보' — 이름·주소·좌표를 받아 2D 지도와 목록으로 보여 줍니다
export default function HistoryPlaces() {
  const me = useAppStore((s) => s.me)
  const [q, setQ] = useState('')
  const [shown, setShown] = useState(30)
  const [sel, setSel] = useState(null)
  const [st, setSt] = useState({ loading: true, error: '', data: null })

  useEffect(() => {
    let alive = true
    fetchHistoryPlaces()
      .then((data) => alive && setSt({ loading: false, error: '', data }))
      .catch((e) => alive && setSt({ loading: false, error: e.message, data: null }))
    return () => { alive = false }
  }, [])

  const items = useMemo(() => {
    const all = (st.data?.items ?? []).map((p) => ({ ...p, id: String(p.id), kind: 'history' }))
    const f = q.trim() ? all.filter((p) => (p.name + (p.addr ?? '')).includes(q.trim())) : all
    return me ? [...f].sort((a, b) => distanceKm(me, a) - distanceKm(me, b)) : f
  }, [st.data, q, me])

  return (
    <>
      <div className="stone-card p-3 mb-3 d-flex flex-wrap gap-3 align-items-center">
        <LocateBar />
        <Form.Control style={{ maxWidth: 240 }} size="sm" placeholder="장소·주소 검색" value={q} onChange={(e) => { setQ(e.target.value); setShown(30) }} />
        <span className="small text-muted">출처 제주특별자치도 · 역사문화 위치정보{st.data && ` · ${st.data.items.length}곳`}</span>
      </div>
      <ApiState loading={st.loading} error={st.error} empty={!st.loading && !st.error && items.length === 0} emptyText="맞는 장소가 없어요." />
      {st.data && items.length > 0 && (
        <div className="row g-3">
          <div className="col-lg-6">
            <RealMap places={items} selectedId={sel} onPick={setSel} me={me} />
          </div>
          <div className="col-lg-6">
            <ul className="hist-list">
              {items.slice(0, shown).map((p) => (
                <li key={p.id} className={p.id === sel ? 'on' : ''} onClick={() => setSel(p.id)}>
                  <b>{p.name}</b>
                  <small>{p.addr}</small>
                  <span>
                    {me && <em>{fmtKm(distanceKm(me, p))}</em>}
                    <a href={routeUrl(p)} target="_blank" rel="noreferrer">길찾기</a>
                    {p.url && <a href={p.url} target="_blank" rel="noreferrer">상세</a>}
                  </span>
                </li>
              ))}
            </ul>
            {shown < items.length && <button className="btn btn-sm btn-dol mt-2" onClick={() => setShown(shown + 30)}>더 보기 ({items.length - shown}곳 남음)</button>}
          </div>
        </div>
      )}
    </>
  )
}
