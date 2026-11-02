import { useRef, useState } from 'react'
import ThreeStage from '../components/ThreeStage'
import PageHeader from '../components/PageHeader'
import { buildHarbang } from '../scenes/harbang'

const MOODS = [['day', '한낮'], ['dusk', '노을'], ['night', '달밤']]
const FACTS = [
  ['재료', '제주의 화산암, 현무암'],
  ['역할', '마을과 성문 앞을 지키는 수호 석상'],
  ['생김새', '벙거지, 부리부리한 눈, 큰 코, 배 위의 두 손'],
  ['이름', '돌 + 하르방(제주어로 할아버지)'],
  ['함께 쓰인 돌', '구멍 숭숭 뚫린 현무암은 제주 돌담에도 쓰인다'],
]

export default function Harbang() {
  const [mood, setMood] = useState('day')
  const [orange, setOrange] = useState(false)
  const [spin, setSpin] = useState(true)
  const live = useRef({})
  Object.assign(live.current, { mood, orange, spin })

  return (
    <div className="wrap">
      <PageHeader no="02" title="돌하르방 3D" subtitle="드래그해서 앞뒤로 돌려 보세요. 조명과 소품을 바꾸면 분위기가 달라집니다." />
      <div className="hbgrid">
        <div className="hbbox">
          <ThreeStage camera={{ position: [0, 3.2, 8.5], fov: 42 }}
            controls={{ enablePan: false, minDistance: 4.5, maxDistance: 14, maxPolarAngle: Math.PI * 0.49 }}
            build={(ctx) => { ctx.controls.target.set(0, 2.2, 0); return buildHarbang(ctx, live.current) }} />
        </div>
        <aside className="panel">
          <h2>돌하르방</h2>
          <div className="group">
            <span>조명</span>
            <div className="seg">{MOODS.map(([k, l]) => <button key={k} className={mood === k ? 'on' : ''} onClick={() => setMood(k)}>{l}</button>)}</div>
          </div>
          <div className="group">
            <span>소품·동작</span>
            <div className="seg">
              <button className={orange ? 'on' : ''} onClick={() => setOrange(!orange)}>🍊 감귤 들기</button>
              <button className={spin ? 'on' : ''} onClick={() => setSpin(!spin)}>자동 회전</button>
            </div>
          </div>
          <dl className="facts">{FACTS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </aside>
      </div>
    </div>
  )
}
