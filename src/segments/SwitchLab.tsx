const TARGET = '101'

interface SwitchLabProps {
  pattern: string
  completed: boolean
  onPatternChange: (pattern: string) => void
}

export function SwitchLab({ pattern, completed, onPatternChange }: SwitchLabProps) {
  const bits = pattern.padEnd(3, '0').slice(0, 3).split('')

  const toggle = (index: number) => {
    const next = bits.map((bit, i) => (i === index ? (bit === '1' ? '0' : '1') : bit)).join('')
    onPatternChange(next)
  }

  return (
    <div className="switch-lab">
      <div className="bit-row">
        {bits.map((bit, index) => {
          const on = bit === '1'
          return (
            <div className="bit" key={index}>
              <span className={on ? 'bulb on' : 'bulb'} aria-hidden="true">
                <svg viewBox="0 0 32 40" width="32" height="40">
                  <circle cx="16" cy="14" r="10" />
                  <rect x="12" y="24" width="8" height="6" rx="1.5" />
                  <rect x="13" y="31" width="6" height="3" rx="1" />
                </svg>
              </span>
              <button
                type="button"
                className={on ? 'toggle on' : 'toggle'}
                aria-pressed={on}
                aria-label={`第 ${index + 1} 个开关，当前${on ? '开' : '关'}`}
                onClick={() => toggle(index)}
              >
                <span className="toggle-knob" />
              </button>
              <span className="mono bit-char">{bit}</span>
            </div>
          )
        })}
      </div>
      <p className="mono pattern" aria-live="polite">
        {bits.join(' ')}
      </p>
      <p className="lab-note">目标 {TARGET}。点开关就会变，不用提交。</p>
      {pattern === TARGET ? (
        <p className="pass" role="status">
          通过了。通是 1，断是 0，这串灯现在是 {TARGET}。
        </p>
      ) : completed ? (
        <p className="pass" role="status">
          这段已经走过了。灯可以再拧回别的图案。
        </p>
      ) : null}
    </div>
  )
}
