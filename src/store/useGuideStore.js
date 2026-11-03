import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { askGuide } from '../api/client'

// AI 가이드 대화. 페이지(useState)가 아니라 전역 저장소에 두어서, 다른 메뉴에 다녀와도 대화가 남아요.
//  · log   — 대화 내용. 새로고침해도 남도록 localStorage 에 저장하고, 오래된 것부터 버립니다.
//  · busy  — 답을 기다리는 중. 저장하지 않아요 (새로고침하면 대기가 끝난 것이므로).
//  · draft — 쓰다 만 질문. 메뉴를 옮겨도 남지만 저장하지는 않아요.
// 질문을 보내는 일(ask)도 여기서 하므로, 답을 기다리는 동안 다른 메뉴로 가도 답이 대화에 들어와요.
const MAX = 40

export const useGuideStore = create(
  persist(
    (set, get) => ({
      log: [],
      busy: false,
      draft: '',
      setDraft: (draft) => set({ draft }),
      clear: () => set({ log: [], draft: '' }),
      ask: async (question, me) => {
        const text = String(question ?? '').trim()
        if (!text || get().busy) return
        const push = (m) => set((s) => ({ log: [...s.log, m].slice(-MAX) }))
        set({ busy: true })
        push({ role: 'user', text })
        try {
          push({ role: 'guide', ...(await askGuide(text, me)) })
        } catch (e) {
          push({ role: 'error', text: e.message })
        } finally {
          set({ busy: false })
        }
      },
    }),
    { name: 'dolbit-guide-chat-v1', partialize: (s) => ({ log: s.log }) },
  ),
)
