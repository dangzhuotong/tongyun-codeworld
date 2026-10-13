import { useState } from 'react'
import { HintBubble } from '../components/HintBubble.tsx'
import { LabCard } from '../components/LabCard.tsx'
import { useProgress } from '../progress/useProgress.ts'
import { AttentionLab } from '../segments/AttentionLab.tsx'
import { ROAD_SIGNS, SEGMENTS } from '../segments/catalog.ts'
import { CpuLab } from '../segments/CpuLab.tsx'
import { GatesLab } from '../segments/GatesLab.tsx'
import { MultiLanguageLab } from '../segments/MultiLanguageLab.tsx'
import { NnLab } from '../segments/NnLab.tsx'
import { OsLab } from '../segments/OsLab.tsx'
import { SwitchLab } from '../segments/SwitchLab.tsx'
import { SystemArchLab } from '../segments/SystemArchLab.tsx'
import './journey.css'

export function Journey() {
  const { progress, complete, setSwitchPattern, reset, resetCount, completedCount } = useProgress()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const [expandedInterview, setExpandedInterview] = useState<number | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const active = SEGMENTS[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === SEGMENTS.length - 1
  const isCurrentDone = !!progress.segments[active.id]?.completed
  const sign = ROAD_SIGNS.find((item) => item.after === active.id)

  const handleNext = () => {
    if (!isLast) {
      setCurrentStepIndex((prev) => prev + 1)
      setShowHint(true)
      setExpandedInterview(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1)
      setShowHint(true)
      setExpandedInterview(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSelectStep = (index: number) => {
    setCurrentStepIndex(index)
    setShowHint(true)
    setExpandedInterview(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmAndReset = () => {
    reset()
    setConfirmReset(false)
    setCurrentStepIndex(0)
    setShowHint(true)
    setExpandedInterview(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page studio-mode">
      {/* 顶部吸顶状态栏 & 步骤横向导航条 */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-group">
            <h1 className="brand">代码世界 · 架构师进阶录</h1>
            <p className="brand-sub">
              第 0{active.index} 节 · {active.title}
            </p>
          </div>
          <div className="status-badge">
            <span className="walked">已掌握 <strong>{completedCount}</strong>/8 节</span>
            <div className="meter-mini" aria-hidden="true">
              <span style={{ width: `${Math.round((completedCount / 8) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* 八大纪元单步导向轴 (Step Indicator Bar) */}
        <nav className="step-nav-bar" aria-label="课程章节导航">
          {SEGMENTS.map((segment, index) => {
            const isDone = !!progress.segments[segment.id]?.completed
            const isCurrent = index === currentStepIndex
            return (
              <button
                key={segment.id}
                type="button"
                className={`step-nav-pill ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}`}
                onClick={() => handleSelectStep(index)}
                title={`${segment.index}. ${segment.title}`}
              >
                <span className="step-pill-idx">
                  {isDone ? '✓' : `0${segment.index}`}
                </span>
                <span className="step-pill-title">{segment.title.split(' ')[0]}</span>
              </button>
            )
          })}
        </nav>
      </header>

      {/* 中心舞台：当前节专注学习与实操面板 */}
      <main className="stage-container">
        {/* 路过提示短语 */}
        {showHint && (
          <div className="stage-hint-wrap">
            <HintBubble text={active.hint} onClose={() => setShowHint(false)} />
          </div>
        )}

        {/* 核心工作台 */}
        <div className="stage-content">
          <LabCard
            index={active.index}
            title={active.title}
            subtitle={active.subtitle}
            goal={active.goal}
            completed={isCurrentDone}
          >
            {active.id === 'switch' && (
              <SwitchLab
                key={`switch-${resetCount}`}
                pattern={progress.segments.switch.lastPattern}
                completed={isCurrentDone}
                onPatternChange={setSwitchPattern}
              />
            )}
            {active.id === 'gates' && (
              <GatesLab
                key={`gates-${resetCount}`}
                completed={isCurrentDone}
                onComplete={() => complete('gates')}
              />
            )}
            {active.id === 'cpu' && (
              <CpuLab
                key={`cpu-${resetCount}`}
                completed={isCurrentDone}
                onComplete={() => complete('cpu')}
              />
            )}
            {active.id === 'os' && (
              <OsLab
                key={`os-${resetCount}`}
                completed={isCurrentDone}
                onComplete={() => complete('os')}
              />
            )}
            {active.id === 'languages' && (
              <MultiLanguageLab
                key={`languages-${resetCount}`}
                completed={isCurrentDone}
                onComplete={() => complete('languages')}
              />
            )}
            {active.id === 'arch' && (
              <SystemArchLab
                key={`arch-${resetCount}`}
                completed={isCurrentDone}
                onComplete={() => complete('arch')}
              />
            )}
            {active.id === 'nn' && (
              <NnLab
                key={`nn-${resetCount}`}
                completed={isCurrentDone}
                onComplete={() => complete('nn')}
              />
            )}
            {active.id === 'attn' && (
              <AttentionLab
                key={`attn-${resetCount}`}
                completed={isCurrentDone}
                onComplete={() => complete('attn')}
              />
            )}
          </LabCard>

          {/* 面向未来 AI 原生体系映射 */}
          {active.aiMapping && (
            <div className="ai-mapping-banner">
              <div className="ai-mapping-header">
                <span className="ai-badge">🚀 为什么必须懂底层？面向未来 AI 范式映射</span>
              </div>
              <p>{active.aiMapping}</p>
            </div>
          )}

          {/* 大厂高频架构面试题与灵魂拷问 */}
          {active.interviews && active.interviews.length > 0 && (
            <div className="interview-section">
              <div className="interview-section-header">
                <span className="interview-fire-badge">🔥 大厂高频架构面试题与深度追问</span>
                <span className="interview-hint">点击展开查看大厂资深架构师标答推导</span>
              </div>
              <div className="interview-cards-grid">
                {active.interviews.map((item, idx) => {
                  const isExpanded = expandedInterview === idx
                  return (
                    <div key={idx} className={`interview-item-card ${isExpanded ? 'expanded' : ''}`}>
                      <button
                        type="button"
                        className="interview-q-btn"
                        onClick={() => setExpandedInterview(isExpanded ? null : idx)}
                      >
                        <div className="q-left">
                          <span className="q-tag">Q{idx + 1}</span>
                          <span className="q-text">{item.question}</span>
                        </div>
                        <span className="q-toggle-text">{isExpanded ? '收起 ▲' : '查看解析 ▼'}</span>
                      </button>
                      <div className="interview-focus mono">🎯 考察重心：{item.focus}</div>
                      {isExpanded && (
                        <div className="interview-ans-box">
                          <span className="ans-tag">💡 资深架构师推导标答：</span>
                          <p>{item.answer}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 阶段性启示便签 */}
          {sign && (
            <aside className="epoch-sign">
              <span className="sign-badge">💡 架构启示</span>
              <h4>{sign.title}</h4>
              <p>{sign.text}</p>
            </aside>
          )}
        </div>

        {/* 底部前后步进控制条 (Step Footer Bar) */}
        <footer className="step-footer-bar">
          <button
            type="button"
            className="btn secondary"
            disabled={isFirst}
            onClick={handlePrev}
          >
            ◀ 上一节
          </button>

          <div className="step-status-center">
            {isCurrentDone ? (
              <span className="status-text pass">
                ✨ 本节实操已通关！随时可以进入下一节
              </span>
            ) : (
              <span className="status-text pending">
                👉 在上方完成实操目标即可通关本节
              </span>
            )}
          </div>

          {!isLast ? (
            <button
              type="button"
              className={`btn ${isCurrentDone ? 'btn-next-active' : ''}`}
              onClick={handleNext}
            >
              学完这个，进入下一节 ▶
            </button>
          ) : (
            <div className="finish-pill">
              🎉 已登顶第八节架构师闭环！
            </div>
          )}
        </footer>
      </main>

      {/* 极简页脚与重置进度 */}
      <footer className="footer-mini">
        {confirmReset ? (
          <div className="reset-row">
            <span>清空所有 8 节的通关进度？</span>
            <button type="button" className="btn" onClick={confirmAndReset}>
              确定重置
            </button>
            <button type="button" className="btn secondary" onClick={() => setConfirmReset(false)}>
              取消
            </button>
          </div>
        ) : (
          <div className="footer-links">
            <button type="button" className="btn-link" onClick={() => setConfirmReset(true)}>
              重置学习进度
            </button>
            <span>·</span>
            <span>纯前端单页架构 · 本地自动记忆</span>
          </div>
        )}
      </footer>
    </div>
  )
}
