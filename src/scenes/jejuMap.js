import * as THREE from 'three'
import { KINDS, PLACES } from '../data/places'
import { buildOreums, buildTerrain, heightAt, toXZ } from './terrain'
import { makeLabel, makeStars } from './helpers'

const HOME_CAM = new THREE.Vector3(0, 24, 32)
const HOME_TARGET = new THREE.Vector3(0, 0, 1.6)

// 종류마다 다른 모양의 표지: 신화=구슬, 돌문화=돌, 역사문화=마름모
const SHAPES = {
  myth: () => new THREE.SphereGeometry(0.2, 20, 20),
  stone: () => new THREE.DodecahedronGeometry(0.26),
  history: () => new THREE.OctahedronGeometry(0.3),
}

// 제주 섬 3D 지도. live 는 React 쪽에서 계속 갱신하는 값 묶음입니다.
//   live = { selectedId, onPick(id), layers[], showOreum, showLabels, follow, resetNonce, me }
export function buildJejuMap({ scene, camera, controls, dom }, live) {
  const BG = new THREE.Color('#12303b')
  scene.background = BG
  scene.fog = new THREE.Fog(BG, 38, 100)
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x1b2a22, 1.0))
  const sun = new THREE.DirectionalLight(0xffd9a0, 2.8)
  sun.position.set(-18, 16, 12)
  scene.add(sun)
  scene.add(makeStars())
  scene.add(buildTerrain())

  const seaGeo = new THREE.PlaneGeometry(130, 130, 64, 64)
  seaGeo.rotateX(-Math.PI / 2)
  const seaBase = Float32Array.from(seaGeo.attributes.position.array)
  const sea = new THREE.Mesh(seaGeo, new THREE.MeshStandardMaterial({
    color: 0x2fb4cc, transparent: true, opacity: 0.8, roughness: 0.25, metalness: 0.1,
  }))
  sea.position.y = 0.02
  scene.add(sea)

  const oreums = buildOreums()
  scene.add(oreums)

  // 장소 표지: 빛기둥 + 종류별 모양 + 바닥 고리 + 이름표
  const hits = []
  const spots = PLACES.map((m) => {
    const [x, z] = toXZ(m.lat, m.lng)
    const y = Math.max(0.04, heightAt(x, z))
    const color = new THREE.Color(KINDS[m.kind].color)
    const g = new THREE.Group()
    g.position.set(x, y, z)

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.16, 2.4, 14, 1, true),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    )
    beam.position.y = 1.2
    const orb = new THREE.Mesh(SHAPES[m.kind](), new THREE.MeshBasicMaterial({ color }))
    orb.position.y = 2.5
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.45, 40),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }),
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.05
    const label = makeLabel(m.name)
    label.position.y = 3.1
    g.add(beam, orb, ring, label)

    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), new THREE.MeshBasicMaterial({ visible: false }))
    hit.position.y = 1.4
    hit.userData.id = m.id
    g.add(hit)
    hits.push(hit)

    scene.add(g)
    return { m, g, beam, orb, ring, label, base: new THREE.Vector3(x, y, z) }
  })

  // 내 위치 표지
  const me = new THREE.Group()
  const meDot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), new THREE.MeshBasicMaterial({ color: 0x35e0ff }))
  const mePulse = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 0.5, 40),
    new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
  )
  mePulse.rotation.x = -Math.PI / 2
  mePulse.position.y = -0.2
  const meLabel = makeLabel('내 위치', { bg: 'rgba(0,120,150,.9)' })
  meLabel.position.y = 0.9
  me.add(meDot, mePulse, meLabel)
  me.visible = false
  scene.add(me)

  // ── 클릭 선택 (드래그와 구분) ──
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let down = null
  const setNdc = (e) => {
    const r = dom.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
  }
  const pick = () => ray.intersectObjects(hits, false).find((h) => h.object.parent.visible)   // 꺼진 레이어는 제외
  const onDown = (e) => { down = [e.clientX, e.clientY]; flight = null }   // 직접 조작하면 이동 취소
  const onUp = (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return
    setNdc(e)
    const hit = pick()
    if (hit) live.onPick?.(hit.object.userData.id)
  }
  const onMove = (e) => {
    if (!live.onPick) return
    setNdc(e)
    dom.style.cursor = pick() ? 'pointer' : 'grab'
  }
  dom.addEventListener('pointerdown', onDown)
  dom.addEventListener('pointerup', onUp)
  dom.addEventListener('pointermove', onMove)

  // ── 카메라 이동 ──
  let flight = null, lastSel = undefined, lastReset = live.resetNonce, lastMe = null
  const goal = (cam, tgt) => { flight = { cam, tgt } }

  return {
    update(dt, t) {
      const arr = seaGeo.attributes.position.array
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] = Math.sin(seaBase[i] * 0.35 + t * 0.9) * 0.05 + Math.cos(seaBase[i + 2] * 0.45 + t * 1.2) * 0.04
      }
      seaGeo.attributes.position.needsUpdate = true

      oreums.visible = live.showOreum
      for (const s of spots) {
        const sel = s.m.id === live.selectedId
        s.g.visible = live.layers.includes(s.m.kind)
        s.orb.position.y = 2.5 + Math.sin(t * 1.8 + s.base.x) * 0.12
        s.orb.rotation.y += dt * 1.2
        s.ring.scale.setScalar(sel ? 1.8 + 0.25 * Math.sin(t * 3) : 1 + 0.12 * Math.sin(t * 2.4 + s.base.x))
        s.beam.material.opacity = sel ? 0.85 : 0.4
        s.label.visible = live.showLabels || sel
        s.label.scale.setScalar(sel ? 1.25 : 1)
      }

      // 내 위치: 섬 바깥이어도 장면 안에 머물도록 범위를 제한
      if (live.me) {
        const [mx, mz] = toXZ(live.me.lat, live.me.lng)
        const cx = THREE.MathUtils.clamp(mx, -20, 20), cz = THREE.MathUtils.clamp(mz, -11, 14)
        me.position.set(cx, Math.max(0.1, heightAt(cx, cz)) + 0.5, cz)
        me.visible = true
        mePulse.scale.setScalar(1 + 0.4 * Math.abs(Math.sin(t * 2.2)))
        if (lastMe !== live.me && live.follow) {   // 위치를 새로 찾으면 그쪽으로 이동
          goal(me.position.clone().add(new THREE.Vector3(7, 8, 11)), me.position.clone())
        }
        lastMe = live.me
      } else me.visible = false

      if (live.follow && lastSel !== live.selectedId) {
        lastSel = live.selectedId
        const s = spots.find((x) => x.m.id === live.selectedId)
        if (s) goal(s.base.clone().add(new THREE.Vector3(5.5, 5.5, 8.5)), s.base.clone().setY(s.base.y + 0.8))
      }
      if (lastReset !== live.resetNonce) {
        lastReset = live.resetNonce
        goal(HOME_CAM.clone(), HOME_TARGET.clone())
      }
      if (flight) {
        const k = 1 - Math.exp(-dt * 3.2)
        camera.position.lerp(flight.cam, k)
        controls.target.lerp(flight.tgt, k)
        if (camera.position.distanceTo(flight.cam) < 0.15) flight = null
      }
    },
    dispose() {
      dom.removeEventListener('pointerdown', onDown)
      dom.removeEventListener('pointerup', onUp)
      dom.removeEventListener('pointermove', onMove)
    },
  }
}

export { HOME_CAM, HOME_TARGET }
