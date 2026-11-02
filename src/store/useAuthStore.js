import { create } from 'zustand'
import * as auth from '../lib/auth'

// 로그인 상태 — 비밀번호는 여기에 절대 두지 않습니다.
export const useAuthStore = create((set) => ({
  user: null,
  ready: false,
  init: async () => set({ user: await auth.restore((user) => set({ user })), ready: true }),
  signUp: async (form) => { const user = await auth.signUp(form); set({ user }); return user },
  signIn: async (form) => { const user = await auth.signIn(form); set({ user }); return user },
  signOut: async () => { await auth.signOut(); set({ user: null }) },
}))
