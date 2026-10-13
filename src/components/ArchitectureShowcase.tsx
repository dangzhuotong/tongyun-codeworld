import { useMemo, useState } from 'react'
import {
  ARCHITECTURE_CASES,
  type ArchitectureCase,
} from '../data/architectureCasesData.ts'
import { MAP_NODES } from '../data/knowledgeMapData.ts'
import './architectureShowcase.css'

interface ArchitectureShowcaseProps {
  selectedArchId?: string
  onSelectArchCase: (archId: string) => void
  onJumpToKnowledgeNode: (nodeId: string) => void
}

export function ArchitectureShowcase({
  selectedArchId,
  onSelectArchCase,
  onJumpToKnowledgeNode,
}: ArchitectureShowcaseProps) {
  // 当前选中的架构案例
  const activeCase: ArchitectureCase = useMemo(() => {
    return (
      ARCHITECTURE_CASES.find((c) => c.id === selectedArchId) ||
      ARCHITECTURE_CASES[0]
    )
  }, [selectedArchId])

  // 当前激活的数据流步骤 (1 ~ coreFlow.length)
  const [activeStepNum, setActiveStepNum] = useState<number>(1)
  const [copiedInsight, setCopiedInsight] = useState(false)

  // 依赖的技术知识点映射
  const relatedNodes = useMemo(() => {
    return activeCase.relatedNodeIds.map((id) => {
      const node = MAP_NODES.find((n) => n.id === id)
      return { id, title: node ? node.title : id, tag: node ? node.tag : '技术节点' }
    })
  }, [activeCase])

  const currentStep = activeCase.coreFlow.find((s) => s.step === activeStepNum) || activeCase.coreFlow[0]

  const handleCopyInterview = () => {
    navigator.clipboard?.writeText(activeCase.interviewInsight)
    setCopiedInsight(true)
    setTimeout(() => setCopiedInsight(false), 2000)
  }

  return (
    <div className="arch-showcase-container">
      {/* 顶部架构案例横向选择条 */}
      <div className="arch-case-nav">
        {ARCHITECTURE_CASES.map((item) => {
          const isActive = item.id === activeCase.id
          return (
            <button
              key={item.id}
              type="button"
              className={`case-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectArchCase(item.id)
                setActiveStepNum(1)
              }}
            >
              <span className="case-icon">{item.icon}</span>
              <div className="case-nav-meta">
                <span className="case-nav-title">{item.title.split('系统')[0]}</span>
                <span className="case-nav-cat">{item.category}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* 核心案例全景看板 */}
      <div className="case-board">
        {/* 1. 案例概览头图 */}
        <div className="case-header-card">
          <div className="case-header-top">
            <div className="case-title-group">
              <span className="case-badge">{activeCase.category}</span>
              <h2 className="case-main-title">
                {activeCase.icon} {activeCase.title}
              </h2>
              <p className="case-sub-title">{activeCase.subtitle}</p>
            </div>
            <div className="case-metrics-badges">
              <div className="metric-box">
                <span className="metric-lbl">流量规模</span>
                <span className="metric-val">{activeCase.trafficScale}</span>
              </div>
              <div className="metric-box">
                <span className="metric-lbl">延迟目标</span>
                <span className="metric-val accent">{activeCase.latencyGoal}</span>
              </div>
            </div>
          </div>

          <div className="case-scenario-box">
            <span className="scenario-label">🎯 典型业务落地场景：</span>
            <span className="scenario-desc">{activeCase.businessScenario}</span>
          </div>

          {/* 关联技术图谱节点超链接 */}
          <div className="case-tech-links">
            <span className="tech-links-lbl">🗺️ 本架构依赖的底层知识图谱：</span>
            <div className="tech-pills">
              {relatedNodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="tech-node-pill"
                  onClick={() => onJumpToKnowledgeNode(n.id)}
                  title="点击跳转至知识图谱查看教学文档"
                >
                  <span className="pill-dot" />
                  <span className="pill-text">{n.title}</span>
                  <span className="pill-jump">↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 交互式端到端请求流转模拟器 (Interactive Request Flow) */}
        <div className="case-section-card">
          <div className="card-header-row">
            <div className="card-header-left">
              <span className="sec-icon">⚡</span>
              <h3 className="card-sec-title">核心端到端数据流转与执行时序</h3>
            </div>
            <span className="stepper-hint">点击步骤查看请求如何在各层流转</span>
          </div>

          <div className="flow-stepper-bar">
            {activeCase.coreFlow.map((step) => {
              const isStepActive = step.step === activeStepNum
              return (
                <button
                  key={step.step}
                  type="button"
                  className={`flow-step-btn ${isStepActive ? 'step-current' : ''}`}
                  onClick={() => setActiveStepNum(step.step)}
                >
                  <span className="step-num">Step {step.step}</span>
                  <span className="step-title">{step.title}</span>
                </button>
              )
            })}
          </div>

          {/* 选中的步骤流转卡片 */}
          <div className="flow-step-detail-card">
            <div className="step-detail-header">
              <div className="step-left">
                <span className="step-badge">第 0{currentStep.step} 步</span>
                <h4 className="step-detail-title">{currentStep.title}</h4>
              </div>
              <div className="step-comp-badge">
                <span className="comp-lbl">承载组件：</span>
                <span className="comp-name">{currentStep.component}</span>
              </div>
            </div>
            <div className="step-action-row">
              <span className="action-tag">触发动作</span>
              <span className="action-text">{currentStep.action}</span>
            </div>
            <p className="step-detail-desc">{currentStep.detail}</p>
          </div>
        </div>

        {/* 3. 六层架构分层职责图解 (Architectural Layers) */}
        <div className="case-section-card">
          <div className="card-header-row">
            <div className="card-header-left">
              <span className="sec-icon">🏢</span>
              <h3 className="card-sec-title">工业级完整分层架构图谱</h3>
            </div>
            <span className="layers-count">共 {activeCase.layers.length} 层防线</span>
          </div>

          <div className="layers-stack">
            {activeCase.layers.map((layer, index) => (
              <div key={index} className="layer-row-card">
                <div className="layer-level">
                  <span className="level-num">L{index + 1}</span>
                  <span className="level-name">{layer.name}</span>
                </div>
                <div className="layer-tech-box">
                  <span className="tech-badge">{layer.tech}</span>
                </div>
                <div className="layer-responsibility">
                  {layer.responsibility}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 架构技术挑战与优雅解法对比 (Challenges vs Solutions) */}
        <div className="case-section-card">
          <div className="card-header-row">
            <div className="card-header-left">
              <span className="sec-icon">⚔️</span>
              <h3 className="card-sec-title">实战架构技术攻防与方案对比</h3>
            </div>
            <span className="stepper-hint">常见踩坑 Bad Approach vs 资深架构师 Elegance</span>
          </div>

          <div className="challenges-grid">
            {activeCase.challenges.map((c, idx) => (
              <div key={idx} className="challenge-item-card">
                <div className="challenge-header">
                  <span className="ch-num">痛点 0{idx + 1}</span>
                  <h4 className="ch-problem">{c.problem}</h4>
                </div>
                <div className="approach-comparison">
                  <div className="bad-box">
                    <span className="approach-lbl bad">❌ 常见新手做法 (Bad Approach)</span>
                    <p>{c.badApproach}</p>
                  </div>
                  <div className="good-box">
                    <span className="approach-lbl good">✨ 资深架构师方案 (Architect Solution)</span>
                    <p>{c.architectSolution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. 大厂架构师面试黄金标答 (Interview Insight) */}
        <div className="interview-insight-card">
          <div className="insight-header">
            <div className="insight-title-group">
              <span className="insight-badge">🔥 大厂高频架构面试黄金标答推导</span>
              <span className="insight-sub">面试官问到该系统时，如何用 1 分钟框架式话术惊艳全场</span>
            </div>
            <button
              type="button"
              className="copy-insight-btn"
              onClick={handleCopyInterview}
            >
              {copiedInsight ? '✓ 已复制到剪贴板' : '📋 复制面试话术'}
            </button>
          </div>
          <p className="insight-content">{activeCase.interviewInsight}</p>
        </div>
      </div>
    </div>
  )
}
