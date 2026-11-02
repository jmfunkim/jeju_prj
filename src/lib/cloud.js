import { supabase } from './auth'

// 로그인한 계정의 수첩(담은 장소 + 방문 도장) 저장소.
// Supabase 가 있으면 notebooks 테이블(supabase/schema.sql), 없으면 이 브라우저의 localStorage(계정별).
const key = (uid) => `tamna-nb:${uid}`

export async function loadNotebook(user) {
  if (supabase) {
    const { data, error } = await supabase.from('notebooks').select('saved, stamps').eq('user_id', user.id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? { saved: data.saved ?? [], stamps: data.stamps ?? {} } : null
  }
  try { return JSON.parse(localStorage.getItem(key(user.id))) } catch { return null }
}

export async function saveNotebook(user, { saved, stamps }) {
  if (supabase) {
    const { error } = await supabase.from('notebooks').upsert({ user_id: user.id, saved, stamps, updated_at: new Date().toISOString() })
    if (error) throw new Error(error.message)
    return
  }
  localStorage.setItem(key(user.id), JSON.stringify({ saved, stamps }))
}
