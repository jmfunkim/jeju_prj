import { useRef, useState } from 'react'
import { Accordion, ButtonGroup, ToggleButton } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import ThreeStage from '../components/ThreeStage'
import { SaveButton } from '../components/ui'
import { placesOf } from '../data/places'
import { STONES } from '../data/stones'
import { buildHarbang } from '../scenes/harbang'
import { useAppStore } from '../store/useAppStore'

const MOODS = [['day', '한낮'], ['dusk', '노을'], ['night', '달밤']]

export default function Stone() {
  const [mood, setMood] = useState('day')
  const [orange, setOrange] = useState(false)
  const [spin, setSpin] = useState(true)
  const live = useRef({})
  Object.assign(live.current, { mood, orange, spin })
  const select = useAppStore((s) => s.select)
  const navigate = useNavigate()

  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">제주 돌문화</p>
        <h1>구멍 숭숭 뚫린 돌의 섬</h1>
        <p>화산섬 사람들은 현무암으로 신을 모시고, 밭을 지키고, 집을 열고 닫았어요. 돌하르방을 직접 돌려 보세요.</p>
      </header>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="stone-card p-2">
            <div className="map-frame map-frame--tall">
              <ThreeStage camera={{ position: [0, 3.2, 8.5], fov: 42 }}
                controls={{ enablePan: false, minDistance: 4.5, maxDistance: 14, maxPolarAngle: Math.PI * 0.49 }}
                build={(ctx) => { ctx.controls.target.set(0, 2.2, 0); return buildHarbang(ctx, live.current) }} />
            </div>
            <div className="d-flex flex-wrap gap-2 justify-content-between mt-2 px-1">
              <ButtonGroup size="sm">
                {MOODS.map(([k, l]) => (
                  <ToggleButton key={k} id={`mood-${k}`} type="radio" name="mood" variant="outline-dark" value={k} checked={mood === k} onChange={() => setMood(k)}>{l}</ToggleButton>
                ))}
              </ButtonGroup>
              <div className="d-flex gap-1">
                <button className={`btn btn-sm ${orange ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setOrange(!orange)}>🍊 감귤 들기</button>
                <button className={`btn btn-sm ${spin ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setSpin(!spin)}>자동 회전</button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <Accordion defaultActiveKey="harbang" className="stone-accordion">
            {STONES.map((s) => (
              <Accordion.Item eventKey={s.id} key={s.id}>
                <Accordion.Header><i className={`bi bi-${s.icon} me-2`} /><b>{s.name}</b><span className="ms-2 text-muted small d-none d-sm-inline">{s.what}</span></Accordion.Header>
                <Accordion.Body>{s.detail}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </div>

      <h2 className="h4 mt-4 mb-3"><i className="bi bi-bricks me-2" />돌문화를 만날 수 있는 곳</h2>
      <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-3">
        {placesOf('stone').map((p) => (
          <div className="col" key={p.id}>
            <article className="stone-card place-card" style={{ '--k': '#6e7f86' }}>
              <span className="mini-tag">{p.tag}</span>
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
    </div>
  )
}
