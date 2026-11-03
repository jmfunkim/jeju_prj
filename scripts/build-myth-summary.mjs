// 제주 신화 콘텐츠 '해제' 자료의 첫 페이지 '1 개요' 를 뽑아 src/data/mythSummary.json 으로 저장합니다.
//   node scripts/build-myth-summary.mjs
// 제주도청 문서뷰어가 쓰는 변환본(/files/convert2020/201708/<파일>.files/<파일>_1.xml)은 글자마다 좌표가 있어서,
// 같은 줄의 글자를 모아 줄을 다시 만든 뒤 '1 개요' ~ '2 내용' 사이를 줄거리로 씁니다.
// (원문은 채록한 제주어라 쓰지 않고, 같은 이름의 해제 개요를 카드에서 빌려 써요.)
import fs from 'node:fs/promises'
import { XMLParser } from 'fast-xml-parser'

const LIST = 'https://www.jeju.go.kr/rest/JejuMythContents/getJejuMythContentsList?pageSize=500'
const FILES = 'https://www.jeju.go.kr/files/convert2020/201708'
const OUT = new URL('../src/data/mythSummary.json', import.meta.url)

// 카드(src/components/Bonpuri.jsx)와 같은 이름 규칙: 공백·괄호·끝 숫자를 지우고 '본푸리'는 '본풀이'로
export const keyOf = (t) => String(t).replace(/[\s()*]/g, '').replace(/\d+$/, '').replace(/본푸리/g, '본풀이')

async function lines(id) {
  const x = await (await fetch(`${FILES}/${id}.files/${id}_1.xml`)).text()
  const ch = [...x.matchAll(/<text l='([\d.]+)' t='([\d.]+)' w='([\d.]+)' h='([\d.]+)' ?>([^<]*)<\/text>/g)]
    .map((m) => ({ l: +m[1], t: +m[2], w: +m[3], h: +m[4], c: m[5].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') }))
    .filter((c) => c.c.trim() && (c.h > 5 || /[.,?!]/.test(c.c)))   // 마침표·쉼표는 글자가 작아서 따로 살려요
  const mid = (c) => (/[.,?!]/.test(c.c) && c.h <= 5 ? c.t - 6 : c.t + c.h / 2)
  ch.sort((a, b) => mid(a) - mid(b) || a.l - b.l)
  const rows = []
  for (const c of ch) {
    const last = rows[rows.length - 1]
    if (last && Math.abs(last.mid - mid(c)) < 9) last.cs.push(c)
    else rows.push({ mid: mid(c), cs: [c] })
  }
  return rows.map((r) => {
    r.cs.sort((a, b) => a.l - b.l)
    let s = ''
    let right = null
    for (const c of r.cs) {
      // 앞 글자 오른쪽 끝과의 틈이 글자 높이의 절반쯤 넘으면 띄어쓰기
      if (right !== null && c.l - right > Math.max(c.h, 10) * 0.5 && !/[.,?!]/.test(c.c)) s += ' '
      s += c.c
      right = Math.max(right ?? 0, c.l + c.w)
    }
    return s.trim()
  }).filter(Boolean)
}

const tidy = (s) => s.replace(/\s+/g, ' ').replace(/(으|므) (로|므)/g, '$1$2').replace(/ ([.,?!])/g, '$1').trim()

if (process.env.DEBUG_ID) { console.log((await lines(process.env.DEBUG_ID)).slice(0, 8).join('\n')); process.exit(0) }

const xml = await (await fetch(LIST)).text()
const raw = new XMLParser({ parseTagValue: false }).parse(xml).jejunetApi.items.item
const items = (Array.isArray(raw) ? raw : [raw]).filter((i) => i.type === '해제')

const result = []
let n = 0
await Promise.all(Array.from({ length: 6 }, async () => {
  while (n < items.length) {
    const i = items[n++]
    const id = /([0-9a-f-]{36}\.pdf)$/i.exec(i.pdfUrl ?? '')?.[1]
    if (!id) continue
    try {
      const text = (await lines(id)).join('\n')
      const m = /1\s*개요\n([\s\S]*?)\n\s*2\s*내용/.exec(text)
      if (m) result.push({ key: keyOf(i.title), code: i.codeNo, title: String(i.title).trim(), summary: tidy(m[1]) })
    } catch (e) { console.warn('실패', i.title, e.message) }
  }
}))

result.sort((a, b) => a.code.localeCompare(b.code))
await fs.writeFile(OUT, JSON.stringify(result, null, 1) + '\n')
console.log(`${result.length}/${items.length}건 저장 → src/data/mythSummary.json`)
