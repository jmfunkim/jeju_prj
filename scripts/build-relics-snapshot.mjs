// 제주돌문화공원 소장 유물(제주도청 API) 전체를 server/data/relics.js 으로 저장합니다.
//   node scripts/build-relics-snapshot.mjs
// 배포 서버에서 도청 API 를 읽지 못할 때 server/jejugo.js 가 이 저장본으로 대신 답해요.
import fs from 'node:fs/promises'

const URL_ = 'https://www.jeju.go.kr/api/jejustonepark/have/'
const OUT = new URL('../server/data/relics.js', import.meta.url)

const page = async (p) => (await fetch(`${URL_}?page=${p}`, { signal: AbortSignal.timeout(20000) })).json()

const first = await page(1)
const pages = Math.ceil(first.total / (first.pageSize || 9))
const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => page(i + 2)))
const items = [first, ...rest].flatMap((p) => p.items).map((i) => ({
  name: i.name, age: i.historicAge, material: i.material, source: i.source, desc: i.desc,
}))

await fs.mkdir(new URL('./', OUT), { recursive: true })
const header = '// scripts/build-relics-snapshot.mjs 로 만든 저장본 — 도청 API 를 못 읽을 때만 씁니다\n'
await fs.writeFile(OUT, `${header}export default ${JSON.stringify(items, null, 1)}\n`)
console.log(`${items.length}/${first.total}점 저장 → server/data/relics.js`)
