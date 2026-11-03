import { useNavigate } from 'react-router-dom'
import HistoryPlaces from '../components/HistoryPlaces'
import { Cover, SaveButton } from '../components/ui'
import { KINDS, placesOf } from '../data/places'
import { useAppStore } from '../store/useAppStore'

// 역사문화 — 신화·설화, 돌문화와 같은 결로 따로 둔 페이지.
// 위쪽은 돌빛 제주길이 고른 장소 이야기, 아래쪽은 공공데이터 '제주역사문화위치정보' 지도·목록입니다.
export default function History() {
  const select = useAppStore((s) => s.select)
  const navigate = useNavigate()
  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">제주 역사문화</p>
        <h1>기억을 품은 자리들</h1>
        <p>관아와 유배지, 항쟁과 평화의 터, 바다를 지킨 사람들의 이야기. 추천 장소를 먼저 읽고, 아래 지도에서 제주의 역사문화 장소를 더 찾아보세요.</p>
      </header>

      <h2 className="h4 mb-3"><i className={`bi bi-${KINDS.history.icon} me-2`} />돌빛 제주길이 고른 장소</h2>
      <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-3 mb-4">
        {placesOf('history').map((p) => (
          <div className="col" key={p.id}>
            <article className="stone-card place-card" style={{ '--k': KINDS.history.color }}>
              <Cover kind="history" label={p.tag} id={p.id} tall />
              <h3>{p.name}</h3>
              <p>{p.summary}</p>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-dol" onClick={() => { select(p.id); navigate('/map') }}>지도에서 보기</button>
                <SaveButton id={p.id} compact />
              </div>
            </article>
          </div>
        ))}
      </div>

      <h2 className="h4 mb-3"><i className="bi bi-pin-map me-2" />제주 역사문화 장소 지도</h2>
      <HistoryPlaces />
    </div>
  )
}
