import { useState } from 'react'

interface CpuLabProps {
  completed: boolean
  onComplete: () => void
}

interface Instruction {
  asm: string
  code: string
  action: string
}

const PROGRAM: Instruction[] = [
  { asm: 'LOAD R0, 2', code: '0001 0000 0010', action: '将数值 2 从内存放入寄存器 R0' },
  { asm: 'LOAD R1, 3', code: '0001 0001 0011', action: '将数值 3 从内存放入寄存器 R1' },
  { asm: 'ADD  R0, R1', code: '0010 0000 0001', action: 'ALU 计算 R0 + R1 (2+3=5)，将结果写回 R0' },
  { asm: 'STORE [0x04], R0', code: '0011 0100 0000', action: '将 R0 里的 5 存入内存地址 0x04' },
  { asm: 'HALT', code: '1111 0000 0000', action: '停机，程序执行完毕' },
]

export function CpuLab({ completed, onComplete }: CpuLabProps) {
  const [subTab, setSubTab] = useState<'pipeline' | 'hierarchy' | 'branch'>('pipeline')
  const [pc, setPc] = useState(0)
  const [cyclePhase, setCyclePhase] = useState<'FETCH' | 'DECODE' | 'EXECUTE' | 'WRITEBACK'>('FETCH')
  const [r0, setR0] = useState(0)
  const [r1, setR1] = useState(0)
  const [mem4, setMem4] = useState(0)
  const [clockTick, setClockTick] = useState(0)
  const [log, setLog] = useState<string[]>(['微处理器初始化就绪，等待第一个时钟脉冲。'])

  const currentInst = pc < PROGRAM.length ? PROGRAM[pc] : null
  const isHalted = pc >= PROGRAM.length - 1 && cyclePhase === 'WRITEBACK'

  const stepCycle = () => {
    if (isHalted) return

    setClockTick((c) => c + 1)

    if (cyclePhase === 'FETCH') {
      setCyclePhase('DECODE')
      setLog((prev) => [
        `[节拍 ${clockTick + 1} 译码] 译码器解析指令机器码: ${PROGRAM[pc].code} ➔ ${PROGRAM[pc].asm}`,
        ...prev.slice(0, 4),
      ])
    } else if (cyclePhase === 'DECODE') {
      setCyclePhase('EXECUTE')
      setLog((prev) => [
        `[节拍 ${clockTick + 1} 执行] ALU 激活，总线传输控制信号`,
        ...prev.slice(0, 4),
      ])
    } else if (cyclePhase === 'EXECUTE') {
      setCyclePhase('WRITEBACK')
      if (pc === 0) setR0(2)
      if (pc === 1) setR1(3)
      if (pc === 2) setR0(5)
      if (pc === 3) setMem4(5)

      setLog((prev) => [
        `[节拍 ${clockTick + 1} 写回] ${PROGRAM[pc].action}`,
        ...prev.slice(0, 4),
      ])

      if (pc === 2 && !completed) {
        onComplete()
      }
    } else if (cyclePhase === 'WRITEBACK') {
      if (pc < PROGRAM.length - 1) {
        setPc((prev) => prev + 1)
        setCyclePhase('FETCH')
        setLog((prev) => [
          `[节拍 ${clockTick + 1} 取指] PC 递增为 0x0${pc + 1}，从内存取出指令`,
          ...prev.slice(0, 4),
        ])
      }
    }
  }

  const resetCpu = () => {
    setPc(0)
    setCyclePhase('FETCH')
    setR0(0)
    setR1(0)
    setMem4(0)
    setClockTick(0)
    setLog(['CPU 已重置至初始状态。'])
  }

  return (
    <div className="cpu-lab">
      {/* 顶部实操模式子标签 */}
      <div className="lab-sub-tabs">
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setSubTab('pipeline')}
        >
          ⚡ 四拍流水线微机单步执行
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'hierarchy' ? 'active' : ''}`}
          onClick={() => setSubTab('hierarchy')}
        >
          🏔️ 存储分层金字塔（纳秒时延天平）
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'branch' ? 'active' : ''}`}
          onClick={() => setSubTab('branch')}
        >
          🔀 分支预测与指令乱序（为什么先排序后循环更快）
        </button>
      </div>

      {subTab === 'pipeline' && (
        <div className="tab-pane-content">
          {/* 顶部时钟与微机流水线状态 */}
          <div className="cpu-pipeline-banner">
            <div className="clock-indicator">
              <span className="clock-symbol">⚡ 时钟节拍: #{clockTick}</span>
              <span className="clock-wave mono">[ ‾|_ ‾|_ ‾|_ ]</span>
            </div>
            <div className="phases-bar">
              <span className={`phase-tag ${cyclePhase === 'FETCH' ? 'active' : ''}`}>1. 取指 Fetch</span>
              <span className="phase-sep">➔</span>
              <span className={`phase-tag ${cyclePhase === 'DECODE' ? 'active' : ''}`}>2. 译码 Decode</span>
              <span className="phase-sep">➔</span>
              <span className={`phase-tag ${cyclePhase === 'EXECUTE' ? 'active' : ''}`}>3. 执行 Execute</span>
              <span className="phase-sep">➔</span>
              <span className={`phase-tag ${cyclePhase === 'WRITEBACK' ? 'active' : ''}`}>4. 写回 Writeback</span>
            </div>
          </div>

          {/* 冯·诺依曼架构微机全景实操拓扑图 */}
          <div className="cpu-architecture-grid">
            {/* 左侧：程序指令内存区 */}
            <div className="arch-panel program-mem">
              <h4>内存代码段 (Program ROM)</h4>
              <div className="inst-list">
                {PROGRAM.map((inst, index) => {
                  const isCurrent = index === pc
                  return (
                    <div key={index} className={`inst-item ${isCurrent ? 'current' : ''}`}>
                      <span className="mono inst-addr">0x0{index}</span>
                      <span className="mono inst-asm">{inst.asm}</span>
                      <span className="mono inst-bin">{inst.code}</span>
                      {isCurrent && <span className="pc-pointer">◀ PC</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 中间：CPU 核心部件 (PC / IR / ALU) */}
            <div className="arch-panel cpu-core">
              <h4>CPU 核心流水线</h4>
              <div className="core-modules">
                <div className="core-card">
                  <span className="core-label">程序计数器 PC</span>
                  <span className="core-val mono">0x0{pc}</span>
                </div>
                <div className="core-card">
                  <span className="core-label">指令寄存器 IR</span>
                  <span className="core-val mono">{currentInst ? currentInst.asm : 'HALT'}</span>
                </div>
                <div className="core-card alu-card">
                  <span className="core-label">算术逻辑单元 ALU</span>
                  <span className="core-val mono">
                    {pc === 2 && cyclePhase === 'EXECUTE' ? '2 + 3 ➔ 5' : 'ALU 待命'}
                  </span>
                </div>
              </div>

              <div className="registers-box">
                <div className="reg-item">
                  <span className="reg-name">寄存器 R0</span>
                  <span className="reg-val mono">{r0}</span>
                </div>
                <div className="reg-item">
                  <span className="reg-name">寄存器 R1</span>
                  <span className="reg-val mono">{r1}</span>
                </div>
              </div>
            </div>

            {/* 右侧：数据内存与缓存 */}
            <div className="arch-panel ram-mem">
              <h4>数据内存 (RAM)</h4>
              <div className="ram-slots">
                <div className="ram-slot">
                  <span className="slot-addr mono">[0x00]</span>
                  <span className="slot-val mono">00</span>
                </div>
                <div className="ram-slot">
                  <span className="slot-addr mono">[0x04]</span>
                  <span className={`slot-val mono ${mem4 > 0 ? 'highlight-mem' : ''}`}>
                    {mem4 > 0 ? `0${mem4}` : '00'}
                  </span>
                </div>
              </div>
              <div className="bus-indicator">
                <span className="bus-line">64-bit 共享系统总线 (Data & Address Bus)</span>
              </div>
            </div>
          </div>

          {/* 控制按钮与日志面板 */}
          <div className="cpu-action-bar">
            <button
              type="button"
              className="btn"
              disabled={isHalted}
              onClick={stepCycle}
            >
              {isHalted ? '程序已停机 (HALT)' : '单步时钟节拍 (Step Clock)'}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={resetCpu}
            >
              重置 CPU
            </button>
          </div>

          {/* 实时硬件执行日志 */}
          <div className="cpu-log-box">
            <span className="log-title">硬件微指令日志：</span>
            <div className="log-entries mono">
              {log.map((entry, idx) => (
                <div key={idx} className="log-line">{entry}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'hierarchy' && (
        <div className="tab-pane-content hierarchy-content">
          <h4>🏔️ 存储分层金字塔：人类技术史上的时延天平</h4>
          <p className="sub-note">
            越靠近 CPU 核心的存储越快、越贵、越小；越远离的越慢、越便宜、越大。
            <strong>如果 CPU 执行一次计算相当于 1 秒钟</strong>，那么各级存储的访问耗时在人类感官中相当于：
          </p>

          <div className="pyramid-grid">
            <div className="pyramid-card level-reg">
              <div className="pyr-head">
                <span className="pyr-title">1. CPU 通用寄存器 (Registers)</span>
                <span className="pyr-time mono">&lt; 1 ns (人类比喻: 1 秒)</span>
              </div>
              <p>就在 CPU 核心内部，随用随取，容量仅几百字节。</p>
            </div>

            <div className="pyramid-card level-l1">
              <div className="pyr-head">
                <span className="pyr-title">2. L1 / L2 高速缓存 (SRAM)</span>
                <span className="pyr-time mono">1 ~ 4 ns (人类比喻: 几秒)</span>
              </div>
              <p>集成在 CPU 芯片内部，容量几十 KB ~ 几 MB，用于缓存最热门的循环指令与变量。</p>
            </div>

            <div className="pyramid-card level-l3">
              <div className="pyr-head">
                <span className="pyr-title">3. L3 共享三级缓存</span>
                <span className="pyr-time mono">10 ~ 20 ns (人类比喻: 1 分钟)</span>
              </div>
              <p>多个 CPU 核心共享的大缓存，容量十几 ~ 几十 MB。</p>
            </div>

            <div className="pyramid-card level-ram">
              <div className="pyr-head">
                <span className="pyr-title">4. 物理主内存 (DRAM / 内存条)</span>
                <span className="pyr-time mono">60 ~ 100 ns (人类比喻: 10 分钟出门取快递)</span>
              </div>
              <p>通过内存总线通信，CPU 每次发生 Cache Miss 找内存拿数据，都要干等上百个时钟周期！</p>
            </div>

            <div className="pyramid-card level-ssd">
              <div className="pyr-head">
                <span className="pyr-title">5. NVMe SSD / 磁盘</span>
                <span className="pyr-time mono">100,000 ns (人类比喻: 坐飞机去另一个半球耗时数月)</span>
              </div>
              <p>持久化存储，读写极慢，因此操作系统必须设计虚拟内存 Page Cache 尽量减少磁盘直接 I/O！</p>
            </div>
          </div>
        </div>
      )}

      {subTab === 'branch' && (
        <div className="tab-pane-content branch-content">
          <h4>🔀 分支预测（Branch Prediction）：StackOverflow 著名悬案</h4>
          <div className="branch-case-box">
            <div className="branch-code-snippet mono">
              // 先排序再遍历，速度竟然比无序数组快 3~6 倍！<br />
              std::sort(data.begin(), data.end());<br />
              for (int i = 0; i &lt; 100000; ++i) &#123;<br />
              &nbsp;&nbsp;if (data[i] &gt;= 128) sum += data[i];<br />
              &#125;
            </div>
            <p className="branch-explain">
              <strong>为什么？</strong>因为现代 CPU 拥有深达十几级的<strong>超标量流水线</strong>。在遇到 <code>if</code> 分支时，CPU 不会傻等判断结果，而是由<strong>分支预测器（Branch Predictor）</strong>猜一个方向提前预执行指令！<br />
              如果数组已经排序，前面全是 false，后面全是 true，预测准确率接近 100%，流水线拉满；如果数组无序，预测频繁失败，CPU 必须把流水线里的半成品指令<strong>全部冲刷清空（Pipeline Flush）</strong>重新加载，导致性能雪崩！
            </p>
          </div>
        </div>
      )}

      {r0 === 5 && (
        <div className="pass-banner">
          <strong>阶段达成！</strong> 你亲手通过时钟信号驱动了冯·诺依曼机器的取指、译码、执行与写回全流程！代码不再是文本，而是总线上的电信号！
        </div>
      )}
    </div>
  )
}
