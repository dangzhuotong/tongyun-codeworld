import { useEffect, useRef, useState } from 'react'
import { HintBubble } from '../components/HintBubble.tsx'
import { LabCard } from '../components/LabCard.tsx'
import { useProgress } from '../progress/useProgress.ts'
import { SEGMENT_IDS, type SegmentId } from '../progress/types.ts'
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

function isSegmentId(value: string | null): value is SegmentId {
  return value !== null && (SEGMENT_IDS as readonly string[]).includes(value)
}

export function Journey() {
  const { progress, complete, setSwitchPattern, reset, resetCount, completedCount } = useProgress()
  const [activeId, setActiveId] = useState<SegmentId>('switch')
  const [scrollRatio, setScrollRatio] = useState(0)
  const [hintFor, setHintFor] = useState<SegmentId | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const dismissedRef = useRef(new Set<SegmentId>())
  const ratiosRef = useRef(new Map<SegmentId, number>())

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      setScrollRatio(max <= 0 ? 0 : root.scrollTop / max)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const nodes = SEGMENT_IDS.map((id) => document.querySelector(`[data-segment="${id}"]`)).filter(
      (node): node is Element => node !== null,
    )
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-segment')
          if (!isSegmentId(id)) return
          ratiosRef.current.set(id, entry.isIntersecting ? entry.intersectionRatio : 0)
          if (!entry.isIntersecting) dismissedRef.current.delete(id)
        })

        let best: SegmentId | null = null
        let bestRatio = 0
        for (const [id, ratio] of ratiosRef.current) {
          if (ratio > bestRatio) {
            best = id
            bestRatio = ratio
          }
        }
        if (!best || bestRatio <= 0) return
        setActiveId(best)
        if (!dismissedRef.current.has(best)) setHintFor(best)
      },
      { threshold: [0.2, 0.4, 0.6] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [resetCount])

  useEffect(() => {
    if (!hintFor) return
    const id = hintFor
    const timer = window.setTimeout(() => {
      dismissedRef.current.add(id)
      setHintFor((current) => (current === id ? null : current))
    }, 8000)
    return () => window.clearTimeout(timer)
  }, [hintFor])

  const active = SEGMENTS.find((segment) => segment.id === activeId) ?? SEGMENTS[0]
  const activeIndex = active.index

  const dismissHint = () => {
    if (!hintFor) return
    dismissedRef.current.add(hintFor)
    setHintFor(null)
  }

  const confirmAndReset = () => {
    reset()
    dismissedRef.current.clear()
    ratiosRef.current.clear()
    setConfirmReset(false)
    setHintFor(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <div>
            <p className="brand">代码世界 · 架构师之路</p>
            <p className="brand-sub">
              顺着路往下走 · 第 {activeIndex}/8 段 · {active.title}
            </p>
          </div>
          <p className="walked">走过 {completedCount}/8</p>
        </div>
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${Math.round(scrollRatio * 100)}%` }} />
        </div>
        <div className="dots" aria-hidden="true">
          {SEGMENTS.map((segment) => {
            const done = progress.segments[segment.id]?.completed
            const current = segment.id === activeId
            const tone = done ? 'pip done' : current ? 'pip here' : 'pip'
            return <span key={segment.id} className={tone} title={segment.title} />
          })}
        </div>
      </header>

      <main className="road">
        <section className="intro">
          <h1>从物理开关到系统与大模型架构师</h1>
          <p>
            拒绝浮躁与黑盒，这是一条因果相连的连续探索之路：
            从物理电平、算术加法器、CPU指令，到操作系统虚拟内存、六大编程语言架构抉择、高并发分布式防线，再到神经网络与大模型注意力。
            每一段都有第一性原理图解与可动手的实操台。
          </p>
        </section>

        {SEGMENTS.map((segment) => {
          const sign = ROAD_SIGNS.find((item) => item.after === segment.id)
          const done = !!progress.segments[segment.id]?.completed
          return (
            <div key={segment.id}>
              <section className="segment" data-segment={segment.id} id={segment.id}>
                <span className={done ? 'mile done' : 'mile'} aria-hidden="true" />
                {hintFor === segment.id ? <HintBubble text={segment.hint} onClose={dismissHint} /> : null}
                <LabCard index={segment.index} title={segment.title} goal={segment.goal} completed={done}>
                  {segment.id === 'switch' ? (
                    <SwitchLab
                      key={`switch-${resetCount}`}
                      pattern={progress.segments.switch.lastPattern}
                      completed={done}
                      onPatternChange={setSwitchPattern}
                    />
                  ) : null}
                  {segment.id === 'gates' ? (
                    <GatesLab
                      key={`gates-${resetCount}`}
                      completed={done}
                      onComplete={() => complete('gates')}
                    />
                  ) : null}
                  {segment.id === 'cpu' ? (
                    <CpuLab key={`cpu-${resetCount}`} completed={done} onComplete={() => complete('cpu')} />
                  ) : null}
                  {segment.id === 'os' ? (
                    <OsLab key={`os-${resetCount}`} completed={done} onComplete={() => complete('os')} />
                  ) : null}
                  {segment.id === 'languages' ? (
                    <MultiLanguageLab
                      key={`languages-${resetCount}`}
                      completed={done}
                      onComplete={() => complete('languages')}
                    />
                  ) : null}
                  {segment.id === 'arch' ? (
                    <SystemArchLab
                      key={`arch-${resetCount}`}
                      completed={done}
                      onComplete={() => complete('arch')}
                    />
                  ) : null}
                  {segment.id === 'nn' ? (
                    <NnLab key={`nn-${resetCount}`} completed={done} onComplete={() => complete('nn')} />
                  ) : null}
                  {segment.id === 'attn' ? (
                    <AttentionLab
                      key={`attn-${resetCount}`}
                      completed={done}
                      onComplete={() => complete('attn')}
                    />
                  ) : null}
                </LabCard>
              </section>
              {sign ? (
                <aside className="sign">
                  <p className="sign-title">{sign.title}</p>
                  <p>{sign.text}</p>
                </aside>
              ) : null}
            </div>
          )
        })}

        <section className="ending">
          <p>
            {completedCount === 8
              ? '🎉 八大纪元全部走过！从物理开关、算术加法器、CPU指令、操作系统虚拟内存、六大编程语言架构，到高并发分布式防线、神经网络与大模型注意力，你已经打通了完整的架构师心智模型！'
              : `已走过 ${completedCount}/8 段。可以继续往下滚，或随时回头拧开没做完的实验台。`}
          </p>
        </section>
      </main>

      <footer className="footer">
        {confirmReset ? (
          <div className="reset-row">
            <span>清空八大纪元的「走过了」进度？</span>
            <button type="button" className="btn" onClick={confirmAndReset}>
              确定重置
            </button>
            <button type="button" className="btn secondary" onClick={() => setConfirmReset(false)}>
              取消
            </button>
          </div>
        ) : (
          <button type="button" className="btn secondary" onClick={() => setConfirmReset(true)}>
            重置进度
          </button>
        )}
        <p>纯前端静态架构。进度写在这台浏览器的 localStorage 里，无后端无隐私收集。</p>
      </footer>
    </div>
  )
}
