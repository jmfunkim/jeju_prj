import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { KINDS } from '../data/places'

// 실제 지도(OpenStreetMap 타일 + Leaflet). 장소 표지, 내 위치, 산책 코스 선을 올립니다.
// 타일은 인증키 없이 쓰는 OSM 공개 타일이고, 지도 오른쪽 아래에 출처를 표시합니다.
const JEJU = [33.38, 126.55]
const ISLAND = [[33.1, 126.14], [33.6, 126.98]]

const pinIcon = (p, num, on, label) => L.divIcon({
  className: 'rpin-wrap',
  html: `<span class="rpin rpin--${p.kind}${on ? ' on' : ''}" style="--k:${KINDS[p.kind].color}"><b>${num ?? ''}</b></span>${label ? `<em class="rpin__label">${p.name.replace(/[<>&]/g, '')}</em>` : ''}`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

export default function RealMap({ places, selectedId, onPick, me, route, numbers, labels = false }) {
  const host = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const pick = useRef(onPick)
  pick.current = onPick

  // 지도는 한 번만 만들고, 크기가 바뀌면 다시 맞춥니다
  useEffect(() => {
    const m = L.map(host.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true }).fitBounds(ISLAND)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> 기여자',
    }).addTo(m)
    layer.current = L.layerGroup().addTo(m)
    // 페이지를 스크롤하다 지도에 걸리지 않도록, 지도를 눌렀을 때만 휠 확대를 켭니다
    m.on('click', () => m.scrollWheelZoom.enable())
    m.on('mouseout', () => m.scrollWheelZoom.disable())
    const ro = new ResizeObserver(() => m.invalidateSize())
    ro.observe(host.current)
    map.current = m
    return () => { ro.disconnect(); m.remove(); map.current = null }
  }, [])

  // 표지·코스선·내 위치
  useEffect(() => {
    const g = layer.current
    if (!g) return
    g.clearLayers()
    if (route?.length) {
      const pts = [...(me ? [me] : []), ...route].map((p) => [p.lat, p.lng])
      L.polyline(pts, { color: '#0f8b9d', weight: 4, dashArray: '8 8', opacity: 0.9 }).addTo(g)
    }
    places.forEach((p) => {
      const on = p.id === selectedId
      L.marker([p.lat, p.lng], { icon: pinIcon(p, numbers?.[p.id], on, labels || on), zIndexOffset: on ? 1000 : 0, title: p.name, keyboard: true })
        .on('click', () => pick.current?.(p.id))
        .addTo(g)
    })
    if (me) {
      L.marker([me.lat, me.lng], { icon: L.divIcon({ className: 'rpin-wrap', html: '<i class="rme"></i>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 900, title: '내 위치' }).addTo(g)
    }
  }, [places, selectedId, me, route, numbers, labels])

  // 코스는 한눈에 보이게, 고른 장소는 가운데로
  useEffect(() => {
    const m = map.current
    if (!m) return
    if (route?.length) {
      m.fitBounds(L.latLngBounds([...(me ? [me] : []), ...route].map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 13 })
    }
  }, [route, me])
  useEffect(() => {
    const m = map.current
    const p = places.find((x) => x.id === selectedId)
    if (m && p && !route?.length) m.panTo([p.lat, p.lng], { animate: true })
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="flat" role="region" aria-label="제주 지도"><div ref={host} className="flat__map" /></div>
}
