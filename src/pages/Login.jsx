import { useState } from 'react'
import { Alert, Form, Nav } from 'react-bootstrap'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AUTH_MODE } from '../lib/auth'
import { useAuthStore } from '../store/useAuthStore'

export default function Login() {
  const nav = useNavigate()
  const { user, signIn, signUp } = useAuthStore()
  const [mode, setMode] = useState('in')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/notebook" replace />
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError(''); setInfo(''); setBusy(true)
    try {
      if (mode === 'in') { await signIn(form); nav('/notebook') }
      else {
        const u = await signUp(form)
        if (u) nav('/notebook')
        else { setInfo('가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.'); setMode('in') }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="stone-card auth-card">
          <p className="stamp">돌빛 제주길</p>
          <h1 className="h2 mb-1">{mode === 'in' ? '다시 오셨네요' : '수첩 만들기'}</h1>
          <p className="text-muted">{mode === 'in' ? '로그인하면 내 수첩이 내 이름으로 남아요.' : '이름과 이메일만 있으면 돼요.'}</p>

          <Nav variant="pills" className="pill-nav mb-3" activeKey={mode} onSelect={(k) => { setMode(k); setError('') }}>
            <Nav.Item><Nav.Link eventKey="in">로그인</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="up">회원가입</Nav.Link></Nav.Item>
          </Nav>

          <Form onSubmit={submit} noValidate>
            {mode === 'up' && (
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>이름(별명)</Form.Label>
                <Form.Control value={form.name} onChange={set('name')} autoComplete="nickname" placeholder="예: 한라산지기" />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>이메일</Form.Label>
              <Form.Control type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>비밀번호</Form.Label>
              <Form.Control type="password" value={form.password} onChange={set('password')} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} placeholder="6자 이상" />
            </Form.Group>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            {info && <Alert variant="success" className="py-2">{info}</Alert>}
            <button className="btn btn-dol w-100 btn-lg" disabled={busy}>{busy ? '잠시만요…' : mode === 'in' ? '로그인' : '가입하고 시작하기'}</button>
          </Form>

          {AUTH_MODE === 'local' && (
            <p className="auth-note"><i className="bi bi-info-circle me-1" />체험 모드예요. 계정은 이 브라우저에만 저장되고, Supabase 키를 넣으면 실제 회원 시스템으로 바뀝니다.</p>
          )}
          <p className="text-center mb-0 mt-3"><Link to="/">로그인 없이 둘러보기</Link></p>
        </div>
      </div>
    </div>
  )
}
