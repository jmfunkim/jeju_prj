import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { KIND_KEYS } from '../data/places'

export const DRAFT_MAX = 10   // 직접 짜는 코스에 담을 수 있는 장소 수

// 여러 페이지가 함께 쓰는 상태. 수첩(saved)과 지도 설정, 작성 중인 코스(draft)는 localStorage 에 남습니다.
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

      // 내가 짜고 있는 코스 (장소 id 를 순서대로) — 이야기 산책의 '직접 짜기'와 지도의 '코스에 추가'가 함께 써요
      draft: [],
      addToDraft: (id) => {
        const d = get().draft
        if (d.includes(id) || d.length >= DRAFT_MAX) return false
        set({ draft: [...d, id] })
        return true
      },
      removeFromDraft: (id) => set({ draft: get().draft.filter((k) => k !== id) }),
      moveInDraft: (id, dir) => {
        const d = [...get().draft]
        const i = d.indexOf(id)
        const j = i + dir
        if (i < 0 || j < 0 || j >= d.length) return
        ;[d[i], d[j]] = [d[j], d[i]]
        set({ draft: d })
      },
      setDraft: (ids) => set({ draft: [...new Set(ids)].slice(0, DRAFT_MAX) }),
      clearDraft: () => set({ draft: [] }),

      // 방문 도장 { 장소id: { at: ISO 시각, verified: 현장(500m 이내) 확인 여부 } }
      stamps: {},
      stamp: (id, verified = false) => {
        if (get().stamps[id]) return
        set({ stamps: { ...get().stamps, [id]: { at: new Date().toISOString(), verified } } })
      },

      // 로그인 계정의 수첩과 합치기(합집합) / 로그아웃 때 이 기기에서 비우기
      mergeNotebook: (remote) => {
        if (!remote) return
        const stamps = { ...(remote.stamps ?? {}) }
        for (const [id, s] of Object.entries(get().stamps)) {
          if (!stamps[id] || (s.verified && !stamps[id].verified)) stamps[id] = s
        }
        const have = new Set((remote.courses ?? []).map((c) => c.id))
        const courses = [...(remote.courses ?? []), ...get().courses.filter((c) => !have.has(c.id))].slice(0, 20)
        set({ saved: [...new Set([...(remote.saved ?? []), ...get().saved])], stamps, courses })
      },
      clearNotebook: () => set({ saved: [], stamps: {}, courses: [], draft: [] }),

      // 저장한 산책 코스 { id, name, ids(장소 순서), mode, at } — 최대 20개
      courses: [],
      saveCourse: ({ name, ids, mode }) => {
        const id = `${mode}:${ids.join(',')}`
        const list = get().courses
        if (list.some((c) => c.id === id)) return
        set({ courses: [{ id, name, ids, mode, at: new Date().toISOString() }, ...list].slice(0, 20) })
      },
      removeCourse: (id) => set({ courses: get().courses.filter((c) => c.id !== id) }),
      renameCourse: (id, name) => set({ courses: get().courses.map((c) => (c.id === id ? { ...c, name: name.trim() || c.name } : c)) }),

      // 지도 보기 방식: 2D(찾기 쉬움) / 3D(둘러보기)
      mapMode: '2d',
      setMapMode: (mapMode) => set({ mapMode }),

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
            locError: err.code === 1 ? '위치 권한이 거부됐어요. "제주시청 기준으로 보기"를 눌러 보세요.' : '위치를 가져오지 못했어요.',
          }),
          { timeout: 8000 },
        )
      },
    }),
    {
      name: 'tamna-notebook-v2',
      partialize: (s) => ({ saved: s.saved, stamps: s.stamps, courses: s.courses, draft: s.draft, layers: s.layers, showOreum: s.showOreum, mapMode: s.mapMode }),
    },
  ),
)
