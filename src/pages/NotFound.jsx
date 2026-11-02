import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '100vh', gap: 12 }}>
      <h1 className="display-1 fw-bold">404</h1>
      <p>바람이 길을 지워 버렸어요. 올레 끝에서 다시 시작해 볼까요?</p>
      <Link className="btn btn-dol" to="/">홈으로</Link>
    </div>
  )
}
