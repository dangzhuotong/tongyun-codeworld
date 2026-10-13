import { useState } from 'react'

export type LangKey = 'cpp' | 'rust' | 'go' | 'java' | 'python' | 'ts'

interface LangProfile {
  key: LangKey
  name: string
  tagline: string
  aiRole: string
  runtimeModel: string
  memoryModel: string
  concurrencyModel: string
  scores: {
    perf: number // 1-5
    safety: number
    concurrency: number
    ergonomics: number
    memoryEfficiency: number
  }
  bestFor: string
  avoidWhen: string
  counterCode: string
  memoryDiagramText: string
}

const LANGUAGES: Record<LangKey, LangProfile> = {
  cpp: {
    key: 'cpp',
    name: 'C / C++',
    tagline: '直接贴地飞行的性能怪兽，硬件的直接翻译器',
    aiRole: '在未来 AI 架构中：编写底层 CUDA C++ 算子加速、显卡显存直接搬运，以及顶尖大模型推理引擎核心（如 TensorRT-LLM, llama.cpp）。',
    runtimeModel: '纯 AOT 本地机器码编译，零额外运行时',
    memoryModel: '手动管理 (malloc/free, new/delete, RAII)，裸指针直接操作物理内存',
    concurrencyModel: 'OS 原生内核线程 (std::thread, pthread)，锁与硬件原子指令',
    scores: { perf: 5, safety: 1, concurrency: 3, ergonomics: 2, memoryEfficiency: 5 },
    bestFor: '操作系统内核、游戏引擎、数据库底层存储引擎 (RocksDB)、AI底层高并发CUDA算子',
    avoidWhen: '快速变动的普通业务CRUD、缺乏资深老手的团队（易产生野指针与越界内存安全隐患）',
    memoryDiagramText: '栈区直接放结构体；堆区由程序员手动 malloc 物理地址；忘记 free 就会发生内存泄漏。',
    counterCode: `// C++: 使用硬件原子指令实现无锁并发计数器
#include <atomic>
#include <thread>

std::atomic<long> counter{0};

void worker() {
    for(int i = 0; i < 100000; ++i) {
        counter.fetch_add(1, std::memory_order_relaxed); // 直接生成 CPU LOCK XADD 汇编指令
    }
}`,
  },
  rust: {
    key: 'rust',
    name: 'Rust',
    tagline: '零成本抽象的系统神作：极速性能 + 编译期 100% 内存安全',
    aiRole: '在未来 AI 架构中：构建安全沙箱（Firecracker微虚拟机）、WASM边缘运行时、高吞吐向量检索核心（Qdrant）与高性能数据分析（Polars）。',
    runtimeModel: '纯 AOT 机器码编译，无 GC 垃圾回收器，零抽象运行时惩罚',
    memoryModel: '所有权机制 (Ownership) + 借用检查器 (Borrow Checker)，离开作用域自动释放',
    concurrencyModel: '无畏并发 (Send/Sync 特征，编译期杜绝数据竞争) + async/await 状态机',
    scores: { perf: 5, safety: 5, concurrency: 5, ergonomics: 3, memoryEfficiency: 5 },
    bestFor: '新一代基础云原生底座、分布式一致性存储 (TiKV)、加密算法、安全AI沙箱',
    avoidWhen: '急于交付的敏捷轻量原型、包含复杂双向循环引用图结构的有向图场景',
    memoryDiagramText: '每一个堆内存拥有唯一 Owner；借用检查器在编译阶段保证没有悬垂指针，运行时零GC开销。',
    counterCode: `// Rust: 编译期强制检查线程安全
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::thread;

let counter = Arc::new(AtomicUsize::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter_clone = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        counter_clone.fetch_add(1, Ordering::Relaxed);
    }));
}`,
  },
  go: {
    key: 'go',
    name: 'Go (Golang)',
    tagline: '云原生与高并发网关的绝对霸主，为分布式网络而生',
    aiRole: '在未来 AI 架构中：构建高并发大模型推理 API 网关、Kubernetes 容器编排调度器、分布式智能体通信总线与流式排队集群。',
    runtimeModel: 'AOT 机器码编译，内置轻量级运行时与 M:N 协程调度器',
    memoryModel: '轻量并发标记清除 GC（STW 延迟低于 1 毫秒），逃逸分析决定栈或堆',
    concurrencyModel: 'CSP 协程模型：Goroutine (初始仅 2KB) + Channel 通道通信',
    scores: { perf: 4, safety: 4, concurrency: 5, ergonomics: 5, memoryEfficiency: 4 },
    bestFor: 'Kubernetes/Docker 云原生体系、高并发 API 网关、微服务业务后端、中间件集群',
    avoidWhen: '硬实时系统、高频量化交易系统（虽然 GC 极短但仍偶有微毫秒抖动）、底层矩阵算子开发',
    memoryDiagramText: '变量自动通过逃逸分析分配；后台 GC 线程定期三色标记，无需手动管理。',
    counterCode: `// Go: 原生 Goroutine 协程并发
package main

import (
    "sync/atomic"
)

var counter int64

func worker() {
    for i := 0; i < 100000; i++ {
        atomic.AddInt64(&counter, 1) // 极简的高效原子操作
    }
}`,
  },
  java: {
    key: 'java',
    name: 'Java',
    tagline: '企业级大型工业架构的常青树，生态体系极其深厚',
    aiRole: '在未来 AI 架构中：大型企业已有中台交易系统与大数据流处理平台（Flink/Kafka）平滑接入大模型企业级智能体应用。',
    runtimeModel: 'JVM 字节码 + HotSpot JIT 即时编译器（热点代码动态编译为汇编）',
    memoryModel: 'JVM 分代堆内存 (新生代 Eden/Survivor + 老年代)，配备 G1 / ZGC 回收器',
    concurrencyModel: 'OS 线程池模型 (java.util.concurrent) + 最新 JDK 21 虚拟线程 (Project Loom)',
    scores: { perf: 4, safety: 4, concurrency: 4, ergonomics: 4, memoryEfficiency: 2 },
    bestFor: '银行金融核心交易、超大型复杂业务企业中台、大数据计算生态 (Hadoop/Flink/Kafka)',
    avoidWhen: '资源极度受限的嵌入式/IoT 设备、要求几毫秒冷启动的纯 Serverless 极简函数',
    memoryDiagramText: '所有 Object 都在堆上分配，对象头占用 12~16 字节，通过指针访问，内存开销较重。',
    counterCode: `// Java: 强大的并发包原子类与 CAS
import java.util.concurrent.atomic.AtomicLong;

public class CounterService {
    private final AtomicLong counter = new AtomicLong(0);

    public void increment() {
        counter.incrementAndGet(); // 底层 Unsafe.compareAndSwapLong 硬件 CAS
    }
}`,
  },
  python: {
    key: 'python',
    name: 'Python',
    tagline: 'AI 与数据科学的天下共主，胶水语言的终极形态',
    aiRole: '在未来 AI 架构中：深度学习算法实验、PyTorch 训练微调、数据清洗流水线，以及 LangChain/LlamaIndex Agent 敏捷开发的主战场。',
    runtimeModel: 'CPython 解释器执行字节码，计算密集型严重依赖底层 C/C++ 扩展 (PyTorch/NumPy)',
    memoryModel: '引用计数机制为主（每个对象包装 PyObject，开销 ~28 字节）+ 分代循环引用垃圾回收',
    concurrencyModel: '受限于全局解释器锁 (GIL)；I/O 密集型使用 Asyncio 协程，计算密集型使用多进程 (Multiprocessing)',
    scores: { perf: 1, safety: 3, concurrency: 2, ergonomics: 5, memoryEfficiency: 1 },
    bestFor: 'AI/大模型算法训练与推理流水线 (PyTorch)、数据分析、自动化脚本、快速 MVP 原型验证',
    avoidWhen: '高吞吐低延迟网关、密集数字运算但无法调用底层 C 扩展的纯 CPU 循环、对内存占用敏感的系统',
    memoryDiagramText: '万物皆是 PyObject 包装指针；变量赋值只是计数器 +1；受限于 GIL 锁，多线程无法同时利用多核 CPU。',
    counterCode: `# Python: 多线程受 GIL 限制，使用锁或多进程
import threading

counter = 0
lock = threading.Lock()

def worker():
    global counter
    for _ in range(100000):
        with lock: # 必须加锁，否则 counter += 1 字节码不是原子的
            counter += 1`,
  },
  ts: {
    key: 'ts',
    name: 'TypeScript (Node.js)',
    tagline: '全栈交互与人机界面的统治者，结构化类型的优雅之美',
    aiRole: '在未来 AI 架构中：构筑 AI 时代的前端人机协同 Copilot 界面、Next.js 智能体全栈应用，以及 Anthropic MCP（模型上下文协议）服务器编写。',
    runtimeModel: '编译为 JavaScript，由 V8 引擎执行并进行高效 JIT 即时编译',
    memoryModel: 'V8 引擎堆内存分代垃圾回收 (新生代 Scavenge + 老年代 Mark-Sweep)',
    concurrencyModel: '单线程事件循环 (Event Loop) + 异步非阻塞 I/O (libuv) + Worker Threads',
    scores: { perf: 3, safety: 4, concurrency: 4, ergonomics: 5, memoryEfficiency: 3 },
    bestFor: '现代全栈 Web 开发、高并发 I/O 密集型 API 网关、跨平台桌面客户端 (Electron)、MCP 智能体工具编写',
    avoidWhen: '密集型图形/矩阵数字运算、对微秒级垃圾回收停顿极度敏感的高频底层系统',
    memoryDiagramText: '单主线程独享堆栈；无需任何并发锁即可操作普通变量；耗时 I/O 扔给底层 libuv 线程池。',
    counterCode: `// TypeScript (Node.js): 单线程事件循环天然无竞态
let counter = 0;

// 在单个 Node.js 进程中，同步代码执行绝不会被打断
function increment() {
  counter++; // 无需 Mutex 互斥锁，因为没有第二个线程并发写！
}

async function handleRequest() {
  increment();
  await database.save(counter); // 异步等待时不阻塞事件循环
}`,
  },
}

interface MultiLanguageLabProps {
  completed: boolean
  onComplete: () => void
}

export function MultiLanguageLab({ completed, onComplete }: MultiLanguageLabProps) {
  const [selectedLang, setSelectedLang] = useState<LangKey>('rust')
  const [testedSim, setTestedSim] = useState(false)
  const current = LANGUAGES[selectedLang]

  const handleSimulate100k = () => {
    setTestedSim(true)
    if (!completed) {
      onComplete()
    }
  }

  return (
    <div className="multilang-lab">
      {/* 语言选择器 */}
      <div className="lang-tabs-bar">
        {(Object.keys(LANGUAGES) as LangKey[]).map((key) => {
          const l = LANGUAGES[key]
          const isSelected = selectedLang === key
          return (
            <button
              key={key}
              type="button"
              className={`lang-tab-pill ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedLang(key)}
            >
              <span className="lang-tab-name">{l.name}</span>
            </button>
          )
        })}
      </div>

      {/* 语言全景核心卡片 */}
      <div className="lang-profile-card">
        <div className="lang-title-row">
          <div>
            <h3>{current.name}</h3>
            <p className="lang-tagline">{current.tagline}</p>
          </div>
        </div>

        {/* AI 原生定位横幅 */}
        <div className="lang-ai-role-banner">
          <span className="ai-badge-pill">🤖 未来 AI 原生架构定位：</span>
          <p>{current.aiRole}</p>
        </div>

        {/* 架构维度五边形评分条 */}
        <div className="radar-score-container">
          <span className="radar-title">架构能力雷达（满分 5 星）：</span>
          <div className="score-bars-grid">
            <div className="score-bar-item">
              <span className="score-label">执行性能 (CPU/时延)</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${current.scores.perf * 20}%` }} />
              </div>
              <span className="score-num mono">{current.scores.perf}/5</span>
            </div>

            <div className="score-bar-item">
              <span className="score-label">内存安全 (防溢出/无野指针)</span>
              <div className="bar-track">
                <div className="bar-fill matcha" style={{ width: `${current.scores.safety * 20}%` }} />
              </div>
              <span className="score-num mono">{current.scores.safety}/5</span>
            </div>

            <div className="score-bar-item">
              <span className="score-label">高并发吞吐能力</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${current.scores.concurrency * 20}%` }} />
              </div>
              <span className="score-num mono">{current.scores.concurrency}/5</span>
            </div>

            <div className="score-bar-item">
              <span className="score-label">内存资源精简度</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${current.scores.memoryEfficiency * 20}%` }} />
              </div>
              <span className="score-num mono">{current.scores.memoryEfficiency}/5</span>
            </div>

            <div className="score-bar-item">
              <span className="score-label">开发心智与人体工学</span>
              <div className="bar-track">
                <div className="bar-fill peach" style={{ width: `${current.scores.ergonomics * 20}%` }} />
              </div>
              <span className="score-num mono">{current.scores.ergonomics}/5</span>
            </div>
          </div>
        </div>

        {/* 底层三大架构支柱剖析 */}
        <div className="lang-internals-grid">
          <div className="internal-col">
            <div className="internal-head">
              <span className="icon">⚙️</span>
              <h4>执行模型</h4>
            </div>
            <p>{current.runtimeModel}</p>
          </div>

          <div className="internal-col">
            <div className="internal-head">
              <span className="icon">🧠</span>
              <h4>内存管理哲学</h4>
            </div>
            <p>{current.memoryModel}</p>
            <div className="memory-desc-tip mono">{current.memoryDiagramText}</div>
          </div>

          <div className="internal-col">
            <div className="internal-head">
              <span className="icon">⚡</span>
              <h4>并发与调度模型</h4>
            </div>
            <p>{current.concurrencyModel}</p>
          </div>
        </div>

        {/* 同一业务场景代码横向对照 */}
        <div className="code-comparison-box">
          <div className="code-header">
            <span>同题对照：高并发无锁计数器实现（只看关键设计，不扣细枝末节）</span>
            <span className="mono code-lang-tag">{current.key.toUpperCase()}</span>
          </div>
          <pre className="mono code-block">
            <code>{current.counterCode}</code>
          </pre>
        </div>

        {/* 架构师技术选型罗盘 */}
        <div className="architect-advice-box">
          <div className="advice-item best">
            <span className="advice-tag">✅ 架构师选型黄金场景 (Best For)：</span>
            <p>{current.bestFor}</p>
          </div>
          <div className="advice-item avoid">
            <span className="advice-tag">❌ 严禁选型避坑场景 (Avoid When)：</span>
            <p>{current.avoidWhen}</p>
          </div>
        </div>
      </div>

      {/* 10万并发连接模拟实操沙盘 */}
      <div className="concurrency-simulation-sandbox">
        <div className="sim-head">
          <h4>🧪 架构师实操测试：模拟 100,000 (10万) 客户端长连接并发</h4>
          <p>
            点击下方按钮，观察 <strong>{current.name}</strong> 在处理海量并发连接时的物理内存消耗与系统表现！
          </p>
        </div>

        <div className="sim-action">
          <button
            type="button"
            className="btn"
            onClick={handleSimulate100k}
          >
            🚀 施压 10 万并发连接！观察资源开销
          </button>
        </div>

        {testedSim && (
          <div className="sim-result-card">
            <h5>测试结果评估：</h5>
            {selectedLang === 'go' && (
              <p className="sim-p good">
                <strong>Go 表现极佳：</strong>10 万个 Goroutine 协程总共仅占用约 <strong>200MB ~ 300MB</strong> 内存（每个初始 2KB）！M:N 运行时调度平稳，CPU 上下文切换开销极小！
              </p>
            )}
            {selectedLang === 'rust' && (
              <p className="sim-p good">
                <strong>Rust 表现极佳：</strong>基于 async 状态机运行，无任何 GC 停顿，10 万连接内存开销仅 <strong>150MB</strong>，极致轻量，尾部延迟（P99）低至亚毫秒！
              </p>
            )}
            {selectedLang === 'ts' && (
              <p className="sim-p warn">
                <strong>TypeScript (Node.js) 表现优秀：</strong>基于单线程 Event Loop 事件循环，内存占用约 <strong>350MB</strong>，抗压优秀，但注意回调中绝对不能执行重计算，否则会导致全局阻塞！
              </p>
            )}
            {selectedLang === 'java' && (
              <p className="sim-p warn">
                <strong>传统 Java 线程模型预警：</strong>如果为每个连接创建 OS 线程，10 万个线程将消耗 <strong>100GB+ 内存</strong>（每个线程 1MB 栈）直接 OOM 崩溃！必须引入 Netty NIO 或 JDK 21 虚拟线程 (Virtual Threads)！
              </p>
            )}
            {selectedLang === 'cpp' && (
              <p className="sim-p good">
                <strong>C++ (epoll 原生架构)：</strong>直接操作 Linux 内核 epoll 边缘触发事件，内存开销最低（约 <strong>80MB</strong>），但需要高超的工程手艺避免数据竞争与野指针！
              </p>
            )}
            {selectedLang === 'python' && (
              <p className="sim-p danger">
                <strong>Python 架构妥协：</strong>必须基于 asyncio 异步事件循环；若使用多线程会因为 GIL 锁无法发挥多核算力，对象封装导致内存消耗高达 <strong>800MB+</strong>。
              </p>
            )}
          </div>
        )}
      </div>

      {completed && (
        <div className="pass-banner">
          <strong>通关达成！</strong> 你已经建立了资深架构师的核心心智模型：<strong>没有任何语言是全知全能的银弹，架构的精髓在于洞察底层的内存与并发代价，并在特定场景中做出最恰当的权衡。</strong>
        </div>
      )}
    </div>
  )
}
