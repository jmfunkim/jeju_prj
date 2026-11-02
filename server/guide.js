// AI 가이드 — 질문을 받아 도구(코스 짜기·날씨·주변 관광정보·장소 검색)를 부르며 답합니다.
// ANTHROPIC_API_KEY 가 있으면 Claude 가 도구를 골라 부르고, 없으면 규칙 기반 가이드가 같은 도구를 직접 부릅니다.
import { KIND_KEYS, PLACES, placeById } from '../src/data/places.js'
import { MODES, buildCourse, fmtMin } from '../src/lib/course.js'
import { getWeather } from './weather.js'
import { nearbyTour } from './tour.js'
import { listMyth } from './jejugo.js'

const API = 'https://api.anthropic.com/v1/messages'
const MODEL = () => process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5'

// ── 도구 구현 ───────────────────────────────────────────
function courseJson(c) {
  return {
    total_minutes: c.total,
    over_budget: c.over,
    stops: c.stops.map((s) => ({
      id: s.place.id, name: s.place.name, kind: s.place.kind, tag: s.place.tag,
      leg_minutes: s.leg, stay_minutes: s.stay, look: s.info.look, tip: s.info.tip, rain_ok: s.info.rain,
    })),
  }
}

async function runTool(name, input, ctx) {
  if (name === 'plan_course') {
    const kinds = (input.kinds ?? []).filter((k) => KIND_KEYS.includes(k))
    const course = buildCourse({
      start: ctx.start,
      minutes: Math.min(480, Math.max(30, Number(input.minutes) || 120)),
      mode: input.mode === 'walk' ? 'walk' : 'car',
      kinds: kinds.length ? kinds : KIND_KEYS,
      rainy: !!input.rainy,
      kids: !!input.kids,
    })
    ctx.ids = course.stops.map((s) => s.place.id)
    ctx.mode = input.mode === 'walk' ? 'walk' : 'car'
    return courseJson(course)
  }
  if (name === 'get_weather') {
    return (await getWeather({ place: input.place || '제주시' })).slice(0, 4)
  }
  if (name === 'nearby_tour') {
    const p = placeById(input.place_id)
    if (!p) return { error: '알 수 없는 place_id 예요. search_places 로 먼저 찾아 보세요.' }
    const list = await nearbyTour({ lat: p.lat, lng: p.lng, radius: 3000, rows: 8 })
    return list.slice(0, 6).map((t) => ({ title: t.title, addr: t.addr, dist_m: t.distM }))
  }
  if (name === 'search_places') {
    const q = String(input.keyword ?? '').trim()
    const hit = PLACES.filter((p) => [p.name, p.title, p.summary, p.tag, ...p.keywords].some((t) => t.includes(q)))
    return hit.slice(0, 8).map((p) => ({ id: p.id, name: p.name, kind: p.kind, tag: p.tag, summary: p.summary }))
  }
  if (name === 'search_myth_archive') {
    const r = await listMyth({ keyword: String(input.keyword ?? ''), limit: 8 })
    return { matched: r.matched, items: r.items.map((m) => ({ title: m.title, type: m.type, tags: m.tags })) }
  }
  return { error: `알 수 없는 도구: ${name}` }
}

const TOOLS = [
  {
    name: 'plan_course',
    description: '사용자의 출발 위치에서 시간 안에 돌 수 있는 이야기 산책 코스를 짭니다. 코스를 말하기 전에 반드시 이 도구를 먼저 부르세요.',
    input_schema: {
      type: 'object',
      properties: {
        minutes: { type: 'integer', description: '쓸 수 있는 전체 시간(분). 이동과 머무는 시간을 합친 값' },
        mode: { type: 'string', enum: ['car', 'walk'] },
        kinds: { type: 'array', items: { type: 'string', enum: KIND_KEYS }, description: 'myth=신화·설화, stone=돌문화, history=역사문화. 비우면 전체' },
        rainy: { type: 'boolean', description: '비가 오거나 실내 위주로 가야 할 때 true' },
        kids: { type: 'boolean', description: '아이와 함께일 때 true' },
      },
      required: ['minutes'],
    },
  },
  {
    name: 'get_weather',
    description: '기상청 단기예보로 제주의 지금 날씨를 봅니다. 비가 오는지 확인할 때 쓰세요.',
    input_schema: { type: 'object', properties: { place: { type: 'string', description: '예: 제주시, 서귀포시' } } },
  },
  {
    name: 'nearby_tour',
    description: '큐레이션 장소 주변 3km 의 관광지·음식점 등을 한국관광공사 TourAPI 로 찾습니다.',
    input_schema: { type: 'object', properties: { place_id: { type: 'string' } }, required: ['place_id'] },
  },
  {
    name: 'search_myth_archive',
    description: '제주도청 제주 신화 콘텐츠(본풀이·당신화 원문과 해제)에서 제목·태그로 자료를 찾습니다. 신화 자료를 더 읽고 싶다는 요청에 쓰세요.',
    input_schema: { type: 'object', properties: { keyword: { type: 'string' } }, required: ['keyword'] },
  },
  {
    name: 'search_places',
    description: '이름·태그·키워드로 큐레이션 장소를 찾습니다.',
    input_schema: { type: 'object', properties: { keyword: { type: 'string' } }, required: ['keyword'] },
  },
]

const SYSTEM = `당신은 "돌빛 제주길"의 제주 이야기 산책 가이드입니다.
- 코스·장소·시간·거리 같은 사실은 반드시 도구 결과에서만 가져오고, 도구에 없는 정보는 지어내지 마세요.
- 코스를 추천할 때는 plan_course 를 먼저 부르세요. 비·날씨가 언급되면 get_weather 도 확인하세요.
- 도구가 실패하면 실패했다고 솔직히 말하고, 확인한 범위에서만 답하세요.
- 답은 한국어로, 6~10문장 이내로 짧게. 각 장소는 이름, 이동·머무는 시간, 현장에서 볼 것을 한 줄씩.
- 예약·운영 시간은 방문 전에 확인하라고 덧붙이세요.`

// ── Claude 에이전트 루프 ────────────────────────────────
async function askClaude(question, ctx) {
  const messages = [{ role: 'user', content: `출발 위치: 위도 ${ctx.start.lat}, 경도 ${ctx.start.lng}${ctx.start.demo ? ' (제주시청 부근, 체험용)' : ''}\n질문: ${question}` }]
  const used = []
  for (let turn = 0; turn < 6; turn++) {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL(), max_tokens: 1024, system: SYSTEM, tools: TOOLS, messages }),
      signal: AbortSignal.timeout(30000),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data?.error?.message || `Claude API ${r.status}`)
    messages.push({ role: 'assistant', content: data.content })
    const calls = data.content.filter((b) => b.type === 'tool_use')
    if (data.stop_reason !== 'tool_use' || calls.length === 0) {
      const answer = data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
      return { mode: 'ai', answer, ids: ctx.ids, travel: ctx.mode, tools: used }
    }
    const results = []
    for (const c of calls) {
      used.push(c.name)
      let content
      let is_error = false
      try { content = JSON.stringify(await runTool(c.name, c.input ?? {}, ctx)) } catch (e) { content = `도구 오류: ${e.message}`; is_error = true }
      results.push({ type: 'tool_result', tool_use_id: c.id, content, is_error })
    }
    messages.push({ role: 'user', content: results })
  }
  throw new Error('도구 호출이 너무 길어져 멈췄어요.')
}

// ── 규칙 기반 가이드(키 없을 때) ────────────────────────
function parse(q) {
  const m = /(\d+)\s*(시간|분)/.exec(q)
  let minutes = 120
  if (m) minutes = m[2] === '시간' ? Number(m[1]) * 60 : Number(m[1])
  else if (/반나절/.test(q)) minutes = 240
  else if (/하루|종일/.test(q)) minutes = 360
  const kinds = []
  if (/신화|설화|전설|할망|선녀/.test(q)) kinds.push('myth')
  if (/돌|담|하르방|용암|동굴/.test(q)) kinds.push('stone')
  if (/역사|유적|유배|4·3|사삼|해녀/.test(q)) kinds.push('history')
  return {
    minutes: Math.min(480, Math.max(30, minutes)),
    mode: /걸어|도보|뚜벅/.test(q) ? 'walk' : 'car',
    kinds: kinds.length ? kinds : KIND_KEYS,
    rainy: /비|우천|궂은|눈/.test(q),
    kids: /아이|아기|가족|어린이/.test(q),
  }
}

async function askRules(question, ctx, note) {
  const opt = parse(question)
  const used = []
  const notes = []
  if (note) notes.push(note)
  if (!opt.rainy) {
    try {
      used.push('get_weather')
      const w = (await getWeather({ place: '제주시' }))[0]
      if (w && w.rain && w.rain !== '없음') { opt.rainy = true; notes.push(`지금 제주시는 ${w.rain} 예보라 실내·비 피하기 좋은 곳 위주로 골랐어요.`) }
    } catch { notes.push('날씨를 확인하지 못해 맑다고 가정했어요.') }
  }
  used.push('plan_course')
  const course = buildCourse({ start: ctx.start, ...opt })
  ctx.ids = course.stops.map((s) => s.place.id)
  const tags = [`${fmtMin(opt.minutes)}`, MODES[opt.mode].label, opt.rainy && '비 오는 날', opt.kids && '아이와 함께'].filter(Boolean).join(' · ')
  if (course.stops.length === 0) {
    return { mode: 'rules', answer: `조건(${tags})에 맞는 장소를 찾지 못했어요. 시간을 늘리거나 조건을 줄여 보세요.`, ids: [], travel: opt.mode, tools: used }
  }
  const lines = course.stops.map((s, i) => `${i + 1}. ${s.place.name} — 앞에서 ${fmtMin(s.leg)} 이동, ${fmtMin(s.stay)} 머물러요. ${s.info.look ? `볼 것: ${s.info.look}.` : ''}`)
  const head = `${tags} 조건으로 ${course.stops.length}곳을 골랐어요. 이동과 머묾을 합쳐 약 ${fmtMin(course.total)}예요.${course.over ? ' (시간 안에 한 곳도 다 못 봐서 가장 가까운 곳만 골랐어요.)' : ''}`
  return { mode: 'rules', answer: [head, ...lines, ...notes, '예약·운영 시간은 방문 전에 확인하세요.'].join('\n'), ids: ctx.ids, travel: opt.mode, tools: used }
}

export async function askGuide({ question, start }) {
  const q = String(question ?? '').trim().slice(0, 300)
  if (!q) throw new Error('질문을 입력해 주세요.')
  const ctx = { start, ids: [], mode: 'car' }
  if (process.env.ANTHROPIC_API_KEY) {
    try { return await askClaude(q, ctx) } catch (e) {
      return askRules(q, { ...ctx, ids: [] }, `AI 호출에 실패해 기본 가이드로 답했어요 (${e.message}).`)
    }
  }
  return askRules(q, ctx)
}

