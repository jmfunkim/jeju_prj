import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { KIND_KEYS } from '../data/places'

// 여러 페이지가 함께 쓰는 상태. 수첩(saved)과 지도 설정은 localStorage 에 남습니다.
export const useAppStore = create(
  persist(
    (set, get) => ({
      // 선택한 장소 + 지도 레이어
      selectedId: 'seolmundae',
      select: (selectedId) => set({ selectedId }),
      layers: KIND_KEYS,
      setLayers: (layers) => set({ layers }),
      showOreum: true,
      toggleOreum: () => set({ showOreum: !get().showOreum }),

      // 수첩 (장소 id 목록)
      saved: [],
      toggleSaved: (id) => {
        const saved = get().saved
        set({ saved: saved.includes(id) ? saved.filter((k) => k !== id) : [...saved, id] })
      },

      // 내 위치 — 저장하지 않음(매번 새로 확인)
      me: null,
      locating: false,
      locError: '',
      setMe: (me) => set({ me, locError: '' }),
      locate: () => {
        if (!navigator.geolocation) return set({ locError: '이 브라우저는 위치 기능을 지원하지 않아요.' })
        set({ locating: true, locError: '' })
        navigator.geolocation.getCurrentPosition(
          (pos) => set({ me: { lat: pos.coords.latitude, lng: pos.coords.longitude }, locating: false }),
          (err) => set({
            locating: false,
            locError: err.code === 1 ? '위치 권한이 거부됐어요. 체험용 위치를 써 보세요.' : '위치를 가져오지 못했어요.',
          }),
          { timeout: 8000 },
        )
      },
    }),
    {
      name: 'tamna-notebook-v2',
      partialize: (s) => ({ saved: s.saved, layers: s.layers, showOreum: s.showOreum }),
    },
  ),
)
