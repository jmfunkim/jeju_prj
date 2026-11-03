import { useEffect, useSyncExternalStore } from 'react'
import { fetchKhsPhotos, fetchMythMedia, fetchPlacePhotos } from '../api/client'
import { PLACES } from '../data/places'
import { mainMedia, photoMedia } from '../data/mythMedia'
import { WEB_PHOTOS } from '../data/webPhotos'

// 장소 사진은 네 곳에서 모읍니다.
//  · 제주신화정보(제주도청) — 신화·설화 장소의 사진·삽화. 키가 필요 없어요.
//  · 한국관광공사 TourAPI — 그 밖의 장소 사진. 공공데이터 키가 있어야 해요.
//  · 국가유산청 국가유산 이미지 — 국가유산인 장소의 사진. 키가 필요 없어요.
//  · 위키미디어 커먼즈 — 위 셋에 없을 때 마지막으로 (자유 이용 사진, 작성자·라이선스 표시).
// 신화·설화 장소는 신화정보 이미지를, 나머지는 관광공사 사진을 먼저 쓰고 없으면 서로 대신합니다.
// first: true 인 사진(관덕정 돌하르방처럼 다른 출처가 장소와 안 맞는 경우)은 무엇보다 먼저 씁니다.
// 어디에도 그 장소 사진이 없으면 비슷한 곳 사진으로 때우지 않고 빈 값이라, 화면은 그 장소를 그린 일러스트를 씁니다.
let khs = null
let tour = null
let media = null
let merged = null            // null = 아직 모름
let mergedPhoto = null       // 위와 같지만 제주신화정보의 삽화 대신 같은 장소의 사진을 쓴 것 (지도·이야기 산책용)
let started = false
const subs = new Set()

function recompute() {
  const items = media ?? []
  // photoOnly: 지도·이야기 산책처럼 실제 모습을 보여 줄 곳 — 삽화가 대표여도 같은 장소의 사진이 있으면 그것을 씁니다 (없으면 삽화 그대로)
  const build = (photoOnly) => {
    const out = {}
    for (const p of PLACES) {
      const m = (photoOnly && photoMedia(p.id, items)) || mainMedia(p.id, items)
      const jeju = m && { src: m.image, title: m.title, credit: m.credit, form: m.form, source: 'jeju' }
      const t = tour?.[p.id] && { ...tour[p.id], source: 'tour' }
      const k = khs?.[p.id] && { ...khs[p.id], source: 'khs' }
      const w = WEB_PHOTOS[p.id] && { ...WEB_PHOTOS[p.id], source: 'web' }
      const base = p.kind === 'myth' ? (jeju ?? t) : (t ?? jeju)
      const pick = (k?.first ? k : null) ?? (w?.first ? w : null) ?? base ?? k ?? w
      if (pick) out[p.id] = pick
    }
    return out
  }
  merged = build(false)
  mergedPhoto = build(true)
  subs.forEach((f) => f())
}

function load() {
  if (started) return
  started = true
  fetchKhsPhotos().then((d) => { khs = d.photos ?? {} }).catch(() => { khs = {} }).finally(recompute)
  fetchPlacePhotos().then((d) => { tour = d.photos ?? {} }).catch(() => { tour = {} }).finally(recompute)
  fetchMythMedia().then((d) => { media = d.items ?? [] }).catch(() => { media = [] }).finally(recompute)
}

const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }

// photoOnly: 삽화 대신 사진을 우선 (지도·이야기 산책). 기본은 신화·설화 카드처럼 삽화도 그대로 써요.
export function usePlacePhotos({ photoOnly = false } = {}) {
  useEffect(load, [])
  return useSyncExternalStore(subscribe, () => (photoOnly ? mergedPhoto : merged)) ?? {}
}

// 제주신화정보의 사진·삽화·장면 전체 목록(받기 전에는 빈 배열)
export function useMythMedia() {
  useEffect(load, [])
  return useSyncExternalStore(subscribe, () => media) ?? []
}

const COPYRIGHT = { Type1: '출처표시', Type3: '출처표시·변경금지' }
export const copyrightLabel = (c) => COPYRIGHT[c] ?? ''
