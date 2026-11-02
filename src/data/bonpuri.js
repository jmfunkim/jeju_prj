// 제주 본풀이(신들의 이야기) 중 널리 알려진 8편의 한 줄 소개.
// 자료 수·판본·태그는 제주도청 신화 콘텐츠 API 응답에서 이름(keys)으로 찾아 세므로, 소개 글만 직접 쓴 요약입니다.
// ※ 한 줄 소개는 대표 줄거리를 줄인 것이라 판본에 따라 다를 수 있어요. 발표·배포 전 검수가 필요합니다.
export const FEATURED = [
  { id: 'cheonjiwang', name: '천지왕본풀이', kind: '창세 신화', keys: ['천지왕'], img: '이미지:소별왕과두태양', icon: 'sun', blurb: '하늘의 천지왕이 내려와 낳은 대별왕·소별왕 형제가 이승과 저승을 나눠 다스리게 된 제주의 창세 신화예요.' },
  { id: 'segyeong', name: '세경본풀이', kind: '농경의 신', keys: ['세경'], img: '이미지:자청비1', icon: 'flower1', blurb: '자청비가 사랑과 모험 끝에 농사의 신 세경이 되기까지의 이야기예요.' },
  { id: 'samgong', name: '삼공본풀이', kind: '복의 신', keys: ['삼공'], img: '이미지:가문장아기', icon: 'gem', blurb: '막내딸 가믄장아기가 "나는 내 복으로 산다"며 집을 나와 스스로 복을 일군 이야기예요.' },
  { id: 'munjeon', name: '문전본풀이', kind: '집안의 신', keys: ['문전'], icon: 'door-open', blurb: '남선비와 여산부인, 일곱 아들의 이야기로 집을 지키는 문전신과 조왕신의 내력을 풀어요.' },
  { id: 'chasa', name: '차사본풀이', kind: '저승의 신', keys: ['차사'], icon: 'moon-stars', blurb: '저승차사 강림이 염라대왕을 잡아 오는 이야기예요.' },
  { id: 'chilseong', name: '칠성본풀이', kind: '재물의 신', keys: ['칠성'], icon: 'stars', blurb: '뱀의 모습으로 집안의 재물을 지키는 칠성신의 내력을 풀어요.' },
  { id: 'songdang', name: '송당 소천국과 백주할망', kind: '마을의 신', keys: ['소천국'], icon: 'houses', blurb: '송당리 본향당에 모신 신, 소천국과 백주할망 부부의 이야기예요.' },
  { id: 'wonchang', name: '원천강본풀이', kind: '운명의 신', keys: ['원천강', '원텬강'], icon: 'compass', blurb: '오늘이가 부모를 찾아 원천강으로 길을 떠나는 이야기예요.' },
]

// API 응답(items)에서 이야기 하나에 해당하는 자료를 찾습니다 — 제목이나 태그에 이름이 들어 있으면 같은 이야기로 봅니다.
export function matchFeatured(f, items) {
  return items.filter((i) => f.keys.some((k) => i.title.includes(k) || i.tags.some((t) => t.includes(k))))
}
