// 장소 id → 제주신화정보(제주도청)의 사진·삽화를 찾는 이름.
//  main: 대표 이미지로 쓸 자료 — '형식:제목' 이 똑같은 것 중 앞에 있는 것부터
//  keys: 관련 자료를 모아 보여 줄 때 제목에 들어 있어야 할 말
// 형식은 사진 · 이미지(삽화) · 애니메이션 · 동영상입니다. 안 맞는 사진이 붙으면 여기를 고치세요.
export const PLACE_MEDIA = {
  seolmundae: { main: ['이미지:설문대할망 전설', '사진:한라산전설'], keys: ['설문대', '한라산전설', '백록'] },
  obaek: { main: ['이미지:설문대할망과 오백장군 전설', '사진:영실기암전설'], keys: ['오백장군', '영실기암'] },
  sanbang: { main: ['사진:산방산전설', '사진:산방굴사전설'], keys: ['산방', '용머리'] },
  samsung: { main: ['사진:삼성혈전설', '이미지:삼성혈'], keys: ['삼성혈', '혼인지'] },
  yeongdeung: { main: ['사진:영등대왕전설'], keys: [] },   // 영등 삽화는 괴물 그림이라 쓰지 않아요(전설의 사진과 그림 갤러리에서는 볼 수 있어요)
  yongduam: { main: ['사진:용두암 전설', '사진:용두암'], keys: ['용두암'] },
  cheonjeyeon: { main: ['사진:천제연폭포전설'], keys: ['천제연'] },
  manjanggul: { main: ['사진:만장굴'], keys: ['만장굴'] },
  'gwandeok-harbang': { main: ['사진:관덕정전설'], keys: ['관덕정'] },
  hangpaduri: { main: ['사진:항파두리전설'], keys: ['항파두리'] },

  // 제주신화정보에 그 장소의 사진이 없으면 이 목록에 넣지 않습니다. 비슷한 곳의 사진으로 때우지 않고, 그 장소를 그린 일러스트(MythArt)를 씁니다.
}

export const mediaKey = (m) => `${m.form}:${m.title}`

// 장소의 대표 이미지(없으면 null)
export function mainMedia(id, items) {
  const cfg = PLACE_MEDIA[id]
  if (!cfg) return null
  for (const k of cfg.main) {
    const hit = items.find((m) => mediaKey(m) === k)
    if (hit) return hit
  }
  return null
}

// 같은 장소의 '사진'(형식이 사진인 자료). 대표 이미지가 삽화여도 지도·이야기 산책처럼 실제 모습을 보여 줄 곳에서는 이것을 먼저 써요.
// 대표 후보(main) 중 사진 → 관련 자료 중 사진 순으로 찾고, 없으면 null 입니다.
export function photoMedia(id, items) {
  const cfg = PLACE_MEDIA[id]
  if (!cfg) return null
  for (const k of cfg.main) {
    if (!k.startsWith('사진:')) continue
    const hit = items.find((m) => mediaKey(m) === k)
    if (hit) return hit
  }
  return relatedMedia(id, items).find((m) => m.form === '사진') ?? null
}

// 장소와 관련된 사진·삽화·장면 (대표 이미지는 빼고)
export function relatedMedia(id, items) {
  const cfg = PLACE_MEDIA[id]
  if (!cfg) return []
  const main = mainMedia(id, items)
  return items.filter((m) => m !== main && cfg.keys.some((k) => m.title.includes(k)))
}
