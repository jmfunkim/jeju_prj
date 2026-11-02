import { useEffect } from 'react'
import { loadNotebook, saveNotebook } from './cloud'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'

// 로그인하면 계정의 수첩을 불러와 합치고, 이후 바뀔 때마다 저장합니다.
// 불러오기에 실패하면 저장도 하지 않아요(빈 값으로 덮어쓰는 사고 방지).
export function useNotebookSync() {
  const user = useAuthStore((s) => s.user)
  useEffect(() => {
    if (!user) return undefined
    let alive = true
    let ready = false
    let timer
    const setSync = (sync) => alive && useAuthStore.setState({ sync })
    const push = () => {
      if (!useAuthStore.getState().user) return
      const { saved, stamps, courses } = useAppStore.getState()
      setSync('syncing')
      saveNotebook(user, { saved, stamps, courses }).then(() => setSync('ok')).catch(() => setSync('error'))
    }

    setSync('syncing')
    loadNotebook(user)
      .then((remote) => {
        if (!alive) return
        useAppStore.getState().mergeNotebook(remote)
        ready = true
        push()
      })
      .catch(() => setSync('error'))

    const unsub = useAppStore.subscribe((s, prev) => {
      // 로그아웃 때 이 기기 수첩을 비우는 변경이 계정 저장소를 덮어쓰지 않도록 user 를 확인합니다.
      if (!ready || !useAuthStore.getState().user || (s.saved === prev.saved && s.stamps === prev.stamps && s.courses === prev.courses)) return
      clearTimeout(timer)
      timer = setTimeout(push, 600)
    })
    return () => { alive = false; clearTimeout(timer); unsub() }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps
}
