import { useEffect, useSyncExternalStore } from 'react'
import { fetchPlacePhotos } from '../api/client'

// 장소 사진은 한국관광공사 TourAPI 에서 /api/placephoto 로 한 번에 받아 모든 화면이 나눠 씁니다.
// 받지 못하면(키 없음·오프라인) 빈 값이라 화면은 갈래 무늬 머리띠를 그대로 씁니다.
let state = null          // null = 아직 안 받음, {} = 받았지만 없음
let started = false
const subs = new Set()
const emit = () => subs.forEach((f) => f())

function load() {
  if (started) return
  started = true
  fetchPlacePhotos()
    .then((d) => { state = d.photos ?? {} })
    .catch(() => { state = {} })
    .finally(emit)
}

export function usePlacePhotos() {
  useEffect(load, [])
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => state) ?? {}
}

const COPYRIGHT = { Type1: '출처표시', Type3: '출처표시·변경금지' }
export const copyrightLabel = (c) => COPYRIGHT[c] ?? ''
