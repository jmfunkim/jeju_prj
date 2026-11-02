import { useEffect, useState } from 'react'
import { Offcanvas } from 'react-bootstrap'
import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNotebookSync } from '../lib/sync'

// 모바일 하단 탭바에는 자주 쓰는 다섯 개만 둡니다
const TAB_PATHS = ['/', '/map', '/walk', '/guide', '/notebook']

function NavList({ onPick }) {
  const count = useAppStore((s) => s.saved.length)
  return (
    <ul className="navlinks">
      {NAV_ITEMS.map((n) => (
        <li key={n.to}>
          <NavLink to={n.to} end={n.to === '/'} onClick={onPick} className="navlink">
            <i className={`bi bi-${n.icon}`} />
            <span>{n.label}</span>
            {n.to === '/notebook' && count > 0 && <em>{count}</em>}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

function AccountLink({ onPick }) {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  if (!user) {
    return (
      <NavLink to="/login" onClick={onPick} className="navlink navlink--login">
        <i className="bi bi-person-circle" /><span>로그인</span>
      </NavLink>
    )
  }
  return (
    <div className="account">
      <span className="account__name" title={user.email}><i className="bi bi-person-check" /> {user.name}</span>
      <button type="button" className="account__out" onClick={async () => { await signOut(); useAppStore.getState().clearNotebook(); onPick?.() }}>로그아웃</button>
    </div>
  )
}

function TabBar() {
  const count = useAppStore((s) => s.saved.length)
  return (
    <nav className="tabbar d-md-none" aria-label="주요 메뉴">
      {NAV_ITEMS.filter((n) => TAB_PATHS.includes(n.to)).map((n) => (
        <NavLink key={n.to} to={n.to} end={n.to === '/'} className="tab">
          <i className={`bi bi-${n.icon}`} />
          <span>{n.label}</span>
          {n.to === '/notebook' && count > 0 && <em>{count}</em>}
        </NavLink>
      ))}
    </nav>
  )
}

export default function RootLayout() {
  const [open, setOpen] = useState(false)
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])
  useNotebookSync()

  return (
    <div className="app">
      <header className="topnav">
        <div className="topnav__in">
          <NavLink to="/" className="brand" aria-label="돌빛 제주길 홈">
            <span className="brand__mark">
              {/* 오름과 떠오르는 해, 파도 */}
              <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
                <circle cx="21.5" cy="11" r="4.6" fill="#ffb347" />
                <path d="M2 24c3-8 7-12 11-12s7 4 9.5 8c2 3 5 4 7.5 4v2H2z" fill="#fff" />
                <path d="M2 28q3.5-3 7 0t7 0 7 0 7 0" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span>돌빛 제주길<small>제주 신화·돌·역사 산책</small></span>
          </NavLink>
          <div className="d-none d-xl-flex flex-grow-1 align-items-center"><NavList /></div>
          <div className="d-none d-xl-block"><AccountLink /></div>
          <button className="menu-btn d-xl-none" onClick={() => setOpen(true)} aria-label="메뉴"><i className="bi bi-list" /></button>
        </div>
      </header>

      <Offcanvas show={open} onHide={() => setOpen(false)} placement="end" className="offcanvas-dol">
        <Offcanvas.Header closeButton><Offcanvas.Title className="fw-bold">메뉴</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body>
          <NavList onPick={() => setOpen(false)} />
          <div className="account-slot"><AccountLink onPick={() => setOpen(false)} /></div>
        </Offcanvas.Body>
      </Offcanvas>

      <div className="content">
        <main><Outlet /></main>
        <footer className="foot">
          돌빛 제주길 · 신화·설화 / 돌문화 / 역사문화 위치정보 · 지도의 좌표는 대략적인 위치이며 전승은 지역에 따라 다를 수 있습니다
        </footer>
      </div>
      <TabBar />
    </div>
  )
}
