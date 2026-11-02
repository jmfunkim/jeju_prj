import { useEffect, useState } from 'react'
import { Form, Nav } from 'react-bootstrap'
import { fetchMyth } from '../api/client'
import { ApiState } from './ui'

const TYPE_COLOR = { 원문: '#f08a1c', 해제: '#3d5fa8', 현지조사: '#1e8a9a' }

// 제주특별자치도 '제주 신화 콘텐츠' 공공 API — 본풀이·당신화 원문과 해제, 현지조사 자료
export default function MythArchive() {
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [limit, setLimit] = useState(24)
  const [st, setSt] = useState({ loading: true, error: '', data: null })

  useEffect(() => {
    let alive = true
    setSt((s) => ({ ...s, loading: true, error: '' }))
    const t = setTimeout(() => {
      fetchMyth(q, type, limit)
        .then((data) => alive && setSt({ loading: false, error: '', data }))
        .catch((e) => alive && setSt({ loading: false, error: e.message, data: null }))
    }, 250)
    return () => { alive = false; clearTimeout(t) }
  }, [q, type, limit])

  const d = st.data
  return (
    <section className="archive mt-5">
      <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
        <div>
          <p className="stamp mb-1">제주도청 공공데이터</p>
          <h2 className="h3 mb-0">제주 신화 아카이브{d && <small className="text-muted"> {d.total}건</small>}</h2>
        </div>
        <Form.Control className="ms-auto" style={{ maxWidth: 260 }} size="sm" placeholder="제목·태그 검색 (예: 송당, 삼공)" value={q} onChange={(e) => { setQ(e.target.value); setLimit(24) }} />
      </div>
      {d && (
        <Nav variant="pills" className="pill-nav mb-3" activeKey={type} onSelect={(k) => { setType(k ?? ''); setLimit(24) }}>
          <Nav.Item><Nav.Link eventKey="">전체</Nav.Link></Nav.Item>
          {d.types.map((t) => <Nav.Item key={t}><Nav.Link eventKey={t}>{t}</Nav.Link></Nav.Item>)}
        </Nav>
      )}
      <p className="small text-muted mb-3">
        본풀이는 제주 마을의 당(신당)에서 전해 온 신들의 이야기예요. 위 탭은 제주도청 자료의 구분입니다 —
        <b> 원문</b>은 채록한 본풀이 원본, <b>해제</b>는 자료를 설명하는 글, <b>현지조사</b>는 현장에서 조사한 자료예요.
      </p>
      <ApiState loading={st.loading && !d} error={st.error} empty={!st.loading && !st.error && d && d.items.length === 0} emptyText="맞는 자료가 없어요." />
      {d && (
        <>
          <div className="row g-2 row-cols-1 row-cols-md-2 row-cols-xl-3">
            {d.items.map((m) => (
              <div className="col" key={m.code}>
                <article className="stone-card archive-item">
                  <span className="mini-tag" style={{ '--k': TYPE_COLOR[m.type] ?? '#6e7f86' }}>{m.type}</span>
                  <h3>{m.title}</h3>
                  <div className="d-flex flex-wrap gap-1 mb-2">{m.tags.slice(0, 3).map((t) => <span key={t} className="kw">#{t}</span>)}</div>
                  <a className="btn btn-sm btn-outline-dark" href={`https://search.naver.com/search.naver?query=${encodeURIComponent(`제주 ${m.title.replace(/\(.*\)/, '')} 본풀이`)}`} target="_blank" rel="noreferrer">
                    <i className="bi bi-search me-1" />더 알아보기
                  </a>
                </article>
              </div>
            ))}
          </div>
          <div className="d-flex align-items-center gap-3 mt-3">
            <span className="small text-muted">{d.matched}건 중 {d.items.length}건 표시</span>
            {d.items.length < d.matched && <button className="btn btn-sm btn-dol" onClick={() => setLimit(limit + 24)}>더 보기</button>}
          </div>
        </>
      )}
      <p className="small text-muted mt-2">출처: 제주특별자치도 제주 신화 콘텐츠 API(제목·구분·태그). API가 주는 e-book·PDF 주소는 현재 열리지 않아 연결하지 않고, 검색으로 이어 줘요.</p>
    </section>
  )
}
