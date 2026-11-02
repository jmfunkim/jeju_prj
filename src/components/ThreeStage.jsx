import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// three.js 캔버스를 React 에 붙이는 공통 컴포넌트.
// build({ scene, camera, renderer, controls, dom }) 가 { update(dt, t), dispose() } 를 돌려주면
// 렌더 루프·리사이즈·정리(dispose)는 여기서 처리합니다.
export default function ThreeStage({ build, camera: camOpts = {}, controls: ctrlOpts = {}, className = '', style }) {
  const hostRef = useRef(null)
  const buildRef = useRef(build)
  buildRef.current = build

  useEffect(() => {
    const host = hostRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(camOpts.fov ?? 50, 1, 0.1, 2000)
    camera.position.set(...(camOpts.position ?? [0, 40, 90]))

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    Object.assign(controls, ctrlOpts)

    const api = buildRef.current({ scene, camera, renderer, controls, dom: renderer.domElement }) ?? {}

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host
      if (!w || !h) return
      renderer.setSize(w, h, false)   // 크기는 CSS(.stage canvas)가 정하게 둔다
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    const clock = new THREE.Clock()
    let raf
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(clock.getDelta(), 0.25)
      controls.update()
      api.update?.(dt, clock.elapsedTime)
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      api.dispose?.()
      controls.dispose()
      scene.traverse((o) => {
        o.geometry?.dispose()
        const m = o.material
        if (m) (Array.isArray(m) ? m : [m]).forEach((x) => { x.map?.dispose(); x.dispose() })
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={hostRef} className={`stage ${className}`} style={style} />
}
