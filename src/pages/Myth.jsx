import { useState } from 'react'
import { Modal, Nav } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Bonpuri from '../components/Bonpuri'
import MythGallery from '../components/MythGallery'
import { DoliSay } from '../components/Doli'
import { Cover, PlaceBody, SaveButton } from '../components/ui'
import { placesOf } from '../data/places'
import { useAppStore } from '../store/useAppStore'

const MYTHS = placesOf('myth')
const TAGS = ['전체', ...new Set(MYTHS.map((m) => m.tag))]

export default function Myth() {
  const [tag, setTag] = useState('전체')
  const [open, setOpen] = useState(null)
  const { select, me } = useAppStore()
  const navigate = useNavigate()
  const list = MYTHS.filter((m) => tag === '전체' || m.tag === tag)

  return (
    <div className="page">
      <header className="page-head myth-head">
        <p className="stamp">신화 · 설화</p>
        <h1>섬을 만든 거인과 떨어진 봉우리</h1>
        <p>제주의 이야기를 두 갈래로 만나요. 장소에 얽힌 설화 {MYTHS.length}편, 그리고 신들의 이야기 본풀이예요.</p>
        <DoliSay mood="hi" className="mt-3">설화는 가서 만나고, 본풀이는 신들의 이야기예요. 어디부터 읽어 볼까요?</DoliSay>
      </header>

      <div className="section-title"><h2>장소로 만나는 설화</h2><small>{MYTHS.length}편 · 카드를 누르면 전문이 열려요</small></div>
      <Nav variant="pills" className="pill-nav mb-3" activeKey={tag} onSelect={setTag}>
        {TAGS.map((t) => <Nav.Item key={t}><Nav.Link eventKey={t}>{t}</Nav.Link></Nav.Item>)}
      </Nav>

      <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-3">
        {list.map((m) => (
          <div className="col" key={m.id}>
            <article className="stone-card myth-card" onClick={() => setOpen(m)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(m)}>
              <Cover kind="myth" label={m.tag} id={m.id} tall />
              <SaveButton id={m.id} compact className="cover-save" />
              <h2>{m.title}</h2>
              <p>{m.summary}</p>
              <div className="myth-card__foot">
                <small className="text-muted"><i className="bi bi-geo-alt me-1" />{m.name} · {m.spot}</small>
                <span className="myth-card__more">전문 읽기 <i className="bi bi-arrow-right" /></span>
              </div>
              <div className="d-flex flex-wrap gap-1 mt-2">{m.keywords.map((k) => <span key={k} className="kw">#{k}</span>)}</div>
            </article>
          </div>
        ))}
      </div>
      <p className="text-muted small mt-3">※ 같은 이야기도 마을과 채록자에 따라 내용이 다르게 전해질 수 있어요.</p>

      <MythGallery />

      <Bonpuri />

      <Modal show={!!open} onHide={() => setOpen(null)} centered scrollable size="lg" contentClassName="stone-modal">
        {open && (
          <>
            <Modal.Header closeButton />
            <Modal.Body><PlaceBody place={open} me={me} /></Modal.Body>
            <Modal.Footer className="justify-content-between">
              <SaveButton id={open.id} />
              <button className="btn btn-dol" onClick={() => { select(open.id); navigate('/map') }}>
                <i className="bi bi-globe-asia-australia me-1" />지도에서 보기
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  )
}
