import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProgressBar } from 'react-bootstrap'
import Doli from '../components/Doli'
import { Cover, SaveButton, distanceLabel } from '../components/ui'
import { earnedBadges, stageOf } from '../data/world'
import { KINDS, KIND_KEYS, PLACES, placeById, placesOf } from '../data/places'
import { MODES } from '../lib/course'
import { courseUrl, shareCourse } from '../lib/share'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'

export default function Notebook() {
  const { saved, stamps, select, me, courses, removeCourse, renameCourse } = useAppStore()
  const [note, setNote] = useState('')
  const user = useAuthStore((st) => st.user)
  const sync = useAuthStore((st) => st.sync)
  const navigate = useNavigate()
  const items = saved.map(placeById).filter(Boolean)
  const stampCount = Object.keys(stamps).length
  const stage = stageOf(stampCount)
  const badges = earnedBadges(stamps)

  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">내 수첩</p>
        <h1>담아 둔 이야기와 장소</h1>
        <p>북마크한 장소와 방문 도장을 모아 둬요. 세 분야를 골고루 모아 보세요.</p>
        {user ? (
          <p className="sync-note"><i className="bi bi-cloud-check me-1" />{user.name} 님의 수첩 · {{ syncing: '저장 중…', ok: '계정에 저장됨', error: '저장하지 못했어요. 새로고침 후 다시 시도해 주세요', idle: '' }[sync]}</p>
        ) : (
          <p className="sync-note"><i className="bi bi-cloud-slash me-1" />지금은 이 브라우저에만 저장돼요. <Link to="/login">로그인</Link>하면 계정에 보관해요.</p>
        )}
      </header>

      <section className="stage stone-card">
        <Doli size={110} mood={stage.mood} glow={stage.glow} />
        <div className="stage__body">
          <p className="stamp">돌빛 단계</p>
          <h2>{stage.name} <small>{stampCount}/{PLACES.length}</small></h2>
          <p>{stage.say}</p>
          <div className="stage__bar" aria-hidden="true"><i style={{ width: `${(stampCount / PLACES.length) * 100}%` }} /></div>
          <small className="text-muted">{stage.next ? `다음 단계 '${stage.next.name}'까지 도장 ${stage.toNext}개` : '모든 돌빛이 켜졌어요'}</small>
          <div className="badges">
            {badges.map((b) => (
              <span key={b.kind} className={`badge-k ${b.earned ? 'on' : ''}`} style={{ '--k': KINDS[b.kind].color }} title={`${b.have}/${b.total}`}>
                <i className={`bi bi-${b.icon}`} />{b.name}<em>{b.have}/{b.total}</em>
              </span>
            ))}
          </div>
        </div>
      </section>

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
        <h2 className="h5 mb-2">저장한 코스 <small className="text-muted">{courses.length}개</small></h2>
        {courses.length === 0 ? (
          <div className="stone-card saved-empty">
            <p className="mb-2">아직 저장한 코스가 없어요. 이야기 산책에서 마음에 드는 코스를 저장해 보세요.</p>
            <Link to="/walk" className="btn btn-sm btn-dol">코스 만들러 가기</Link>
          </div>
        ) : (
          <div className="saved-courses">
            {courses.map((c) => {
              const stops = c.ids.map(placeById).filter(Boolean)
              const share = async () => {
                const r = await shareCourse({ title: '돌빛 제주길 이야기 산책', text: `돌빛 제주길 이야기 산책 코스예요: ${stops.map((p) => p.name).join(' → ')}`, url: courseUrl(c.ids, c.mode) })
                if (r === 'copied') { setNote('링크를 복사했어요.'); setTimeout(() => setNote(''), 2500) }
              }
              return (
                <article key={c.id} className="stone-card saved-course">
                  <div className="saved-course__head">
                    <h3>{c.name}</h3>
                    <button type="button" className="icon-btn" title="이름 바꾸기" aria-label="이름 바꾸기" onClick={() => { const n = window.prompt('코스 이름', c.name); if (n !== null) renameCourse(c.id, n) }}><i className="bi bi-pencil" /></button>
                  </div>
                  <p className="saved-course__meta">{stops.length}곳 · {MODES[c.mode]?.label ?? '자동차'} · {new Date(c.at).toLocaleDateString('ko-KR')} 저장</p>
                  <ol className="saved-course__stops">
                    {stops.map((p) => <li key={p.id} style={{ '--k': KINDS[p.kind].color }}><i />{p.name}</li>)}
                  </ol>
                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-sm btn-dol" onClick={() => navigate(`/walk?ids=${c.ids.join(',')}&mode=${c.mode}`)}><i className="bi bi-signpost-split me-1" />열기</button>
                    <button type="button" className="btn btn-sm btn-outline-dark" onClick={share}><i className="bi bi-share me-1" />공유</button>
                    <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => { if (window.confirm(`'${c.name}' 코스를 지울까요?`)) removeCourse(c.id) }}><i className="bi bi-trash me-1" />삭제</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
        {note && <p className="small text-success mt-2 mb-0" role="status">{note}</p>}
      </section>

      <section className="mb-4">
        <h2 className="h5 mb-2">돌빛 도장판 <small className="text-muted">{Object.keys(stamps).length}/{PLACES.length}</small></h2>
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
        <p className="small text-muted mt-2">도장은 <Link to="/walk">이야기 산책</Link>에서 찍어요. 장소 500m 안에서 찍으면 현장 돌빛이 켜져요.</p>
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
                <Cover kind={p.kind} label={p.tag} id={p.id} />
                <SaveButton id={p.id} compact className="cover-save" />
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
