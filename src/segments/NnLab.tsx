import { useEffect, useMemo, useRef, useState } from 'react'

const POINTS: { x: number; y: number; label: 0 | 1 }[] = [
  { x: 18, y: 78, label: 0 },
  { x: 28, y: 70, label: 0 },
  { x: 22, y: 58, label: 0 },
  { x: 36, y: 84, label: 0 },
  { x: 42, y: 66, label: 0 },
  { x: 72, y: 24, label: 1 },
  { x: 82, y: 32, label: 1 },
  { x: 66, y: 36, label: 1 },
  { x: 86, y: 18, label: 1 },
  { x: 62, y: 28, label: 1 },
]

const THRESHOLD = 0.8

interface NnLabProps {
  completed: boolean
  onComplete: () => void
}

function predict(x: number, y: number, wX: number, wY: number, bias: number): 0 | 1 {
  return wX * x + wY * y + bias >= 0 ? 1 : 0
}

function boundary(
  wX: number,
  wY: number,
  bias: number,
): { x1: number; y1: number; x2: number; y2: number } | null {
  const hits: { x: number; y: number }[] = []
  const push = (x: number, y: number) => {
    if (x >= -0.01 && x <= 100.01 && y >= -0.01 && y <= 100.01) {
      const nx = Math.min(100, Math.max(0, x))
      const ny = Math.min(100, Math.max(0, y))
      if (!hits.some((hit) => Math.abs(hit.x - nx) < 0.4 && Math.abs(hit.y - ny) < 0.4)) {
        hits.push({ x: nx, y: ny })
      }
    }
  }
  if (Math.abs(wY) > 1e-6) {
    push(0, -bias / wY)
    push(100, -(wX * 100 + bias) / wY)
  }
  if (Math.abs(wX) > 1e-6) {
    push(-bias / wX, 0)
    push(-(wY * 100 + bias) / wX, 100)
  }
  if (hits.length < 2) return null
  return { x1: hits[0].x, y1: hits[0].y, x2: hits[1].x, y2: hits[1].y }
}

export function NnLab({ completed, onComplete }: NnLabProps) {
  const [wX, setWX] = useState(0)
  const [wY, setWY] = useState(0)
  const [bias, setBias] = useState(0)

  const scored = useMemo(
    () =>
      POINTS.map((point) => ({
        ...point,
        guess: predict(point.x, point.y, wX, wY, bias),
      })),
    [wX, wY, bias],
  )
  const correct = scored.filter((point) => point.guess === point.label).length
  const accuracy = correct / POINTS.length
  const line = boundary(wX, wY, bias)
  const passed = accuracy >= THRESHOLD
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    if (passed) onCompleteRef.current()
  }, [passed])

  return (
    <div className="nn-lab">
      <svg className="plot" viewBox="0 0 100 100" role="img" aria-label="两类点与分类边界">
        <rect x="0" y="0" width="100" height="100" className="plot-bg" />
        {line ? (
          <line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className="boundary"
          />
        ) : null}
        {scored.map((point) => (
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r="3.4"
            className={
              point.label === 1
                ? point.guess === point.label
                  ? 'point tea'
                  : 'point tea miss'
                : point.guess === point.label
                  ? 'point peach'
                  : 'point peach miss'
            }
          />
        ))}
      </svg>
      <div className="legend">
        <span>
          <i className="swatch peach" /> 桃子点
        </span>
        <span>
          <i className="swatch tea" /> 抹茶点
        </span>
      </div>
      <p className="mono formula">分数 = wₓ·x + wᵧ·y + b ，分数 ≥ 0 判成抹茶点</p>
      <Slider label="权重 x" value={wX} onChange={setWX} />
      <Slider label="权重 y" value={wY} onChange={setWY} />
      <Slider label="偏置" value={bias} onChange={setBias} />
      <p role="status">
        分对了 {correct}/{POINTS.length} · 准确率 {Math.round(accuracy * 100)}%
      </p>
      {passed ? (
        <p className="pass" role="status">
          通过了。边界把两类大致分开了，权重一变，这条线就跟着歪。
        </p>
      ) : completed ? (
        <p className="pass" role="status">
          这段已经走过了。把权重拧回去，准确率也会掉下来。
        </p>
      ) : (
        <p className="lab-note">权重决定直线往哪边斜。到 80% 就算走过。</p>
      )}
    </div>
  )
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const id = `nn-${label.replace(/\s+/g, '-')}`
  return (
    <label className="slider" htmlFor={id}>
      <span>
        {label} <strong className="mono">{value.toFixed(1)}</strong>
      </span>
      <input
        id={id}
        type="range"
        min={-2}
        max={2}
        step={0.1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
