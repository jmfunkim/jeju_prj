// 산책 코스를 링크로 만들고 공유합니다. 코스는 주소(?ids=…&mode=…)만으로 열려서, 받은 사람은 자기 위치에서 같은 순서의 코스를 봅니다.
export const courseUrl = (ids, mode = 'car') => `${window.location.origin}/walk?ids=${ids.join(',')}&mode=${mode}`

// 공유 시트(휴대폰) → 클립보드 복사 → 직접 복사 창 순으로 시도합니다. 결과: shared | copied | manual | cancel
export async function shareCourse({ title, text, url }) {
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return 'shared' } catch (e) { if (e?.name === 'AbortError') return 'cancel' }
  }
  try { await navigator.clipboard.writeText(`${text}\n${url}`); return 'copied' } catch { /* 아래에서 직접 복사 */ }
  window.prompt('링크를 복사해서 보내 주세요', url)
  return 'manual'
}

// 코스 이름 만들기: 첫 곳 → 마지막 곳 · N곳
export const courseName = (places) => (places.length > 1 ? `${places[0].name} → ${places[places.length - 1].name} · ${places.length}곳` : places[0]?.name ?? '내 코스')
