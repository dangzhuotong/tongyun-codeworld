import { useState, type ReactNode } from 'react'

interface LabCardProps {
  index: number
  title: string
  goal: string
  completed: boolean
  children: ReactNode
}

export function LabCard({ index, title, goal, completed, children }: LabCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <article className="lab">
      <header className="lab-head">
        <p className="lab-index">第 {index} 段</p>
        <h2>{title}</h2>
        {completed ? <span className="stamp">走过了</span> : null}
      </header>
      <p className="lab-goal">{goal}</p>
      {open ? (
        <div className="lab-body">
          {children}
          <button type="button" className="btn secondary" onClick={() => setOpen(false)}>
            收起实验台
          </button>
        </div>
      ) : (
        <button type="button" className="btn" onClick={() => setOpen(true)}>
          打开实验台
        </button>
      )}
    </article>
  )
}
