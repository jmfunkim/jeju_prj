import { useEffect, useState } from 'react'
import { Form, Pagination } from 'react-bootstrap'
import { fetchRelics } from '../api/client'
import { ApiState } from './ui'

const PER = 9

// 제주돌문화공원 소장 유물 공공 API — 재질·시대로 걸러 보기
export default function RelicShelf() {
  const [q, setQ] = useState('')
  const [material, setMaterial] = useState('')
  const [age, setAge] = useState('')
  const [page, setPage] = useState(1)
  const [st, setSt] = useState({ loading: true, error: '', data: null })

  useEffect(() => {
    let alive = true
    setSt((s) => ({ ...s, loading: true, error: '' }))
    const t = setTimeout(() => {
      fetchRelics(q, material, age)
        .then((data) => alive && setSt({ loading: false, error: '', data }))
        .catch((e) => alive && setSt({ loading: false, error: e.message, data: null }))
    }, 250)
    return () => { alive = false; clearTimeout(t) }
  }, [q, material, age])

  const d = st.data
  const pages = d ? Math.max(1, Math.ceil(d.items.length / PER)) : 1
  const view = d ? d.items.slice((page - 1) * PER, page * PER) : []
  const reset = (fn) => (e) => { fn(e.target.value); setPage(1) }

  return (
    <section className="archive mt-5">
      <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
        <div className="me-auto">
          <p className="stamp mb-1">제주도청 자료</p>
          <h2 className="h3 mb-0">돌문화공원 소장 유물{d && <small className="text-muted"> {d.total}점</small>}</h2>
        </div>
        <Form.Control style={{ maxWidth: 180 }} size="sm" placeholder="이름·설명 검색" value={q} onChange={reset(setQ)} />
        <Form.Select style={{ maxWidth: 130 }} size="sm" value={material} onChange={reset(setMaterial)}>
          <option value="">재질 전체</option>
          {d?.materials.map((m) => <option key={m}>{m}</option>)}
        </Form.Select>
        <Form.Select style={{ maxWidth: 130 }} size="sm" value={age} onChange={reset(setAge)}>
          <option value="">시대 전체</option>
          {d?.ages.map((a) => <option key={a}>{a}</option>)}
        </Form.Select>
      </div>
      <ApiState loading={st.loading && !d} error={st.error} empty={!st.loading && !st.error && d && d.items.length === 0} emptyText="맞는 유물이 없어요." />
      <div className="row g-2 row-cols-1 row-cols-md-2 row-cols-xl-3">
        {view.map((r, i) => (
          <div className="col" key={`${r.name}-${i}`}>
            <article className="stone-card archive-item">
              <div className="d-flex gap-1 mb-1"><span className="kw">{r.age}</span><span className="kw">{r.material}</span>{r.source && <span className="kw">{r.source}</span>}</div>
              <h3>{r.name}</h3>
              <p className="small mb-0">{r.desc && r.desc !== r.name ? r.desc : '설명이 아직 등록되지 않았어요.'}</p>
            </article>
          </div>
        ))}
      </div>
      {pages > 1 && (
        <Pagination size="sm" className="stone-pager mt-3">
          {Array.from({ length: pages }, (_, i) => <Pagination.Item key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</Pagination.Item>)}
        </Pagination>
      )}
      <p className="small text-muted mt-2">출처: 제주특별자치도 제주돌문화공원 소장 유물.{d?.snapshot && ' (지금은 도청 연결이 어려워 미리 저장해 둔 자료를 보여 드려요.)'}</p>
    </section>
  )
}
