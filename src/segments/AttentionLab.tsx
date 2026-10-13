import { useState } from 'react'

const TOKENS = ['小明', '把', '红色', '的', '苹果', '递给', '妹妹'] as const

const GLANCES: { weights: number[]; note: string }[] = [
  {
    weights: [1, 0, 0, 0, 0, 0, 0],
    note: 'Query =「小明」：只关注自身特征，上文尚未展开。',
  },
  {
    weights: [0.55, 0.25, 0.08, 0.04, 0.04, 0.02, 0.02],
    note: 'Query =「把」：重点回溯主语「小明」，介词需要确定动作发出者。',
  },
  {
    weights: [0.12, 0.1, 0.62, 0.06, 0.06, 0.02, 0.02],
    note: 'Query =「红色」：强聚焦修饰词自身语义特征。',
  },
  {
    weights: [0.08, 0.06, 0.46, 0.22, 0.1, 0.04, 0.04],
    note: 'Query =「的」：强注意前置定语「红色」，完成偏正短语结构绑定。',
  },
  {
    weights: [0.06, 0.08, 0.4, 0.1, 0.28, 0.04, 0.04],
    note: 'Query =「苹果」：重点注意力投射在「红色」，赋予宾语实体具体颜色属性。',
  },
  {
    weights: [0.22, 0.06, 0.08, 0.04, 0.36, 0.18, 0.06],
    note: 'Query =「递给」：注意力同时跨越连接主语「小明」与受事宾语「苹果」。',
  },
  {
    weights: [0.16, 0.05, 0.06, 0.04, 0.24, 0.3, 0.15],
    note: 'Query =「妹妹」：关联动作「递给」与核心物品「苹果」，语义三角完整闭合。',
  },
]

// 模型架构预设
interface ModelArch {
  name: string
  paramsB: number
  layers: number
  hiddenSize: number
  qHeads: number
  kvHeads: number
  headDim: number
}

const MODEL_PRESETS: ModelArch[] = [
  {
    name: 'Llama-3-8B (GQA 8 Heads)',
    paramsB: 8,
    layers: 32,
    hiddenSize: 4096,
    qHeads: 32,
    kvHeads: 8,
    headDim: 128,
  },
  {
    name: 'Llama-3-70B (GQA 8 Heads)',
    paramsB: 70,
    layers: 80,
    hiddenSize: 8192,
    qHeads: 64,
    kvHeads: 8,
    headDim: 128,
  },
  {
    name: 'Qwen-2.5-72B (GQA 8 Heads)',
    paramsB: 72,
    layers: 80,
    hiddenSize: 8192,
    qHeads: 64,
    kvHeads: 8,
    headDim: 128,
  },
]

interface AttentionLabProps {
  completed: boolean
  onComplete: () => void
}

export function AttentionLab({ completed, onComplete }: AttentionLabProps) {
  const [subTab, setSubTab] = useState<'qkv' | 'prefill-decode' | 'kv-calc'>('qkv')

  // Sub-Tab 1: QKV
  const [picked, setPicked] = useState<number[]>([4])
  const [focus, setFocus] = useState<number>(4) // 默认高亮「苹果」

  // Sub-Tab 2: Prefill vs Decode 模拟
  const [inferPhase, setInferPhase] = useState<'idle' | 'prefill' | 'decode'>('idle')
  const [genTokens, setGenTokens] = useState<string[]>(['小明', '把', '红色', '的', '苹果', '递给', '妹妹'])
  const [decodeStep, setDecodeStep] = useState(0)
  const nextWordCandidates = ['笑了', '，', '接过', '苹果', '大口', '吃', '了', '起来', '。']

  // Sub-Tab 3: KV Cache 计算器参数
  const [selectedModelIdx, setSelectedModelIdx] = useState(0)
  const [batchSize, setBatchSize] = useState(8)
  const [contextLen, setContextLen] = useState(8192)
  const [kvPrecision, setKvPrecision] = useState<2 | 1 | 0.5>(2) // 2: FP16, 1: FP8, 0.5: INT4
  const [usePagedAttention, setUsePagedAttention] = useState(true)

  const curModel = MODEL_PRESETS[selectedModelIdx]
  const glance = focus === null ? null : GLANCES[focus]

  const chooseToken = (index: number) => {
    setFocus(index)
    setPicked((prev) => (prev.includes(index) ? prev : [...prev, index]))
  }

  // Prefill / Decode 控制
  const handleStartPrefill = () => {
    setInferPhase('prefill')
    setGenTokens(['小明', '把', '红色', '的', '苹果', '递给', '妹妹'])
    setDecodeStep(0)
  }

  const handleStepDecode = () => {
    if (decodeStep < nextWordCandidates.length) {
      setInferPhase('decode')
      const nextWord = nextWordCandidates[decodeStep]
      setGenTokens((prev) => [...prev, nextWord])
      setDecodeStep((s) => s + 1)
      if (decodeStep + 1 >= 3 && !completed) {
        onComplete()
      }
    }
  }

  // KV Cache 显存核心公式推导计算:
  // 每个 Token 在每层占用的 KV Cache (字节) = 2 (Key与Value) * kvHeads * headDim * precision_bytes
  // 全模型每 Token KV Cache (字节) = layers * 2 * kvHeads * headDim * precision_bytes
  const kvBytesPerTokenPerLayer = 2 * curModel.kvHeads * curModel.headDim * kvPrecision
  const kvBytesPerTokenTotal = curModel.layers * kvBytesPerTokenPerLayer
  const totalKVCacheBytes = kvBytesPerTokenTotal * batchSize * contextLen
  const totalKVCacheGB = (totalKVCacheBytes / (1024 * 1024 * 1024)).toFixed(2)

  // 静态模型权重显存估算 (假设 FP16 为 2 字节/参数, FP8 约为 1 字节)
  const weightPrecisionBytes = 2 // 模型权重通常至少用 FP16 或 4-bit 量化
  const staticWeightGB = (curModel.paramsB * weightPrecisionBytes).toFixed(1)

  // 内存碎片开销系数
  const fragmentationMultiplier = usePagedAttention ? 1.04 : 1.65
  const actualKVCacheGB = (parseFloat(totalKVCacheGB) * fragmentationMultiplier).toFixed(2)
  const totalVRAMNeededGB = (parseFloat(staticWeightGB) + parseFloat(actualKVCacheGB)).toFixed(1)
  const a100CountNeeded = Math.ceil(parseFloat(totalVRAMNeededGB) / 80)

  const ready = picked.length >= 2 || decodeStep >= 2

  return (
    <div className="attn-lab">
      {/* 顶部实操模式子标签 */}
      <div className="lab-sub-tabs">
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'qkv' ? 'active' : ''}`}
          onClick={() => setSubTab('qkv')}
        >
          1. QKV 自注意力点积热力图
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'prefill-decode' ? 'active' : ''}`}
          onClick={() => setSubTab('prefill-decode')}
        >
          2. Prefill vs Decode 架构瓶颈实测
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'kv-calc' ? 'active' : ''}`}
          onClick={() => setSubTab('kv-calc')}
        >
          3. KV Cache 显存容量计算器 & PagedAttention
        </button>
      </div>

      {/* ================= 子标签 1: QKV 点积与注意力热力图 ================= */}
      {subTab === 'qkv' && (
        <div className="qkv-section">
          <div className="attn-intro-box">
            <h4>第一性原理解析：Q、K、V 矩阵点积与为什么除以 √dₖ？</h4>
            <p>
              大模型没有“理解”，它只在执行高维向量空间检索：
              <code className="mono">Attention(Q, K, V) = softmax(Q · Kᵀ / √dₖ) · V</code>
            </p>
            <p className="math-derivation-note">
              <strong>为什么除以 √dₖ？</strong> 当向量维度 dₖ（如 128）很大时，两个独立高斯分布向量点积的均值为 0，方差却高达 dₖ。若不缩放，点积绝对值极大，送入 softmax 后梯度几乎全部归零（梯度消失饱和）。除以 √dₖ 将方差重新拉回稳定值 1！
            </p>
          </div>

          <div className="tokens-interactive-area">
            <span className="tokens-label">点击任意 Token 作为 Query（查询项），观察大模型在为它关注哪些 Key：</span>
            <div className="tokens" role="group" aria-label="Token列表">
              {TOKENS.map((token, index) => {
                const weight = glance?.weights[index] ?? 0
                return (
                  <button
                    key={token}
                    type="button"
                    className={index === focus ? 'token current' : 'token'}
                    style={{ ['--w' as string]: String(weight) }}
                    aria-pressed={index === focus}
                    onClick={() => chooseToken(index)}
                  >
                    {token}
                  </button>
                )
              })}
            </div>

            {glance && (
              <div className="attention-bars-box">
                <div className="qkv-formula-view mono">
                  Query [<strong>{TOKENS[focus]}</strong>] ➔ 与历史上下文 Key 点积 Softmax 分布：
                </div>
                <ul className="bars">
                  {TOKENS.map((token, index) => (
                    <li key={token}>
                      <span className="token-name">{token}</span>
                      <span className="bar-track">
                        <span
                          className="bar-fill matcha"
                          style={{ width: `${glance.weights[index] * 100}%` }}
                        />
                      </span>
                      <span className="mono bar-num">{glance.weights[index].toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <p className="lab-note" role="status">
                  💡 <strong>语义流向解读</strong>：{glance.note}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 子标签 2: Prefill vs Decode 架构瓶颈 ================= */}
      {subTab === 'prefill-decode' && (
        <div className="prefill-decode-section">
          <div className="attn-intro-box">
            <h4>大模型推理系统的两个截然不同的物理阶段</h4>
            <p>
              大模型生产环境部署中，系统开销被严格切分为两阶段，其算力瓶颈与优化方向彻底相反：
            </p>
          </div>

          <div className="phases-contrast-grid">
            <div className={`phase-card ${inferPhase === 'prefill' ? 'phase-active' : ''}`}>
              <div className="phase-badge prefill-badge">阶段一：Prefill（首字生成 / 提示词计算）</div>
              <ul className="phase-specs-list">
                <li><strong>并行计算模式</strong>：高并行矩阵乘法（GEMM）</li>
                <li><strong>物理瓶颈</strong>：<span className="bottle-pill compute">算力受限 (Compute-Bound)</span></li>
                <li><strong>Tensor Core 利用率</strong>：极高（MFU 达 50%~65%）</li>
                <li><strong>核心时延指标</strong>：<strong>TTFT</strong> (Time to First Token)</li>
                <li><strong>主流加速器技术</strong>：FlashAttention-2、Chunked Prefill、张量并行</li>
              </ul>
            </div>

            <div className={`phase-card ${inferPhase === 'decode' ? 'phase-active' : ''}`}>
              <div className="phase-badge decode-badge">阶段二：Decode（自回归增量吐字）</div>
              <ul className="phase-specs-list">
                <li><strong>并行计算模式</strong>：串行自回归（每次只输入 1 个 Token）</li>
                <li><strong>物理瓶颈</strong>：<span className="bottle-pill memory">显存带宽受限 (Memory-Bound)</span></li>
                <li><strong>Tensor Core 利用率</strong>：极低（MFU 常只有 1%~5%！）</li>
                <li><strong>核心时延指标</strong>：<strong>TPOT</strong> (Time per Output Token)</li>
                <li><strong>主流加速器技术</strong>：PagedAttention、投机采样 (Speculative Decoding)、FlashDecoding</li>
              </ul>
            </div>
          </div>

          <div className="live-inference-simulator">
            <h5>⚡ 在线推理状态机沙盘</h5>
            <div className="sim-token-display mono">
              {genTokens.map((t, idx) => (
                <span
                  key={idx}
                  className={`gen-token-pill ${idx >= 7 ? 'new-token' : 'prompt-token'}`}
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="sim-hardware-meters">
              <div className="hardware-meter-box">
                <span className="meter-label">GPU 计算核心利用率 (Compute FLOPs)</span>
                <div className="meter-bar-track">
                  <div
                    className="meter-bar-inner compute-color"
                    style={{
                      width:
                        inferPhase === 'prefill'
                          ? '92%'
                          : inferPhase === 'decode'
                          ? '8%'
                          : '0%',
                    }}
                  />
                </div>
                <span className="meter-val mono">
                  {inferPhase === 'prefill'
                    ? '92% (吃满 Tensor Cores)'
                    : inferPhase === 'decode'
                    ? '8% (算力严重饥饿闲置)'
                    : '待机'}
                </span>
              </div>

              <div className="hardware-meter-box">
                <span className="meter-label">GPU 显存总线带宽利用率 (HBM Bandwidth)</span>
                <div className="meter-bar-track">
                  <div
                    className="meter-bar-inner memory-color"
                    style={{
                      width:
                        inferPhase === 'prefill'
                          ? '40%'
                          : inferPhase === 'decode'
                          ? '98%'
                          : '0%',
                    }}
                  />
                </div>
                <span className="meter-val mono">
                  {inferPhase === 'prefill'
                    ? '40% (数据复用率高)'
                    : inferPhase === 'decode'
                    ? '98% (显存带宽墙被打爆！)'
                    : '待机'}
                </span>
              </div>
            </div>

            <div className="sim-ctrl-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleStartPrefill}
              >
                1. 触发 Prefill (单次送入提示词)
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleStepDecode}
                disabled={decodeStep >= nextWordCandidates.length}
              >
                {decodeStep >= nextWordCandidates.length
                  ? '生成完毕'
                  : '2. 逐步 Decode 吐字 (观察显存带宽)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 子标签 3: KV Cache 显存容量计算器 & PagedAttention ================= */}
      {subTab === 'kv-calc' && (
        <div className="kv-calc-section">
          <div className="attn-intro-box">
            <h4>工业级 KV Cache 显存容量推导模型</h4>
            <p>
              大模型生成每一个新 Token 时，为了不重复计算前文中庞大 Token 的 QKV 向量，必须把每一层所有历史 Token 的 Key 和 Value 保存在显存中。这笔显存开销随上下文长度和并发 Batch 呈线性爆发增长！
            </p>
            <div className="mono-formula-box mono">
              KV Cache 显存(Bytes) = 2 × 2 × Layers × (HiddenSize / QHeads × KVHeads) × ContextLength × BatchSize × PrecisionBytes
            </div>
          </div>

          <div className="calc-dashboard-grid">
            <div className="calc-controls-panel">
              <div className="control-group">
                <label className="ctrl-label">选择基座模型预设：</label>
                <div className="model-radio-group">
                  {MODEL_PRESETS.map((m, idx) => (
                    <button
                      key={m.name}
                      type="button"
                      className={`model-pill-btn ${idx === selectedModelIdx ? 'active' : ''}`}
                      onClick={() => setSelectedModelIdx(idx)}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <div className="label-val-row">
                  <label className="ctrl-label">并发并发批次 (Batch Size):</label>
                  <span className="val-text mono">{batchSize}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="64"
                  step="1"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="range-slider"
                />
              </div>

              <div className="control-group">
                <div className="label-val-row">
                  <label className="ctrl-label">上下文窗口长度 (Tokens):</label>
                  <span className="val-text mono">{contextLen.toLocaleString()} Tokens</span>
                </div>
                <input
                  type="range"
                  min="2048"
                  max="131072"
                  step="2048"
                  value={contextLen}
                  onChange={(e) => setContextLen(Number(e.target.value))}
                  className="range-slider"
                />
              </div>

              <div className="control-group">
                <label className="ctrl-label">KV Cache 量化精度：</label>
                <div className="precision-btn-group">
                  <button
                    type="button"
                    className={`sub-tab-btn ${kvPrecision === 2 ? 'active' : ''}`}
                    onClick={() => setKvPrecision(2)}
                  >
                    FP16 (2 Bytes)
                  </button>
                  <button
                    type="button"
                    className={`sub-tab-btn ${kvPrecision === 1 ? 'active' : ''}`}
                    onClick={() => setKvPrecision(1)}
                  >
                    FP8 (1 Byte)
                  </button>
                  <button
                    type="button"
                    className={`sub-tab-btn ${kvPrecision === 0.5 ? 'active' : ''}`}
                    onClick={() => setKvPrecision(0.5)}
                  >
                    INT4 (0.5 Byte)
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={usePagedAttention}
                    onChange={(e) => setUsePagedAttention(e.target.checked)}
                  />
                  <span>启用 vLLM <strong>PagedAttention 虚拟分页</strong>（消除连续物理显存碎片）</span>
                </label>
              </div>
            </div>

            <div className="calc-results-panel">
              <div className="vram-metric-card">
                <span className="m-label">静态基座模型权重显存</span>
                <span className="m-val mono">{staticWeightGB} GB</span>
                <span className="m-sub">不随上下文增加改变</span>
              </div>

              <div className="vram-metric-card alert-kv-card">
                <span className="m-label">动态 KV Cache 显存占用</span>
                <span className="m-val mono highlight">{actualKVCacheGB} GB</span>
                <span className="m-sub">
                  {usePagedAttention
                    ? 'PagedAttention 分页管理，仅约 4% 内部碎片'
                    : '传统连续显存预留，受 65% 内存碎片与虚高槽位浪费'}
                </span>
              </div>

              <div className="vram-metric-card total-card">
                <span className="m-label">总计需申请 GPU 显存</span>
                <span className="m-val mono total-val">{totalVRAMNeededGB} GB</span>
                <span className="m-sub">
                  需至少搭载 <strong>{a100CountNeeded} 张</strong> 80GB H100/A100 GPU 显卡
                </span>
              </div>
            </div>
          </div>

          {/* PagedAttention 虚拟内存技术架构解析 */}
          <div className="paged-attention-concept-box">
            <h5>💡 为什么 vLLM 的 PagedAttention 是革命性的？</h5>
            <div className="paged-comparison-grid">
              <div className="compare-block bad">
                <h6>传统 HuggingFace 显存分配（连续数组）</h6>
                <p>
                  必须预先按最大长度（如 128k）分配一整块连续显存空间。哪怕用户只聊了 2 句话，整个大槽位也被占死。造成 <strong>60%~80% 显存浪费</strong> 与严重的 OOM。
                </p>
              </div>
              <div className="compare-block good">
                <h6>vLLM PagedAttention（借鉴 OS 虚拟内存分页）</h6>
                <p>
                  将 KV Cache 切分为固定大小的 Block（如每个 Block 存 16 个 Token）。通过类似 OS 页表（Page Table）将逻辑上的连续 Token 离散映射到物理显存页上！显存利用率飙升至 <strong>96%</strong>，吞吐量提升 3-4 倍！
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {ready && !completed && (
        <div className="pass-row">
          <button
            type="button"
            className="btn"
            onClick={onComplete}
          >
            我已参透自注意力与 KV Cache 推理架构！点击通关
          </button>
        </div>
      )}

      {completed && (
        <div className="pass-banner">
          <strong>大模型与 AI 架构师登顶达成！</strong> 从最初的 0 与 1 物理开关，到全加器、冯诺依曼指令、操作系统虚拟内存、六大编程语言生态、高并发分布式防线，再到 Transformer 与现代大模型推理体系，你已经完整走通了整座计算机科学的宏伟山脉！
        </div>
      )}
    </div>
  )
}
