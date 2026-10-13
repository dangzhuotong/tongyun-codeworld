import { useState } from 'react'

const TOKENS = ['小明', '把', '红色', '的', '苹果', '递给', '妹妹'] as const

const GLANCES: { weights: number[]; note: string }[] = [
  {
    weights: [1, 0, 0, 0, 0, 0, 0],
    note: '你看，它几乎只看着「小明」自己，上文还没展开。',
  },
  {
    weights: [0.55, 0.25, 0.08, 0.04, 0.04, 0.02, 0.02],
    note: '你看，它在看「小明」——「把」要接住是谁在递。',
  },
  {
    weights: [0.12, 0.1, 0.62, 0.06, 0.06, 0.02, 0.02],
    note: '你看，它主要盯着「红色」这个词本身。',
  },
  {
    weights: [0.08, 0.06, 0.46, 0.22, 0.1, 0.04, 0.04],
    note: '你看，它在看「红色」，「的」是贴在颜色后面的。',
  },
  {
    weights: [0.06, 0.08, 0.4, 0.1, 0.28, 0.04, 0.04],
    note: '你看，它在看「红色」——这只苹果是红的。',
  },
  {
    weights: [0.22, 0.06, 0.08, 0.04, 0.36, 0.18, 0.06],
    note: '你看，它在看「苹果」和「小明」：谁把东西递出去。',
  },
  {
    weights: [0.16, 0.05, 0.06, 0.04, 0.24, 0.3, 0.15],
    note: '你看，它在看「递给」和「苹果」：东西到了妹妹手里。',
  },
]

interface AttentionLabProps {
  completed: boolean
  onComplete: () => void
}

export function AttentionLab({ completed, onComplete }: AttentionLabProps) {
  const [picked, setPicked] = useState<number[]>([])
  const [focus, setFocus] = useState<number | null>(4) // 默认高亮苹果
  const [genTokens, setGenTokens] = useState<string[]>(['小明', '把', '红色', '的', '苹果', '递给', '妹妹'])
  const [simStep, setSimStep] = useState(0)

  const glance = focus === null ? null : GLANCES[focus]
  const ready = picked.length >= 2 || simStep >= 2

  const choose = (index: number) => {
    setFocus(index)
    setPicked((prev) => (prev.includes(index) ? prev : [...prev, index]))
  }

  // 模拟自回归生成下一个 Token 与 KV Cache 增长
  const nextWordCandidates = ['笑了', '，', '妹妹', '很', '开心', '。']
  const handleGenerateNextToken = () => {
    if (simStep < nextWordCandidates.length) {
      const nextWord = nextWordCandidates[simStep]
      setGenTokens((prev) => [...prev, nextWord])
      setSimStep((s) => s + 1)
      if (simStep + 1 >= 2 && !completed) {
        onComplete()
      }
    }
  }

  // 计算估算的 KV Cache 显存大小（假设 70B 模型，fp16，每个 Token 约 1.2MB）
  const totalTokens = genTokens.length
  const estimatedKVCacheMB = (totalTokens * 1.25).toFixed(1)

  return (
    <div className="attn-lab">
      {/* 第一性原理解构：QKV 点积与图书检索模型 */}
      <div className="attn-intro-box">
        <h4>Transformer 自注意力机制：Q、K、V 的向量点积之美</h4>
        <p>
          大模型没有灵魂，它只是在计算高维向量的相似度：
          <strong>Query（我想找什么）</strong> 与所有历史词的 <strong>Key（我是什么特征）</strong> 做点积计算出匹配权重，再把对应的 <strong>Value（信息内容）</strong> 加权汇总起来。
        </p>
      </div>

      {/* 句子与 Token 交互高亮 */}
      <div className="tokens-interactive-area">
        <span className="tokens-label">点击任意 Token，观察大模型内部在“看谁”：</span>
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
                onClick={() => choose(index)}
              >
                {token}
              </button>
            )
          })}
        </div>

        {glance && (
          <div className="attention-bars-box">
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
              {glance.note}
            </p>
          </div>
        )}
      </div>

      {/* AI 架构师深水区：自回归生成与 KV Cache 显存带宽墙沙盘 */}
      <div className="kv-cache-sandbox">
        <div className="kv-header">
          <h4>🚀 现代大模型推理架构瓶颈：自回归与 KV Cache 显存墙</h4>
          <p>
            大模型生成文本是一个词一个词往外蹦（自回归 Decode）。为避免每次重复计算过去词的 QKV，显存必须把历史 Key 和 Value 缓存下来（KV Cache）。
          </p>
        </div>

        <div className="kv-live-display">
          <div className="generated-sentence-box mono">
            {genTokens.map((t, idx) => (
              <span key={idx} className={`gen-token-pill ${idx >= 7 ? 'new-token' : ''}`}>
                {t}
              </span>
            ))}
          </div>

          <div className="kv-metrics-row">
            <div className="kv-metric-card">
              <span className="kv-label">当前上下文长度 (Tokens)</span>
              <span className="kv-val mono">{totalTokens}</span>
            </div>
            <div className="kv-metric-card highlight-metric">
              <span className="kv-label">已占用 KV Cache 显存估算</span>
              <span className="kv-val mono">{estimatedKVCacheMB} MB</span>
            </div>
            <div className="kv-metric-card">
              <span className="kv-label">推理瓶颈性质</span>
              <span className="kv-val mono bottle-text">显存带宽瓶颈 (Memory-Bound)</span>
            </div>
          </div>

          <div className="kv-actions">
            <button
              type="button"
              className="btn"
              onClick={handleGenerateNextToken}
              disabled={simStep >= nextWordCandidates.length}
            >
              {simStep >= nextWordCandidates.length
                ? '已生成完整长句'
                : '✨ 逐 Token 自回归吐字生成 ➔ 观察 KV Cache 增长'}
            </button>
          </div>

          <p className="kv-insight-note">
            <strong>架构师洞察</strong>：为什么长文本大模型极其费卡？因为每生成 1 个新词，GPU 都必须把过去所有 Token 的庞大 KV Cache 从显存重新搬运到计算核心里！这就是为什么 vLLM 的 <strong>PagedAttention</strong> 和 <strong>FlashAttention</strong> 能够震撼整个开源世界！
          </p>
        </div>
      </div>

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
