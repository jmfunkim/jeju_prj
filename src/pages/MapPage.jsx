import { useState } from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import JejuMapView from '../components/JejuMapView'
import { LocateBar, PlaceBody, SaveButton, distanceLabel } from '../components/ui'
import { KINDS, KIND_KEYS, PLACES, placeById } from '../data/places'
import { distanceKm } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'

export default function MapPage() {
  const { selectedId, select, layers, setLayers, showOreum, toggleOreum, me } = useAppStore()
  const [reset, setReset] = useState(0)
  const [labels, setLabels] = useState(false)
  const navigate = useNavigate()
  const place = placeById(selectedId) ?? PLACES[0]

  const visible = PLACES.filter((p) => layers.includes(p.kind))
  const list = me ? [...visible].sort((a, b) => distanceKm(me, a) - distanceKm(me, b)) : visible

  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">3D 문화 지도</p>
        <h1>섬 위의 이야기 {PLACES.length}곳</h1>
        <p>구슬은 신화·설화, 돌은 돌문화, 마름모는 역사문화예요. 표지를 누르면 카메라가 날아가 이야기가 열립니다.</p>
      </header>

      <div className="row g-3">
        <div className="col-xl-8">
          <div className="stone-card p-2">
            <div className="d-flex flex-wrap gap-2 justify-content-between mb-2">
              <ToggleButtonGroup type="checkbox" value={layers} onChange={setLayers} size="sm">
                {KIND_KEYS.map((k) => (
                  <ToggleButton key={k} id={`layer-${k}`} value={k} variant="outline-dark" className="layer-btn" style={{ '--k': KINDS[k].color }}>
                    <i className={`bi bi-${KINDS[k].icon} me-1`} />{KINDS[k].label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <div className="d-flex gap-1">
                <button className={`btn btn-sm ${showOreum ? 'btn-dark' : 'btn-outline-dark'}`} onClick={toggleOreum}>오름 368</button>
                <button className={`btn btn-sm ${labels ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setLabels(!labels)}>이름표</button>
                <button className="btn btn-sm btn-outline-dark" onClick={() => setReset(reset + 1)}>전체 보기</button>
              </div>
            </div>
            <div className="map-frame">
              <JejuMapView follow selectedId={selectedId} onPick={select} layers={layers} showOreum={showOreum}
                showLabels={labels} resetNonce={reset} me={me} />
            </div>
            <LocateBar className="mt-2 px-1" />
          </div>
        </div>

        <div className="col-xl-4">
          <article className="stone-card detail" key={place.id}>
            <PlaceBody place={place} me={me} />
            <div className="d-flex flex-wrap gap-2">
              <SaveButton id={place.id} />
              {place.kind === 'myth' && <button className="btn btn-sm btn-outline-dark" onClick={() => navigate('/myth')}>신화·설화 모아 보기</button>}
              {place.kind === 'stone' && <button className="btn btn-sm btn-outline-dark" onClick={() => navigate('/stone')}>돌문화 3D 보기</button>}
            </div>
          </article>
        </div>
      </div>

      <div className="place-chips">
        {list.map((p) => (
          <button key={p.id} className={`chip ${p.id === selectedId ? 'on' : ''}`} style={{ '--k': KINDS[p.kind].color }} onClick={() => select(p.id)}>
            <i />{p.name}{me && <small>{distanceLabel(me, p)}</small>}
          </button>
        ))}
      </div>
    </div>
  )
}
