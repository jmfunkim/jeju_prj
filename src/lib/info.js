import { useEffect, useSyncExternalStore } from 'react'

// 서버가 공공데이터 키를 갖고 있는지(/api/hello) 한 번만 물어, 안 되는 기능은 눌러 보기 전에 감춥니다.
// null = 아직 모름, true/false = 확인함. 서버에 못 닿으면 감추지 않고(null) 평소처럼 보여 줍니다.
let state = null
let started = false
const subs = new Set()

function load() {
  if (started) return
  started = true
  fetch('/api/hello')
    .then((r) => r.json())
    .then((d) => { state = typeof d.hasDataKey === 'boolean' ? d.hasDataKey : null })
    .catch(() => { state = null })
    .finally(() => subs.forEach((f) => f()))
}

export function useDataKey() {
  useEffect(load, [])
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => state)
}
