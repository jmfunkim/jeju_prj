import { useState } from 'react'
import { Offcanvas } from 'react-bootstrap'
import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'

function NavList({ onPick }) {
  const count = useAppStore((s) => s.saved.length)
  return (
    <ul className="rail__list">
      {NAV_ITEMS.map((n) => (
        <li key={n.to}>
          <NavLink to={n.to} end={n.to === '/'} onClick={onPick} className="stone-link">
            <i className={`bi bi-${n.icon}`} />
            <span>{n.label}</span>
            {n.to === '/notebook' && count > 0 && <em>{count}</em>}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export default function RootLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="app">
      {/* 데스크톱: 돌을 쌓은 듯한 세로 레일 */}
      <aside className="rail d-none d-lg-flex">
        <NavLink to="/" className="rail__brand" aria-label="탐라 이야기 수첩 홈">
          <span>耽</span><small>탐라</small>
        </NavLink>
        <NavList />
        <p className="rail__foot">돌·바람·이야기</p>
      </aside>

      {/* 모바일: 상단 바 + Offcanvas */}
      <header className="topbar d-lg-none">
        <NavLink to="/" className="topbar__brand"><span>耽</span> 탐라 이야기 수첩</NavLink>
        <button className="btn btn-dark btn-sm" onClick={() => setOpen(true)} aria-label="메뉴"><i className="bi bi-list fs-5" /></button>
      </header>
      <Offcanvas show={open} onHide={() => setOpen(false)} placement="end" className="offcanvas-dol">
        <Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title>탐라 이야기 수첩</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body><NavList onPick={() => setOpen(false)} /></Offcanvas.Body>
      </Offcanvas>

      <div className="content">
        <main><Outlet /></main>
        <footer className="foot">
          탐라 이야기 수첩 · 신화·설화 / 돌문화 / 역사문화 위치정보 · 지도의 좌표는 대략적인 위치이며 전승은 지역에 따라 다를 수 있습니다
        </footer>
      </div>
    </div>
  )
}
