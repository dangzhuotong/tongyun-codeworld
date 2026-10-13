import { useState } from 'react'

interface OsLabProps {
  completed: boolean
  onComplete: () => void
}

interface PageMapping {
  process: 'A' | 'B'
  virtualPage: number
  physicalFrame: number
}

export function OsLab({ completed, onComplete }: OsLabProps) {
  const [mappings, setMappings] = useState<PageMapping[]>([
    { process: 'A', virtualPage: 0, physicalFrame: 1 },
    { process: 'A', virtualPage: 1, physicalFrame: 3 },
    { process: 'B', virtualPage: 0, physicalFrame: 4 },
  ])
  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const [hasTestedFault, setHasTestedFault] = useState(false)

  // 物理内存总共有 8 个页框 (Frame 0 ~ 7)
  const totalFrames = 8

  const allocateForProcess = (proc: 'A' | 'B') => {
    const usedFrames = new Set(mappings.map((m) => m.physicalFrame))
    let freeFrame = -1
    for (let i = 0; i < totalFrames; i++) {
      if (!usedFrames.has(i)) {
        freeFrame = i
        break
      }
    }

    if (freeFrame === -1) {
      setAlertMsg('物理内存已满！操作系统将触发页面置换算法（LRU 换出至磁盘 Swap）！')
      return
    }

    const currentProcPages = mappings.filter((m) => m.process === proc).length
    setMappings((prev) => [
      ...prev,
      { process: proc, virtualPage: currentProcPages, physicalFrame: freeFrame },
    ])
    setAlertMsg(`操作系统为进程 ${proc} 分配了虚拟页 #${currentProcPages} ➔ 映射到物理页框 #${freeFrame}`)
  }

  const simulatePageFault = () => {
    setHasTestedFault(true)
    setAlertMsg(
      '⚠️ 异常触发！进程 A 试图读取未映射的虚拟地址 0x999999！MMU 硬件检测到非法地址，立即抛出【Page Fault 缺页异常 / 段错误】，内核已隔离并安全拦截！',
    )
    if (!completed) {
      onComplete()
    }
  }

  const resetMappings = () => {
    setMappings([
      { process: 'A', virtualPage: 0, physicalFrame: 1 },
      { process: 'A', virtualPage: 1, physicalFrame: 3 },
      { process: 'B', virtualPage: 0, physicalFrame: 4 },
    ])
    setAlertMsg('内存映射已重置为初始状态。')
  }

  return (
    <div className="os-lab">
      {/* 原理提示与直觉解构 */}
      <div className="os-intro-card">
        <h4>为什么多任务不会打架？—— 虚拟内存与 MMU 页表</h4>
        <p>
          每个程序编译时都以为自己从 <code>0x00000000</code> 开始独占整根物理内存条。
          操作系统与 CPU 里的 <strong>MMU（内存管理单元）</strong> 联合演了一出好戏：通过<strong>页表映射</strong>，把不同进程的虚拟空间打散映射到物理内存的各个插槽中。程序之间彼此完全不可见！
        </p>
      </div>

      {/* 虚拟内存映射交互实操沙盘 */}
      <div className="memory-sandbox">
        {/* 左侧：两个独立进程的虚拟内存空间 */}
        <div className="proc-column">
          <div className="proc-box proc-a">
            <div className="proc-header">
              <span className="proc-tag">进程 A (音乐播放器)</span>
              <button
                type="button"
                className="btn-tiny"
                onClick={() => allocateForProcess('A')}
              >
                + 申请 1 页内存
              </button>
            </div>
            <div className="page-list">
              {mappings
                .filter((m) => m.process === 'A')
                .map((m) => (
                  <div key={`A-${m.virtualPage}`} className="vpage-item proc-a-bg">
                    <span className="mono">虚拟页 Page #{m.virtualPage}</span>
                    <span className="mono map-arrow">➔ 物理页框 #{m.physicalFrame}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="proc-box proc-b">
            <div className="proc-header">
              <span className="proc-tag proc-b-tag">进程 B (文本编辑器)</span>
              <button
                type="button"
                className="btn-tiny secondary"
                onClick={() => allocateForProcess('B')}
              >
                + 申请 1 页内存
              </button>
            </div>
            <div className="page-list">
              {mappings
                .filter((m) => m.process === 'B')
                .map((m) => (
                  <div key={`B-${m.virtualPage}`} className="vpage-item proc-b-bg">
                    <span className="mono">虚拟页 Page #{m.virtualPage}</span>
                    <span className="mono map-arrow">➔ 物理页框 #{m.physicalFrame}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 中间：MMU 页表转换器 */}
        <div className="mmu-column">
          <div className="mmu-badge">
            <span>CPU 硬件 MMU</span>
            <small>查页表实时翻译</small>
          </div>
          <svg viewBox="0 0 120 220" className="mmu-svg">
            <line x1="10" y1="50" x2="110" y2="80" stroke="#7a9e7e" strokeWidth="2.5" strokeDasharray="4 2" />
            <line x1="10" y1="90" x2="110" y2="130" stroke="#7a9e7e" strokeWidth="2.5" strokeDasharray="4 2" />
            <line x1="10" y1="170" x2="110" y2="160" stroke="#e8918a" strokeWidth="2.5" strokeDasharray="4 2" />
            <circle cx="60" cy="110" r="16" fill="#fffaf5" stroke="#4a3f35" strokeWidth="2" />
            <text x="60" y="115" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#4a3f35">MMU</text>
          </svg>
        </div>

        {/* 右侧：真实的单一物理内存条 RAM */}
        <div className="physical-ram-column">
          <div className="ram-header">
            <span>物理内存条 (8 个页框 Frame)</span>
          </div>
          <div className="ram-frames-grid">
            {Array.from({ length: totalFrames }).map((_, frameIdx) => {
              const mapped = mappings.find((m) => m.physicalFrame === frameIdx)
              return (
                <div
                  key={frameIdx}
                  className={`frame-slot ${
                    mapped
                      ? mapped.process === 'A'
                        ? 'slot-proc-a'
                        : 'slot-proc-b'
                      : 'slot-empty'
                  }`}
                >
                  <span className="mono frame-no">Frame #{frameIdx}</span>
                  <span className="frame-desc">
                    {mapped
                      ? `进程 ${mapped.process} (页 #${mapped.virtualPage})`
                      : '空闲 [Free]'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 操作与安全模拟面板 */}
      <div className="os-action-controls">
        <button
          type="button"
          className="btn warning-btn"
          onClick={simulatePageFault}
        >
          💥 模拟进程野指针越界（触发 Page Fault 隔离）
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={resetMappings}
        >
          重置内存分配
        </button>
      </div>

      {alertMsg && (
        <div className="os-log-alert mono">
          {alertMsg}
        </div>
      )}

      {hasTestedFault && (
        <div className="pass-banner">
          <strong>通关达成！</strong> 你掌握了现代操作系统的核心底色：<strong>虚拟内存、MMU 页表映射与硬件级进程隔离</strong>！再凶险的进程崩溃，也绝不能伤及整个系统！
        </div>
      )}
    </div>
  )
}
