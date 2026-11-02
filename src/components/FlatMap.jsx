import { useEffect, useRef } from 'react'
import { KINDS } from '../data/places'
import { heightAt, toXZ } from '../scenes/terrain'

// 3D 지도와 같은 지형 함수로 그린 2D 지도. 장소를 빨리 찾고 코스를 한눈에 볼 때 씁니다.
const B = { lat0: 33.1, lat1: 33.6, lng0: 126.12, lng1: 126.98 }
const W = 640
const H = 444
const pos = (lat, lng) => ({
  left: `${((lng - B.lng0) / (B.lng1 - B.lng0)) * 100}%`,
  top: `${((B.lat1 - lat) / (B.lat1 - B.lat0)) * 100}%`,
})
const pct = (lat, lng) => [((lng - B.lng0) / (B.lng1 - B.lng0)) * 100, ((B.lat1 - lat) / (B.lat1 - B.lat0)) * 100]

function paint(canvas) {
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W, H)
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const lng = B.lng0 + (px / W) * (B.lng1 - B.lng0)
      const lat = B.lat1 - (py / H) * (B.lat1 - B.lat0)
      const [x, z] = toXZ(lat, lng)
      const h = heightAt(x, z)
      const shade = Math.max(-0.5, Math.min(0.5, (h - heightAt(x + 0.12, z + 0.12)) * 1.6))   // 북서쪽 햇빛
      let r, g, b
      if (h < -0.05) { const t = Math.min(1, -h / 1.4); r = 196 - 120 * t; g = 226 - 100 * t; b = 228 - 90 * t }
      else if (h < 0.14) { r = 233; g = 217; b = 168 }
      else if (h < 1.2) { const t = (h - 0.14) / 1.06; r = 127 - 34 * t; g = 174 - 31 * t; b = 94 - 18 * t }
      else if (h < 3) { const t = (h - 1.2) / 1.8; r = 79 + 27 * t; g = 122 - 21 * t; b = 69 + 27 * t }
      else { const t = Math.min(1, (h - 3) / 2); r = 106 + 48 * t; g = 101 + 47 * t; b = 96 + 44 * t }
      const k = h < -0.05 ? 1 : 1 + shade
      const i = (py * W + px) * 4
      img.data[i] = Math.min(255, r * k); img.data[i + 1] = Math.min(255, g * k); img.data[i + 2] = Math.min(255, b * k); img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}

export default function FlatMap({ places, selectedId, onPick, me, route, numbers, labels = false }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) paint(ref.current) }, [])

  const line = route?.length ? [...(me ? [me] : []), ...route].map((p) => pct(p.lat, p.lng).join(',')).join(' ') : ''

  return (
    <div className="flat" style={{ aspectRatio: `${W} / ${H}` }}>
      <canvas ref={ref} width={W} height={H} aria-hidden="true" />
      {line && (
        <svg className="flat__route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={line} vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {places.map((p) => (
        <button key={p.id} type="button" title={p.name} aria-label={p.name}
          className={`flat__pin flat__pin--${p.kind} ${p.id === selectedId ? 'on' : ''}`}
          style={{ ...pos(p.lat, p.lng), '--k': KINDS[p.kind].color }} onClick={() => onPick?.(p.id)}>
          <b>{numbers?.[p.id] ?? ''}</b>
          {(labels || p.id === selectedId) && <span>{p.name}</span>}
        </button>
      ))}
      {me && <i className="flat__me" style={pos(me.lat, me.lng)} title="내 위치" />}
    </div>
  )
}
