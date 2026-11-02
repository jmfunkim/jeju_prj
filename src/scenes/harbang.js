import * as THREE from 'three'
import { makeBasaltTexture, makeStars } from './helpers'

const MOODS = {
  day:   { bg: '#9fd3e6', fog: '#9fd3e6', sun: 0xfff2d8, sunI: 3.2, amb: 1.1, pos: [5, 8, 6] },
  dusk:  { bg: '#3b2a3f', fog: '#3b2a3f', sun: 0xff9a4a, sunI: 3.6, amb: 0.55, pos: [-6, 2.5, 5] },
  night: { bg: '#0b1220', fog: '#0b1220', sun: 0x9fb8ff, sunI: 1.5, amb: 0.35, pos: [4, 6, -3] },
}

// 모델마다 카메라가 바라볼 곳(target)과 거리, 바닥 색
const VIEWS = {
  harbang:   { target: [0, 2.2, 0], dist: 9.5, el: 0.3, ground: 0x78a65c },
  baddam:    { target: [0, 0.5, 0], dist: 12, el: 0.85, ground: 0x7aa95a },
  bangsatap: { target: [0, 1.9, 0], dist: 9, el: 0.35, ground: 0x86a860 },
  jeongnang: { target: [0, 1.1, 0.2], dist: 8, el: 0.22, ground: 0x9a8a5c },
  budeok:    { target: [0, 0.5, 0], dist: 9, el: 0.8, ground: 0xd9c38a },
}

// 지금 보던 방향(좌우 각도)은 유지하고, 위아래 각도(el)만 모델에 맞춰 정한 카메라 위치
function viewPosition(camera, controls, v) {
  const dx = camera.position.x - controls.target.x, dz = camera.position.z - controls.target.z
  const az = Math.atan2(dx, dz)
  return new THREE.Vector3(...v.target).add(new THREE.Vector3(Math.sin(az) * Math.cos(v.el), Math.sin(v.el), Math.cos(az) * Math.cos(v.el)).multiplyScalar(v.dist))
}

// 같은 입력이면 같은 모양이 나오는 난수 (새로고침해도 돌담 모양이 그대로)
function rng(seed) {
  let a = seed
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

// 울퉁불퉁한 돌 한 덩이 (꼭짓점을 위치에 따라 일정하게 흔들어 각진 현무암처럼)
function makeRockGeometry() {
  const g = new THREE.IcosahedronGeometry(1, 1)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const k = 1 + 0.2 * Math.sin(x * 12.9 + y * 7.7 + z * 5.3) + 0.08 * Math.cos(x * 23.1 - z * 11.3)
    p.setXYZ(i, x * k, y * k, z * k)
  }
  g.computeVertexNormals()
  return g
}

// 돌 전시장: 돌하르방·밭담·방사탑·정주석과 정낭·불턱을 도형으로 빚은 3D 씬.
// live = { model, mood, orange, spin, bars }  — model 이 바뀌면 해당 모델이 커지며 나타나고 카메라가 따라갑니다.
export function buildHarbang({ scene, camera, controls }, live) {
  const stars = makeStars(600, 60)
  scene.add(stars)
  const hemi = new THREE.HemisphereLight(0xffffff, 0x223322, 1)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffffff, 3)
  scene.add(sun)
  const fill = new THREE.PointLight(0xffb36b, 8, 14)   // 얼굴 쪽 따뜻한 보조광
  fill.position.set(0, 2.6, 4)
  scene.add(fill)

  const tex = makeBasaltTexture()
  tex.repeat.set(2, 2)
  const stone = new THREE.MeshStandardMaterial({ color: 0x5a5755, roughness: 1, bumpMap: tex, bumpScale: 2.2, map: tex })
  const stone2 = new THREE.MeshStandardMaterial({ color: 0x4a4846, roughness: 1, bumpMap: tex, bumpScale: 2.2, map: tex })
  const dark = new THREE.MeshStandardMaterial({ color: 0x1d1c1c, roughness: 0.9 })
  const wood = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85 })
  const rockGeo = makeRockGeometry()

  const groups = {}
  const group = (key) => { const g = new THREE.Group(); groups[key] = g; scene.add(g); return g }
  const add = (geo, mat, x, y, z, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m
  }
  const rock = (parent, rand, x, y, z, size, mat = stone) => {
    const m = new THREE.Mesh(rockGeo, mat)
    m.position.set(x, y, z)
    m.scale.set(size * (0.9 + rand() * 0.35), size * (0.7 + rand() * 0.3), size * (0.9 + rand() * 0.35))
    m.rotation.set(rand() * 3, rand() * 6, rand() * 3)
    parent.add(m)
    return m
  }

  // ───────── 돌하르방 ─────────
  const root = group('harbang')
  add(new THREE.CylinderGeometry(1.5, 1.7, 0.28, 8), stone, 0, 0.14, 0, root)
  const body = add(new THREE.CylinderGeometry(0.85, 1.05, 2.1, 20), stone, 0, 1.33, 0, root)
  body.scale.z = 0.8
  for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(0.93 - i * 0.02, 0.025, 6, 28), dark, 0, 1.0 + i * 0.35, 0, root).rotation.x = Math.PI / 2
  const head = add(new THREE.SphereGeometry(0.88, 32, 32), stone, 0, 2.95, 0, root)
  head.scale.set(1, 1.02, 0.95)
  add(new THREE.CylinderGeometry(1.25, 1.3, 0.12, 32), stone, 0, 3.52, 0, root)
  add(new THREE.CylinderGeometry(0.58, 0.8, 0.5, 24), stone, 0, 3.8, 0, root)
  for (const sx of [-1, 1]) {
    add(new THREE.SphereGeometry(0.17, 16, 16), stone, 0.34 * sx, 3.12, 0.72, root).scale.set(1, 0.8, 0.7)
    add(new THREE.SphereGeometry(0.06, 12, 12), dark, 0.34 * sx, 3.12, 0.84, root)
    add(new THREE.BoxGeometry(0.34, 0.07, 0.1), stone, 0.34 * sx, 3.34, 0.7, root).rotation.z = 0.12 * sx
  }
  add(new THREE.SphereGeometry(0.22, 18, 18), stone, 0, 2.86, 0.8, root).scale.set(1.1, 1.1, 0.8)
  add(new THREE.BoxGeometry(0.62, 0.07, 0.12), dark, 0, 2.52, 0.74, root)
  for (const sx of [-1, 1]) add(new THREE.SphereGeometry(0.17, 12, 12), stone, 0.88 * sx, 2.95, 0, root).scale.set(0.5, 1.1, 0.8)
  add(new THREE.CylinderGeometry(0.16, 0.2, 1.3, 12), stone, 0.95, 1.7, 0.1, root).rotation.z = -0.12
  add(new THREE.CylinderGeometry(0.16, 0.2, 1.3, 12), stone, -0.95, 1.7, 0.1, root).rotation.z = 0.12
  add(new THREE.SphereGeometry(0.24, 16, 16), stone, 0.45, 1.95, 0.78, root).scale.set(1.2, 0.8, 0.8)
  add(new THREE.SphereGeometry(0.24, 16, 16), stone, -0.4, 1.35, 0.82, root).scale.set(1.2, 0.8, 0.8)

  const orange = new THREE.Group()
  const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.55 }))
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0x3f8f3a }))
  leaf.position.y = 0.31; leaf.rotation.z = 0.5
  orange.add(fruit, leaf)
  orange.position.set(-0.4, 1.7, 1.0)
  root.add(orange)

  // ───────── 밭담: 구불구불 두 줄로 쌓은 돌담과 그 사이의 밭 ─────────
  const bd = group('baddam')
  {
    const rand = rng(11)
    const cz = (x) => 1.6 * Math.sin(x * 0.55)
    const ribbon = (a, b, y, color) => {
      const pos = [], idx = []
      const xs = []
      for (let x = -5.2; x <= 5.2; x += 0.4) xs.push(x)
      xs.forEach((x, i) => { pos.push(x, y, cz(x) + a, x, y, cz(x) + b); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k) } })
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      g.setIndex(idx); g.computeVertexNormals()
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide }))
      bd.add(m)
    }
    ribbon(-1.25, 1.25, 0.02, 0x6a9a3f)
    for (let k = -3; k <= 3; k++) ribbon(k * 0.32 - 0.04, k * 0.32 + 0.04, 0.035, 0x4d7a2d)
    for (const side of [-1, 1]) {
      for (let layer = 0; layer < 3; layer++) {
        for (let x = -5.2; x <= 5.2; x += 0.42) {
          const stagger = layer % 2 ? 0.2 : 0
          const xx = x + stagger
          rock(bd, rand, xx, 0.26 + layer * 0.42, cz(xx) + side * (1.5 + (rand() - 0.5) * 0.12), 0.34 + rand() * 0.12 - layer * 0.03, layer % 2 ? stone2 : stone)
        }
      }
    }
  }

  // ───────── 방사탑: 돌을 층층이 쌓은 탑과 꼭대기의 돌새 ─────────
  const bt = group('bangsatap')
  {
    const rand = rng(23)
    const layers = 8
    for (let i = 0; i < layers; i++) {
      const r = 1.55 * (1 - i * 0.1)
      const n = Math.max(5, Math.round((2 * Math.PI * r) / 0.62))
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + (i % 2) * 0.3
        rock(bt, rand, Math.cos(a) * r, 0.26 + i * 0.42, Math.sin(a) * r, 0.36 + rand() * 0.1 - i * 0.015, (i + k) % 2 ? stone : stone2)
      }
      // 속을 채우는 돌
      rock(bt, rand, 0, 0.26 + i * 0.42, 0, Math.max(0.3, r * 0.75), stone2)
    }
    const topY = 0.26 + (layers - 1) * 0.42 + 0.2
    add(new THREE.SphereGeometry(0.42, 20, 16), stone, 0, topY + 0.28, 0, bt).scale.set(1, 0.72, 1.45)
    add(new THREE.SphereGeometry(0.22, 18, 14), stone, 0, topY + 0.62, 0.55, bt)
    const beak = add(new THREE.ConeGeometry(0.1, 0.3, 10), stone, 0, topY + 0.6, 0.86, bt)
    beak.rotation.x = Math.PI / 2
    add(new THREE.SphereGeometry(0.04, 8, 8), dark, 0.1, topY + 0.68, 0.7, bt)
    add(new THREE.SphereGeometry(0.04, 8, 8), dark, -0.1, topY + 0.68, 0.7, bt)
    add(new THREE.ConeGeometry(0.2, 0.45, 8), stone, 0, topY + 0.4, -0.62, bt).rotation.x = -Math.PI / 2.6
  }

  // ───────── 정주석·정낭: 구멍 뚫린 돌기둥 둘과 걸쳐 두는 나무 막대 ─────────
  const jn = group('jeongnang')
  const bars = []
  const holeY = [0.85, 1.3, 1.75]
  {
    const rand = rng(37)
    for (const sx of [-1, 1]) {
      const pillar = add(new THREE.BoxGeometry(0.46, 2.4, 0.46), stone, 1.75 * sx, 1.2, 0, jn)
      pillar.rotation.z = 0.02 * sx
      add(new THREE.SphereGeometry(0.33, 16, 12), stone, 1.75 * sx, 2.42, 0, jn).scale.set(1, 0.6, 1)
      holeY.forEach((y) => { add(new THREE.CylinderGeometry(0.085, 0.085, 0.52, 12), dark, 1.75 * sx, y, 0, jn).rotation.z = Math.PI / 2 })
      for (let i = 0; i < 3; i++) rock(jn, rand, 1.75 * sx + sx * (0.7 + i * 0.55), 0.22, -0.1 + (rand() - 0.5) * 0.2, 0.3 + rand() * 0.1)
    }
    holeY.forEach((y, i) => {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 4.1, 12), wood)
      bar.rotation.z = Math.PI / 2
      bar.userData = { y, i, t: 0 }
      jn.add(bar)
      bars.push(bar)
    })
    live.bars = live.bars ?? 0
  }

  // ───────── 불턱: 바다 쪽을 터 둔 둥근 돌담과 가운데의 불 ─────────
  const bk = group('budeok')
  const flames = []
  let fire
  {
    const rand = rng(51)
    const R = 2.3
    for (let layer = 0; layer < 3; layer++) {
      const n = 26
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2
        const deg = ((a * 180) / Math.PI + 360) % 360
        if (deg > 75 && deg < 135) continue   // 입구
        rock(bk, rand, Math.cos(a) * R, 0.24 + layer * 0.4, Math.sin(a) * R, 0.36 + rand() * 0.1 - layer * 0.03, (k + layer) % 2 ? stone : stone2)
      }
    }
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2
      rock(bk, rand, Math.cos(a) * 0.55, 0.12, Math.sin(a) * 0.55, 0.2 + rand() * 0.06, stone2)
    }
    const flameMat = [0xffd45a, 0xff8a1f, 0xe8501a].map((c) => new THREE.MeshBasicMaterial({ color: c }))
    flameMat.forEach((m, i) => {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.34 - i * 0.08, 1.1 - i * 0.2, 12), m)
      f.position.set((i - 1) * 0.1, 0.65 - i * 0.04, (i === 1 ? 0.1 : -0.05))
      bk.add(f)
      flames.push(f)
    })
    fire = new THREE.PointLight(0xff9a3c, 0, 9)
    fire.position.set(0, 0.9, 0)
    bk.add(fire)
  }

  // 바닥
  const groundMat = new THREE.MeshStandardMaterial({ color: VIEWS.harbang.ground, roughness: 1 })
  const ground = new THREE.Mesh(new THREE.CircleGeometry(9, 48), groundMat)
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  // 처음 상태
  let model = live.model && VIEWS[live.model] ? live.model : 'harbang'
  const scales = {}
  Object.keys(groups).forEach((k) => { scales[k] = k === model ? 1 : 0; groups[k].scale.setScalar(scales[k] || 0.001); groups[k].visible = k === model })
  groupsInit()
  const goal = new THREE.Color(VIEWS[model].ground)
  groundMat.color.copy(goal)
  let flight = null
  function groupsInit() {
    const v = VIEWS[model]
    const pos = viewPosition(camera, controls, v)
    controls.target.set(...v.target)
    camera.position.copy(pos)
  }

  let mood = null
  const bgCol = new THREE.Color(), targetBg = new THREE.Color()
  scene.background = bgCol.set(MOODS.day.bg)
  scene.fog = new THREE.Fog(MOODS.day.fog, 14, 40)

  return {
    update(dt, t) {
      if (mood !== live.mood) {
        mood = live.mood
        const m = MOODS[mood] ?? MOODS.day
        sun.color.set(m.sun); sun.intensity = m.sunI; sun.position.set(...m.pos)
        hemi.intensity = m.amb
        stars.visible = mood === 'night'
        fill.intensity = mood === 'day' ? 2 : 10
        targetBg.set(m.bg)
        scene.fog.color.set(m.fog)
      }
      bgCol.lerp(targetBg, 1 - Math.exp(-dt * 4))

      // 모델 바꾸기: 새 모델은 커지고 이전 모델은 작아지며, 카메라는 새 모델을 향해 날아갑니다
      if (live.model && VIEWS[live.model] && model !== live.model) {
        model = live.model
        groups[model].rotation.y = 0
        const v = VIEWS[model]
        flight = { t: 0, fromT: controls.target.clone(), toT: new THREE.Vector3(...v.target), fromP: camera.position.clone(), toP: viewPosition(camera, controls, v) }
        goal.set(v.ground)
      }
      const k = 1 - Math.exp(-dt * 7)
      for (const key of Object.keys(groups)) {
        scales[key] += ((key === model ? 1 : 0) - scales[key]) * k
        groups[key].scale.setScalar(Math.max(scales[key], 0.001))
        groups[key].visible = scales[key] > 0.06
      }
      groundMat.color.lerp(goal, k)
      if (flight) {
        flight.t = Math.min(1, flight.t + dt / 0.7)
        const e = 1 - (1 - flight.t) ** 3
        controls.target.lerpVectors(flight.fromT, flight.toT, e)
        camera.position.lerpVectors(flight.fromP, flight.toP, e)
        if (flight.t >= 1) flight = null
      }

      orange.visible = !!live.orange && model === 'harbang'
      orange.position.y = 1.7 + Math.sin(t * 2) * 0.03
      if (live.spin) groups[model].rotation.y += dt * 0.5

      // 정낭: 걸어 둔 개수만큼 구멍에 걸리고, 나머지는 땅에 내려놓습니다
      bars.forEach((bar) => {
        const up = bar.userData.i < (live.bars ?? 0) ? 1 : 0
        bar.userData.t += (up - bar.userData.t) * (1 - Math.exp(-dt * 8))
        const u = bar.userData.t
        bar.position.set(0, 0.08 + (bar.userData.y - 0.08) * u, (1 - u) * (0.55 + bar.userData.i * 0.3))
      })

      // 불턱의 불: 흔들리는 불꽃
      if (model === 'budeok') {
        flames.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 9 + i) * 0.08, 1 + Math.sin(t * 12 + i * 2) * 0.12, 1 + Math.cos(t * 10 + i) * 0.08) })
        fire.intensity = 14 + Math.sin(t * 17) * 3
      } else {
        fire.intensity = 0
      }
    },
    dispose() { tex.dispose() },
  }
}
