import { useState } from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import JejuMapView from '../components/JejuMapView'
import FlatMap from '../components/FlatMap'
import { LocateBar, NearbyTour, PlaceBody, SaveButton, distanceLabel, routeUrl } from '../components/ui'
import { KINDS, KIND_KEYS, PLACES, placeById } from '../data/places'
import { distanceKm } from '../lib/geo'
import { useAppStore } from '../store/useAppStore'

export default function MapPage() {
  const { selectedId, select, layers, setLayers, showOreum, toggleOreum, me, mapMode, setMapMode } = useAppStore()
  const is3d = mapMode === '3d'
  const [reset, setReset] = useState(0)
  const [labels, setLabels] = useState(false)
  const navigate = useNavigate()
  const place = placeById(selectedId) ?? PLACES[0]

  const visible = PLACES.filter((p) => layers.includes(p.kind))
  const list = me ? [...visible].sort((a, b) => distanceKm(me, a) - distanceKm(me, b)) : visible

  return (
    <div className="page">
      <header className="page-head">
        <p className="stamp">문화 지도</p>
        <h1>섬 위의 이야기 {PLACES.length}곳</h1>
        <p>동그라미는 신화·설화, 네모는 돌문화, 마름모는 역사문화예요. 찾을 때는 2D, 둘러볼 때는 3D로 바꿔 보세요.</p>
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
              <div className="d-flex flex-wrap gap-1">
                <div className="btn-group btn-group-sm" role="group" aria-label="지도 보기 방식">
                  <button className={`btn ${!is3d ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setMapMode('2d')}>2D</button>
                  <button className={`btn ${is3d ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setMapMode('3d')}>3D</button>
                </div>
                {is3d && <button className={`btn btn-sm ${showOreum ? 'btn-dark' : 'btn-outline-dark'}`} onClick={toggleOreum}>오름 368</button>}
                <button className={`btn btn-sm ${labels ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setLabels(!labels)}>이름표</button>
                {is3d && <button className="btn btn-sm btn-outline-dark" onClick={() => setReset(reset + 1)}>전체 보기</button>}
              </div>
            </div>
            {is3d ? (
              <div className="map-frame">
                <JejuMapView follow selectedId={selectedId} onPick={select} layers={layers} showOreum={showOreum}
                  showLabels={labels} resetNonce={reset} me={me} />
              </div>
            ) : (
              <FlatMap places={visible} selectedId={selectedId} onPick={select} me={me} labels={labels} />
            )}
            <LocateBar className="mt-2 px-1" />
          </div>
        </div>

        <div className="col-xl-4">
          <article className="stone-card detail" key={place.id}>
            <PlaceBody place={place} me={me} />
            <div className="d-flex flex-wrap gap-2">
              <SaveButton id={place.id} />
              <a className="btn btn-sm btn-dol" href={routeUrl(place)} target="_blank" rel="noreferrer"><i className="bi bi-signpost-2 me-1" />길찾기</a>
              {place.kind === 'myth' && <button className="btn btn-sm btn-outline-dark" onClick={() => navigate('/myth')}>신화·설화 모아 보기</button>}
              {place.kind === 'stone' && <button className="btn btn-sm btn-outline-dark" onClick={() => navigate('/stone')}>돌문화 3D 보기</button>}
            </div>
            <hr />
            <NearbyTour place={place} />
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
