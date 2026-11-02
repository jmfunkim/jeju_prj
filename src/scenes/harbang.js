import * as THREE from 'three'
import { makeBasaltTexture, makeStars } from './helpers'

const MOODS = {
  day:   { bg: '#9fd3e6', fog: '#9fd3e6', sun: 0xfff2d8, sunI: 3.2, amb: 1.1, pos: [5, 8, 6] },
  dusk:  { bg: '#3b2a3f', fog: '#3b2a3f', sun: 0xff9a4a, sunI: 3.6, amb: 0.55, pos: [-6, 2.5, 5] },
  night: { bg: '#0b1220', fog: '#0b1220', sun: 0x9fb8ff, sunI: 1.5, amb: 0.35, pos: [4, 6, -3] },
}

// 돌하르방을 도형으로 빚은 3D 씬. live = { mood, orange, spin }
export function buildHarbang({ scene, camera }, live) {
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
  const dark = new THREE.MeshStandardMaterial({ color: 0x1d1c1c, roughness: 0.9 })

  const root = new THREE.Group()
  scene.add(root)
  const add = (geo, mat, x, y, z, parent = root) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m
  }

  // 받침과 몸통
  add(new THREE.CylinderGeometry(1.5, 1.7, 0.28, 8), stone, 0, 0.14, 0)
  const body = add(new THREE.CylinderGeometry(0.85, 1.05, 2.1, 20), stone, 0, 1.33, 0)
  body.scale.z = 0.8
  // 옷주름
  for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(0.93 - i * 0.02, 0.025, 6, 28), dark, 0, 1.0 + i * 0.35, 0).rotation.x = Math.PI / 2

  // 머리
  const head = add(new THREE.SphereGeometry(0.88, 32, 32), stone, 0, 2.95, 0)
  head.scale.set(1, 1.02, 0.95)
  // 벙거지(챙 + 윗부분)
  add(new THREE.CylinderGeometry(1.25, 1.3, 0.12, 32), stone, 0, 3.52, 0)
  add(new THREE.CylinderGeometry(0.58, 0.8, 0.5, 24), stone, 0, 3.8, 0)
  // 눈(튀어나온 큰 눈)
  for (const sx of [-1, 1]) {
    add(new THREE.SphereGeometry(0.17, 16, 16), stone, 0.34 * sx, 3.12, 0.72).scale.set(1, 0.8, 0.7)
    add(new THREE.SphereGeometry(0.06, 12, 12), dark, 0.34 * sx, 3.12, 0.84)
    add(new THREE.BoxGeometry(0.34, 0.07, 0.1), stone, 0.34 * sx, 3.34, 0.7).rotation.z = 0.12 * sx
  }
  // 코와 입, 귀
  add(new THREE.SphereGeometry(0.22, 18, 18), stone, 0, 2.86, 0.8).scale.set(1.1, 1.1, 0.8)
  add(new THREE.BoxGeometry(0.62, 0.07, 0.12), dark, 0, 2.52, 0.74)
  for (const sx of [-1, 1]) add(new THREE.SphereGeometry(0.17, 12, 12), stone, 0.88 * sx, 2.95, 0).scale.set(0.5, 1.1, 0.8)

  // 팔: 한 손은 가슴 위, 한 손은 배 위
  const armR = add(new THREE.CylinderGeometry(0.16, 0.2, 1.3, 12), stone, 0.95, 1.7, 0.1)
  armR.rotation.z = -0.12
  const armL = add(new THREE.CylinderGeometry(0.16, 0.2, 1.3, 12), stone, -0.95, 1.7, 0.1)
  armL.rotation.z = 0.12
  const handUp = add(new THREE.SphereGeometry(0.24, 16, 16), stone, 0.45, 1.95, 0.78)
  handUp.scale.set(1.2, 0.8, 0.8)
  const handDown = add(new THREE.SphereGeometry(0.24, 16, 16), stone, -0.4, 1.35, 0.82)
  handDown.scale.set(1.2, 0.8, 0.8)

  // 소품: 감귤
  const orange = new THREE.Group()
  const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.55 }))
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0x3f8f3a }))
  leaf.position.y = 0.31; leaf.rotation.z = 0.5
  orange.add(fruit, leaf)
  orange.position.set(-0.4, 1.7, 1.0)
  root.add(orange)

  // 바닥
  const ground = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshStandardMaterial({ color: 0x78a65c, roughness: 1 }))
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

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
      orange.visible = !!live.orange
      orange.position.y = 1.7 + Math.sin(t * 2) * 0.03
      if (live.spin) root.rotation.y += dt * 0.5
    },
    dispose() { tex.dispose() },
  }
}
