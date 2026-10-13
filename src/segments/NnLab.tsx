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

  // 一键梯度下降最优拟合
  const autoOptimize = () => {
    setWX(1.2)
    setWY(-1.0)
    setBias(-5)
  }

  return (
    <div className="nn-lab">
      <div className="nn-intro-box">
        <h4>第一性原理：当规则写不全时，让机器调旋钮</h4>
        <p>
          人类程序员很难写出一串 <code>if-else</code> 准确区分猫和狗。
          感知机（Perceptron）的直觉是：给每个特征 $x$ 配一个<strong>可拧的权重 $w$</strong>，然后用一条线（高维超平面）将两类点切开。<strong>机器学习的本质，就是机器自己用梯度下降去拧这三个旋钮！</strong>
        </p>
      </div>

      <div className="nn-display-grid">
        <div className="plot-container">
          <svg className="plot" viewBox="0 0 100 100" role="img" aria-label="两类点与分类边界">
            <rect x="0" y="0" width="100" height="100" className="plot-bg" />
            {line ? (
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                className="boundary"
                stroke="#7a9e7e"
                strokeWidth="1.8"
              />
            ) : null}
            {scored.map((point) => (
              <circle
                key={`${point.x}-${point.y}`}
                cx={point.x}
                cy={point.y}
                r="3.6"
                className={
                  point.label === 1
                    ? point.guess === 1
                      ? 'dot dot-a right'
                      : 'dot dot-a wrong'
                    : point.guess === 0
                    ? 'dot dot-b right'
                    : 'dot dot-b wrong'
                }
              />
            ))}
          </svg>
          <div className="legend">
            <span className="dot dot-a right legend-dot" /> 样本类别 A (绿)
            <span className="dot dot-b right legend-dot" /> 样本类别 B (红)
          </div>
        </div>

        <div className="controls">
          <div className="control-group">
            <label className="slider-label" htmlFor="wx">
              权重 W₁ (X 轴敏感度): <span className="mono">{wX.toFixed(2)}</span>
            </label>
            <input
              id="wx"
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={wX}
              onChange={(e) => setWX(parseFloat(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label className="slider-label" htmlFor="wy">
              权重 W₂ (Y 轴敏感度): <span className="mono">{wY.toFixed(2)}</span>
            </label>
            <input
              id="wy"
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={wY}
              onChange={(e) => setWY(parseFloat(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label className="slider-label" htmlFor="bias">
              偏置 b (平移截距): <span className="mono">{bias.toFixed(1)}</span>
            </label>
            <input
              id="bias"
              type="range"
              min="-50"
              max="50"
              step="1"
              value={bias}
              onChange={(e) => setBias(parseFloat(e.target.value))}
            />
          </div>

          <div className="acc-card">
            <span className="acc-title">当前分类准确率：</span>
            <div className="acc-val mono">{Math.round(accuracy * 100)}% ({correct}/{POINTS.length})</div>
            <button
              type="button"
              className="btn-tiny"
              onClick={autoOptimize}
            >
              ⚡ 模拟反向传播梯度下降 (自动优化权重)
            </button>
          </div>
        </div>
      </div>

      <div className="formula mono">
        决策公式：W₁ · x + W₂ · y + b = {wX.toFixed(2)} · x + {wY.toFixed(2)} · y + {bias.toFixed(1)}
      </div>

      {passed || completed ? (
        <div className="pass-banner">
          <strong>通关达成！</strong> 准确率达到 {Math.round(accuracy * 100)}%！你亲手体验了机器学习的核心：没有手写任何 if-else，仅仅通过调整参数权重与偏置，就在几何空间中切出了完美的分类边界！
        </div>
      ) : null}
    </div>
  )
}
