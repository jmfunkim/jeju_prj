// 이야기 산책 코스 만들기 — 화면(Walk)과 서버(AI 가이드)가 같이 쓰는 순수 함수.
// 서버에서도 불러 쓰므로 import 경로에 .js 를 붙입니다.
import { KIND_KEYS, PLACES, placeById } from '../data/places.js'
import { walkInfo } from '../data/walk.js'
import { distanceKm } from './geo.js'

export const MODES = {
  car: { label: '자동차', kmh: 40, detour: 1.35 },
  walk: { label: '걸어서', kmh: 4, detour: 1.25 },
}
export const TIME_OPTIONS = [
  { value: 60, label: '1시간' },
  { value: 120, label: '2시간' },
  { value: 180, label: '3시간' },
  { value: 240, label: '반나절' },
]

// 직선거리에 우회 계수를 곱해 이동 시간(분)을 어림잡습니다.
export const travelMinutes = (km, mode = 'car') => {
  const m = MODES[mode] ?? MODES.car
  return Math.max(1, Math.round(((km * m.detour) / m.kmh) * 60))
}

function toStop(prev, place, mode, clock) {
  const km = distanceKm(prev, place)
  const leg = travelMinutes(km, mode)
  const info = walkInfo(place.id)
  return { place, km, leg, stay: info.stay, arrive: clock + leg, info }
}

// 정해진 순서(id 목록)로 코스를 계산 — AI 가이드가 고른 코스를 그대로 보여 줄 때
export function planFromIds(start, ids, mode = 'car') {
  const stops = []
  let pos = start
  let clock = 0
  for (const id of ids) {
    const place = placeById(id)
    if (!place) continue
    const s = toStop(pos, place, mode, clock)
    stops.push(s)
    clock = s.arrive + s.stay
    pos = place
  }
  return summarize(stops)
}

// 가까운 곳부터 고르되, 갈래가 겹치지 않도록 점수를 주는 탐욕 방식
export function buildCourse({ start, minutes = 120, mode = 'car', kinds = KIND_KEYS, rainy = false, kids = false, max = 5 }) {
  const pool = PLACES.filter((p) => kinds.includes(p.kind) && (!rainy || walkInfo(p.id).rain))
  const stops = []
  const used = new Set()
  let pos = start
  let clock = 0
  while (stops.length < max) {
    let best = null
    for (const p of pool) {
      if (used.has(p.id)) continue
      const s = toStop(pos, p, mode, clock)
      if (s.arrive + s.stay > minutes) continue
      const repeat = stops.some((x) => x.place.kind === p.kind) ? 12 : 0
      const score = s.leg + repeat - (kids && s.info.kids ? 10 : 0)
      if (!best || score < best.score) best = { s, score }
    }
    if (!best) break
    stops.push(best.s)
    used.add(best.s.place.id)
    clock = best.s.arrive + best.s.stay
    pos = best.s.place
  }
  // 시간 안에 한 곳도 못 들어가면 가장 가까운 한 곳이라도 보여 줍니다.
  if (stops.length === 0 && pool.length) {
    const s = pool.map((p) => toStop(start, p, mode, 0)).sort((a, b) => a.leg - b.leg)[0]
    return { ...summarize([s]), over: true }
  }
  return summarize(stops)
}

function summarize(stops) {
  const travel = stops.reduce((n, s) => n + s.leg, 0)
  const stay = stops.reduce((n, s) => n + s.stay, 0)
  const km = stops.reduce((n, s) => n + s.km, 0)
  return { stops, travel, stay, total: travel + stay, km, over: false }
}

export const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${m}분`)
