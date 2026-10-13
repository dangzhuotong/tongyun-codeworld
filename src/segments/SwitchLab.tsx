import { useState } from 'react'

const TARGET_CHAR = 'A' // ASCII 65: 01000001
const TARGET_BITS = '01000001'

interface SwitchLabProps {
  pattern: string
  completed: boolean
  onPatternChange: (pattern: string) => void
}

export function SwitchLab({ pattern, completed, onPatternChange }: SwitchLabProps) {
  const [subTab, setSubTab] = useState<'ascii' | 'twos' | 'float'>('ascii')
  const [floatInput, setFloatInput] = useState<number>(0.1)

  // 保证 8 位长度
  const bits = (pattern || '00000000').padEnd(8, '0').slice(0, 8).split('')

  const toggle = (index: number) => {
    const next = bits.map((b, i) => (i === index ? (b === '1' ? '0' : '1') : b)).join('')
    onPatternChange(next)
  }

  // 无符号十进制
  const unsignedVal = parseInt(bits.join(''), 2)
  // 有符号补码十进制 (8位: -128 ~ 127)
  const signedVal = bits[0] === '1' ? unsignedVal - 256 : unsignedVal
  const hexValue = '0x' + unsignedVal.toString(16).toUpperCase().padStart(2, '0')
  const asciiChar =
    unsignedVal >= 32 && unsignedVal <= 126
      ? String.fromCharCode(unsignedVal)
      : unsignedVal === 0
      ? '(NUL/空)'
      : '(控制字符)'

  const isMatched = bits.join('') === TARGET_BITS

  // 浮点数 IEEE 754 单精度模拟拆解
  const getFloatBreakdown = (num: number) => {
    const buf = new ArrayBuffer(4)
    const view = new DataView(buf)
    view.setFloat32(0, num)
    const uint = view.getUint32(0)
    const binStr = uint.toString(2).padStart(32, '0')
    const sign = binStr[0]
    const exp = binStr.slice(1, 9)
    const frac = binStr.slice(9)
    const expVal = parseInt(exp, 2) - 127
    return { sign, exp, frac, expVal, binStr }
  }

  const floatBreakdown = getFloatBreakdown(floatInput)

  return (
    <div className="switch-lab">
      {/* 顶部实操模式子标签 */}
      <div className="lab-sub-tabs">
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'ascii' ? 'active' : ''}`}
          onClick={() => setSubTab('ascii')}
        >
          🎛️ 8位字节与ASCII拼字台
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'twos' ? 'active' : ''}`}
          onClick={() => setSubTab('twos')}
        >
          ➕ 原码与补码（负数怎么表示）
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'float' ? 'active' : ''}`}
          onClick={() => setSubTab('float')}
        >
          🔬 IEEE 754 浮点数二进制拆解 (0.1+0.2!=0.3)
        </button>
      </div>

      {subTab === 'ascii' && (
        <div className="tab-pane-content">
          {/* 第一性原理图解 */}
          <div className="principle-box">
            <div className="principle-header">
              <span className="principle-badge">第一性原理：从电压到逻辑</span>
              <h4>为什么电压通断能变成字符？</h4>
            </div>
            <div className="principle-content">
              <svg viewBox="0 0 540 100" className="principle-svg" aria-label="晶体管闸门示意图">
                <rect x="15" y="15" width="110" height="70" rx="8" fill="#fcf4ec" stroke="#e5d4c0" strokeWidth="2" />
                <text x="70" y="40" textAnchor="middle" fontSize="12" fill="#4a3f35" fontWeight="bold">高电平 (5V/3.3V)</text>
                <text x="70" y="68" textAnchor="middle" fontSize="16" fill="#7a9e7e" fontWeight="bold">导通 = 1</text>

                <path d="M 130 50 L 165 50" stroke="#7a9e7e" strokeWidth="2.5" markerEnd="url(#arrow)" />

                <rect x="175" y="10" width="190" height="80" rx="10" fill="#fffaf5" stroke="#7a9e7e" strokeWidth="2" />
                <text x="270" y="32" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#7a9e7e">MOSFET 晶体管闸门</text>
                <line x1="215" y1="55" x2="325" y2="55" stroke="#7a9e7e" strokeWidth="4" />
                <text x="270" y="75" textAnchor="middle" fontSize="10" fill="#8a7e72">电荷流动无阻碍</text>

                <path d="M 370 50 L 405 50" stroke="#7a9e7e" strokeWidth="2.5" />

                <rect x="415" y="15" width="110" height="70" rx="8" fill="#fcf4ec" stroke="#e5d4c0" strokeWidth="2" />
                <text x="470" y="40" textAnchor="middle" fontSize="12" fill="#4a3f35" fontWeight="bold">低电平 (0V)</text>
                <text x="470" y="68" textAnchor="middle" fontSize="16" fill="#e8918a" fontWeight="bold">截止 = 0</text>
              </svg>
              <p className="principle-desc">
                计算机没有大脑，只有数十亿个微型“电控水龙头”（MOSFET 晶体管）。高电平通过记为 1，断开记为 0。并排 8 根导线，就能拼出 256 种组合！
              </p>
            </div>
          </div>

          {/* 8位交互开关面板 */}
          <div className="byte-board">
            <div className="byte-header">
              <span>8 个物理开关（1 个字节 / 8 Bits）：</span>
              <span className="mono target-hint">目标拼出大写字母：<strong>'{TARGET_CHAR}'</strong></span>
            </div>

            <div className="bit-row-8">
              {bits.map((bit, index) => {
                const on = bit === '1'
                const weight = Math.pow(2, 7 - index)
                return (
                  <div className="bit-col" key={index}>
                    <span className="bit-weight mono">2^{7 - index}</span>
                    <span className="bit-weight-val mono">({weight})</span>
                    <span className={on ? 'bulb on' : 'bulb'} aria-hidden="true">
                      <svg viewBox="0 0 32 40" width="28" height="34">
                        <circle cx="16" cy="14" r="10" />
                        <rect x="12" y="24" width="8" height="6" rx="1.5" />
                        <rect x="13" y="31" width="6" height="3" rx="1" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      className={on ? 'toggle on' : 'toggle'}
                      aria-pressed={on}
                      onClick={() => toggle(index)}
                      title={`第 ${8 - index} 位，权重 ${weight}`}
                    >
                      <span className="toggle-knob" />
                    </button>
                    <span className="mono bit-val">{bit}</span>
                  </div>
                )
              })}
            </div>

            {/* 实时翻译显示屏 */}
            <div className="conversion-display">
              <div className="display-card">
                <span className="display-label">二进制串 (Binary)</span>
                <span className="display-val mono">{bits.slice(0, 4).join('')} {bits.slice(4).join('')}</span>
              </div>
              <div className="display-card">
                <span className="display-label">无符号十进制 (0~255)</span>
                <span className="display-val mono">{unsignedVal}</span>
              </div>
              <div className="display-card">
                <span className="display-label">十六进制 (Hex)</span>
                <span className="display-val mono">{hexValue}</span>
              </div>
              <div className="display-card highlight">
                <span className="display-label">人类 ASCII 字符</span>
                <span className="display-val mono char-highlight">{asciiChar}</span>
              </div>
            </div>

            <div className="lab-controls">
              <button
                type="button"
                className="btn-tiny"
                onClick={() => onPatternChange('01000001')}
              >
                一键拼出 'A' (十进制 65)
              </button>
              <button
                type="button"
                className="btn-tiny"
                onClick={() => onPatternChange('01000010')}
              >
                一键拼出 'B' (十进制 66)
              </button>
              <button
                type="button"
                className="btn-tiny secondary"
                onClick={() => onPatternChange('00000000')}
              >
                全归零 (0)
              </button>
              <button
                type="button"
                className="btn-tiny secondary"
                onClick={() => onPatternChange('11111111')}
              >
                全置一 (255)
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'twos' && (
        <div className="tab-pane-content twos-content">
          <h4>🧮 补码的秘密：为什么计算机把减法变成加法？</h4>
          <p className="sub-note">
            如果用最高位表示正负号（原码），会有 <code>+0 (00000000)</code> 和 <code>-0 (10000000)</code> 两个零，且硬件必须额外造减法器！
            <strong>补码（Two's Complement）</strong>把最高位的权重设为负数（$-2^7 = -128$），不仅消除了负零，还能直接用加法器做减法！
          </p>

          <div className="twos-display-card">
            <div className="twos-row">
              <span>当前 8 位比特：<code className="mono">{bits.join('')}</code></span>
              <span>最高位符号位 (Sign Bit)：<strong className={bits[0] === '1' ? 'text-peach' : 'text-matcha'}>{bits[0]} ({bits[0] === '1' ? '负数' : '正数'})</strong></span>
            </div>
            <div className="twos-result-box">
              <div className="result-col">
                <span className="label">作为无符号整数（Unsigned）：</span>
                <span className="val mono">{unsignedVal}</span>
              </div>
              <div className="result-col highlight">
                <span className="label">作为有符号补码整数（Signed int8）：</span>
                <span className="val mono">{signedVal}</span>
              </div>
            </div>
          </div>

          <div className="twos-tips-grid">
            <div className="tip-box">
              <strong>127 的二进制：</strong>
              <code>01111111</code> (最大正整数)
            </div>
            <div className="tip-box">
              <strong>-1 的二进制：</strong>
              <code>11111111</code> (全 1 代表 -1)
            </div>
            <div className="tip-box">
              <strong>-128 的二进制：</strong>
              <code>10000000</code> (最小负整数，无对应正数)
            </div>
          </div>
        </div>
      )}

      {subTab === 'float' && (
        <div className="tab-pane-content float-content">
          <h4>🔬 IEEE 754 单精度浮点数二进制拆解</h4>
          <p className="sub-note">
            为什么计算机算 <code>0.1 + 0.2 = 0.30000000000000004</code>？因为 0.1 转换为二进制是无限循环小数，有限 32/64 位截断带来了无法消除的微小精度损失！
          </p>

          <div className="float-input-bar">
            <label htmlFor="float-val">输入浮点数观察底层二进制结构：</label>
            <input
              id="float-val"
              type="number"
              step="0.05"
              value={floatInput}
              onChange={(e) => setFloatInput(parseFloat(e.target.value) || 0)}
              className="float-num-input"
            />
            <div className="float-quick-btns">
              <button type="button" className="btn-tiny" onClick={() => setFloatInput(0.1)}>0.1</button>
              <button type="button" className="btn-tiny" onClick={() => setFloatInput(0.2)}>0.2</button>
              <button type="button" className="btn-tiny" onClick={() => setFloatInput(0.3)}>0.3</button>
              <button type="button" className="btn-tiny" onClick={() => setFloatInput(1.0)}>1.0</button>
            </div>
          </div>

          <div className="ieee-visualizer">
            <div className="ieee-part sign-part">
              <span className="part-title">符号位 S (1 bit)</span>
              <span className="part-code mono">{floatBreakdown.sign}</span>
              <span className="part-desc">{floatBreakdown.sign === '0' ? '+ 正数' : '- 负数'}</span>
            </div>
            <div className="ieee-part exp-part">
              <span className="part-title">阶码 E (8 bits, 偏置127)</span>
              <span className="part-code mono">{floatBreakdown.exp}</span>
              <span className="part-desc">指数: 2^{floatBreakdown.expVal}</span>
            </div>
            <div className="ieee-part frac-part">
              <span className="part-title">尾数 M (23 bits 精度)</span>
              <span className="part-code mono">{floatBreakdown.frac}</span>
              <span className="part-desc">二进制小数部分</span>
            </div>
          </div>

          <div className="float-conclusion">
            <span className="mono">
              32位内存机器码：{floatBreakdown.binStr.slice(0, 8)} {floatBreakdown.binStr.slice(8, 16)} {floatBreakdown.binStr.slice(16, 24)} {floatBreakdown.binStr.slice(24)}
            </span>
            <p>
              看到尾数部分那长串重复数字了吗？十进制的 0.1 在二进制世界里就像十进制的 1/3 (0.3333...) 一样无法整除！所以在涉及货币交易的系统里，严禁直接使用 <code>float/double</code>，必须使用定点数或字符串 BigDecimal！
            </p>
          </div>
        </div>
      )}

      {isMatched ? (
        <div className="pass-banner" role="status">
          <strong>通关达成！</strong> 你用 8 个物理开关完美表示出了大写字母 <code>'A'</code> (十进制 65, 二进制 01000001)。你已经彻底跨过了“从连续电压到离散数字符号”的物理大关！
        </div>
      ) : completed ? (
        <div className="pass-banner light" role="status">
          本节已通关。你可以继续自由拨动开关，观察不同数字与字母的转换！
        </div>
      ) : null}
    </div>
  )
}
