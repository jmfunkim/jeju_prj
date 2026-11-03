// 장소마다 직접 그린 장면 일러스트(SVG) — 신화·설화 9곳과 사진이 없는 돌문화·역사문화 8곳. 사진이 없을 때 카드 얼굴이 되고, 사진이 있으면 그 밑에 깔립니다.
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
  // ── 사진이 없는 장소를 위한 장면 (돌문화·역사문화) ──
  // 구불구불 이어진 밭담
  balddam: { sky: ['#7fc4e8', '#bfe6f2', '#f5f0c9'], el: (
    <>
      <circle cx="330" cy="40" r="18" fill="#ffd35c" />
      <path d="M0 170 V92 Q100 78 200 90 T400 84 V170Z" fill="#7aa95a" />
      <path d="M0 170 V120 Q90 104 170 118 T400 104 V170Z" fill="#a3c466" />
      <path d="M0 170 V146 Q110 130 200 144 T400 132 V170Z" fill="#d6c46a" />
      <g fill="none" stroke="#2f2e2c" strokeLinecap="round">
        <path d="M-10 120 Q90 102 170 118 T410 104" strokeWidth="9" strokeDasharray="11 2.5" />
        <path d="M-10 146 Q110 128 200 144 T410 130" strokeWidth="10" strokeDasharray="12 2.5" />
        <path d="M-10 168 Q130 150 230 164 T410 154" strokeWidth="11" strokeDasharray="13 3" />
      </g>
    </>) },
  // 초가와 정낭이 있는 성읍민속마을
  seongeup: { sky: ['#8fcbe4', '#d7eef0', '#f7f1d2'], el: (
    <>
      <path d="M0 170 V128 H400 V170Z" fill="#86ad5c" />
      <rect x="140" y="92" width="120" height="40" fill="#e9dfc7" />
      <path d="M118 98 Q200 36 282 98Z" fill="#b08a3e" />
      <path d="M150 92 Q200 62 250 92" stroke="#8a6a2a" strokeWidth="2" fill="none" />
      <rect x="188" y="104" width="24" height="28" fill="#5a4630" />
      <path d="M40 142 H360" stroke="#3a3a38" strokeWidth="14" strokeLinecap="round" strokeDasharray="14 2" />
      <g fill="#6a6f72"><rect x="300" y="92" width="10" height="50" rx="3" /><rect x="350" y="92" width="10" height="50" rx="3" /></g>
      <g fill="#8b5a2b"><rect x="296" y="100" width="68" height="5" rx="2" /><rect x="296" y="114" width="68" height="5" rx="2" /><rect x="312" y="136" width="64" height="5" rx="2" transform="rotate(-6 340 138)" /></g>
    </>) },
  // 노을 진 바닷가의 불턱
  budeok: { sky: ['#3a2f5c', '#c4605a', '#ffb86b'], el: (
    <>
      <Stars n={10} seed={19} maxY={50} />
      <circle cx="200" cy="100" r="26" fill="#ffd9a0" />
      <path d="M0 170 V104 H400 V170Z" fill="#245a74" />
      <path d="M0 170 V138 Q100 128 200 136 T400 132 V170Z" fill="#2e4a50" />
      <circle cx="200" cy="140" r="42" fill="#ff9a3c" opacity=".25" />
      <ellipse cx="200" cy="146" rx="66" ry="15" fill="none" stroke="#2b2f33" strokeWidth="13" strokeDasharray="13 3" strokeLinecap="round" />
      <path d="M200 150 Q184 132 200 108 Q216 132 200 150Z" fill="#ffb347" />
      <path d="M200 150 Q192 138 200 124 Q208 138 200 150Z" fill="#ffe08a" />
    </>) },
  // 물질하는 해녀와 테왁
  haenyeo: { sky: ['#a9dcee', '#dff3f6', '#f5fbfb'], el: (
    <>
      <path d="M0 170 V86 H400 V170Z" fill="#1d7f98" />
      <path d="M0 112 Q50 102 100 112 T200 112 T300 112 T400 112 V170H0Z" fill="#14687f" opacity=".7" />
      <circle cx="150" cy="86" r="17" fill="#ff8a1f" />
      <path d="M134 90 Q150 112 166 90" stroke="#7a3a00" strokeWidth="2" fill="none" />
      <path d="M142 98 Q150 132 158 98" fill="none" stroke="#fff" opacity=".6" />
      <ellipse cx="150" cy="90" rx="30" ry="5" fill="none" stroke="#fff" opacity=".5" />
      <circle cx="244" cy="90" r="9" fill="#d9a77b" />
      <path d="M235 88 Q244 77 253 88Z" fill="#26343a" />
      <rect x="237" y="88" width="14" height="5" rx="2.5" fill="none" stroke="#fff" />
      <ellipse cx="268" cy="124" rx="32" ry="9" fill="#26343a" opacity=".5" transform="rotate(-20 268 124)" />
      <g fill="#fff" opacity=".6"><circle cx="216" cy="120" r="3" /><circle cx="224" cy="132" r="2" /><circle cx="210" cy="136" r="2.4" /></g>
    </>) },
  // 4·3 평화공원 — 조용한 새벽과 붉은 동백
  peacepark: { sky: ['#2b3a4f', '#5b6f86', '#b9c6d2'], el: (
    <>
      <Stars n={10} seed={23} maxY={50} />
      <path d="M0 170 V132 Q200 118 400 132 V170Z" fill="#2f4a3f" />
      <rect x="128" y="106" width="144" height="28" rx="3" fill="#8e9aa3" />
      <rect x="128" y="106" width="144" height="6" fill="#aab5bd" />
      <g>
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="310" cy="54" rx="11" ry="16" fill="#c8283c" transform={'rotate(' + a + ' 310 70)'} />)}
        <circle cx="310" cy="70" r="6" fill="#ffd35c" />
        <path d="M310 86 Q312 120 306 134" stroke="#2f5a3c" strokeWidth="3" fill="none" />
        <path d="M308 112 Q290 104 282 112 Q292 122 308 112Z" fill="#2f5a3c" />
      </g>
      <g fill="#c8283c" opacity=".8"><ellipse cx="86" cy="96" rx="4" ry="6" transform="rotate(30 86 96)" /><ellipse cx="60" cy="118" rx="4" ry="6" transform="rotate(-20 60 118)" /></g>
    </>) },
  // 세한도처럼 소나무와 초가, 추사 유배지
  chusa: { sky: ['#efe6cf', '#f6efdd', '#fbf6e9'], el: (
    <>
      <circle cx="318" cy="40" r="16" fill="#e8dcc0" />
      <path d="M0 140 Q60 90 120 130 Q180 80 250 128 Q320 96 400 134 V170H0Z" fill="#9aa39b" opacity=".55" />
      <path d="M96 170 Q90 120 110 84" stroke="#3d3a33" strokeWidth="8" fill="none" />
      <path d="M110 84 Q70 76 56 92 M110 90 Q150 70 170 86 M102 108 Q70 104 60 120" stroke="#3d3a33" strokeWidth="5" fill="none" />
      <g fill="#2f4a36"><ellipse cx="58" cy="90" rx="24" ry="8" /><ellipse cx="164" cy="82" rx="26" ry="8" /><ellipse cx="62" cy="118" rx="22" ry="7" /><ellipse cx="112" cy="78" rx="22" ry="8" /></g>
      <path d="M244 152 L288 112 L332 152Z" fill="#a98a4a" />
      <rect x="258" y="150" width="60" height="20" fill="#e6dcc0" />
      <rect x="282" y="152" width="14" height="18" fill="#4a3a28" />
    </>) },
  // 배로 곡식을 실어 온 김만덕
  mandeok: { sky: ['#f4a259', '#f9d48c', '#fdeccc'], el: (
    <>
      <circle cx="322" cy="70" r="24" fill="#fff2c4" />
      <path d="M0 170 V112 H400 V170Z" fill="#2c7a95" />
      <path d="M0 130 Q50 122 100 130 T200 130 T300 130 T400 130 V170H0Z" fill="#1f6a85" opacity=".7" />
      <path d="M130 130 L270 130 L250 152 L150 152Z" fill="#6b4a2b" />
      <rect x="198" y="64" width="4" height="68" fill="#4a3320" />
      <path d="M202 68 L202 124 L258 124Z" fill="#f6efe0" />
      <path d="M198 74 L198 124 L154 124Z" fill="#efe4cc" />
      <g fill="#d9b97a"><ellipse cx="166" cy="128" rx="11" ry="7" /><ellipse cx="190" cy="128" rx="11" ry="7" /><ellipse cx="214" cy="128" rx="11" ry="7" /><ellipse cx="240" cy="128" rx="11" ry="7" /></g>
    </>) },
  // 들판에 남은 알뜨르 격납고
  alddreu: { sky: ['#33406e', '#9a6a9e', '#ffb48a'], el: (
    <>
      <Stars n={12} seed={29} maxY={55} />
      <path d="M0 170 V124 H400 V170Z" fill="#4f6a45" />
      <path d="M0 150 Q100 142 200 148 T400 144 V170H0Z" fill="#5e7a50" />
      {[60, 150, 240, 330].map((x) => (
        <g key={x}>
          <path d={'M' + (x - 34) + ' 142 Q' + (x - 34) + ' 100 ' + x + ' 100 Q' + (x + 34) + ' 100 ' + (x + 34) + ' 142Z'} fill="#6c6a68" />
          <path d={'M' + (x - 18) + ' 142 Q' + (x - 18) + ' 118 ' + x + ' 118 Q' + (x + 18) + ' 118 ' + (x + 18) + ' 142Z'} fill="#24262a" />
        </g>
      ))}
    </>) },
  // 돌하르방과 선돌이 모인 제주돌문화공원
  stonepark: { sky: ['#8fc9ea', '#cfe9f1', '#f4f1d6'], el: (
    <>
      <circle cx="334" cy="36" r="16" fill="#ffd35c" />
      <path d="M0 170 V104 Q100 92 200 102 T400 98 V170Z" fill="#8fb36a" />
      <path d="M0 170 V132 Q120 120 220 130 T400 126 V170Z" fill="#6e9a52" />
      {[80, 190, 300].map((x, i) => (
        <g key={x} transform={'translate(0 ' + (i === 1 ? 4 : 0) + ')'}>
          <ellipse cx={x} cy="82" rx="30" ry="6" fill="#5f6b70" />
          <path d={'M' + (x - 15) + ' 82 Q' + (x - 15) + ' 62 ' + x + ' 62 Q' + (x + 15) + ' 62 ' + (x + 15) + ' 82Z'} fill="#6f7c82" />
          <rect x={x - 17} y="80" width="34" height="56" rx="14" fill="#7d8a90" />
          <circle cx={x - 7} cy="94" r="3.4" fill="#26343a" /><circle cx={x + 7} cy="94" r="3.4" fill="#26343a" />
          <ellipse cx={x} cy="103" rx="4" ry="3.4" fill="#5f6b70" />
        </g>
      ))}
      <g fill="#59656b"><ellipse cx="46" cy="148" rx="20" ry="12" /><ellipse cx="364" cy="150" rx="24" ry="13" /></g>
    </>) },
  // 마을 어귀의 방사탑 — 돌을 쌓은 탑과 꼭대기의 돌새
  'bukchon-bangsatap': { sky: ['#9fb4c4', '#cdd9e0', '#eef1ee'], el: (
    <>
      <path d="M0 170 V120 H400 V170Z" fill="#3d7a92" />
      <path d="M0 170 V146 Q100 136 200 144 T400 140 V170Z" fill="#7d9a5a" />
      <g fill="#5d5a56">
        <ellipse cx="200" cy="146" rx="52" ry="12" />
        <ellipse cx="200" cy="132" rx="44" ry="11" />
        <ellipse cx="200" cy="119" rx="36" ry="10" />
        <ellipse cx="200" cy="107" rx="28" ry="9" />
        <ellipse cx="200" cy="96" rx="20" ry="8" />
        <ellipse cx="200" cy="87" rx="13" ry="7" />
      </g>
      <g fill="#7a7671"><ellipse cx="178" cy="140" rx="13" ry="7" /><ellipse cx="226" cy="128" rx="12" ry="6" /><ellipse cx="190" cy="114" rx="10" ry="5" /><ellipse cx="212" cy="102" rx="8" ry="4" /></g>
      <ellipse cx="200" cy="74" rx="14" ry="8" fill="#4a4743" />
      <circle cx="212" cy="66" r="5" fill="#4a4743" />
      <path d="M216 66 L224 68 L216 70Z" fill="#4a4743" />
    </>) },
  // 숲이 짙은 거문오름과 용암동굴 입구
  geomun: { sky: ['#6fa8c8', '#b9dbe6', '#eef3dc'], el: (
    <>
      <path d="M0 170 V120 Q80 70 170 50 Q200 42 230 50 Q320 70 400 120 V170Z" fill="#35684a" />
      <path d="M150 54 Q200 40 250 54 Q200 64 150 54Z" fill="#244a34" />
      <g fill="#2c5a3e">{[40, 90, 140, 260, 310, 360].map((x, i) => <circle key={x} cx={x} cy={118 + (i % 3) * 8} r={22 + (i % 2) * 4} />)}</g>
      <g fill="#3f7a52">{[70, 120, 280, 330].map((x, i) => <circle key={x} cx={x} cy={134 + (i % 2) * 6} r={20} />)}</g>
      <path d="M0 170 V146 Q200 130 400 146 V170Z" fill="#2a4a36" />
      <path d="M160 170 Q160 130 200 130 Q240 130 240 170Z" fill="#14201a" />
      <path d="M176 170 Q176 144 200 144 Q224 144 224 170Z" fill="#05090a" />
    </>) },
  // 기와지붕과 붉은 기둥의 제주목 관아
  mokgwana: { sky: ['#7db5d6', '#c4e0ea', '#f6f1d6'], el: (
    <>
      <path d="M0 170 V138 H400 V170Z" fill="#c9bfa6" />
      <rect x="86" y="118" width="228" height="22" fill="#9a9488" />
      <g fill="#a8302a">{[112, 152, 192, 232, 272].map((x) => <rect key={x} x={x} y="76" width="10" height="44" />)}</g>
      <rect x="104" y="72" width="192" height="8" fill="#3a3a3c" />
      <path d="M62 76 Q200 14 338 76 Q200 56 62 76Z" fill="#3a3d42" />
      <path d="M78 70 Q200 30 322 70" stroke="#6a6f76" strokeWidth="3" fill="none" />
      <rect x="170" y="96" width="60" height="24" fill="#5a1f1a" />
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
