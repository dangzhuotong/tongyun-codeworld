import { lazy, Suspense, useEffect, useState } from 'react'
import { closeBookshelf, navigateBookshelf, parseBookshelfHash } from './bookshelf/route.ts'
import { ArchitectureShowcase } from './components/ArchitectureShowcase.tsx'
import { KnowledgeMap } from './components/KnowledgeMap.tsx'
import { Journey } from './journey/Journey.tsx'
import './App.css'

const Bookshelf = lazy(() =>
  import('./bookshelf/Bookshelf.tsx').then((mod) => ({ default: mod.Bookshelf })),
)

export type NavTab = 'map' | 'arch' | 'labs'

export default function App() {
  const [shelf, setShelf] = useState(() => parseBookshelfHash(window.location.hash))
  const [activeTab, setActiveTab] = useState<NavTab>('map')
  const [selectedNodeId, setSelectedNodeId] = useState<string>('binary-logic')
  const [selectedArchId, setSelectedArchId] = useState<string>('flash-sale')
  const [selectedLabId, setSelectedLabId] = useState<string>('switch')

  // 从知识地图跳转到架构案例
  const handleJumpToArchCase = (caseId: string) => {
    setSelectedArchId(caseId)
    setActiveTab('arch')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 从架构案例跳转到知识地图节点
  const handleJumpToKnowledgeNode = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    setActiveTab('map')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 从知识地图跳转到动手实验台
  const handleJumpToLab = (labId: string) => {
    setSelectedLabId(labId)
    setActiveTab('labs')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const syncShelf = () => setShelf(parseBookshelfHash(window.location.hash))
    window.addEventListener('hashchange', syncShelf)
    window.addEventListener('popstate', syncShelf)
    return () => {
      window.removeEventListener('hashchange', syncShelf)
      window.removeEventListener('popstate', syncShelf)
    }
  }, [])

  return (
    <>
    <div className="codeworld-app" aria-hidden={shelf.open || undefined} inert={shelf.open || undefined}>
      {/* 顶层吸顶导航总览 */}
      <header className="app-top-nav">
        <div className="nav-container">
          <div className="nav-brand-wrap">
            <div className="brand-logo-badge">🗺️</div>
            <div className="brand-texts">
              <h1 className="nav-brand-title">代码世界 · 架构师全景知识库</h1>
              <p className="nav-brand-desc">
                广度驱动深度 · 串联底层硬件、操作系统、网络、存储到前沿 AI 智能体体系
              </p>
            </div>
          </div>

          {/* 三大核心模式切换器 */}
          <nav className="mode-tabs-bar" aria-label="核心模式切换">
            <button
              type="button"
              className={`mode-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('map')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <span className="tab-icon">🗺️</span>
              <span className="tab-name">知识拓扑地图</span>
              <span className="tab-pill-count">25 个核心域</span>
            </button>

            <button
              type="button"
              className={`mode-tab-btn ${activeTab === 'arch' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('arch')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <span className="tab-icon">🏛️</span>
              <span className="tab-name">经典工业架构</span>
              <span className="tab-pill-count">7 大经典案例</span>
            </button>

            <button
              type="button"
              className={`mode-tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('labs')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <span className="tab-icon">🔬</span>
              <span className="tab-name">互动沙盘实验</span>
              <span className="tab-pill-count">8 节动手玩</span>
            </button>
          </nav>
          <button type="button" className="bookshelf-entry" onClick={() => navigateBookshelf(null)}>
            <span className="tab-icon" aria-hidden="true">📚</span>
            <span className="tab-name">面试书架</span>
            <span className="tab-pill-count">28 章</span>
          </button>
        </div>
      </header>

      {/* 主视图区域 */}
      <main className="app-main-content">
        {activeTab === 'map' && (
          <div className="tab-view-container animate-fade-in">
            <KnowledgeMap
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onJumpToArchCase={handleJumpToArchCase}
              onJumpToLab={handleJumpToLab}
            />
          </div>
        )}

        {activeTab === 'arch' && (
          <div className="tab-view-container animate-fade-in">
            <ArchitectureShowcase
              selectedArchId={selectedArchId}
              onSelectArchCase={setSelectedArchId}
              onJumpToKnowledgeNode={handleJumpToKnowledgeNode}
            />
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="tab-view-container animate-fade-in">
            <Journey initialSegmentId={selectedLabId} />
          </div>
        )}
      </main>

      {/* 全局底部微信息 */}
      <footer className="app-footer">
        <p>
          代码世界 · 面向未来架构师与智能体编排者 · 知识的广度构建系统的骨架 · 纯前端离线可用
        </p>
      </footer>
    </div>
    {shelf.open ? (
      <Suspense fallback={<p className="bookshelf-fallback">正在打开书架…</p>}>
        <Bookshelf slug={shelf.slug} onClose={closeBookshelf} />
      </Suspense>
    ) : null}
    </>
  )
}
