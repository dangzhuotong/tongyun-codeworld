import { useState } from 'react'

const TARGET_CHAR = 'A' // ASCII 65: 01000001
const TARGET_BITS = '01000001'

interface SwitchLabProps {
  pattern: string
  completed: boolean
  onPatternChange: (pattern: string) => void
}

export function SwitchLab({ pattern, completed, onPatternChange }: SwitchLabProps) {
  const [showPrinciple, setShowPrinciple] = useState(false)

  // 保证 8 位长度
  const bits = (pattern || '00000000').padEnd(8, '0').slice(0, 8).split('')

  const toggle = (index: number) => {
    const next = bits.map((b, i) => (i === index ? (b === '1' ? '0' : '1') : b)).join('')
    onPatternChange(next)
  }

  const decimalValue = parseInt(bits.join(''), 2)
  const hexValue = '0x' + decimalValue.toString(16).toUpperCase().padStart(2, '0')
  const asciiChar =
    decimalValue >= 32 && decimalValue <= 126
      ? String.fromCharCode(decimalValue)
      : decimalValue === 0
      ? '(空/NUL)'
      : '(控制字符)'

  const isMatched = bits.join('') === TARGET_BITS

  return (
    <div className="switch-lab">
      {/* 第一性原理图解抽屉 */}
      <div className="principle-box">
        <div className="principle-header">
          <span className="principle-badge">第一性原理图解</span>
          <h4>为什么“通电”就能变成“数字”？</h4>
          <button
            type="button"
            className="principle-toggle-btn"
            onClick={() => setShowPrinciple(!showPrinciple)}
          >
            {showPrinciple ? '收起图解' : '查看物理水龙头模型'}
          </button>
        </div>

        {showPrinciple && (
          <div className="principle-content">
            <svg viewBox="0 0 520 130" className="principle-svg" aria-label="MOSFET晶体管闸门示意图">
              <rect x="10" y="20" width="100" height="90" rx="8" fill="#fcf4ec" stroke="#e5d4c0" strokeWidth="2" />
              <text x="60" y="45" textAnchor="middle" fontSize="13" fill="#4a3f35" fontWeight="bold">高电平 (5V)</text>
              <text x="60" y="70" textAnchor="middle" fontSize="11" fill="#8a7e72">控制闸门开启</text>
              <text x="60" y="95" textAnchor="middle" fontSize="18" fill="#7a9e7e" fontWeight="bold">导通 = 1</text>

              <path d="M 115 65 L 145 65" stroke="#7a9e7e" strokeWidth="3" markerEnd="url(#arrow)" />

              <rect x="155" y="15" width="200" height="100" rx="10" fill="#fffaf5" stroke="#7a9e7e" strokeWidth="2" />
              <text x="255" y="38" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#7a9e7e">MOSFET 晶体管像电控水龙头</text>
              <circle cx="210" cy="70" r="14" fill="#7a9e7e" opacity="0.2" />
              <text x="210" y="75" textAnchor="middle" fontSize="12" fill="#7a9e7e">G栅极</text>
              <line x1="230" y1="70" x2="280" y2="70" stroke="#7a9e7e" strokeWidth="4" />
              <text x="255" y="95" textAnchor="middle" fontSize="11" fill="#8a7e72">电荷流动无阻碍</text>

              <path d="M 360 65 L 390 65" stroke="#7a9e7e" strokeWidth="3" />

              <rect x="395" y="20" width="115" height="90" rx="8" fill="#fcf4ec" stroke="#e5d4c0" strokeWidth="2" />
              <text x="452" y="45" textAnchor="middle" fontSize="13" fill="#4a3f35" fontWeight="bold">低电平 (0V)</text>
              <text x="452" y="70" textAnchor="middle" fontSize="11" fill="#8a7e72">控制闸门关闭</text>
              <text x="452" y="95" textAnchor="middle" fontSize="18" fill="#e8918a" fontWeight="bold">截止 = 0</text>
            </svg>
            <p className="principle-desc">
              <strong>直觉</strong>：芯片内部没有魔法数字，只有几十亿个微型“水龙头”（晶体管）。当电压高于阈值，电流通过，被人类逻辑记为 <strong>1</strong>；没有电流则为 <strong>0</strong>。8个并排的水龙头，就是一个字节（Byte）！
            </p>
          </div>
        )}
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
            // 权值：128, 64, 32, 16, 8, 4, 2, 1
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
            <span className="display-label">二进制 (Binary)</span>
            <span className="display-val mono">{bits.slice(0, 4).join('')} {bits.slice(4).join('')}</span>
          </div>
          <div className="display-card">
            <span className="display-label">十进制数值 (Decimal)</span>
            <span className="display-val mono">{decimalValue}</span>
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
            一键设置 'A' (65)
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

      {isMatched ? (
        <div className="pass-banner" role="status">
          <strong>通关达成！</strong> 你用 8 个物理开关的通断组合，完美表示出了人类语言的大写字母 <code>'A'</code> (十进制 65, 二进制 01000001)。计算机世界的信息基石，就此奠定！
        </div>
      ) : completed ? (
        <div className="pass-banner light" role="status">
          此段已通关。你可以继续随意拨动开关，观察不同数字与字母的转换！
        </div>
      ) : null}
    </div>
  )
}
