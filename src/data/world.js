// 돌빛 세계관과 안내 캐릭터 '돌이'의 설정·대사.
// ※ 이 세계관은 서비스가 만든 창작 이야기입니다. 제주의 전승이나 사실이 아니며, 실제 신화·역사는 장소별 이야기 전문을 따르세요.
import { KIND_KEYS, PLACES, placesOf } from './places.js'

export const WORLD = {
  title: '돌은 이야기를 기억해요',
  lines: [
    '제주는 돌이 이야기를 기억하는 섬이에요. 설문대할망이 흙과 돌을 나르던 때부터, 돌마다 이야기가 스며들었대요.',
    '현무암에 뚫린 작은 구멍들은 이야기가 숨 쉬던 자리예요. 사람이 그곳에 가서 이야기를 들으면, 구멍에서 따뜻한 빛 — 돌빛이 새어 나와요.',
    `돌빛은 모두 ${PLACES.length}곳에 숨어 있어요. 장소에 가서 도장을 찍으면 그곳의 돌빛이 켜지고, 모두 켜면 섬이 환하게 빛난대요.`,
  ],
  note: '돌빛 세계관은 서비스가 만든 창작 이야기이며, 제주의 전승이 아닙니다.',
}

export const DOLI = {
  name: '돌이',
  who: '벙거지를 쓴 아기 돌하르방',
  intro: '섬의 돌빛이 모두 꺼진 줄 알고 잠들었다가, 길 위의 발소리에 깨어났어요. 이야기를 들려주고 돌빛을 깨우는 길을 안내해요.',
  likes: ['감귤', '바람 소리', '구멍 사이로 새는 빛'],
  voice: '짧고 다정한 해요체. 제주 인사말을 가끔만 써요(혼저 옵서예, 폭삭 속았수다).',
}

// 한마디 인사
export const DOLI_HELLO = '혼저 옵서예! 오늘은 어느 돌빛을 깨워 볼까요?'

// 장소에서 돌이가 건네는 말 — 갈래 기본값과 장소별 말
const KIND_SAYS = {
  myth: '이 돌에는 오래된 이야기가 스며 있대요. 천천히 읽어 볼까요?',
  stone: '손으로 만지기보다 눈으로 살펴봐요. 구멍 숭숭 뚫린 곳마다 돌빛이 새어 나올지도 몰라요.',
  history: '이곳의 이야기는 차분히 들어 봐요. 돌이는 옆에서 조용히 기다릴게요.',
}
const PLACE_SAYS = {
  seolmundae: '할망이 쌓은 산이에요! 오름 368개가 여기서 시작됐대요.',
  sanbang: '한라산 봉우리가 날아왔다는 이야기, 믿어지세요?',
  seongsan: '바다 위에 솟은 돌이에요. 해가 뜰 때 돌빛이 가장 환하대요.',
  yongduam: '파도 소리가 용의 울음처럼 들리는지 귀 기울여 봐요.',
  manjanggul: '용암이 지나간 길이에요. 안은 서늘하니 겉옷 챙겼죠?',
  balddam: '돌담 구멍으로 바람이 지나가요. 돌이랑 닮았죠?',
  haenyeo: '숨 참고 바다로 들어간 분들의 이야기예요. 폭삭 속았수다!',
  stonepark: '돌이 친구들이 모여 있는 곳이에요. 설문대할망 이야기도 만나 봐요.',
  peacepark: '이곳은 아픈 기억을 품은 곳이에요. 천천히, 조용히 둘러봐요.',
  'bukchon-bangsatap': '마을의 기억이 남은 곳이에요. 조용히 둘러봐요.',
  hangpaduri: '들판에 남은 성터예요. 돌 하나하나가 오래 견뎠어요.',
  alddreu: '들판 위의 콘크리트 돌이에요. 아픈 시간을 말없이 기억하고 있어요.',
}
export const doliSays = (place) => PLACE_SAYS[place.id] ?? KIND_SAYS[place.kind]

// 도장을 찍었을 때
export const doliStamped = (place) =>
  place.kind === 'history'
    ? `${place.name}의 이야기를 마음에 담았어요. 돌빛이 켜졌어요.`
    : `폭삭 속았수다! ${place.name}의 돌빛이 켜졌어요.`

// 모은 도장 수에 따른 돌빛 단계
export const STAGES = [
  { from: 0, name: '잠든 돌', mood: 'sleep', glow: 0.1, say: '쿨쿨… 첫 도장을 찍어 주면 눈을 뜰 것 같아요.' },
  { from: 1, name: '깨어나는 돌', mood: 'hi', glow: 0.35, say: '앗, 돌빛이 깜빡였어요! 다음 이야기도 들려줘요.' },
  { from: 6, name: '반짝이는 돌', mood: 'happy', glow: 0.55, say: '구멍마다 빛이 새어 나와요. 같이 걸어서 좋아요!' },
  { from: 12, name: '빛나는 돌', mood: 'happy', glow: 0.8, say: '섬의 반이 환해졌어요. 정말 멀리까지 왔네요.' },
  { from: 18, name: '돌빛 지킴이', mood: 'happy', glow: 0.95, say: '이제 돌빛 지킴이예요! 조금만 더 가면 섬이 환하게 빛나요.' },
  { from: PLACES.length, name: '돌빛 완성', mood: 'happy', glow: 1, say: '모든 돌빛이 켜졌어요. 폭삭 속았수다, 정말로요!' },
]
export function stageOf(count) {
  let i = 0
  STAGES.forEach((s, k) => { if (count >= s.from) i = k })
  const cur = STAGES[i]
  const next = STAGES[i + 1] ?? null
  return { ...cur, index: i, next, toNext: next ? next.from - count : 0 }
}

// 갈래를 모두 모았을 때 받는 뱃지
export const KIND_BADGES = {
  myth: { name: '별빛 이야기꾼', icon: 'stars' },
  stone: { name: '돌담 지킴이', icon: 'bricks' },
  history: { name: '기억 지킴이', icon: 'bank2' },
}
export function earnedBadges(stamps) {
  return KIND_KEYS.map((k) => {
    const list = placesOf(k)
    const have = list.filter((p) => stamps[p.id]).length
    return { kind: k, ...KIND_BADGES[k], have, total: list.length, earned: have === list.length }
  })
}
