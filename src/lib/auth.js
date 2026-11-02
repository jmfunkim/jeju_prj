import { createClient } from '@supabase/supabase-js'

// Supabase 키가 있으면 진짜 회원 시스템, 없으면 브라우저 안에서만 도는 체험 모드로 동작합니다.
const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && anon ? createClient(url, anon) : null
export const AUTH_MODE = supabase ? 'supabase' : 'local'

const USERS = 'tamna-users'
const SESSION = 'tamna-session'
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* 저장 불가 환경 */ } }

async function hash(text, salt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${text}`))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
const toUser = (u) => ({ id: u.id, email: u.email, name: u.user_metadata?.name || u.name || u.email.split('@')[0] })
const fail = (message) => { throw new Error(message) }

export function validate({ email, password, name }, signup) {
  if (!/^\S+@\S+\.\S+$/.test(email)) fail('이메일 형식을 확인해 주세요.')
  if (signup && !name.trim()) fail('이름(별명)을 입력해 주세요.')
  if (password.length < 6) fail('비밀번호는 6자 이상이어야 해요.')
}

export async function signUp(form) {
  validate(form, true)
  const email = form.email.trim().toLowerCase()
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({ email, password: form.password, options: { data: { name: form.name.trim() } } })
    if (error) fail(error.message)
    // 이메일 확인이 켜져 있으면 세션이 아직 없습니다.
    return data.session ? toUser(data.user) : null
  }
  const users = read(USERS, {})
  if (users[email]) fail('이미 가입된 이메일이에요.')
  const salt = crypto.randomUUID()
  const user = { id: crypto.randomUUID(), email, name: form.name.trim() }
  users[email] = { ...user, salt, hash: await hash(form.password, salt) }
  write(USERS, users)
  write(SESSION, user)
  return user
}

export async function signIn({ email, password }) {
  validate({ email, password }, false)
  const mail = email.trim().toLowerCase()
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: mail, password })
    if (error) fail('이메일 또는 비밀번호가 맞지 않아요.')
    return toUser(data.user)
  }
  const rec = read(USERS, {})[mail]
  if (!rec || (await hash(password, rec.salt)) !== rec.hash) fail('이메일 또는 비밀번호가 맞지 않아요.')
  const user = { id: rec.id, email: rec.email, name: rec.name }
  write(SESSION, user)
  return user
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut()
  try { localStorage.removeItem(SESSION) } catch { /* 무시 */ }
}

// 새로고침 후 로그인 유지, 그리고 다른 곳에서 로그아웃 되면 알려 줍니다.
export async function restore(onChange) {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    supabase.auth.onAuthStateChange((_e, s) => onChange(s?.user ? toUser(s.user) : null))
    return data.session?.user ? toUser(data.session.user) : null
  }
  return read(SESSION, null)
}
