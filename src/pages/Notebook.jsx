import { Link, useNavigate } from 'react-router-dom'
import { ProgressBar } from 'react-bootstrap'
import { KindBadge, SaveButton, distanceLabel } from '../components/ui'
import { KINDS, KIND_KEYS, PLACES, placeById, placesOf } from '../data/places'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'

export default function Notebook() {
  const { saved, stamps, select, me } = useAppStore()
  const user = useAuthStore((st) => st.user)
  const sync = useAuthStore((st) => st.sync)
  const navigate = useNavigate()
  const items = saved.map(placeById).filter(Boolean)

  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">내 수첩</p>
        <h1>담아 둔 이야기와 장소</h1>
        <p>북마크한 장소와 방문 도장을 모아 둬요. 세 갈래를 골고루 모아 보세요.</p>
        {user ? (
          <p className="sync-note"><i className="bi bi-cloud-check me-1" />{user.name} 님의 수첩 · {{ syncing: '저장 중…', ok: '계정에 저장됨', error: '저장하지 못했어요. 새로고침 후 다시 시도해 주세요', idle: '' }[sync]}</p>
        ) : (
          <p className="sync-note"><i className="bi bi-cloud-slash me-1" />지금은 이 브라우저에만 저장돼요. <Link to="/login">로그인</Link>하면 계정에 보관해요.</p>
        )}
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

      <section className="mb-4">
        <h2 className="h5 mb-2">방문 도장판 <small className="text-muted">{Object.keys(stamps).length}/{PLACES.length}</small></h2>
        <div className="stamp-board">
          {PLACES.map((p) => {
            const st = stamps[p.id]
            return (
              <div key={p.id} className={`stamp-slot ${st ? 'on' : ''} ${st?.verified ? 'is-verified' : ''}`} style={{ '--k': KINDS[p.kind].color }} title={st ? new Date(st.at).toLocaleDateString('ko-KR') : '아직 안 찍었어요'}>
                <span>{st ? '✔' : ''}</span>
                <b>{p.name}</b>
              </div>
            )
          })}
        </div>
        <p className="small text-muted mt-2">도장은 <Link to="/walk">이야기 산책</Link>에서 찍어요. 장소 500m 안에서 찍으면 현장 도장이 돼요.</p>
      </section>

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
