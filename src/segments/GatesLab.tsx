import { useState } from 'react'

interface GatesLabProps {
  completed: boolean
  onComplete: () => void
}

export function GatesLab({ completed, onComplete }: GatesLabProps) {
  const [inputA, setInputA] = useState(1)
  const [inputB, setInputB] = useState(1)
  const [activeTab, setActiveTab] = useState<'adder' | 'basic'>('adder')

  // 半加器计算
  // Sum = A XOR B
  const sum = inputA ^ inputB
  // Carry = A AND B
  const carry = inputA & inputB
  // 合并结果
  const resultBinary = `${carry}${sum}`
  const resultDecimal = inputA + inputB

  const isOnePlusOne = inputA === 1 && inputB === 1

  const handleTestPass = () => {
    onComplete()
  }

  return (
    <div className="gates-lab">
      {/* 顶部模式切换 */}
      <div className="lab-nav-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'adder' ? 'active' : ''}`}
          onClick={() => setActiveTab('adder')}
        >
          🌟 核心实操：半加器电路（1+1=2的物理实现）
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          📐 串联与并联：三大基本逻辑门图解
        </button>
      </div>

      {activeTab === 'basic' && (
        <div className="basic-gates-view">
          <div className="gates-grid">
            <div className="gate-card">
              <h5>与门 (AND) · 串联原理</h5>
              <svg viewBox="0 0 160 80" className="gate-mini-svg">
                <line x1="10" y1="40" x2="45" y2="40" stroke="#7a9e7e" strokeWidth="3" />
                <line x1="55" y1="40" x2="90" y2="40" stroke="#7a9e7e" strokeWidth="3" />
                <circle cx="50" cy="40" r="4" fill="#7a9e7e" />
                <line x1="50" y1="40" x2="65" y2="28" stroke="#e8918a" strokeWidth="3" />
                <rect x="95" y="25" width="55" height="30" rx="6" fill="#fcf4ec" stroke="#7a9e7e" strokeWidth="2" />
                <text x="122" y="45" textAnchor="middle" fontSize="12" fill="#4a3f35" fontWeight="bold">AND</text>
              </svg>
              <p>两个开关依次串联在同一根线上。<strong>都闭合</strong>电流才能穿过。</p>
            </div>

            <div className="gate-card">
              <h5>或门 (OR) · 并联原理</h5>
              <svg viewBox="0 0 160 80" className="gate-mini-svg">
                <path d="M 10 40 L 30 20 L 70 20 L 90 40" fill="none" stroke="#7a9e7e" strokeWidth="2" />
                <path d="M 10 40 L 30 60 L 70 60 L 90 40" fill="none" stroke="#7a9e7e" strokeWidth="2" />
                <rect x="95" y="25" width="55" height="30" rx="6" fill="#fcf4ec" stroke="#7a9e7e" strokeWidth="2" />
                <text x="122" y="45" textAnchor="middle" fontSize="12" fill="#4a3f35" fontWeight="bold">OR</text>
              </svg>
              <p>两条支路并联。<strong>只要任意一条接通</strong>，电流就能绕过去。</p>
            </div>

            <div className="gate-card">
              <h5>异或门 (XOR) · 本位运算核心</h5>
              <svg viewBox="0 0 160 80" className="gate-mini-svg">
                <path d="M 20 20 Q 35 40 20 60" fill="none" stroke="#e8918a" strokeWidth="3" />
                <path d="M 30 20 Q 70 20 85 40 Q 70 60 30 60 Q 45 40 30 20 Z" fill="#fffaf5" stroke="#7a9e7e" strokeWidth="2" />
                <text x="55" y="45" textAnchor="middle" fontSize="12" fill="#4a3f35" fontWeight="bold">XOR</text>
              </svg>
              <p><strong>相同为 0，不同为 1</strong>。这是算术加法本位值的神奇源泉！</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'adder' && (
        <div className="adder-workbench">
          <div className="adder-inputs-bar">
            <span className="input-title">输入端（点击拨动电平信号）：</span>
            <div className="adder-inputs">
              <button
                type="button"
                className={`adder-btn-toggle ${inputA === 1 ? 'on' : ''}`}
                onClick={() => setInputA(inputA === 1 ? 0 : 1)}
              >
                输入 A: <strong>{inputA}</strong> ({inputA === 1 ? '高电平 5V' : '低电平 0V'})
              </button>
              <span className="math-plus">+</span>
              <button
                type="button"
                className={`adder-btn-toggle ${inputB === 1 ? 'on' : ''}`}
                onClick={() => setInputB(inputB === 1 ? 0 : 1)}
              >
                输入 B: <strong>{inputB}</strong> ({inputB === 1 ? '高电平 5V' : '低电平 0V'})
              </button>
            </div>
          </div>

          {/* 半加器交互电路图 SVG */}
          <div className="circuit-container">
            <svg viewBox="0 0 540 220" className="circuit-svg">
              {/* 导线 A */}
              <line x1="40" y1="60" x2="160" y2="60" stroke={inputA === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
              <line x1="100" y1="60" x2="100" y2="150" stroke={inputA === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
              <line x1="100" y1="150" x2="160" y2="150" stroke={inputA === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />

              {/* 导线 B */}
              <line x1="40" y1="90" x2="160" y2="90" stroke={inputB === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
              <line x1="130" y1="90" x2="130" y2="180" stroke={inputB === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
              <line x1="130" y1="180" x2="160" y2="180" stroke={inputB === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />

              {/* 输入端圆点标注 */}
              <circle cx="40" cy="60" r="7" fill={inputA === 1 ? '#7a9e7e' : '#baa794'} />
              <text x="25" y="65" textAnchor="end" fontSize="13" fontWeight="bold" fill="#4a3f35">A ({inputA})</text>
              <circle cx="40" cy="90" r="7" fill={inputB === 1 ? '#7a9e7e' : '#baa794'} />
              <text x="25" y="95" textAnchor="end" fontSize="13" fontWeight="bold" fill="#4a3f35">B ({inputB})</text>

              {/* 异或门 XOR */}
              <rect x="160" y="45" width="130" height="60" rx="10" fill="#fffaf5" stroke="#7a9e7e" strokeWidth="2.5" />
              <text x="225" y="75" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#7a9e7e">异或门 XOR</text>
              <text x="225" y="94" textAnchor="middle" fontSize="10" fill="#8a7e72">计算本位 (A ⊕ B)</text>

              {/* 与门 AND */}
              <rect x="160" y="135" width="130" height="60" rx="10" fill="#fffaf5" stroke="#e8a0a0" strokeWidth="2.5" />
              <text x="225" y="165" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#e8918a">与门 AND</text>
              <text x="225" y="184" textAnchor="middle" fontSize="10" fill="#8a7e72">计算进位 (A & B)</text>

              {/* XOR 输出线 (Sum) */}
              <line x1="290" y1="75" x2="390" y2="75" stroke={sum === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
              <circle cx="390" cy="75" r="7" fill={sum === 1 ? '#7a9e7e' : '#baa794'} />
              <text x="405" y="80" fontSize="14" fontWeight="bold" fill={sum === 1 ? '#7a9e7e' : '#4a3f35'}>
                本位和 Sum = {sum}
              </text>

              {/* AND 输出线 (Carry) */}
              <line x1="290" y1="165" x2="390" y2="165" stroke={carry === 1 ? '#e8918a' : '#d5c4b0'} strokeWidth="4" />
              <circle cx="390" cy="165" r="7" fill={carry === 1 ? '#e8918a' : '#baa794'} />
              <text x="405" y="170" fontSize="14" fontWeight="bold" fill={carry === 1 ? '#e8918a' : '#4a3f35'}>
                进位 Carry = {carry}
              </text>
            </svg>
          </div>

          {/* 实时运算结算面板 */}
          <div className="adder-result-box">
            <div className="math-row">
              <span className="mono math-eq">
                {inputA} + {inputB} = {resultDecimal} (十进制)
              </span>
              <span className="arrow-sep">➔</span>
              <span className="mono math-binary">
                二进制输出：[Carry: {carry}] [Sum: {sum}] = <strong>{resultBinary}</strong>
              </span>
            </div>
            <p className="explain-text">
              看！当输入 A=1 且 B=1 时，异或门因为“相同为0”输出了 <strong>0</strong>；而与门因为“同时为1”激活了进位，输出了 <strong>1</strong>！
              组合在一起正是 <code>10</code>（二进制的 2）！加法没有任何神明，<strong>就是电线分流出来的确定性物理规律</strong>。
            </p>
          </div>

          <div className="action-row">
            {isOnePlusOne && !completed && (
              <button type="button" className="btn" onClick={handleTestPass}>
                我亲眼见证了 1+1=10 的物理诞生！点击通关
              </button>
            )}
            {completed && (
              <p className="pass">已通关：你已经彻底掌握了门电路与二进制加法器的物理因果关系！</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
