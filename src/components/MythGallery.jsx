import { useMemo, useState } from 'react'
import { Form, Modal, Nav } from 'react-bootstrap'
import { useMythMedia } from '../lib/photos'

// 제주신화정보(제주도청)의 사진·삽화·애니메이션 장면·동영상 장면 모음
const FORMS = [
  { key: '사진', label: '사진', help: '전설이 깃든 장소의 사진' },
  { key: '이미지', label: '삽화', help: '이야기를 그린 그림' },
  { key: '애니메이션', label: '애니메이션 장면', help: '애니메이션의 대표 장면(영상은 제공되지 않아요)' },
  { key: '동영상', label: '동영상 장면', help: '동영상의 대표 장면(영상은 제공되지 않아요)' },
]

export default function MythGallery() {
  const items = useMythMedia()
  const [form, setForm] = useState('사진')
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(24)
  const [open, setOpen] = useState(null)

  const counts = useMemo(() => items.reduce((m, i) => ({ ...m, [i.form]: (m[i.form] ?? 0) + 1 }), {}), [items])
  const list = useMemo(() => items.filter((i) => i.form === form && (!q.trim() || i.title.includes(q.trim()))), [items, form, q])
  if (items.length === 0) return null
  const help = FORMS.find((f) => f.key === form)?.help

  return (
    <section className="gallery">
      <div className="section-title"><h2>전설의 사진과 그림</h2><small>제주도청 제주신화정보 · {items.length}점</small></div>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <Nav variant="pills" className="pill-nav" activeKey={form} onSelect={(k) => { setForm(k); setLimit(24) }}>
          {FORMS.filter((f) => counts[f.key]).map((f) => <Nav.Item key={f.key}><Nav.Link eventKey={f.key}>{f.label} <small>{counts[f.key]}</small></Nav.Link></Nav.Item>)}
        </Nav>
        <Form.Control className="ms-auto" style={{ maxWidth: 220 }} size="sm" placeholder="제목 검색 (예: 용두암)" value={q} onChange={(e) => { setQ(e.target.value); setLimit(24) }} />
      </div>
      <p className="small text-muted mb-3">{help}</p>

      {list.length === 0 && <p className="text-muted py-3">맞는 자료가 없어요.</p>}
      <div className="gallery__grid">
        {list.slice(0, limit).map((m) => (
          <button key={m.image} type="button" className={`gallery__item gallery__item--${m.form === '사진' || m.form === '이미지' ? 'big' : 'small'}`} onClick={() => setOpen(m)}>
            <img src={m.image} alt={m.title} loading="lazy" />
            <span>{m.title}</span>
          </button>
        ))}
      </div>
      <div className="d-flex align-items-center gap-3 mt-3">
        <span className="small text-muted">{list.length}점 중 {Math.min(limit, list.length)}점 표시</span>
        {limit < list.length && <button className="btn btn-sm btn-dol" onClick={() => setLimit(limit + 24)}>더 보기</button>}
      </div>
      <p className="small text-muted mt-2 mb-0">출처: 제주특별자치도 제주신화정보(OpenAPI). 이미지의 저작권은 제주특별자치도에 있어요.</p>

      <Modal show={!!open} onHide={() => setOpen(null)} centered size="lg" contentClassName="stone-modal">
        {open && (
          <>
            <Modal.Header closeButton><Modal.Title as="h2" className="h5 mb-0">{open.title}</Modal.Title></Modal.Header>
            <Modal.Body className="text-center">
              <img className="gallery__zoom" src={open.image} alt={open.title} />
              <p className="small text-muted mt-3 mb-0">
                {FORMS.find((f) => f.key === open.form)?.label ?? open.form} · 제공 {open.credit}{open.date ? ` · 발행 ${open.date}` : ''}
                {(open.form === '애니메이션' || open.form === '동영상') && ' · 대표 장면만 제공돼요'}
              </p>
            </Modal.Body>
          </>
        )}
      </Modal>
    </section>
  )
}
