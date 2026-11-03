import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Spinner } from 'react-bootstrap'
import { fetchNearby } from '../api/client'
import { KINDS } from '../data/places'
import { copyrightLabel, useMythMedia, usePlacePhotos } from '../lib/photos'
import { relatedMedia } from '../data/mythMedia'
import { walkInfo } from '../data/walk'
import { usePlaceInfo } from '../lib/placeinfo'
import { useDataKey } from '../lib/info'
import MythArt, { hasMythArt } from './MythArt'
import { DEMO_ME, distanceKm, fmtKm } from '../lib/geo'
import { DRAFT_MAX, useAppStore } from '../store/useAppStore'

// 종류(신화·설화/돌문화/역사문화) 표시 뱃지
export function KindBadge({ kind, children }) {
  const k = KINDS[kind]
  return (
    <Badge pill className="kind-badge" style={{ '--k': k.color }}>
      <i className={`bi bi-${k.icon} me-1`} />{children ?? k.label}
    </Badge>
  )
}

// 사진 출처 표시 — 제주신화정보(제주도청), 한국관광공사 TourAPI, 국가유산청, 위키미디어 커먼즈 사진 (link: 상세 화면에서 원본 페이지로 연결)
export function PhotoCredit({ photo, link = false }) {
  if (photo.source === 'jeju') {
    const kind = photo.form === '이미지' ? '삽화' : '사진'
    return <span className="photo-credit" title={`제주신화정보 · ${photo.title}`}>{kind} {photo.credit}</span>
  }
  if (photo.source === 'khs') {
    const text = '사진 국가유산청 · 공공누리'
    return <span className="photo-credit" title={`국가유산청 · ${photo.heritage} · ${photo.title}`}>{text}</span>
  }
  if (photo.source === 'web') {
    const text = `사진 ${photo.by}${photo.license ? ` · ${photo.license}` : ''}`
    return (
      <span className="photo-credit" title={`${photo.site ?? '위키미디어 커먼즈'} · ${photo.title} · ${photo.by}${photo.license ? ` · ${photo.license}` : ''}`}>
        {link
          ? <a href={photo.page} target="_blank" rel="noreferrer">{text} · {photo.site ?? '위키미디어'}</a>
          : text}
      </span>
    )
  }
  const cr = copyrightLabel(photo.copyright)
  return (
    <span className="photo-credit" title={`한국관광공사 · ${photo.title}${cr ? ' · ' + cr : ''}`}>
      사진 한국관광공사{cr ? ` · ${cr}` : ''}
    </span>
  )
}

// 갈래별 머리띠 — 사진이 있으면 사진, 없으면 무늬 (신화=별빛, 돌=현무암, 역사=기와)
export function Cover({ kind, label, id, tall = false }) {
  const k = KINDS[kind]
  const photo = usePlacePhotos()[id]
  const art = hasMythArt(id)
  return (
    <div className={`cover cover--${kind} ${photo ? 'cover--photo' : ''} ${art ? 'cover--art' : ''} ${tall ? 'cover--tall' : ''}`} style={{ '--k': k.color }}>
      {art && <MythArt id={id} className="cover__art" />}
      {photo && <div className="cover__photo" role="img" aria-label={photo.title} style={{ backgroundImage: `url(${photo.src})` }} />}
      <i className={`bi bi-${k.icon} cover__icon`} aria-hidden="true" />
      <span className="cover__tag">{label ?? k.label}</span>
      {photo && <PhotoCredit photo={photo} />}
    </div>
  )
}

// 상세 화면용 큰 사진 + 출처
// photoOnly: 삽화 대신 같은 장소의 사진을 우선 보여 줘요 (지도·이야기 산책)
export function PlacePhoto({ id, name, photoOnly = false }) {
  const photo = usePlacePhotos({ photoOnly })[id]
  if (!photo) {
    // 사진이 없는 장소는 직접 그린 장면을 보여 줍니다
    return hasMythArt(id) ? <figure className="place-photo place-photo--art"><MythArt id={id} /></figure> : null
  }
  return (
    <figure className="place-photo">
      <img src={photo.src} alt={name ? `${name} 사진` : photo.title} loading="lazy" onError={(e) => { e.currentTarget.closest('figure').style.display = 'none' }} />
      <figcaption><PhotoCredit photo={photo} link /></figcaption>
    </figure>
  )
}

// 이 장소와 관련된 제주신화정보의 사진·삽화·장면 (제주도청, 키 없음)
export function RelatedMedia({ id }) {
  const items = useMythMedia()
  const list = relatedMedia(id, items).slice(0, 8)
  if (list.length === 0) return null
  return (
    <div className="related-media">
      <p className="related-media__head"><i className="bi bi-images me-1" />관련 사진·삽화 <small>제주특별자치도 · 눌러서 크게 보기</small></p>
      <div className="related-media__row">
        {list.map((m) => (
          <a key={m.image} href={m.image} target="_blank" rel="noreferrer" title={`${m.title} · ${m.credit}`}>
            <img src={m.image} alt={m.title} loading="lazy" />
            <span>{m.form === '애니메이션' || m.form === '동영상' ? '장면 · ' : ''}{m.title}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

// 수첩에 담기/빼기
export function SaveButton({ id, compact = false, className = '' }) {
  const on = useAppStore((s) => s.saved.includes(id))
  const toggle = useAppStore((s) => s.toggleSaved)
  return (
    <Button size="sm" variant={on ? 'dark' : 'outline-dark'} className={`save-btn ${on ? 'is-saved' : ''} ${className}`} aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); toggle(id) }}>
      <i className={`bi bi-bookmark${on ? '-fill' : ''}`} />{!compact && <span className="ms-1">{on ? '수첩에 담김' : '수첩에 담기'}</span>}
    </Button>
  )
}

// 전시·기념관처럼 운영 시간·휴관일이 있는 곳에 붙이는 안내.
// 한국관광공사 소개정보가 있으면 쉬는 날·이용 시간을 보여 주고(바뀔 수 있어 확인 링크도 함께), 없으면 링크만 줘요.
export function VisitNote({ place }) {
  const visit = walkInfo(place.id).visit
  const info = usePlaceInfo(visit ? place.id : null)
  if (!visit) return null
  const rows = info ? [['쉬는 날', info.rest], ['이용 시간', info.hours], ['요금', info.fee]].filter(([, v]) => v) : []
  return (
    <div className="visit-note">
      {rows.length > 0 && (
        <dl className="visit-note__rows">
          {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
      <p>
        <i className="bi bi-calendar-check me-1" />
        {rows.length > 0 ? '한국관광공사 정보예요. 바뀔 수 있으니 방문 전에 확인하세요.' : '운영 시간·휴관일은 방문 전에 확인하세요.'}{' '}
        <a href={`https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`} target="_blank" rel="noreferrer">카카오맵에서 확인</a>
      </p>
    </div>
  )
}

// 내가 짜는 코스에 담기/빼기 (이야기 산책 › 내가 직접 짜기와 같은 목록)
export function AddToCourseButton({ id, className = '' }) {
  const inDraft = useAppStore((s) => s.draft.includes(id))
  const full = useAppStore((s) => s.draft.length >= DRAFT_MAX)
  const add = useAppStore((s) => s.addToDraft)
  const remove = useAppStore((s) => s.removeFromDraft)
  return (
    <Button size="sm" variant={inDraft ? 'dark' : 'outline-dark'} className={`course-add ${inDraft ? 'is-in' : ''} ${className}`} aria-pressed={inDraft}
      disabled={!inDraft && full} title={!inDraft && full ? `코스에는 ${DRAFT_MAX}곳까지 담을 수 있어요` : undefined}
      onClick={() => (inDraft ? remove(id) : add(id))}>
      <i className={`bi bi-${inDraft ? 'check2-circle' : 'plus-circle'} me-1`} />{inDraft ? '코스에 담김' : '코스에 추가'}
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
      {me && <span className="small text-muted"><i className="bi bi-check2-circle text-success me-1" />{me.demo ? '제주시청 부근에서 출발해요' : '현재 위치 확인됨'}</span>}
      {locError && <span className="small text-danger">{locError}</span>}
    </div>
  )
}

// 내 위치가 있으면 거리 문자열, 없으면 null
export const distanceLabel = (me, place) => (me ? fmtKm(distanceKm(me, place)) : null)

// API 호출 상태(로딩·에러·빈 결과)
export function ApiState({ loading, error, empty, emptyText = '결과가 없어요.' }) {
  if (loading) return <div className="py-4 text-center"><Spinner animation="border" size="sm" className="me-2" />불러오는 중…</div>
  if (error) return <Alert variant="light" className="api-note mb-0"><i className="bi bi-hourglass-split me-2" />{error}</Alert>
  if (empty) return <p className="text-muted py-3 mb-0">{emptyText}</p>
  return null
}

const TOUR_TYPE = { 12: '관광지', 14: '문화시설', 15: '축제', 25: '여행코스', 28: '레포츠', 32: '숙박', 38: '쇼핑', 39: '음식점' }

// 이 장소 주변 3km 의 관광정보(한국관광공사 TourAPI) — 눌렀을 때만 불러옵니다
export function NearbyTour({ place }) {
  const hasKey = useDataKey()
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

  // 공공데이터 연결이 안 된 상태에서는 눌러도 오류만 나오므로 버튼을 감춥니다
  if (hasKey === false) return <p className="small text-muted mb-0"><i className="bi bi-hourglass-split me-1" />주변 볼거리·맛집은 곧 연결할게요.</p>

  return (
    <div className="nearby">
      {st.status === 'idle' && (
        <Button size="sm" variant="outline-dark" onClick={load}><i className="bi bi-binoculars me-1" />주변 볼거리·맛집</Button>
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
export function PlaceBody({ place, me, photoOnly = false }) {
  const dist = distanceLabel(me, place)
  return (
    <>
      <PlacePhoto id={place.id} name={place.name} photoOnly={photoOnly} />
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <KindBadge kind={place.kind}>{place.tag}</KindBadge>
        {dist && <Badge bg="info" text="dark" pill><i className="bi bi-signpost-split me-1" />내 위치에서 {dist}</Badge>}
      </div>
      <h2 className="place-title">{place.title}</h2>
      <p className="place-spot"><i className="bi bi-geo-alt-fill me-1" />{place.name} · {place.spot}</p>
      <p className="place-sum">{place.summary}</p>
      <VisitNote place={place} />
      {place.story.map((p, i) => <p key={i}>{p}</p>)}
      <RelatedMedia id={place.id} />
      <div className="d-flex flex-wrap gap-1 mb-3">
        {place.keywords.map((k) => <span key={k} className="kw">#{k}</span>)}
      </div>
    </>
  )
}
