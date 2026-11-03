import { useEffect, useSyncExternalStore } from 'react'
import { fetchMythMedia, fetchPlacePhotos } from '../api/client'
import { PLACES } from '../data/places'
import { mainMedia } from '../data/mythMedia'
import { WEB_PHOTOS } from '../data/webPhotos'

// 장소 사진은 두 곳에서 모읍니다.
//  · 제주신화정보(제주도청) — 신화·설화 장소의 사진·삽화. 키가 필요 없어요.
//  · 한국관광공사 TourAPI — 그 밖의 장소 사진. 공공데이터 키가 있어야 해요.
// 신화·설화 장소는 신화정보 이미지를, 나머지는 관광공사 사진을 먼저 쓰고 없으면 서로 대신합니다.
// 어디에도 그 장소 사진이 없으면 비슷한 곳 사진으로 때우지 않고 빈 값이라, 화면은 그 장소를 그린 일러스트를 씁니다.
// 둘 다 못 받으면 빈 값이라 화면은 갈래 무늬·일러스트를 그대로 씁니다.
let tour = null
let media = null
let merged = null            // null = 아직 모름
let started = false
const subs = new Set()

function recompute() {
  const items = media ?? []
  const out = {}
  for (const p of PLACES) {
    const m = mainMedia(p.id, items)
    const jeju = m && { src: m.image, title: m.title, credit: m.credit, form: m.form, source: 'jeju' }
    const t = tour?.[p.id] && { ...tour[p.id], source: 'tour' }
    const w = WEB_PHOTOS[p.id] && { ...WEB_PHOTOS[p.id], source: 'web' }   // 위키미디어 커먼즈 — 위 둘이 없을 때만
    const pick = (p.kind === 'myth' ? (jeju ?? t) : (t ?? jeju)) ?? w
    if (pick) out[p.id] = pick
  }
  merged = out
  subs.forEach((f) => f())
}

function load() {
  if (started) return
  started = true
  fetchPlacePhotos().then((d) => { tour = d.photos ?? {} }).catch(() => { tour = {} }).finally(recompute)
  fetchMythMedia().then((d) => { media = d.items ?? [] }).catch(() => { media = [] }).finally(recompute)
}

const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }

export function usePlacePhotos() {
  useEffect(load, [])
  return useSyncExternalStore(subscribe, () => merged) ?? {}
}

// 제주신화정보의 사진·삽화·장면 전체 목록(받기 전에는 빈 배열)
export function useMythMedia() {
  useEffect(load, [])
  return useSyncExternalStore(subscribe, () => media) ?? []
}

const COPYRIGHT = { Type1: '출처표시', Type3: '출처표시·변경금지' }
export const copyrightLabel = (c) => COPYRIGHT[c] ?? ''
