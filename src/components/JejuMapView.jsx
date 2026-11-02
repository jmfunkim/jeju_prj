import { useRef } from 'react'
import ThreeStage from './ThreeStage'
import { buildJejuMap, HOME_CAM, HOME_TARGET } from '../scenes/jejuMap'
import { KIND_KEYS } from '../data/places'

// 제주 3D 지도 + React 값(선택·레이어·내 위치)을 live ref 로 연결
export default function JejuMapView({
  selectedId, onPick, layers = KIND_KEYS, showOreum = true, showLabels = false,
  follow = false, resetNonce = 0, me = null, autoRotate = false, camera, className,
}) {
  const live = useRef({})
  Object.assign(live.current, { selectedId, onPick, layers, showOreum, showLabels, follow, resetNonce, me })

  return (
    <ThreeStage
      className={className}
      camera={camera ?? { position: HOME_CAM.toArray(), fov: 46 }}
      controls={{ autoRotate, autoRotateSpeed: 0.4, minDistance: 4, maxDistance: 70, maxPolarAngle: Math.PI * 0.47 }}
      build={(ctx) => {
        ctx.controls.target.copy(HOME_TARGET)
        return buildJejuMap(ctx, live.current)
      }}
    />
  )
}
