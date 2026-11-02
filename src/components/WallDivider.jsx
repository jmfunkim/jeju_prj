// 제주 밭담처럼 크기가 제각각인 현무암을 두 줄로 쌓은 구분선
const ROWS = [
  [34, 22, 40, 26, 30, 38, 24, 36, 28, 42, 26, 32, 38, 24, 34, 30, 40, 26, 36, 28],
  [28, 40, 24, 36, 32, 26, 42, 30, 24, 38, 34, 28, 22, 40, 30, 36, 26, 32, 38, 24],
]

export default function WallDivider({ label }) {
  return (
    <div className="wall" role="separator" aria-label={label || '돌담'}>
      {ROWS.map((row, r) => (
        <div className="wall__row" key={r} style={{ marginLeft: r ? -18 : 0 }}>
          {row.map((w, i) => (
            <i key={i} style={{ width: w + 14, height: 15 + ((i * 7 + r * 5) % 6), transform: `rotate(${((i * 13 + r * 7) % 7) - 3}deg)` }} />
          ))}
        </div>
      ))}
      {label && <span className="wall__label">{label}</span>}
    </div>
  )
}
