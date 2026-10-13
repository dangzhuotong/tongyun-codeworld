import { useEffect, useRef, useState } from 'react'

const GATES = ['AND', 'OR', 'NOT'] as const
type Gate = (typeof GATES)[number]

interface GatesLabProps {
  completed: boolean
  onComplete: () => void
}

function evalGate(gate: Gate, a: boolean, b: boolean): boolean {
  if (gate === 'AND') return a && b
  if (gate === 'OR') return a || b
  return !a
}

export function GatesLab({ completed, onComplete }: GatesLabProps) {
  const [gate, setGate] = useState<Gate>('OR')
  const [a, setA] = useState(false)
  const [b, setB] = useState(false)
  const open = evalGate(gate, a, b)
  const solved = gate === 'AND' && a && b
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    if (solved) onCompleteRef.current()
  }, [solved])

  let feedback = '锁还关着。换一种门，或拧拧钥匙。'
  if (solved) feedback = '对了。两把钥匙都在，AND 才肯开锁。'
  else if (open) feedback = '锁开了，但这条规则不是「两把都要」。试试都开才亮的那种。'

  return (
    <div className="gates-lab">
      <div className="gate-picks" role="group" aria-label="选择逻辑门">
        {GATES.map((item) => (
          <button
            key={item}
            type="button"
            className={item === gate ? 'chip on' : 'chip'}
            aria-pressed={item === gate}
            onClick={() => setGate(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="lab-note">
        {gate === 'AND' ? 'AND：都开才亮。' : null}
        {gate === 'OR' ? 'OR：有一个开就亮。' : null}
        {gate === 'NOT' ? 'NOT：只看钥匙 A，把它反过来。' : null}
      </p>
      <div className="key-row">
        <KeyButton label="钥匙 A" on={a} onClick={() => setA((value) => !value)} />
        <KeyButton
          label="钥匙 B"
          on={b}
          disabled={gate === 'NOT'}
          onClick={() => setB((value) => !value)}
        />
        <div className={open ? 'lock open' : 'lock'} aria-hidden="true">
          <svg viewBox="0 0 48 48" width="48" height="48">
            <path
              d={open ? 'M16 22 V14 a8 8 0 0 1 16 0' : 'M16 22 V16 a8 8 0 0 1 16 0 V22'}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="12" y="22" width="24" height="18" rx="4" fill="currentColor" />
          </svg>
          <span>{open ? '开' : '关'}</span>
        </div>
      </div>
      <p className={solved || completed ? 'pass' : 'lab-note'} role="status">
        {completed && !solved ? '这段已经走过了。还可以再换门看看。' : feedback}
      </p>
    </div>
  )
}

function KeyButton({
  label,
  on,
  disabled,
  onClick,
}: {
  label: string
  on: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={on ? 'key on' : 'key'}
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
    >
      <span>{label}</span>
      <strong>{on ? '开' : '关'}</strong>
    </button>
  )
}
