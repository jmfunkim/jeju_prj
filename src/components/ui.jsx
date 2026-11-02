import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Spinner } from 'react-bootstrap'
import { fetchNearby } from '../api/client'
import { KINDS } from '../data/places'
import { DEMO_ME, distanceKm, fmtKm } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'

// 종류(신화·설화/돌문화/역사문화) 표시 뱃지
export function KindBadge({ kind, children }) {
  const k = KINDS[kind]
  return (
    <Badge pill className="kind-badge" style={{ '--k': k.color }}>
      <i className={`bi bi-${k.icon} me-1`} />{children ?? k.label}
    </Badge>
  )
}

// 갈래별 무늬 머리띠 — 사진이 없는 카드의 얼굴 (신화=별빛, 돌=현무암, 역사=기와)
export function Cover({ kind, label }) {
  const k = KINDS[kind]
  return (
    <div className={`cover cover--${kind}`} style={{ '--k': k.color }}>
      <i className={`bi bi-${k.icon} cover__icon`} aria-hidden="true" />
      <span className="cover__tag">{label ?? k.label}</span>
    </div>
  )
}

// 수첩에 담기/빼기
export function SaveButton({ id, compact = false, className = '' }) {
  const on = useAppStore((s) => s.saved.includes(id))
  const toggle = useAppStore((s) => s.toggleSaved)
  return (
    <Button size="sm" variant={on ? 'dark' : 'outline-dark'} className={`save-btn ${className}`} aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); toggle(id) }}>
      <i className={`bi bi-bookmark${on ? '-fill' : ''}`} />{!compact && <span className="ms-1">{on ? '수첩에 담김' : '수첩에 담기'}</span>}
    </Button>
  )
}

// 내 위치 찾기 (+ 권한이 없을 때 체험용 위치)
export function LocateBar({ className = '' }) {
  const { me, locating, locError, locate, setMe } = useAppStore()
  return (
    <div className={`d-flex flex-wrap align-items-center gap-2 ${className}`}>
      <Button variant="dark" size="sm" onClick={locate} disabled={locating}>
        {locating ? <Spinner size="sm" className="me-1" /> : <i className="bi bi-crosshair me-1" />}내 위치 찾기
      </Button>
      <Button variant="outline-dark" size="sm" onClick={() => setMe(DEMO_ME)}>제주시청 기준으로 보기</Button>
      {me && <span className="small text-muted"><i className="bi bi-check2-circle text-success me-1" />{me.demo ? '체험용 위치(제주시청 부근)' : '현재 위치 확인됨'}</span>}
      {locError && <span className="small text-danger">{locError}</span>}
    </div>
  )
}

// 내 위치가 있으면 거리 문자열, 없으면 null
export const distanceLabel = (me, place) => (me ? fmtKm(distanceKm(me, place)) : null)

// API 호출 상태(로딩·에러·빈 결과)
export function ApiState({ loading, error, empty, emptyText = '결과가 없어요.' }) {
  if (loading) return <div className="py-4 text-center"><Spinner animation="border" size="sm" className="me-2" />불러오는 중…</div>
  if (error) return <Alert variant="warning" className="mb-0"><i className="bi bi-exclamation-triangle me-1" />{error}</Alert>
  if (empty) return <p className="text-muted py-3 mb-0">{emptyText}</p>
  return null
}

const TOUR_TYPE = { 12: '관광지', 14: '문화시설', 15: '축제', 25: '여행코스', 28: '레포츠', 32: '숙박', 38: '쇼핑', 39: '음식점' }

// 이 장소 주변 3km 의 관광정보(한국관광공사 TourAPI) — 눌렀을 때만 불러옵니다
export function NearbyTour({ place }) {
  const [st, setSt] = useState({ status: 'idle' })
  useEffect(() => setSt({ status: 'idle' }), [place.id])

  async function load() {
    setSt({ status: 'loading' })
    try {
      setSt({ status: 'ok', list: (await fetchNearby(place.lat, place.lng, 3000)).slice(0, 6) })
    } catch (e) {
      setSt({ status: 'error', message: e.message })
    }
  }

  return (
    <div className="nearby">
      {st.status === 'idle' && (
        <Button size="sm" variant="outline-dark" onClick={load}><i className="bi bi-binoculars me-1" />주변 볼거리·맛집 (공공데이터)</Button>
      )}
      <ApiState loading={st.status === 'loading'} error={st.status === 'error' ? st.message : ''} empty={st.status === 'ok' && st.list.length === 0} emptyText="3km 안에 조회된 곳이 없어요." />
      {st.status === 'ok' && st.list.length > 0 && (
        <ul className="nearby__list">
          {st.list.map((t) => (
            <li key={t.id}><b>{t.title}</b> <small>{TOUR_TYPE[t.type] ?? '관광정보'}{t.distM != null && ` · ${fmtKm(t.distM / 1000)}`}</small></li>
          ))}
        </ul>
      )}
    </div>
  )
}

// 길찾기(카카오맵 링크 — 키 없이 열려요)
export const routeUrl = (p) => `https://map.kakao.com/link/to/${encodeURIComponent(p.name)},${p.lat},${p.lng}`

// 장소 상세 본문 (지도 패널·모달 공용)
export function PlaceBody({ place, me }) {
  const dist = distanceLabel(me, place)
  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <KindBadge kind={place.kind}>{place.tag}</KindBadge>
        {dist && <Badge bg="info" text="dark" pill><i className="bi bi-signpost-split me-1" />내 위치에서 {dist}</Badge>}
      </div>
      <h2 className="place-title">{place.title}</h2>
      <p className="place-spot"><i className="bi bi-geo-alt-fill me-1" />{place.name} · {place.spot}</p>
      <p className="place-sum">{place.summary}</p>
      {place.story.map((p, i) => <p key={i}>{p}</p>)}
      <div className="d-flex flex-wrap gap-1 mb-3">
        {place.keywords.map((k) => <span key={k} className="kw">#{k}</span>)}
      </div>
    </>
  )
}
