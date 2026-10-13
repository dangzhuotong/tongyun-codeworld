import { useEffect, useRef, useState } from 'react'
import { HintBubble } from '../components/HintBubble.tsx'
import { LabCard } from '../components/LabCard.tsx'
import { useProgress } from '../progress/useProgress.ts'
import { SEGMENT_IDS, type SegmentId } from '../progress/types.ts'
import { AttentionLab } from '../segments/AttentionLab.tsx'
import { ROAD_SIGNS, SEGMENTS } from '../segments/catalog.ts'
import { CpuLab } from '../segments/CpuLab.tsx'
import { GatesLab } from '../segments/GatesLab.tsx'
import { NnLab } from '../segments/NnLab.tsx'
import { SwitchLab } from '../segments/SwitchLab.tsx'
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
      { threshold: [0.3, 0.5, 0.7] },
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
            <p className="brand">代码世界</p>
            <p className="brand-sub">
              顺着路往下走 · 第 {activeIndex}/5 段 · {active.title}
            </p>
          </div>
          <p className="walked">走过 {completedCount}/5</p>
        </div>
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${Math.round(scrollRatio * 100)}%` }} />
        </div>
        <div className="dots" aria-hidden="true">
          {SEGMENTS.map((segment) => {
            const done = progress.segments[segment.id].completed
            const current = segment.id === activeId
            const tone = done ? 'pip done' : current ? 'pip here' : 'pip'
            return <span key={segment.id} className={tone} />
          })}
        </div>
      </header>

      <main className="road">
        <section className="intro">
          <h1>从开关走到注意力</h1>
          <p>路过会冒出一句短话。想动手，再打开路边的实验台。没做完也能继续往下滚。</p>
        </section>

        {SEGMENTS.map((segment) => {
          const sign = ROAD_SIGNS.find((item) => item.after === segment.id)
          const done = progress.segments[segment.id].completed
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
            {completedCount === 5
              ? '五段都走过了。开关、门、指令、权重、注意力，进度留在这台设备上。'
              : '五段先铺到这里。可以回头再拧没做完的实验台。'}
          </p>
        </section>
      </main>

      <footer className="footer">
        {confirmReset ? (
          <div className="reset-row">
            <span>清空五段的「走过了」？</span>
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
        <p>纯前端。进度只写在这台浏览器的 localStorage 里。</p>
      </footer>
    </div>
  )
}
