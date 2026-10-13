import type { ReactNode } from 'react'

interface LabCardProps {
  index: number
  title: string
  subtitle?: string
  goal: string
  completed: boolean
  children: ReactNode
}

export function LabCard({ index, title, subtitle, goal, completed, children }: LabCardProps) {
  return (
    <article className="lab-stage">
      <header className="lab-head">
        <div className="lab-head-info">
          <span className="lab-index-pill">第 0{index} 节 · 核心通关实践</span>
          <h2>{title}</h2>
          {subtitle && <p className="lab-subtitle">{subtitle}</p>}
        </div>
        {completed ? (
          <span className="stamp done-stamp">已掌握 ✓</span>
        ) : (
          <span className="stamp learning-stamp">正在学习 ✍️</span>
        )}
      </header>
      <div className="lab-goal-banner">
        <span className="goal-flag">🎯 通关目标：</span>
        <span className="goal-text">{goal}</span>
      </div>
      <div className="lab-workbench-body">
        {children}
      </div>
    </article>
  )
}
