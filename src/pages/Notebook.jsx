import { Link, useNavigate } from 'react-router-dom'
import { ProgressBar } from 'react-bootstrap'
import { KindBadge, SaveButton, distanceLabel } from '../components/ui'
import { KINDS, KIND_KEYS, PLACES, placeById, placesOf } from '../data/places'
import { useAppStore } from '../store/useAppStore'

export default function Notebook() {
  const { saved, select, me } = useAppStore()
  const navigate = useNavigate()
  const items = saved.map(placeById).filter(Boolean)

  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">내 수첩</p>
        <h1>담아 둔 이야기와 장소</h1>
        <p>북마크한 장소가 이 브라우저에 보관돼요. 세 갈래를 골고루 모아 보세요.</p>
      </header>

      <div className="row g-3 mb-4">
        {KIND_KEYS.map((k) => {
          const total = placesOf(k).length
          const have = items.filter((p) => p.kind === k).length
          return (
            <div className="col-md-4" key={k}>
              <div className="stone-card p-3" style={{ '--k': KINDS[k].color }}>
                <div className="d-flex justify-content-between mb-1"><b><i className={`bi bi-${KINDS[k].icon} me-1`} />{KINDS[k].label}</b><span>{have}/{total}</span></div>
                <ProgressBar now={(have / total) * 100} className="stone-progress" />
              </div>
            </div>
          )
        })}
      </div>

      {items.length === 0 ? (
        <div className="stone-card p-5 text-center">
          <p className="text-muted">아직 비어 있어요. 장소 옆의 북마크 버튼으로 담아 보세요.</p>
          <Link className="btn btn-dol me-2" to="/map">3D 지도</Link>
          <Link className="btn btn-outline-dark" to="/myth">신화·설화</Link>
        </div>
      ) : (
        <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-3">
          {items.map((p) => (
            <div className="col" key={p.id}>
              <article className="stone-card place-card" style={{ '--k': KINDS[p.kind].color }}>
                <div className="d-flex justify-content-between align-items-start">
                  <KindBadge kind={p.kind}>{p.tag}</KindBadge>
                  <SaveButton id={p.id} compact />
                </div>
                <h3>{p.name}</h3>
                <p>{p.summary}</p>
                <div className="d-flex align-items-center justify-content-between">
                  <button className="btn btn-sm btn-dol" onClick={() => { select(p.id); navigate('/map') }}>지도에서 보기</button>
                  <small className="text-muted">{distanceLabel(me, p)}</small>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
      <p className="text-muted small mt-3">전체 {PLACES.length}곳 중 {items.length}곳을 담았어요.</p>
    </div>
  )
}
