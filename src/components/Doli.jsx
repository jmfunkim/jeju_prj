import { useId } from 'react'

// 돌이 — 돌빛 제주길의 안내 캐릭터. 벙거지를 쓴 아기 돌하르방이고, 몸의 구멍(현무암 기공)에서 '돌빛'이 새어 나옵니다.
// mood: hi(인사) | happy(기쁨) | think(고민) | sleep(잠든 돌), glow: 0~1 돌빛 세기, orange: 감귤을 들고 있는지
export default function Doli({ size = 120, mood = 'hi', glow = 0.7, orange = true, className = '', title = '돌이' }) {
  const id = useId().replace(/:/g, '')
  const g = Math.max(0, Math.min(1, glow))
  const sleepy = mood === 'sleep'
  const mouth = {
    hi: 'M88 103 Q100 111 112 103',
    happy: 'M84 100 Q100 118 116 100',
    think: 'M92 105 L108 105',
    sleep: 'M94 105 Q100 108 106 105',
  }[mood] ?? 'M88 103 Q100 111 112 103'
  const look = mood === 'think' ? 3 : 0
  const holes = [[84, 138, 6], [112, 128, 5], [98, 160, 7], [126, 156, 5], [76, 168, 4], [114, 178, 4], [140, 140, 3.5]]

  return (
    <svg className={className} width={size} height={size * 1.1} viewBox="0 0 200 220" role="img" aria-label={title}>
      <defs>
        <radialGradient id={`aura${id}`} cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#ffd58a" stopOpacity={0.55 * g} />
          <stop offset="0.6" stopColor="#7fd7e3" stopOpacity={0.25 * g} />
          <stop offset="1" stopColor="#7fd7e3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`stone${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b9ba3" />
          <stop offset="1" stopColor="#4f6068" />
        </linearGradient>
        <radialGradient id={`hole${id}`}>
          <stop offset="0" stopColor="#fff3cf" stopOpacity={0.4 + 0.6 * g} />
          <stop offset="1" stopColor="#ffb347" stopOpacity={0.2 + 0.8 * g} />
        </radialGradient>
      </defs>

      <circle cx="100" cy="115" r="98" fill={`url(#aura${id})`} />
      <ellipse cx="100" cy="207" rx="62" ry="9" fill="#13222d" opacity="0.14" />

      {/* 몸 */}
      <path d="M58 122 Q58 86 100 86 Q142 86 142 122 L152 196 Q100 212 48 196 Z" fill={`url(#stone${id})`} />
      {holes.map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.85} fill="#26343a" />
          <ellipse cx={x} cy={y} rx={r * 0.55} ry={r * 0.45} fill={`url(#hole${id})`} />
        </g>
      ))}
      {/* 팔 */}
      <ellipse cx="56" cy="150" rx="11" ry="20" fill={`url(#stone${id})`} transform="rotate(8 56 150)" />
      <ellipse cx="144" cy="150" rx="11" ry="20" fill={`url(#stone${id})`} transform="rotate(-8 144 150)" />
      {orange && (
        <g>
          <circle cx="146" cy="136" r="12" fill="#ff8a1f" />
          <path d="M146 124 q5 -7 10 -3 q-5 6 -10 3 z" fill="#3f8f3a" />
        </g>
      )}

      {/* 머리 */}
      <circle cx="100" cy="72" r="46" fill={`url(#stone${id})`} />
      {/* 벙거지 */}
      <ellipse cx="100" cy="40" rx="64" ry="11" fill="#566972" />
      <path d="M68 40 Q70 8 100 8 Q130 8 132 40 Z" fill="#6a7d86" />
      <path d="M72 38 Q100 46 128 38" stroke="#3d4d54" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* 눈 */}
      {sleepy ? (
        <g stroke="#13222d" strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path d="M72 74 Q82 80 92 74" />
          <path d="M108 74 Q118 80 128 74" />
        </g>
      ) : (
        <g>
          <circle cx="82" cy="72" r="12.5" fill="#f4f8fa" />
          <circle cx="118" cy="72" r="12.5" fill="#f4f8fa" />
          <circle cx={83 + look} cy="73" r="6.5" fill="#13222d" />
          <circle cx={119 + look} cy="73" r="6.5" fill="#13222d" />
          <circle cx={85 + look} cy="70.5" r="2.2" fill="#fff" />
          <circle cx={121 + look} cy="70.5" r="2.2" fill="#fff" />
        </g>
      )}
      {/* 코 · 입 · 볼 */}
      <ellipse cx="100" cy="88" rx="9" ry="7.5" fill="#7a8b93" />
      <path d={mouth} stroke="#13222d" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      {(mood === 'happy' || mood === 'hi') && (
        <g fill="#ff8a1f" opacity="0.4">
          <circle cx="70" cy="92" r="6" />
          <circle cx="130" cy="92" r="6" />
        </g>
      )}
      {sleepy && <text x="140" y="34" fontSize="18" fontWeight="700" fill="#0f8b9d">z</text>}
    </svg>
  )
}

// 돌이가 말하는 말풍선
export function DoliSay({ mood = 'hi', glow = 0.7, children, className = '' }) {
  return (
    <div className={`doli-say ${className}`}>
      <Doli size={46} mood={mood} glow={glow} orange={false} />
      <p>{children}</p>
    </div>
  )
}
