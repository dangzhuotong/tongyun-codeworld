import { useMemo, useState } from 'react'
import {
  CATEGORIES,
  MAP_LINKS,
  MAP_NODES,
  type MapNode,
} from '../data/knowledgeMapData.ts'
import './knowledgeMap.css'

interface KnowledgeMapProps {
  selectedNodeId?: string
  onSelectNode: (nodeId: string) => void
  onJumpToArchCase: (caseId: string) => void
  onJumpToLab: (labId: string) => void
}

export function KnowledgeMap({
  selectedNodeId,
  onSelectNode,
  onJumpToArchCase,
  onJumpToLab,
}: KnowledgeMapProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // 当前选中的节点
  const activeNode = useMemo(() => {
    return MAP_NODES.find((n) => n.id === selectedNodeId) || MAP_NODES[0]
  }, [selectedNodeId])

  // 节点字典映射加速坐标查询
  const nodeMap = useMemo(() => {
    const map = new Map<string, MapNode>()
    MAP_NODES.forEach((n) => map.set(n.id, n))
    return map
  }, [])

  // 过滤后的节点
  const filteredNodes = useMemo(() => {
    return MAP_NODES.filter((node) => {
      const matchCat = filterCategory === 'all' || node.categoryId === filterCategory
      const matchSearch =
        !searchQuery ||
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.tag.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [filterCategory, searchQuery])

  // 获取与当前激活节点相连的所有连线 (输入与输出)
  const connectedLinks = useMemo(() => {
    if (!activeNode) return new Set<string>()
    const set = new Set<string>()
    MAP_LINKS.forEach((link, idx) => {
      if (link.from === activeNode.id || link.to === activeNode.id) {
        set.add(`link-${idx}`)
      }
    })
    return set
  }, [activeNode])

  // 前置依赖节点与后置演进节点
  const { incomingNodes, outgoingNodes } = useMemo(() => {
    if (!activeNode) return { incomingNodes: [], outgoingNodes: [] }
    const inc: MapNode[] = []
    const out: MapNode[] = []
    MAP_LINKS.forEach((link) => {
      if (link.to === activeNode.id) {
        const source = nodeMap.get(link.from)
        if (source) inc.push(source)
      }
      if (link.from === activeNode.id) {
        const target = nodeMap.get(link.to)
        if (target) out.push(target)
      }
    })
    return { incomingNodes: inc, outgoingNodes: out }
  }, [activeNode, nodeMap])

  return (
    <div className="knowledge-map-container">
      {/* 顶部控制栏：分类筛选、搜索与拓扑图例 */}
      <div className="map-toolbar">
        <div className="category-chips">
          <button
            type="button"
            className={`chip-btn ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            全部知识域 ({MAP_NODES.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`chip-btn ${filterCategory === cat.id ? 'active' : ''}`}
              style={{
                borderColor: filterCategory === cat.id ? cat.color : undefined,
                backgroundColor: filterCategory === cat.id ? `${cat.color}15` : undefined,
              }}
              onClick={() => setFilterCategory(cat.id)}
            >
              <span className="cat-color-dot" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <input
            type="text"
            className="search-input"
            placeholder="搜索核心概念 (如 Redis, epoll, RAG, 虚拟内存)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 主工作区：左侧交互拓扑星图 + 右侧沉浸式深度教学文档 */}
      <div className="map-workspace">
        {/* 左侧：可视化知识网络拓扑画布 */}
        <div className="graph-canvas-wrap">
          <div className="graph-helper-bar">
            <span className="helper-tip">
              🗺️ <strong>技术全景星图</strong> · 点击节点查看教学文档与大厂架构落地 · 连线表示技术支撑与演进
            </span>
            <div className="legend-pills">
              <span className="legend-item"><span className="legend-dot core" /> 核心基石</span>
              <span className="legend-item"><span className="legend-dot important" /> 重点技术</span>
              <span className="legend-item"><span className="legend-dot advanced" /> 前沿范式</span>
            </div>
          </div>

          <div className="svg-map-stage">
            <svg
              className="map-svg-layer"
              viewBox="0 0 1000 650"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* 连线末端箭头指示器 */}
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#bfae9c" opacity="0.6" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#c4683c" />
                </marker>
              </defs>

              {/* 拓扑连线渲染 */}
              {MAP_LINKS.map((link, idx) => {
                const source = nodeMap.get(link.from)
                const target = nodeMap.get(link.to)
                if (!source || !target) return null

                // 将百分比坐标转换为 1000x650 空间
                const x1 = (source.x / 100) * 1000
                const y1 = (source.y / 100) * 650
                const x2 = (target.x / 100) * 1000
                const y2 = (target.y / 100) * 650

                const isConnected = connectedLinks.has(`link-${idx}`)
                const dx = x2 - x1
                const cx1 = x1 + dx * 0.45
                const cx2 = x1 + dx * 0.55
                const cy1 = y1
                const cy2 = y2

                const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`

                return (
                  <g key={`link-${idx}`} className={`link-group ${isConnected ? 'active' : ''}`}>
                    <path
                      d={pathData}
                      className={`map-link-path ${isConnected ? 'link-highlight' : ''}`}
                      markerEnd={isConnected ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                    />
                    {link.label && (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 4}
                        className={`map-link-label ${isConnected ? 'label-highlight' : ''}`}
                        textAnchor="middle"
                      >
                        {link.label}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* 节点渲染 */}
              {filteredNodes.map((node) => {
                const isActive = activeNode.id === node.id
                const category = CATEGORIES.find((c) => c.id === node.categoryId)
                const nodeColor = category ? category.color : '#7a9e7e'
                const cx = (node.x / 100) * 1000
                const cy = (node.y / 100) * 650

                return (
                  <g
                    key={node.id}
                    className={`map-node-group ${isActive ? 'is-active' : ''} ${node.importance}`}
                    onClick={() => onSelectNode(node.id)}
                  >
                    {/* 激活光环 */}
                    {isActive && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="32"
                        className="pulse-halo"
                        style={{ stroke: nodeColor }}
                      />
                    )}

                    {/* 节点实体圆 */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      className="node-circle"
                      style={{ fill: nodeColor }}
                    />

                    {/* 节点内部状态标记 */}
                    <circle cx={cx} cy={cy} r="6" fill="#fff" opacity="0.9" />

                    {/* 节点标题文本 */}
                    <text
                      x={cx}
                      y={cy + 28}
                      className="node-text-title"
                      textAnchor="middle"
                    >
                      {node.title}
                    </text>

                    {/* 节点所属标签 */}
                    <text
                      x={cx}
                      y={cy + 42}
                      className="node-text-tag"
                      textAnchor="middle"
                    >
                      {node.tag}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* 右侧：知识点详尽教学文档面板 (Architecture Teaching Doc) */}
        <aside className="node-doc-panel">
          <div className="doc-panel-header">
            <div className="doc-header-badges">
              <span
                className="category-badge"
                style={{
                  backgroundColor: `${CATEGORIES.find((c) => c.id === activeNode.categoryId)?.color || '#7a9e7e'}22`,
                  color: CATEGORIES.find((c) => c.id === activeNode.categoryId)?.color || '#7a9e7e',
                }}
              >
                {activeNode.category}
              </span>
              <span className={`importance-badge ${activeNode.importance}`}>
                {activeNode.importance === 'core'
                  ? '核心底层基石'
                  : activeNode.importance === 'important'
                  ? '工业高频重点'
                  : '现代前沿范式'}
              </span>
            </div>
            <h2 className="doc-title">{activeNode.title}</h2>
            <p className="doc-summary-lead">{activeNode.doc.overview}</p>
          </div>

          <div className="doc-panel-body">
            {/* 心智模型 */}
            <div className="doc-section mental-model-box">
              <div className="section-title">
                <span className="sec-icon">🧠</span> 架构师心智模型
              </div>
              <p className="mental-model-text">{activeNode.doc.mentalModel}</p>
            </div>

            {/* 核心机制拆解 */}
            <div className="doc-section">
              <div className="section-title">
                <span className="sec-icon">⚙️</span> 核心底层机制推导
              </div>
              <div className="mechanisms-list">
                {activeNode.doc.coreMechanisms.map((mech, i) => (
                  <div key={i} className="mechanism-item-card">
                    <div className="mech-title">
                      <span className="mech-num">0{i + 1}</span> {mech.title}
                    </div>
                    <div className="mech-desc">{mech.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 高并发与系统架构支柱价值 */}
            <div className="doc-section">
              <div className="section-title">
                <span className="sec-icon">🏛️</span> 为什么它是高并发系统核心支柱？
              </div>
              <p className="doc-text-block">{activeNode.doc.architectureImpact}</p>
            </div>

            {/* 未来 AI 时代的全新价值映射 */}
            <div className="doc-section ai-relevance-box">
              <div className="section-title">
                <span className="sec-icon">🚀</span> 未来 AI 时代全新映射与破局
              </div>
              <p className="doc-text-block">{activeNode.doc.aiEraRelevance}</p>
            </div>

            {/* 架构取舍 Trade-offs */}
            <div className="doc-section">
              <div className="section-title">
                <span className="sec-icon">⚖️</span> 经典架构取舍 (Trade-offs)
              </div>
              <p className="doc-text-block tradeoffs-text">{activeNode.doc.tradeoffs}</p>
            </div>

            {/* 技术上下游连接 (Links) */}
            <div className="doc-section links-nexus-box">
              <div className="section-title">
                <span className="sec-icon">🔗</span> 技术链路演进与连接关系
              </div>
              <div className="nexus-flow">
                {incomingNodes.length > 0 && (
                  <div className="nexus-group">
                    <span className="nexus-label">前置支撑基石：</span>
                    <div className="nexus-pills">
                      {incomingNodes.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="nexus-pill-btn"
                          onClick={() => onSelectNode(n.id)}
                        >
                          ← {n.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {outgoingNodes.length > 0 && (
                  <div className="nexus-group">
                    <span className="nexus-label">驱动后置演进：</span>
                    <div className="nexus-pills">
                      {outgoingNodes.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="nexus-pill-btn"
                          onClick={() => onSelectNode(n.id)}
                        >
                          {n.title} →
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 落地经典架构直达 */}
            {activeNode.doc.relatedArchCases && activeNode.doc.relatedArchCases.length > 0 && (
              <div className="doc-section arch-cases-jump-section">
                <div className="section-title">
                  <span className="sec-icon">🎯</span> 本技术在经典工业架构中的实战落地
                </div>
                <div className="jump-case-cards">
                  {activeNode.doc.relatedArchCases.map((caseId) => (
                    <button
                      key={caseId}
                      type="button"
                      className="jump-case-btn"
                      onClick={() => onJumpToArchCase(caseId)}
                    >
                      <span className="jump-case-tag">查看实战架构</span>
                      <span className="jump-case-name">
                        {caseId === 'flash-sale'
                          ? '⚡ 亿级流量秒杀系统架构'
                          : caseId === 'ai-agent-rag'
                          ? '🤖 企业级 AI Agent + RAG 架构'
                          : caseId === 'million-im'
                          ? '💬 百万级即时通讯 IM 架构'
                          : caseId === 'short-url'
                          ? '🔗 高并发海量短链重定向架构'
                          : caseId === 'distributed-logging'
                          ? '📊 分布式海量日志与全链路可观测性'
                          : caseId === 'social-feed'
                          ? '📱 千万级社交 Feed 流与关注关系架构'
                          : caseId === 'distributed-trans'
                          ? '💳 金融级分布式事务与支付结算架构'
                          : caseId}
                      </span>
                      <span className="jump-arrow">进入架构案例 ▶</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 动手沙盘直达 */}
            {activeNode.doc.relatedLabId && (
              <div className="doc-section lab-jump-section">
                <div className="lab-jump-card">
                  <div className="lab-jump-info">
                    <span className="lab-jump-badge">🔬 动手实操沙盘</span>
                    <p>光看文字不够透彻？前往专属动手实验台亲手模拟验证！</p>
                  </div>
                  <button
                    type="button"
                    className="btn lab-jump-btn"
                    onClick={() => onJumpToLab(activeNode.doc.relatedLabId!)}
                  >
                    前往互动实验台 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
