// 신화·설화 이야기마다 직접 그린 장면 일러스트(SVG). 사진이 없을 때 카드 얼굴이 되고, 사진이 있으면 그 밑에 깔립니다.
// viewBox 400×170 — 가로로 넓은 카드에서 가운데를 기준으로 잘려도 어색하지 않게 중심에 주인공을 둡니다.
const Stars = ({ n = 18, seed = 3, maxY = 90 }) => {
  let a = seed
  const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280 }
  return (
    <g fill="#fff">
      {Array.from({ length: n }, (_, i) => <circle key={i} cx={r() * 400} cy={r() * maxY} r={r() * 1.3 + 0.4} opacity={0.5 + r() * 0.5} />)}
    </g>
  )
}

const SCENES = {
  // 치마폭으로 한라산을 쌓은 거인
  seolmundae: { sky: ['#2a2f6b', '#8a4d9e', '#f08a1c'], el: (
    <>
      <Stars />
      <path d="M0 170 L120 120 Q200 100 280 120 L400 170Z" fill="#3a2c5c" />
      <path d="M90 170 L180 78 L205 70 L230 78 L320 170Z" fill="#241a45" />
      <ellipse cx="205" cy="73" rx="22" ry="5" fill="#f08a1c" opacity=".7" />
      <g fill="#150f2e"><circle cx="318" cy="46" r="13" /><path d="M298 168 Q300 76 318 62 Q336 76 342 168Z" /></g>
      <g fill="#f08a1c" opacity=".85">{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={296 - i * 16} cy={120 + i * 7} r={3 + (i % 2)} />)}</g>
    </>) },
  // 영실의 오백장군 바위들
  obaek: { sky: ['#4f6a86', '#9fb8c8', '#e3ecef'], el: (
    <>
      <g fill="#5b6b70">{[40, 90, 140, 190, 245, 300, 350].map((x, i) => <path key={x} d={`M${x} 170 L${x + 6} ${70 + (i % 3) * 18} Q${x + 16} ${52 + (i % 2) * 14} ${x + 26} ${70 + (i % 3) * 18} L${x + 34} 170Z`} />)}</g>
      <path d="M0 170 Q100 130 200 150 T400 140 V170Z" fill="#2f4a3a" />
      <g fill="#fff" opacity=".55"><ellipse cx="90" cy="110" rx="70" ry="9" /><ellipse cx="290" cy="96" rx="80" ry="10" /></g>
    </>) },
  // 밑이 없는 못, 물장오리
  mulchang: { sky: ['#14284a', '#2a4a78', '#6a8fb5'], el: (
    <>
      <Stars n={26} seed={7} maxY={80} />
      <circle cx="318" cy="38" r="16" fill="#f6f1c8" />
      <path d="M0 170 Q120 100 200 118 T400 112 V170Z" fill="#1e3b2f" />
      <ellipse cx="200" cy="140" rx="92" ry="20" fill="#0d2238" />
      <ellipse cx="200" cy="140" rx="70" ry="13" fill="#17365a" />
      <ellipse cx="226" cy="138" rx="7" ry="3" fill="#f6f1c8" opacity=".8" />
    </>) },
  // 날아와 앉은 산방산
  sanbang: { sky: ['#4aa3c9', '#a8dcef', '#fff1c9'], el: (
    <>
      <circle cx="320" cy="42" r="20" fill="#ffd35c" />
      <path d="M0 170 V138 Q100 128 200 136 T400 130 V170Z" fill="#2b7a8f" />
      <path d="M110 150 Q120 70 200 56 Q280 70 290 150Z" fill="#6f6a5c" />
      <path d="M150 150 Q160 92 200 80 Q240 92 250 150Z" fill="#8a8470" opacity=".7" />
      <path d="M0 170 V152 Q100 146 200 152 T400 150 V170Z" fill="#79a85a" />
    </>) },
  // 바다 위의 분화구, 성산일출봉
  seongsan: { sky: ['#ff9a44', '#ffc772', '#ffe9b0'], el: (
    <>
      <circle cx="200" cy="96" r="30" fill="#fff6d8" opacity=".9" />
      <path d="M0 170 V118 H400 V170Z" fill="#2b7a9a" />
      <path d="M0 150 Q100 140 200 148 T400 144 V170H0Z" fill="#1d6280" />
      <path d="M120 124 L150 82 Q200 98 250 82 L282 124Z" fill="#4a5a3c" />
      <path d="M150 82 Q200 98 250 82 Q200 88 150 82Z" fill="#7aa05a" />
      <g stroke="#fff" strokeWidth="1.6" opacity=".6" fill="none"><path d="M40 138 q10 -4 20 0" /><path d="M300 150 q10 -4 20 0" /></g>
    </>) },
  // 땅에서 솟은 세 신인, 삼성혈
  samsung: { sky: ['#1c2c3a', '#3a5a52', '#8fae7a'], el: (
    <>
      <Stars n={14} seed={11} maxY={70} />
      <path d="M0 170 Q200 110 400 170Z" fill="#35563f" />
      <g>{[120, 200, 280].map((x) => (
        <g key={x}>
          <path d={`M${x} 140 L${x - 22} 20 L${x + 22} 20Z`} fill="#ffe08a" opacity=".16" />
          <ellipse cx={x} cy="142" rx="24" ry="8" fill="#101c18" />
          <ellipse cx={x} cy="140" rx="14" ry="4" fill="#ffd35c" />
        </g>))}
      </g>
    </>) },
  // 바다 건너 바람, 영등할망
  yeongdeung: { sky: ['#5a7aa0', '#a9c4d8', '#e8f1f2'], el: (
    <>
      <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".8">
        <path d="M30 52 Q90 30 150 52 T260 48" /><path d="M120 80 Q190 58 250 82 T370 70" /><path d="M20 100 Q70 84 120 100 T210 96" />
      </g>
      <path d="M0 170 V130 H400 V170Z" fill="#2c6d8f" />
      <path d="M0 150 Q50 140 100 150 T200 150 T300 150 T400 150 V170H0Z" fill="#1d5878" />
      <path d="M150 140 L250 140 L232 156 L168 156Z" fill="#5a3a22" /><path d="M200 140 V96 L236 140Z" fill="#f4f0e4" />
    </>) },
  // 용이 굳어 버린 바위, 용두암
  yongduam: { sky: ['#243a63', '#42648c', '#7ea6c4'], el: (
    <>
      <Stars n={16} seed={5} maxY={70} />
      <path d="M0 170 V126 H400 V170Z" fill="#1d4a6e" />
      <path d="M150 140 Q140 90 170 70 Q190 54 214 66 Q236 70 230 88 Q210 84 204 100 Q214 120 224 140Z" fill="#4c4a46" />
      <circle cx="202" cy="72" r="3" fill="#ff8a1f" />
      <path d="M0 156 Q50 144 100 156 T200 156 T300 156 T400 156 V170H0Z" fill="#fff" opacity=".35" />
    </>) },
  // 일곱 선녀가 내려온 천제연
  cheonjeyeon: { sky: ['#1b2850', '#2f5a7a', '#5fa3a8'], el: (
    <>
      <Stars n={22} seed={13} maxY={70} />
      <path d="M0 170 V60 L120 50 V170Z" fill="#26383a" /><path d="M280 50 L400 60 V170H280Z" fill="#26383a" />
      <path d="M150 50 H250 V170H150Z" fill="#cfeff2" opacity=".75" />
      <g stroke="#fff" strokeWidth="2" opacity=".6">{[165, 185, 205, 225, 240].map((x) => <path key={x} d={`M${x} 52 V168`} />)}</g>
      <ellipse cx="200" cy="164" rx="70" ry="8" fill="#0f2a3a" />
      <g fill="#ffe08a">{[70, 110, 150, 200, 250, 290, 330].map((x, i) => <path key={x} d={`M${x} ${24 + (i % 3) * 14} l2 5 5 .6 -4 3.6 1.2 5 -4.2 -2.8 -4.2 2.8 1.2 -5 -4 -3.6 5 -.6z`} />)}</g>
    </>) },
}

export const hasMythArt = (id) => !!SCENES[id]

export default function MythArt({ id, className = '' }) {
  const s = SCENES[id]
  if (!s) return null
  const gid = `ma-${id}`
  return (
    <svg className={className} viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" role="img" aria-label="이야기 장면 일러스트">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.sky[0]} /><stop offset=".55" stopColor={s.sky[1]} /><stop offset="1" stopColor={s.sky[2]} />
        </linearGradient>
      </defs>
      <rect width="400" height="170" fill={`url(#${gid})`} />
      {s.el}
    </svg>
  )
}
