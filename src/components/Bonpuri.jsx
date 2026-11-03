import { useEffect, useMemo, useRef, useState } from 'react'
import { Form, Nav } from 'react-bootstrap'
import { fetchMyth } from '../api/client'
import { FEATURED, matchFeatured } from '../data/bonpuri'
import { mediaKey } from '../data/mythMedia'
import { useMythMedia } from '../lib/photos'
import { ApiState } from './ui'

const TYPE_COLOR = { 원문: '#f08a1c', 해제: '#3d5fa8', 현지조사: '#1e8a9a' }
const TYPE_HELP = { 원문: '채록한 본풀이 원본', 해제: '자료를 설명하는 글', 현지조사: '현장에서 조사한 자료' }
// 같은 이야기의 원문·해제·현지조사 판본을 한 이름으로 묶기 위한 이름 정리
const baseName = (t) => t.replace(/[\s()*]/g, '').replace(/\d+$/, '')

// 제주도청 '제주 신화 콘텐츠' 자료(182건)로 만든 본풀이 마당:
// 널리 알려진 8편은 자료 수·판본·태그를 자료에서 세어 카드로, 전체는 아래 자료실에서 찾아봅니다.
export default function Bonpuri() {
  const [st, setSt] = useState({ loading: true, error: '', items: [] })
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [tag, setTag] = useState('')
  const [limit, setLimit] = useState(24)
  const shelf = useRef(null)
  const media = useMythMedia()

  useEffect(() => {
    let alive = true
    fetchMyth('', '', 500)
      .then((d) => alive && setSt({ loading: false, error: '', items: d.items }))
      .catch((e) => alive && setSt({ loading: false, error: e.message, items: [] }))
    return () => { alive = false }
  }, [])

  const items = st.items
  const featured = useMemo(() => FEATURED.map((f) => {
    const hit = matchFeatured(f, items)
    const byType = hit.reduce((m, i) => ({ ...m, [i.type]: (m[i.type] ?? 0) + 1 }), {})
    const tags = Object.entries(hit.flatMap((i) => i.tags).reduce((m, t) => ({ ...m, [t]: (m[t] ?? 0) + 1 }), {}))
      .filter(([t]) => !['본풀이', f.name].includes(t) && !f.keys.includes(t)).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t)
    return { ...f, hit, byType, tags }
  }), [items])

  const topTags = useMemo(() => Object.entries(items.flatMap((i) => i.tags).reduce((m, t) => ({ ...m, [t]: (m[t] ?? 0) + 1 }), {}))
    .filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1]).slice(0, 14), [items])

  const versions = useMemo(() => items.reduce((m, i) => ({ ...m, [baseName(i.title)]: (m[baseName(i.title)] ?? 0) + 1 }), {}), [items])
  const list = useMemo(() => items.filter((i) => (!type || i.type === type) && (!tag || i.tags.includes(tag)) && (!q.trim() || i.title.includes(q.trim()) || i.tags.some((t) => t.includes(q.trim())))), [items, type, tag, q])

  const openStory = (f) => {
    setQ(f.keys[0]); setType(''); setTag(''); setLimit(24)
    shelf.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="bonpuri">
      <header className="bp-head">
        <p className="stamp">제주도청 자료로 만난 신들의 이야기</p>
        <h2>제주 본풀이</h2>
        <p>
          본풀이는 제주 마을의 당(신당)과 굿에서 전해 온 <b>신들의 이야기</b>예요. 하늘과 땅이 열린 이야기부터 집을 지키는 신까지,
          제주도청이 모은 자료 <b>{items.length || 182}건</b>에서 널리 알려진 이야기를 먼저 골랐어요.
        </p>
      </header>

      <ApiState loading={st.loading} error={st.error} />

      {items.length > 0 && (
        <>
          <div className="bp-featured">
            {featured.map((f) => (
              <button key={f.id} type="button" className="bp-story" onClick={() => openStory(f)}>
                {(() => { const m = f.img && media.find((x) => mediaKey(x) === f.img); return m
                  ? <span className="bp-story__icon bp-story__icon--img" style={{ backgroundImage: `url(${m.image})` }} title={`삽화 · ${m.title} · ${m.credit}`} />
                  : <span className="bp-story__icon"><i className={`bi bi-${f.icon}`} /></span> })()}
                <span className="bp-story__kind">{f.kind}</span>
                <b>{f.name}</b>
                <span className="bp-story__blurb">{f.blurb}</span>
                <span className="bp-story__meta">
                  <em>자료 {f.hit.length}건</em>
                  {Object.entries(f.byType).map(([t, n]) => <i key={t} style={{ '--c': TYPE_COLOR[t] }}>{t} {n}</i>)}
                </span>
                {f.tags.length > 0 && <span className="bp-story__tags">{f.tags.map((t) => <i key={t}>#{t}</i>)}</span>}
              </button>
            ))}
          </div>
          <p className="small text-muted mb-4">한 줄 소개는 대표 줄거리를 줄인 것이라 마을과 판본에 따라 다를 수 있어요. 카드를 누르면 아래 자료실에서 그 이야기의 자료만 모아 봐요.</p>

          <div ref={shelf} className="bp-shelf">
            <div className="d-flex flex-wrap align-items-end gap-3 mb-2">
              <h3 className="h4 mb-0">본풀이 자료실 <small className="text-muted">{list.length}건</small></h3>
              <Form.Control className="ms-auto" style={{ maxWidth: 260 }} size="sm" placeholder="이야기·당 이름 검색 (예: 송당, 삼공)" value={q} onChange={(e) => { setQ(e.target.value); setLimit(24) }} />
            </div>
            <Nav variant="pills" className="pill-nav mb-2" activeKey={type} onSelect={(k) => { setType(k ?? ''); setLimit(24) }}>
              <Nav.Item><Nav.Link eventKey="">전체</Nav.Link></Nav.Item>
              {Object.keys(TYPE_HELP).map((t) => <Nav.Item key={t}><Nav.Link eventKey={t}>{t}</Nav.Link></Nav.Item>)}
            </Nav>
            <p className="small text-muted mb-2">{type ? `${type}: ${TYPE_HELP[type]}` : Object.entries(TYPE_HELP).map(([t, h]) => `${t} = ${h}`).join(' · ')}</p>
            <div className="bp-tags">
              {tag && <button type="button" className="bp-tag on" onClick={() => { setTag(''); setLimit(24) }}>#{tag} ✕</button>}
              {topTags.filter(([t]) => t !== tag).map(([t, n]) => <button key={t} type="button" className="bp-tag" onClick={() => { setTag(t); setLimit(24) }}>#{t} <small>{n}</small></button>)}
            </div>

            {list.length === 0 && <p className="text-muted py-3">맞는 자료가 없어요. 검색어를 줄이거나 필터를 풀어 보세요.</p>}
            <div className="row g-2 row-cols-1 row-cols-md-2 row-cols-xl-3">
              {list.slice(0, limit).map((m) => {
                const n = versions[baseName(m.title)]
                return (
                  <div className="col" key={m.code}>
                    <article className="stone-card bp-card" style={{ '--c': TYPE_COLOR[m.type] ?? '#6e7f86' }}>
                      <span className="bp-card__av" aria-hidden="true">{m.title.charAt(0)}</span>
                      <div className="bp-card__body">
                        <h4>{m.title}</h4>
                        <div className="bp-card__row">
                          <span className="bp-pill">{m.type}</span>
                          {n > 1 && <small>같은 이름 자료 {n}건</small>}
                        </div>
                        <div className="d-flex flex-wrap gap-1">{m.tags.slice(0, 3).map((t) => <button key={t} type="button" className="kw" onClick={() => { setTag(t); setLimit(24) }}>#{t}</button>)}</div>
                      </div>
                      <div className="bp-card__links">
                        {m.pdf && <a href={m.pdf} target="_blank" rel="noreferrer" title="제주도청 문서뷰어로 원문 PDF 보기"><i className="bi bi-file-earmark-pdf" /> PDF</a>}
                      </div>
                      <a className="bp-card__go" href={`https://search.naver.com/search.naver?query=${encodeURIComponent(`제주 ${m.title.replace(/\(.*\)/, '')} 본풀이`)}`} target="_blank" rel="noreferrer" aria-label={`${m.title} 더 알아보기`} title="더 알아보기(검색)">
                        <i className="bi bi-search" />
                      </a>
                    </article>
                  </div>
                )
              })}
            </div>
            <div className="d-flex align-items-center gap-3 mt-3">
              <span className="small text-muted">{list.length}건 중 {Math.min(limit, list.length)}건 표시</span>
              {limit < list.length && <button className="btn btn-sm btn-dol" onClick={() => setLimit(limit + 24)}>더 보기</button>}
            </div>
          </div>
          <p className="small text-muted mt-3 mb-0">출처: 제주특별자치도 제주 신화 콘텐츠(제목·구분·태그). PDF 는 제주도청 문서뷰어로 열려요. 돋보기를 누르면 검색으로도 이어 줘요.</p>
        </>
      )}
    </section>
  )
}
