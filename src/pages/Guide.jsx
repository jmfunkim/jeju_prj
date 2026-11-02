import { useState } from 'react'
import { Badge, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { KindBadge, LocateBar } from '../components/ui'
import { placeById } from '../data/places'
import { askGuide } from '../api/client'
import { useAppStore } from '../store/useAppStore'

const EXAMPLES = [
  '아이와 1시간, 비 오는 날 갈 만한 곳',
  '신화 이야기 위주로 반나절 코스 짜 줘',
  '걸어서 2시간, 돌문화랑 역사 보고 싶어',
  '해녀 이야기랑 용암동굴 보고 싶어',
]
const TOOL_LABEL = { plan_course: '코스 짜기', get_weather: '날씨 확인', nearby_tour: '주변 관광정보', search_places: '장소 검색' }

export default function Guide() {
  const me = useAppStore((s) => s.me)
  const [q, setQ] = useState('')
  const [log, setLog] = useState([])
  const [busy, setBusy] = useState(false)

  async function ask(text) {
    const question = (text ?? q).trim()
    if (!question || busy) return
    setQ('')
    setBusy(true)
    setLog((l) => [...l, { role: 'user', text: question }])
    try {
      const r = await askGuide(question, me)
      setLog((l) => [...l, { role: 'guide', ...r }])
    } catch (e) {
      setLog((l) => [...l, { role: 'error', text: e.message }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">AI 가이드</p>
        <h1>오늘 어디 갈까요?</h1>
        <p>시간, 날씨, 함께 가는 사람을 말해 주세요. 가이드가 코스 짜기·날씨·주변 관광정보 도구를 불러 코스를 만들어 줘요.</p>
      </header>

      <div className="guide stone-card">
        <div className="guide__chips">
          {EXAMPLES.map((t) => <button key={t} type="button" className="chip" onClick={() => ask(t)}>{t}</button>)}
        </div>

        <div className="guide__log" aria-live="polite">
          {log.length === 0 && <p className="text-muted mb-0">예: “아이와 1시간, 비 오는 날 갈 만한 곳”</p>}
          {log.map((m, i) => (
            <div key={i} className={`msg msg--${m.role}`}>
              {m.role === 'guide' ? (
                <>
                  <div className="msg__meta">
                    <Badge bg={m.mode === 'ai' ? 'dark' : 'secondary'}>{m.mode === 'ai' ? 'Claude 에이전트' : '기본 가이드(규칙 기반)'}</Badge>
                    {m.tools?.length > 0 && <small>사용한 도구: {[...new Set(m.tools)].map((t) => TOOL_LABEL[t] ?? t).join(' · ')}</small>}
                  </div>
                  <p className="msg__text">{m.answer}</p>
                  {m.ids?.length > 0 && (
                    <>
                      <div className="msg__stops">
                        {m.ids.map((id, n) => {
                          const p = placeById(id)
                          return p ? <span key={id} className="msg__stop"><b>{n + 1}</b>{p.name}<KindBadge kind={p.kind}>{p.tag}</KindBadge></span> : null
                        })}
                      </div>
                      <Link className="btn btn-sm btn-dol" to={`/walk?ids=${m.ids.join(',')}&mode=${m.travel ?? 'car'}`}><i className="bi bi-signpost-split me-1" />이 코스로 산책 열기</Link>
                    </>
                  )}
                </>
              ) : (
                <p className="msg__text mb-0">{m.text}</p>
              )}
            </div>
          ))}
          {busy && <div className="msg msg--guide"><Spinner size="sm" className="me-2" />코스를 짜는 중…</div>}
        </div>

        <form className="guide__form" onSubmit={(e) => { e.preventDefault(); ask() }}>
          <input className="form-control" value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder="시간, 날씨, 누구와 가는지 알려 주세요" aria-label="가이드에게 질문" />
          <button className="btn btn-dol" disabled={busy || !q.trim()}>묻기</button>
        </form>
        <LocateBar className="mt-3" />
        <p className="small text-muted mt-2 mb-0">{me && !me.demo ? '내 위치에서 출발해요.' : '위치를 찾지 않으면 제주시청 부근에서 출발해요.'}</p>
      </div>
    </div>
  )
}
