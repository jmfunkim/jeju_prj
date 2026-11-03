// 공공데이터포털 인증키. 일반 인증키에는 Decoding 값과 Encoding 값이 있는데, 이 앱은 요청을 보낼 때 키를 알아서 주소용으로 바꿉니다.
// 그래서 Encoding 값(%2B, %3D 같은 % 표기가 들어 있는 값)을 넣어도 한 번 풀어서 쓰도록 맞춰 두었어요(두 번 바뀌면 "등록되지 않은 인증키"가 됩니다).
export function dataKey() {
  const raw = String(process.env.DATA_GO_KR_KEY ?? '').trim()
  if (!raw) return ''
  try { return /%[0-9a-f]{2}/i.test(raw) ? decodeURIComponent(raw) : raw } catch { return raw }
}
