import * as THREE from 'three'

// 1 단위 ≈ 3km. 위도·경도 → 씬 좌표 (제주 중심 북위 33.38, 동경 126.56)
export const toXZ = (lat, lng) => [(lng - 126.56) * 31, (33.38 - lat) * 37]

const HALLA = toXZ(33.3617, 126.5292)
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

// 섬 모양(바깥 d>1 은 바다) + 한라산 + 완만한 기복
function shape(x, z) {
  const dx = x / 12.6, dz = (z - 1.6) / 8.3
  const th = Math.atan2(dz, dx)
  return (dx * dx + dz * dz) * (1 + 0.07 * Math.sin(3 * th + 0.6) + 0.05 * Math.sin(5 * th + 1.4))
}

export function heightAt(x, z) {
  const d = shape(x, z)
  if (d >= 1) return -Math.min(1.6, (d - 1) * 3.2)
  const land = Math.pow(1 - d, 0.55)
  const hx = x - HALLA[0], hz = z - HALLA[1]
  const halla = 4.3 * Math.exp(-(hx * hx * 0.8 + hz * hz * 1.25) / (2 * 3.6 * 3.6))
  const ridge = 0.12 * Math.sin(x * 1.3) * Math.cos(z * 1.1) * smooth(0, 0.4, 1 - d)
  return land * 0.9 + halla * smooth(0, 0.35, 1 - d) + ridge
}

function colorAt(h, out) {
  if (h < -0.05) return out.set('#1f6f86').lerp(new THREE.Color('#0d3442'), Math.min(1, -h / 1.4))
  if (h < 0.14) return out.set('#e9d9a8')
  if (h < 1.2) return out.set('#7fae5e').lerp(new THREE.Color('#5d8f4c'), (h - 0.14) / 1.06)
  if (h < 3) return out.set('#4f7a45').lerp(new THREE.Color('#6a6560'), (h - 1.2) / 1.8)
  return out.set('#6a6560').lerp(new THREE.Color('#9a948c'), Math.min(1, (h - 3) / 2))
}

export function buildTerrain() {
  const W = 44, D = 30, sx = 220, sz = 150
  const geo = new THREE.PlaneGeometry(W, D, sx, sz)
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, 0, 1.6)
  const pos = geo.attributes.position
  const col = new Float32Array(pos.count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const h = heightAt(pos.getX(i), pos.getZ(i))
    pos.setY(i, h)
    colorAt(h, c)
    col.set([c.r, c.g, c.b], i * 3)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  geo.computeVertexNormals()
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: false }))
}

// 오름 368개: 한라산 둘레 산지 위에 흩뿌린다 (고정 시드)
export function buildOreums(count = 368) {
  let s = 20240
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  const mesh = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.16, 0.3, 7),
    new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }),
    count,
  )
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color()
  let n = 0, guard = 0
  while (n < count && guard++ < 40000) {
    const x = (rand() * 2 - 1) * 13, z = (rand() * 2 - 1) * 9 + 1.6
    const h = heightAt(x, z)
    const dh = Math.hypot(x - HALLA[0], z - HALLA[1])
    if (h < 0.35 || h > 3.2 || dh < 1.6) continue
    const k = 0.6 + rand() * 1.1
    p.set(x, h + 0.14 * k, z)
    sc.set(k, k * (0.8 + rand() * 0.5), k)
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6.28)
    m.compose(p, q, sc)
    mesh.setMatrixAt(n, m)
    mesh.setColorAt(n, col.setHSL(0.27 + rand() * 0.06, 0.4, 0.28 + rand() * 0.12))
    n++
  }
  mesh.count = n
  mesh.userData.total = n
  return mesh
}
