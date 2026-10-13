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
  const [subTab, setSubTab] = useState<'fit' | 'activation' | 'resnet'>('fit')
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

  const autoOptimize = () => {
    setWX(1.2)
    setWY(-1.0)
    setBias(-5)
  }

  return (
    <div className="nn-lab">
      {/* 顶部实操模式子标签 */}
      <div className="lab-sub-tabs">
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'fit' ? 'active' : ''}`}
          onClick={() => setSubTab('fit')}
        >
          🎯 2D 超平面切分与反向传播实操
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'activation' ? 'active' : ''}`}
          onClick={() => setSubTab('activation')}
        >
          📈 激活函数的进化（Sigmoid ➔ ReLU ➔ GELU）
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'resnet' ? 'active' : ''}`}
          onClick={() => setSubTab('resnet')}
        >
          ⛓️ 梯度消失与 ResNet 残差跳跃连接
        </button>
      </div>

      {subTab === 'fit' && (
        <div className="tab-pane-content">
          <div className="nn-intro-box">
            <h4>第一性原理：当规则写不全时，让机器调旋钮</h4>
            <p>
              人类写不出识别猫狗的 <code>if-else</code>。感知机给每个输入特征乘一个权重 $w$，加上偏置 $b$。
              <strong>机器学习的本质，就是机器自己用梯度下降在几何空间里寻找分界超平面！</strong>
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
                  ⚡ 模拟反向传播梯度下降 (自动优化旋钮)
                </button>
              </div>
            </div>
          </div>

          <div className="formula mono">
            决策公式：W₁ · x + W₂ · y + b = {wX.toFixed(2)} · x + {wY.toFixed(2)} · y + {bias.toFixed(1)}
          </div>
        </div>
      )}

      {subTab === 'activation' && (
        <div className="tab-pane-content activation-content">
          <h4>📈 激活函数演进：为什么没有非线性，神经网络就是废铁？</h4>
          <p className="sub-note">
            如果不用激活函数，多层矩阵乘法只是一个大线性矩阵：$W_2(W_1 x) = W'x$！无论叠 100 层，它连一个简单的异或（XOR）分类都做不了！
          </p>

          <div className="activation-cards-grid">
            <div className="act-card">
              <h5>1. Sigmoid 函数</h5>
              <div className="act-formula mono">f(x) = 1 / (1 + e^(-x))</div>
              <p>平滑映射到 (0,1)，但两端极平坦，导数极小，深层网络极易发生<strong>梯度消失</strong>！</p>
            </div>

            <div className="act-card highlight">
              <h5>2. ReLU 修正线性单元</h5>
              <div className="act-formula mono">f(x) = max(0, x)</div>
              <p>正半区导数恒为 1！计算极其轻快，彻底引爆了深度学习工业级应用！</p>
            </div>

            <div className="act-card highlight">
              <h5>3. GELU 高斯误差线性单元</h5>
              <div className="act-formula mono">f(x) = x · Φ(x)</div>
              <p>结合概率分布与随机平滑，成为 BERT、GPT-4 等现代大模型 Transformer 的绝对标配！</p>
            </div>
          </div>
        </div>
      )}

      {subTab === 'resnet' && (
        <div className="tab-pane-content resnet-content">
          <h4>⛓️ 梯度消失与深度残差网络（ResNet）跳跃连接</h4>
          <div className="resnet-box">
            <p>
              反向传播根据微积分链式法则连乘导数：<span className="mono">∂L / ∂w₁ = (∂L / ∂y) · ∏(∂yᵢ / ∂yᵢ₋₁)</span>。<br />
              当网络超过 20 层时，几十个小于 1 的小数连乘，梯度呈指数级衰减至 0，浅层参数根本学不到东西！
            </p>
            <div className="resnet-solution">
              <strong>何恺明 ResNet 的旷世神来之笔：</strong>
              <div className="mono resnet-formula">
                y = F(x) + x （直接并联一条无阻碍直通跨层导线）
              </div>
              <p>
                对 x 求导时：<span className="mono">∂y / ∂x = (∂F / ∂x) + 1</span>！多出来的常数项 <strong>+1</strong>，保证了无论网络叠到 152 层甚至上千层，梯度都能无损直通传回第一层！
              </p>
            </div>
          </div>
        </div>
      )}

      {passed || completed ? (
        <div className="pass-banner">
          <strong>通关达成！</strong> 你亲手体验了机器学习的核心：没有手写任何 if-else，仅仅通过调整参数权重与偏置，就在几何空间中切出了完美的分类边界！
        </div>
      ) : null}
    </div>
  )
}
