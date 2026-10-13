import { useState } from 'react'

const TOKENS = ['小明', '把', '红色', '的', '苹果', '递给', '妹妹'] as const

const GLANCES: { weights: number[]; note: string }[] = [
  {
    weights: [1, 0, 0, 0, 0, 0, 0],
    note: '你看，它几乎只看着「小明」自己，上文还没展开。',
  },
  {
    weights: [0.55, 0.25, 0.08, 0.04, 0.04, 0.02, 0.02],
    note: '你看，它在看「小明」——「把」要接住是谁在递。',
  },
  {
    weights: [0.12, 0.1, 0.62, 0.06, 0.06, 0.02, 0.02],
    note: '你看，它主要盯着「红色」这个词本身。',
  },
  {
    weights: [0.08, 0.06, 0.46, 0.22, 0.1, 0.04, 0.04],
    note: '你看，它在看「红色」，「的」是贴在颜色后面的。',
  },
  {
    weights: [0.06, 0.08, 0.4, 0.1, 0.28, 0.04, 0.04],
    note: '你看，它在看「红色」——这只苹果是红的。',
  },
  {
    weights: [0.22, 0.06, 0.08, 0.04, 0.36, 0.18, 0.06],
    note: '你看，它在看「苹果」和「小明」：谁把东西递出去。',
  },
  {
    weights: [0.16, 0.05, 0.06, 0.04, 0.24, 0.3, 0.15],
    note: '你看，它在看「递给」和「苹果」：东西到了妹妹手里。',
  },
]

interface AttentionLabProps {
  completed: boolean
  onComplete: () => void
}

export function AttentionLab({ completed, onComplete }: AttentionLabProps) {
  const [picked, setPicked] = useState<number[]>([])
  const [focus, setFocus] = useState<number | null>(null)
  const glance = focus === null ? null : GLANCES[focus]
  const ready = picked.length >= 2

  const choose = (index: number) => {
    setFocus(index)
    setPicked((prev) => (prev.includes(index) ? prev : [...prev, index]))
  }

  return (
    <div className="attn-lab">
      <p className="sentence">小明把红色的苹果递给妹妹</p>
      <div className="tokens" role="group" aria-label="Token">
        {TOKENS.map((token, index) => {
          const weight = glance?.weights[index] ?? 0
          return (
            <button
              key={token}
              type="button"
              className={index === focus ? 'token current' : 'token'}
              style={{ ['--w' as string]: String(weight) }}
              aria-pressed={index === focus}
              onClick={() => choose(index)}
            >
              {token}
            </button>
          )
        })}
      </div>
      {glance ? (
        <div>
          <ul className="bars">
            {TOKENS.map((token, index) => (
              <li key={token}>
                <span>{token}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${glance.weights[index] * 100}%` }} />
                </span>
                <span className="mono bar-num">{glance.weights[index].toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="lab-note" role="status">
            {glance.note}
          </p>
        </div>
      ) : (
        <p className="lab-note">点一个 Token，看生成这个位置时，它更盯着谁。</p>
      )}
      <p className="lab-note">已看过 {picked.length} 个位置。换两个不同的位置，高亮会变。</p>
      <button
        type="button"
        className="btn"
        disabled={!ready}
        onClick={() => {
          if (picked.length >= 2) onComplete()
        }}
      >
        继续走
      </button>
      {completed ? (
        <p className="pass" role="status">
          通过了。没有真的跑模型，但这就是注意力在做的事：这个位置，更看上下文里的谁。
        </p>
      ) : null}
    </div>
  )
}
