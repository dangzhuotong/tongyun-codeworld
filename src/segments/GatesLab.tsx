import { useState } from 'react'

interface GatesLabProps {
  completed: boolean
  onComplete: () => void
}

export function GatesLab({ completed, onComplete }: GatesLabProps) {
  const [activeTab, setActiveTab] = useState<'half' | 'full' | 'latch' | 'basic'>('half')

  // 半加器输入
  const [haA, setHaA] = useState(1)
  const [haB, setHaB] = useState(1)
  const haSum = haA ^ haB
  const haCarry = haA & haB

  // 全加器输入
  const [faA, setFaA] = useState(1)
  const [faB, setFaB] = useState(1)
  const [faCin, setFaCin] = useState(0)
  // 全加器计算
  const faSum = faA ^ faB ^ faCin
  const faCout = (faA & faB) | (faCin & (faA ^ faB))
  const faTotal = faA + faB + faCin

  // RS 锁存器状态 (Q, Q_bar)
  const [latchS, setLatchS] = useState(0) // Set
  const [latchR, setLatchR] = useState(0) // Reset
  const [latchQ, setLatchQ] = useState(0) // 存储的记忆值

  const handleLatchTrigger = (s: number, r: number) => {
    setLatchS(s)
    setLatchR(r)
    if (s === 1 && r === 0) setLatchQ(1)
    if (s === 0 && r === 1) setLatchQ(0)
  }

  const isOnePlusOne = haA === 1 && haB === 1

  return (
    <div className="gates-lab">
      {/* 顶部模式切换 tabs */}
      <div className="lab-sub-tabs">
        <button
          type="button"
          className={`sub-tab-btn ${activeTab === 'half' ? 'active' : ''}`}
          onClick={() => setActiveTab('half')}
        >
          ⚡ 半加器（1+1=10 物理生成）
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${activeTab === 'full' ? 'active' : ''}`}
          onClick={() => setActiveTab('full')}
        >
          🔗 全加器（带进位 Cin 级联加法）
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${activeTab === 'latch' ? 'active' : ''}`}
          onClick={() => setActiveTab('latch')}
        >
          💾 RS 锁存器（内存与电荷记忆的诞生）
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          📐 与/或/非/万能与非门 (NAND)
        </button>
      </div>

      {activeTab === 'half' && (
        <div className="tab-pane-content">
          <div className="adder-workbench">
            <div className="adder-inputs-bar">
              <span className="input-title">输入端（点击拨动电平信号）：</span>
              <div className="adder-inputs">
                <button
                  type="button"
                  className={`adder-btn-toggle ${haA === 1 ? 'on' : ''}`}
                  onClick={() => setHaA(haA === 1 ? 0 : 1)}
                >
                  输入 A: <strong>{haA}</strong> ({haA === 1 ? '高电平 5V' : '低电平 0V'})
                </button>
                <span className="math-plus">+</span>
                <button
                  type="button"
                  className={`adder-btn-toggle ${haB === 1 ? 'on' : ''}`}
                  onClick={() => setHaB(haB === 1 ? 0 : 1)}
                >
                  输入 B: <strong>{haB}</strong> ({haB === 1 ? '高电平 5V' : '低电平 0V'})
                </button>
              </div>
            </div>

            {/* 半加器交互电路图 SVG */}
            <div className="circuit-container">
              <svg viewBox="0 0 540 210" className="circuit-svg">
                {/* 导线 A */}
                <line x1="40" y1="55" x2="160" y2="55" stroke={haA === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
                <line x1="100" y1="55" x2="100" y2="145" stroke={haA === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
                <line x1="100" y1="145" x2="160" y2="145" stroke={haA === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />

                {/* 导线 B */}
                <line x1="40" y1="85" x2="160" y2="85" stroke={haB === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
                <line x1="130" y1="85" x2="130" y2="175" stroke={haB === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
                <line x1="130" y1="175" x2="160" y2="175" stroke={haB === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />

                {/* 输入端标记 */}
                <circle cx="40" cy="55" r="7" fill={haA === 1 ? '#7a9e7e' : '#baa794'} />
                <text x="25" y="60" textAnchor="end" fontSize="13" fontWeight="bold" fill="#4a3f35">A ({haA})</text>
                <circle cx="40" cy="85" r="7" fill={haB === 1 ? '#7a9e7e' : '#baa794'} />
                <text x="25" y="90" textAnchor="end" fontSize="13" fontWeight="bold" fill="#4a3f35">B ({haB})</text>

                {/* 异或门 XOR */}
                <rect x="160" y="40" width="130" height="55" rx="8" fill="#fffaf5" stroke="#7a9e7e" strokeWidth="2.5" />
                <text x="225" y="68" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#7a9e7e">异或门 XOR</text>
                <text x="225" y="85" textAnchor="middle" fontSize="9" fill="#8a7e72">本位和 (A ⊕ B)</text>

                {/* 与门 AND */}
                <rect x="160" y="130" width="130" height="55" rx="8" fill="#fffaf5" stroke="#e8a0a0" strokeWidth="2.5" />
                <text x="225" y="158" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#e8918a">与门 AND</text>
                <text x="225" y="175" textAnchor="middle" fontSize="9" fill="#8a7e72">进位 (A & B)</text>

                {/* XOR 输出线 (Sum) */}
                <line x1="290" y1="68" x2="390" y2="68" stroke={haSum === 1 ? '#7a9e7e' : '#d5c4b0'} strokeWidth="4" />
                <circle cx="390" cy="68" r="7" fill={haSum === 1 ? '#7a9e7e' : '#baa794'} />
                <text x="405" y="73" fontSize="14" fontWeight="bold" fill={haSum === 1 ? '#7a9e7e' : '#4a3f35'}>
                  本位和 Sum = {haSum}
                </text>

                {/* AND 输出线 (Carry) */}
                <line x1="290" y1="158" x2="390" y2="158" stroke={haCarry === 1 ? '#e8918a' : '#d5c4b0'} strokeWidth="4" />
                <circle cx="390" cy="158" r="7" fill={haCarry === 1 ? '#e8918a' : '#baa794'} />
                <text x="405" y="163" fontSize="14" fontWeight="bold" fill={haCarry === 1 ? '#e8918a' : '#4a3f35'}>
                  进位 Carry = {haCarry}
                </text>
              </svg>
            </div>

            <div className="adder-result-box">
              <div className="math-row">
                <span className="mono math-eq">
                  十进制：{haA} + {haB} = {haA + haB}
                </span>
                <span className="arrow-sep">➔</span>
                <span className="mono math-binary">
                  二进制输出：[Carry: {haCarry}] [Sum: {haSum}] = <strong>{haCarry}{haSum}</strong>
                </span>
              </div>
              <p className="explain-text">
                看！当 A=1 且 B=1 时，异或门输出 0，与门输出 1，组合就是 <code>10</code>（十进制的 2）！加法不是神秘魔法，就是两条导线分流的物理事实！
              </p>
            </div>

            {isOnePlusOne && !completed && (
              <button type="button" className="btn" onClick={onComplete}>
                我亲眼见证了 1+1=10 的物理诞生！点击通关
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'full' && (
        <div className="tab-pane-content full-adder-content">
          <h4>🔗 全加器（Full Adder）：处理低位进位 Cin 的级联核心</h4>
          <p className="sub-note">
            半加器只能算两个数相加，如果有多位数做长加法，上一位进上来的数（Cin）怎么办？
            <strong>全加器由两个半加器和一个或门组成</strong>，同时吃进 A、B 与 Cin，输出本位和与向高位进位 Cout！
          </p>

          <div className="fa-inputs-panel">
            <button
              type="button"
              className={`adder-btn-toggle ${faA === 1 ? 'on' : ''}`}
              onClick={() => setFaA(faA === 1 ? 0 : 1)}
            >
              本位数 A: {faA}
            </button>
            <button
              type="button"
              className={`adder-btn-toggle ${faB === 1 ? 'on' : ''}`}
              onClick={() => setFaB(faB === 1 ? 0 : 1)}
            >
              本位数 B: {faB}
            </button>
            <button
              type="button"
              className={`adder-btn-toggle ${faCin === 1 ? 'on' : ''}`}
              onClick={() => setFaCin(faCin === 1 ? 0 : 1)}
            >
              低位进位 Cin: {faCin}
            </button>
          </div>

          <div className="fa-calc-card">
            <div className="fa-sum-row mono">
              <span>{faA} + {faB} + {faCin} = {faTotal} (十进制)</span>
              <span>➔ 二进制进位 Cout: <strong>{faCout}</strong>，本位 Sum: <strong>{faSum}</strong> (结果: {faCout}{faSum})</span>
            </div>
            <div className="fa-cascade-tip">
              <strong>架构师洞察：</strong>把 64 个全加器首尾串接，就是 64 位 CPU 的运算核心！但高位必须苦苦等待低位的进位一路“波纹式传递”，这促使计算机科学家发明了<strong>超前进位加法器（Carry-Lookahead Adder）</strong>，通过逻辑公式提前预测进位！
            </div>
          </div>
        </div>
      )}

      {activeTab === 'latch' && (
        <div className="tab-pane-content latch-content">
          <h4>💾 RS 锁存器：电路如何凭空拥有“记忆”（SRAM 缓存）？</h4>
          <p className="sub-note">
            之前的门电路只要输入断电，输出立刻消失。如何把一个 bit 永远留在芯片里？
            <strong>将两个与非门交叉反馈连接！</strong>哪怕控制端恢复为 0，电流在环路中互相支撑，电荷就被“锁”住了！
          </p>

          <div className="latch-workbench">
            <div className="latch-controls">
              <button
                type="button"
                className="btn-tiny"
                onClick={() => handleLatchTrigger(1, 0)}
              >
                1️⃣ 置位 Set (S=1, R=0) ➔ 写入 1
              </button>
              <button
                type="button"
                className="btn-tiny secondary"
                onClick={() => handleLatchTrigger(0, 1)}
              >
                0️⃣ 复位 Reset (S=0, R=1) ➔ 写入 0
              </button>
              <button
                type="button"
                className="btn-tiny secondary"
                onClick={() => handleLatchTrigger(0, 0)}
              >
                🔒 保持 Hold (S=0, R=0) ➔ 记忆锁存不变
              </button>
            </div>

            <div className="latch-state-box">
              <span className="state-label">锁存器内部存储的电荷记忆值 (Q)：</span>
              <span className={`state-val mono ${latchQ === 1 ? 'text-matcha' : 'text-peach'}`}>
                {latchQ}
              </span>
              <span className="state-note">
                当前输入 S={latchS}, R={latchR} ➔ 状态：{latchS === 0 && latchR === 0 ? '🔒 完美锁存记忆中（即使切断输入，Q 依然保持）' : '正在写入新状态'}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'basic' && (
        <div className="tab-pane-content basic-gates-view">
          <div className="gates-grid">
            <div className="gate-card">
              <h5>与门 (AND) · 串联</h5>
              <p>两个开关串联在同一根线上。<strong>都闭合</strong>电流才能穿过。</p>
            </div>

            <div className="gate-card">
              <h5>或门 (OR) · 并联</h5>
              <p>两条支路并联。<strong>任意一条接通</strong>，电流就能通过。</p>
            </div>

            <div className="gate-card">
              <h5>非门 (NOT) · 反相</h5>
              <p>输入为 1 输出为 0；输入为 0 输出为 1。</p>
            </div>

            <div className="gate-card highlight-card">
              <h5>万能与非门 (NAND) · 芯片霸主</h5>
              <p>
                <strong>为什么 NAND 是万能门？</strong>因为只需用 NAND 门，就可以组合出 AND、OR、NOT、XOR 的全部逻辑！台积电光刻机在硅片上蚀刻的最基础单元正是 NAND 晶体管！
              </p>
            </div>
          </div>
        </div>
      )}

      {completed && (
        <div className="pass-banner">
          已通关：你已经彻底掌握了门电路、半加器、全加器进位链与电荷锁存记忆（SRAM）的物理因果规律！
        </div>
      )}
    </div>
  )
}
