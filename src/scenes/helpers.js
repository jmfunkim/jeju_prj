import * as THREE from 'three'

// 글자가 들어간 스프라이트 라벨
export function makeLabel(text, { color = '#fff6e6', bg = 'rgba(12,22,26,.78)', size = 44, height = 0.62 } = {}) {
  const c = document.createElement('canvas')
  const g = c.getContext('2d')
  const font = `700 ${size}px "Noto Sans KR","Malgun Gothic",sans-serif`
  g.font = font
  const w = Math.ceil(g.measureText(text).width) + 44, h = size + 30
  c.width = w; c.height = h
  g.font = font
  g.fillStyle = bg
  g.beginPath(); g.roundRect(0, 0, w, h, h / 2); g.fill()
  g.fillStyle = color
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, w / 2, h / 2 + 2)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
  s.scale.set((w / h) * height, height, 1)
  s.renderOrder = 20
  return s
}

// 현무암처럼 거친 표면용 노이즈 텍스처
export function makeBasaltTexture(size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  g.fillStyle = '#777'; g.fillRect(0, 0, size, size)
  for (let i = 0; i < 2600; i++) {
    const v = 90 + Math.random() * 120
    g.fillStyle = `rgb(${v},${v},${v})`
    const r = Math.random() * 2.6 + 0.4
    g.beginPath(); g.arc(Math.random() * size, Math.random() * size, r, 0, 6.3); g.fill()
  }
  // 현무암 특유의 작은 구멍
  for (let i = 0; i < 160; i++) {
    g.fillStyle = 'rgba(20,20,20,.75)'
    const r = Math.random() * 2.2 + 0.8
    g.beginPath(); g.arc(Math.random() * size, Math.random() * size, r, 0, 6.3); g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

export function makeStars(count = 700, radius = 180) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 0.9 + 0.1, th = Math.random() * 6.283
    const r = radius, s = Math.sqrt(1 - u * u)
    pos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xfff1d0, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }))
}
