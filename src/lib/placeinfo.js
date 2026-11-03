import { useEffect, useSyncExternalStore } from 'react'
import { fetchPlaceInfo } from '../api/client'

// 전시·기념관의 쉬는 날·이용 시간 (한국관광공사 TourAPI). 안내 카드가 처음 보일 때 한 번만 불러 모두가 같이 써요.
// 키가 없거나 못 찾은 장소는 값이 없고, 화면은 '방문 전 확인' 안내만 보여 줍니다.
let info = null          // null = 아직 모름
let started = false
const subs = new Set()

function load() {
  if (started) return
  started = true
  fetchPlaceInfo()
    .then((d) => { info = d.info ?? {} })
    .catch(() => { info = {} })
    .finally(() => subs.forEach((f) => f()))
}

const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }

// id 가 없으면(운영 시간이 있는 곳이 아니면) 아무것도 부르지 않아요
export function usePlaceInfo(id) {
  useEffect(() => { if (id) load() }, [id])
  return (useSyncExternalStore(subscribe, () => info) ?? {})[id] ?? null
}
