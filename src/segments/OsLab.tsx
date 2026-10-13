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
  const [subTab, setSubTab] = useState<'mmu' | 'layout' | 'epoll'>('mmu')
  const [mappings, setMappings] = useState<PageMapping[]>([
    { process: 'A', virtualPage: 0, physicalFrame: 1 },
    { process: 'A', virtualPage: 1, physicalFrame: 3 },
    { process: 'B', virtualPage: 0, physicalFrame: 4 },
  ])
  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const [hasTestedFault, setHasTestedFault] = useState(false)

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
      {/* 顶部实操模式子标签 */}
      <div className="lab-sub-tabs">
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'mmu' ? 'active' : ''}`}
          onClick={() => setSubTab('mmu')}
        >
          🧩 MMU 页表与野指针隔离沙盘
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'layout' ? 'active' : ''}`}
          onClick={() => setSubTab('layout')}
        >
          📐 Linux 进程虚拟内存经典布局（栈/堆/mmap）
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'epoll' ? 'active' : ''}`}
          onClick={() => setSubTab('epoll')}
        >
          ⚡ I/O 演进史：为什么 epoll 能轻松抗 10 万连接
        </button>
      </div>

      {subTab === 'mmu' && (
        <div className="tab-pane-content">
          <div className="os-intro-card">
            <h4>为什么多任务不会打架？—— 虚拟内存与 MMU 页表</h4>
            <p>
              每个程序编译时都以为自己独占整根内存条。
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
        </div>
      )}

      {subTab === 'layout' && (
        <div className="tab-pane-content layout-content">
          <h4>📐 Linux 进程经典 4GB / 64位虚拟内存空间布局</h4>
          <p className="sub-note">
            操作系统为每一个普通进程分配的虚拟地址空间，自顶向下分为几个标准区域。
            <strong>栈和堆是相向生长的</strong>：栈从高地址向下缩，堆从低地址向上涨！
          </p>

          <div className="process-layout-tower">
            <div className="tower-segment seg-kernel">
              <span className="seg-addr mono">0xFFFFFFFF (最高地址)</span>
              <span className="seg-name">🛡️ Linux 内核空间 (Kernel Space, 用户态不可触碰)</span>
            </div>
            <div className="tower-segment seg-stack">
              <span className="seg-addr mono">↓ 向低地址生长</span>
              <span className="seg-name">📚 用户栈 (User Stack)：局部变量、函数调用栈帧、返回地址</span>
            </div>
            <div className="tower-segment seg-mmap">
              <span className="seg-addr mono">共享区域</span>
              <span className="seg-name">🗺️ 内存映射区 (Memory Mapping / mmap)：共享库 libc.so、动态链接</span>
            </div>
            <div className="tower-segment seg-heap">
              <span className="seg-addr mono">↑ 向高地址生长</span>
              <span className="seg-name">🧱 运行时堆 (Heap)：malloc / new 动态申请的对象区</span>
            </div>
            <div className="tower-segment seg-data">
              <span className="seg-addr mono">静态数据</span>
              <span className="seg-name">🗄️ BSS / Data 段：全局变量、静态变量 (static)</span>
            </div>
            <div className="tower-segment seg-text">
              <span className="seg-addr mono">0x00000000 (最低地址)</span>
              <span className="seg-name">📜 代码段 (Text Segment)：编译后的只读机器指令</span>
            </div>
          </div>
        </div>
      )}

      {subTab === 'epoll' && (
        <div className="tab-pane-content epoll-content">
          <h4>⚡ I/O 演进史：select 与 epoll 为什么相差千百倍？</h4>
          <div className="epoll-compare-grid">
            <div className="epoll-card card-select">
              <h5>传统 select / poll 的瓶颈 (C10K 灾难)</h5>
              <ul>
                <li>每次调用都必须把 10,000 个 socket fd 完整拷贝进内核；</li>
                <li>内核每次都要通过 <strong>O(N) 笨拙轮询</strong> 逐个检查哪一个 socket 来了数据；</li>
                <li>即使只有 1 个 socket 活跃，也要白白遍历 9999 次，CPU 严重空转！</li>
              </ul>
            </div>

            <div className="epoll-card card-epoll">
              <h5>现代 epoll 的降维打击 (Nginx/Node.js/Redis 基石)</h5>
              <ul>
                <li><strong>红黑树保存：</strong>一次注册，永久保留在内核，无需每次全量拷贝 fd；</li>
                <li><strong>网卡中断驱动：</strong>哪个 socket 数据到了，网卡驱动自动把该事件挂入<strong>就绪双向链表</strong>；</li>
                <li>用户态调用 <code>epoll_wait</code> 永远以 <strong>O(1) 速度直接拿走活跃事件</strong>，万级并发轻轻松松！</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {hasTestedFault && (
        <div className="pass-banner">
          <strong>通关达成！</strong> 你掌握了现代操作系统的核心底色：<strong>虚拟内存、MMU 页表映射、经典内存布局与 epoll 高并发内核机制</strong>！
        </div>
      )}
    </div>
  )
}
