export interface MechanismItem {
  title: string
  desc: string
}

export interface MapDoc {
  overview: string
  mentalModel: string
  coreMechanisms: MechanismItem[]
  architectureImpact: string
  aiEraRelevance: string
  tradeoffs: string
  relatedArchCases: string[] // 对应 ArchitectureCase.id
  relatedLabId?: string // 对应 SEGMENTS 的 id: switch, gates, cpu, os, languages, arch, nn, attn
}

export interface MapNode {
  id: string
  title: string
  category: string
  categoryId: string
  x: number // 地图横坐标百分比 0-100
  y: number // 地图纵坐标百分比 0-100
  importance: 'core' | 'important' | 'advanced'
  summary: string
  tag: string
  doc: MapDoc
}

export interface MapLink {
  from: string
  to: string
  label?: string
}

export interface CategoryMeta {
  id: string
  name: string
  color: string
  description: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'hardware', name: '物理底层与编码', color: '#b27a4e', description: '从晶体管、逻辑门到二进制与浮点数的本质' },
  { id: 'arch', name: '计算机体系与CPU', color: '#6b8f71', description: '冯诺依曼结构、指令流水线、存储金字塔与总线' },
  { id: 'os', name: '现代操作系统内核', color: '#4a7c59', description: '进程线程、虚拟内存分页、Linux 内核与高并发网络 IO' },
  { id: 'network', name: '计算机网络与通信', color: '#3d7280', description: 'OSI 七层、TCP 三次握手、HTTP/3、WebSocket 与 gRPC' },
  { id: 'languages', name: '编程语言生态与并发', color: '#7a5c8f', description: '编译与运行时、垃圾回收 GC、协程并发与内存模型' },
  { id: 'storage', name: '数据存储与缓存检索', color: '#a05c48', description: '关系型 MySQL、缓存 Redis、搜索 ES 与 AI 向量数据库' },
  { id: 'distributed', name: '分布式系统与中间件', color: '#c4683c', description: '微服务架构、消息队列 Kafka、Raft 一致性与分布式事务' },
  { id: 'ai', name: '现代 AI 与智能体体系', color: '#567568', description: 'Transformer、RAG 向量检索、Agent 智能体规划与 MCP 协议' },
]

export const MAP_NODES: MapNode[] = [
  // 1. 物理底层与编码
  {
    id: 'binary-logic',
    title: '二进制与编码本质',
    category: '物理底层与编码',
    categoryId: 'hardware',
    x: 8,
    y: 15,
    importance: 'core',
    summary: '0 与 1 物理电平、ASCII/UTF-8 字符集原理、补码机制与浮点数精度丢失',
    tag: '基础基石',
    doc: {
      overview: '二进制是物理电平高低（1 与 0）的数学映射；字符集与补码是所有数字计算的逻辑基石。',
      mentalModel: '计算机不认识文字或数字，只认识电荷的有无。编码是人类与硅基芯片签署的底层协议。',
      coreMechanisms: [
        { title: '补码机制与加减合一', desc: '原码、反码、补码解决了计算机无法直接做负数减法的问题，利用模数溢出特性让同一套加法器电路同时处理加法与减法。' },
        { title: 'IEEE 754 浮点数表示', desc: '符号位、阶码与尾数的排布方式，直接决定了 0.1 + 0.2 != 0.3 的精度溢出原理，以及金融业务严禁用 float 的根源。' },
        { title: 'UTF-8 变长编码规范', desc: '兼容单字节 ASCII，利用前导标志位使用 1~4 字节动态表达全球所有人类语言符号，兼顾兼容性与紧凑体积。' },
      ],
      architectureImpact: '在网络传输协议（如 Protobuf 二进制序列化）、位图算法（Bitmap / RoaringBitmap 亿级用户标签去重）、高性能哈希表中，二进制位运算比算术运算快 10~50 倍。',
      aiEraRelevance: '大模型量化（FP32 -> FP16 -> INT8 -> INT4 / AWQ / GPTQ）的底层，正是利用低位宽二进制压缩显存占用，让千亿模型能在单张消费级 GPU 跑起来。',
      tradeoffs: '高精度浮点（FP64/FP32）带来计算慢和高显存开销；低精度（FP8/INT4）大幅节省显存，但过低位宽可能引发数值下溢或模型幻觉。',
      relatedArchCases: ['short-url'],
      relatedLabId: 'switch',
    },
  },
  {
    id: 'logic-gates',
    title: '逻辑门与加法器',
    category: '物理底层与编码',
    categoryId: 'hardware',
    x: 8,
    y: 38,
    importance: 'core',
    summary: '与/或/非/异或门物理电路、全加器级联、RS 锁存器记忆电荷诞生',
    tag: '硬件起源',
    doc: {
      overview: '晶体管构成与/或/非/异或门，门电路级联出半加器、全加器，用物理电荷实现数学计算。',
      mentalModel: '硬件不是玄学，加法实质上是物理逻辑：本位是异或（XOR），进位是与（AND）。',
      coreMechanisms: [
        { title: '异或与加法本质', desc: '异或门等价于二进制加法的不进位结果；与门等价于进位检测。两者结合即构成了最基础的半加器。' },
        { title: '全加器级联与进位传递', desc: '3 个输入（A、B、低位进位 Cin）生成本位 Sum 与高位进位 Cout，多个全加器串联即可计算任意位数的二进制加法。' },
        { title: '双稳态锁存器 (RS Latch)', desc: '利用两个反向连接的门电路形成正反馈闭环，把电荷锁在回路里，诞生了 SRAM 内存与寄存器的物理存储形态。' },
      ],
      architectureImpact: 'ALU（算术逻辑单元）与状态寄存器的物理底座。芯片工程师通过优化关键路径（Critical Path）减少门延迟，直接决定了 CPU 的物理主频极限。',
      aiEraRelevance: '现代 AI 专用加速芯片（如 Google TPU、Nvidia Tensor Core）本质上就是超大规模的收缩阵列（Systolic Array），内部是上万个并行全加器和乘法器流水线，专为矩阵乘法优化。',
      tradeoffs: '简单的行波进位加法器电路面积小但延迟高；超前进位加法器速度极快但电路极其复杂、功耗更高。',
      relatedArchCases: [],
      relatedLabId: 'gates',
    },
  },
  {
    id: 'mosfet-transistor',
    title: 'MOSFET 晶体管与开关物理',
    category: '物理底层与编码',
    categoryId: 'hardware',
    x: 8,
    y: 62,
    importance: 'core',
    summary: '电控水龙头模型、从连续模拟电压到离散 0 与 1 阈值电压、半导体能带与漏电功耗墙',
    tag: '物理基石',
    doc: {
      overview: '晶体管是现代数字文明的原子：利用微弱电场控制半导体导电沟道通断，把连续物理电平转换为离散逻辑 0 与 1。',
      mentalModel: '晶体管就像一个电控水龙头，栅极（Gate）是旋钮电压，电压高于阈值则阀门打开水流倾泻（1），反之水断流（0）。',
      coreMechanisms: [
        { title: '阈值电压与离散化容限', desc: '将连续电压范围（如 0~0.8V 为 0，1.2~1.8V 为 1）划定安全禁区，利用高增益饱和区消除微小噪声干扰。' },
        { title: 'CMOS 互补对称结构', desc: 'NMOS 与 PMOS 对称配对，静态时总有一个截止，实现近乎零静态功耗的高速翻转。' },
        { title: '漏电功耗墙与量子隧穿', desc: '当晶体管栅极缩小到几纳米量级，量子隧穿效应导致漏电流剧增，引发芯片“功耗墙”瓶颈。' },
      ],
      architectureImpact: '芯片主频无法无限制提升（Dennard 缩放定律终结），迫使现代计算机架构从追求单核高主频全面转向多核并发与异构加速计算。',
      aiEraRelevance: '大模型万卡算力集群面对的物理本质挑战就是“功耗与散热”；英伟达 Blackwell 架构采用定制 4NP 工艺与液体冷却，本质就是为了突破单芯片晶体管功耗墙。',
      tradeoffs: '降低供电电压能平方级降低动态功耗，但会压缩噪声容限并降低开关速度；提高电压能冲高频但发热成倍增加。',
      relatedArchCases: [],
      relatedLabId: 'switch',
    },
  },

  // 2. 计算机体系与CPU
  {
    id: 'cpu-pipeline',
    title: 'CPU 指令流水线与总线',
    category: '计算机体系与CPU',
    categoryId: 'arch',
    x: 20,
    y: 20,
    importance: 'core',
    summary: '取指/译码/执行/写回四阶段、指令集架构 (x86/ARM/RISC-V) 与总线通信',
    tag: '算力核心',
    doc: {
      overview: '冯·诺依曼结构中 CPU 通过总线连接内存，指令通过取指、译码、执行、写回流水线高速吞吐。',
      mentalModel: 'CPU 就像一条极速运转的汽车装配流水线；每个时钟周期流水线向前推进一拍。',
      coreMechanisms: [
        { title: '四拍流水线时序', desc: 'Fetch（PC 寄存器从内存取指令） -> Decode（译码器解析指令） -> Execute（ALU 计算） -> Writeback（结果写回寄存器）。' },
        { title: '分支预测与流水线气泡', desc: 'CPU 遇到 if-else 跳转时通过历史分支预测预执行；一旦猜错，整条流水线必须清空（Pipeline Flush），带来十几个周期的性能惩罚。' },
        { title: 'SIMD 单指令多数据', desc: 'AVX-512、NEON 等向量指令集一次性对 8~16 个浮点数并行计算，极大加速科学计算与矩阵运算。' },
      ],
      architectureImpact: '业务代码中消除不必要的分支判断（Branchless Code）、数据对齐（Memory Alignment）能直接减少 CPU 气泡，让核心函数单核吞吐提升数倍。',
      aiEraRelevance: 'CPU 适合复杂逻辑分支与流程调度；GPU/TPU 则去掉了复杂的流水线分支预测器，把芯片面积全部留给海量并行算术核心，成为 AI 训练与推理算力基石。',
      tradeoffs: '流水线级数越多（如从 5 级做到 20 级）时钟频率能做得越高，但一旦分支预测失败清空流水线的代价也指数级上升。',
      relatedArchCases: ['distributed-logging'],
      relatedLabId: 'cpu',
    },
  },
  {
    id: 'memory-hierarchy',
    title: '纳秒级存储金字塔',
    category: '计算机体系与CPU',
    categoryId: 'arch',
    x: 20,
    y: 48,
    importance: 'important',
    summary: '寄存器 (0.5ns) -> L1/L3 Cache (1-10ns) -> 内存 (100ns) -> SSD (100μs)',
    tag: '性能瓶颈',
    doc: {
      overview: '计算机利用速度与容量互补的存储层级，掩盖物理内存和磁盘的漫长访问延迟。',
      mentalModel: '寄存器在手边（0.5ns），L1 缓存在桌上（1ns），内存是走廊那头的柜子（100ns），磁盘是出差去另一个城市（100,000ns）。',
      coreMechanisms: [
        { title: '局部性原理', desc: '时间局部性（刚才访问的数据很可能再次访问）与空间局部性（连续地址的数据顺带载入 Cache Line 64 字节）。' },
        { title: '缓存行伪共享 (False Sharing)', desc: '多核 CPU 的不同线程修改同一 64 字节 Cache Line 上的不同变量，导致硬件总线锁和缓存频繁失效。' },
        { title: '纳秒 vs 微秒鸿沟', desc: 'L1/L2 缓存访问仅需 1~5 纳秒，DRAM 内存约 60~100 纳秒，NVMe SSD 约 10~100 微秒，跨网络调用在 10~100 毫秒量级。' },
      ],
      architectureImpact: '数据库 Buffer Pool、Redis 内存缓存、操作系统 PageCache、Go channel 无锁队列等设计，全部建立在“避免沉入金字塔下层慢速介质”的核心哲学上。',
      aiEraRelevance: '现代大模型推理的最大瓶颈不是算力，而是【内存显存带宽墙（Memory Bandwidth Wall）】！模型生成每个 token 都需要从 HBM 显存反复搬运全部模型权重，GPU 计算单元常年处于等显存搬运的饥饿状态。',
      tradeoffs: '越快越贵的介质容量极小（L1 仅几十 KB，HBM 仅几十 GB）；容量大而廉价的介质慢了百万倍。架构师的核心职责就是在层级之间做好缓存与预加载。',
      relatedArchCases: ['flash-sale', 'ai-agent-rag'],
      relatedLabId: 'arch',
    },
  },
  {
    id: 'isa-machine-code',
    title: '指令集架构与机器码 (ISA)',
    category: '计算机体系与CPU',
    categoryId: 'arch',
    x: 20,
    y: 74,
    importance: 'core',
    summary: 'CISC vs RISC 哲学、x86/ARM/RISC-V 差异、操作码译码与微指令控制微架构',
    tag: '软硬契约',
    doc: {
      overview: '指令集是软件与硬件之间的终极契约规范：定义 CPU 能听懂的机器指令语法与数据通路控制信号。',
      mentalModel: '指令集就像一本密码本，软件把逻辑翻译成一串字节（0101），CPU 的译码电路看到特定密码便拨动特定的数据通路开关。',
      coreMechanisms: [
        { title: 'CISC vs RISC 设计哲学', desc: 'x86 复杂指令集追求单指令功能丰富但译码极其繁复；ARM/RISC-V 精简指令集追求等长规整指令与单周期快速流水线。' },
        { title: '变长机器码与指令对齐', desc: 'x86 指令长度 1~15 字节不等需要庞大硬件前置译码器；RISC 指令严格 32 位定长且按 4 字节对齐，硬件结构极其简洁高效。' },
        { title: '寄存器架构与通用调用约定', desc: 'ABI 规范定义哪些寄存器传递参数（如 RISC-V a0-a7）、哪些需要调用方保存，规范函数栈帧生命周期。' },
      ],
      architectureImpact: '云原生和移动端向 ARM/RISC-V 倾斜正是看中其高能效比与简洁流水线；自研芯片（如 Apple Silicon M 系列）借由精简 ISA 实现极高 IPC。',
      aiEraRelevance: '专用 AI 指令扩展（如 Intel AMX、ARM SME）通过在标准 ISA 中引入矩阵乘法原生指令，使传统 CPU 也能高效承载轻量大模型端侧推理。',
      tradeoffs: 'CISC 兼容性极强、代码密度高但芯片面积大、能耗高；RISC 功耗低、架构清晰但某些复杂操作需要更多条指令组合。',
      relatedArchCases: ['distributed-logging'],
      relatedLabId: 'cpu',
    },
  },

  // 3. 现代操作系统内核
  {
    id: 'process-thread-coroutine',
    title: '进程 / 线程 / 协程模型',
    category: '现代操作系统内核',
    categoryId: 'os',
    x: 33,
    y: 15,
    importance: 'core',
    summary: 'CPU 时间片轮转、PCB 控制块、上下文切换开销、用户态 vs 内核态',
    tag: '并发基石',
    doc: {
      overview: '现代操作系统与语言运行时分配 CPU 算力与内存空间的三级并发实体。',
      mentalModel: '进程是独立分公司的办公室（资源隔离）；线程是同一个办公室里的工位员工（共享内存）；协程是员工脑海中同时切换的多项任务（用户态轻量调度）。',
      coreMechanisms: [
        { title: '进程隔离与 MMU', desc: '操作系统资源分配的最小单位，拥有独立 MMU 虚拟地址空间，进程间通信需走 IPC（管道、Socket、共享内存）。' },
        { title: '内核线程与上下文切换', desc: 'CPU 调度的最小单位，共享进程堆内存，但拥有独立线程栈（默认 1MB~8MB）。内核态上下文切换需保存所有寄存器并切换内核栈。' },
        { title: '用户态协程调度 (GMP)', desc: '用户态轻量级并发（如 Go goroutine 初始仅 2KB），由语言运行时调度器调度，上下文切换仅在用户空间保存少许寄存器，开销仅几纳秒。' },
      ],
      architectureImpact: '高并发服务端（如 Netty、Go Gin、Node.js）放弃一个请求一个线程（Thread-per-request）的笨重模型，全面拥抱“事件驱动 + 协程/异步任务池”，单机抗住数十万并发连接。',
      aiEraRelevance: '在 AI Agent 智能体编排中，多 Agent 自主协作与工具调用并发（如并发调用 10 个外部 API 和向量库）均基于轻量异步协程实现。',
      tradeoffs: '多线程共享内存速度极快但极易产生数据竞争（Data Race），需要锁机制保护；协程调度更轻但如果出现长时间 CPU 密集计算会阻塞整个工作线程。',
      relatedArchCases: ['million-im', 'distributed-logging'],
      relatedLabId: 'languages',
    },
  },
  {
    id: 'virtual-memory',
    title: 'MMU 虚拟内存与分页',
    category: '现代操作系统内核',
    categoryId: 'os',
    x: 33,
    y: 38,
    importance: 'core',
    summary: '多级页表、TLB 硬件快表、缺页中断 Page Fault、Linux 进程内存空间排布',
    tag: '内存安全',
    doc: {
      overview: 'CPU 硬件 MMU 与操作系统内核协同，将分散杂乱的物理内存映射为每个进程连续私密的虚拟内存空间。',
      mentalModel: '虚拟内存给每一个进程造了一场“我独占整台机器所有 64 位内存（128TB）”的楚门的世界。',
      coreMechanisms: [
        { title: '多级页表与分页机制', desc: '将内存划分为固定大小的页（通常 4KB），通过多级页表稀疏映射，大幅节省页表自身的内存开销。' },
        { title: 'TLB 硬件快表加速', desc: 'CPU 内置的高速硬件缓存，缓存最近的虚拟地址到物理地址转换，命中率高达 99%。' },
        { title: '写时复制 (Copy-on-Write)', desc: 'Linux fork() 产生子进程时只复制页表指针并标记为只读；只有当其中一个进程试图修改数据时，才触发中断复制一份新的物理页（Redis BGSAVE 的核心底座！）。' },
      ],
      architectureImpact: 'Redis BGSAVE 导出 RDB 快照为什么能做到非阻塞零停机？正是利用操作系统 Linux fork() 的 Copy-on-Write 机制，瞬间完成内存快照备份！',
      aiEraRelevance: '【vLLM 的开创性发明 PagedAttention】，正是直接借鉴了操作系统虚拟内存分页的哲学！它把大模型庞大而动态的 KV Cache 切分成一个个连续的“显存页（Pages）”，彻底解决了显存碎片化，让大模型并发吞吐量飙升 4~5 倍！',
      tradeoffs: '内存分页引入了 TLB 未命中与多级页表寻址开销；巨大页（Huge Pages 2MB/1GB）能减少 TLB 压力，但可能增加内存碎片。',
      relatedArchCases: ['ai-agent-rag'],
      relatedLabId: 'os',
    },
  },
  {
    id: 'io-multiplexing',
    title: '高并发 IO 多路复用 (epoll)',
    category: '现代操作系统内核',
    categoryId: 'os',
    x: 33,
    y: 60,
    importance: 'core',
    summary: '阻塞 vs 非阻塞、select/poll $O(N)$ 轮询与 epoll $O(1)$ 红黑树就绪队列',
    tag: '网络底座',
    doc: {
      overview: '单个线程利用操作系统内核事件通知机制，同时监听数万甚至数百万网络连接的读写事件。',
      mentalModel: '不要挨个去每一个工位问“你有活干吗”（select 轮询），而是让有活的工位主动按铃叫你去处理（epoll 就绪队列）。',
      coreMechanisms: [
        { title: '从 BIO 到 NIO 的演进', desc: '传统阻塞 BIO 一个连接占用一个线程，10,000 连接需要 10,000 个线程，内存直接爆掉（C10K 瓶颈）。' },
        { title: 'select / poll 的性能局限', desc: '每次调用都把包含所有 fd 的数组从用户态拷贝到内核态，内核做 O(N) 暴力遍历，连接数受限。' },
        { title: 'epoll 红黑树与双向就绪链表', desc: '内核中使用红黑树管理监听的所有 Socket fd（只需一次拷贝），使用就绪链表接收网卡硬件中断产生的数据，调用 epoll_wait 瞬间 O(1) 获取就绪事件！' },
      ],
      architectureImpact: 'Nginx 扛住数万并发连接、Redis 单线程单核 10 万 QPS、Netty 百万长连接框架的绝对核心基石就是 epoll！',
      aiEraRelevance: '在现代 AI API 网关（如针对 OpenAI/Claude 的长流式 SSE 响应）中，用户生成几十秒的长文本长连接均由 epoll/Kqueue 异步网关维持，避免后端 worker 线程耗尽。',
      tradeoffs: 'epoll 极度擅长大量长连接但只有少量活跃连接的场景；若所有连接每时每刻都在全负荷读写，epoll 优势相对缩小。',
      relatedArchCases: ['million-im', 'flash-sale', 'distributed-logging'],
      relatedLabId: 'arch',
    },
  },
  {
    id: 'kernel-syscall',
    title: '用户态/内核态与系统调用',
    category: '现代操作系统内核',
    categoryId: 'os',
    x: 33,
    y: 82,
    importance: 'core',
    summary: 'CPU 特权级 Ring 0/Ring 3、软中断陷阱 (Trap)、系统调用开销与安全沙箱隔离',
    tag: '安全边界',
    doc: {
      overview: '硬件特权级（Ring 0 vs Ring 3）划分了操作系统的神圣边界，应用程序必须通过系统调用安全跨越特权级请求硬件资源。',
      mentalModel: '用户态程序就像银行大厅办事的顾客，内核态是柜台防弹玻璃后面的金库；顾客必须填写统一存取款凭条（系统调用）交由柜员办理。',
      coreMechanisms: [
        { title: 'CPU 特权环与指令拦截', desc: 'Ring 0 允许执行关中断、修改页表等特权指令；Ring 3 用户态一旦试图执行特权指令，硬件立即触发通用保护异常（#GP）。' },
        { title: '软中断陷阱与上下文切换', desc: '通过 syscall / int 0x80 指令触发特权级跃迁，保存用户栈指针与寄存器，切换至内核安全栈。' },
        { title: 'eBPF 零拷贝内核扩展', desc: '现代 Linux 允许在内核沙箱内安全运行经过静态校验的字节码，无需频繁在用户态与内核态之间拷贝数据与切换上下文。' },
      ],
      architectureImpact: '系统调用开销（约 100~300ns）在高并发场景下累积成巨大瓶颈，催生了 io_uring 环形缓冲区共享、DPDK 用户态网卡驱动等绕过内核的终极架构。',
      aiEraRelevance: '在 AI Agent 执行不受信代码（Code Interpreter 沙箱）时，依靠 Linux Namespace、Cgroups、seccomp 系统调用白名单构建绝对安全的隔离容器。',
      tradeoffs: '严格特权级隔离保证了系统稳定性与多租户安全，但跨越边界的上下文切换和数据拷贝带来了性能税。',
      relatedArchCases: ['million-im'],
      relatedLabId: 'os',
    },
  },

  // 4. 计算机网络与通信
  {
    id: 'tcp-udp-protocol',
    title: 'TCP / UDP 传输层原理',
    category: '计算机网络与通信',
    categoryId: 'network',
    x: 46,
    y: 20,
    importance: 'core',
    summary: '三次握手、四次挥手、滑动窗口流量控制、拥塞控制算法 (BBR/CUBIC)',
    tag: '可靠传输',
    doc: {
      overview: '传输层在不可靠的 IP 网络之上，提供面向连接可靠字节流（TCP）或轻量无连接数据报（UDP）。',
      mentalModel: 'TCP 像挂号信，有收条、丢了重发、按顺序排好；UDP 像广播大喇叭，喊出去不管你听没听到，胜在极速无延迟。',
      coreMechanisms: [
        { title: '三次握手与四次挥手', desc: 'SYN -> SYN+ACK -> ACK 建立双向序列号同步；FIN -> ACK -> FIN -> ACK 释放连接，TIME_WAIT 状态等待 2MSL 防止旧报文干扰。' },
        { title: '滑动窗口与流量控制', desc: '通过接收方通告的 Receive Window 动态调节发送速度，防止把慢速接收方撑死。' },
        { title: 'TCP 队头阻塞问题', desc: '若一个数据包在途中丢失，后续所有已到达的数据包必须在内核缓冲区排队等待其重传，无法交付给应用层。' },
      ],
      architectureImpact: '了解三次握手的开销才明白为什么必须使用数据库连接池（Druid/HikariCP）与 HTTP Keep-Alive 连接复用；高频创建释放短连接会迅速耗尽端口并产生海量 TIME_WAIT。',
      aiEraRelevance: '分布式 AI 大模型多机多卡训练（如 RDMA / RoCE / InfiniBand）直接绕过传统 TCP/IP 内核栈，利用硬件直接远程读取显存，解决海量参数梯度的网络通信瓶颈。',
      tradeoffs: 'TCP 保证 100% 可靠但协议包头重且有握手延迟；UDP 极快但丢包和乱序必须由上层应用自行处理。',
      relatedArchCases: ['million-im'],
      relatedLabId: 'arch',
    },
  },
  {
    id: 'http-grpc',
    title: '应用层协议 (HTTP/3 & gRPC)',
    category: '计算机网络与通信',
    categoryId: 'network',
    x: 46,
    y: 45,
    importance: 'important',
    summary: 'HTTP/1.1 队头阻塞 -> HTTP/2 多路复用 -> HTTP/3 QUIC (UDP) -> gRPC Protobuf',
    tag: '服务通信',
    doc: {
      overview: '现代分布式服务互联的语言：从文本协议 HTTP/1.1 到二进制多路复用 HTTP/2，再到基于 UDP 的 HTTP/3 与基于 Protobuf 的高效 RPC。',
      mentalModel: 'HTTP/1.1 是一条车道只准跑一辆车，HTTP/2 是多车道同时跑并按包裹拆分拼装，HTTP/3 是直接改走飞机空运（摆脱 TCP 拥堵）。',
      coreMechanisms: [
        { title: 'HTTP/2 多路复用与头部压缩', desc: '将所有请求拆分为带 Stream ID 的帧，单条 TCP 连接并行乱序收发多个 HTTP 请求；配合 HPACK 头部压缩。' },
        { title: 'HTTP/3 QUIC 彻底消灭队头阻塞', desc: '完全建立在 UDP 之上，内置 TLS 1.3 实现 0-RTT/1-RTT 极速握手，在传输层彻底根治了 TCP 队头阻塞与弱网换 Wi-Fi 断连重连问题。' },
        { title: 'gRPC 与 Protobuf 紧凑序列化', desc: '基于 HTTP/2 的高性能跨语言 RPC 框架，采用 Protobuf 强类型二进制紧凑序列化，比 JSON 体积小 3~5 倍，编解码速度快 5~10 倍。' },
      ],
      architectureImpact: '工业级微服务架构规范：对外部公网客户端暴露 RESTful HTTP API；内部微服务集群之间一律强制使用 gRPC 或 RPC 框架，极大地节省内网带宽与网卡吞吐。',
      aiEraRelevance: '现代 AI 大模型推理调用广泛使用 SSE (Server-Sent Events) 维持单向流式打字机输出；而模型上下文协议 MCP (Model Context Protocol) 则是建立在 JSON-RPC 之上的标准大模型外挂工具通信规范！',
      tradeoffs: 'gRPC 二进制协议调试时不如 JSON 直观可视，需要配套专门的接口文档管理与代理工具。',
      relatedArchCases: ['flash-sale', 'ai-agent-rag', 'distributed-trans'],
      relatedLabId: 'arch',
    },
  },
  {
    id: 'dns-cdn-edge',
    title: 'DNS 解析与 CDN 边缘网络',
    category: '计算机网络与通信',
    categoryId: 'network',
    x: 46,
    y: 70,
    importance: 'important',
    summary: '递归/权威 DNS 树状解析、Anycast 任播寻址、CDN 边缘静态化与动态回源',
    tag: '边缘提速',
    doc: {
      overview: '用户请求抵达机房前的前哨站：通过全球分布式 DNS 智能分流与 CDN 边缘节点缓存，将网络延迟从数百毫秒压缩至数十毫秒。',
      mentalModel: 'DNS 是全球因特网的自动导航仪；CDN 就像在每个小区门口开设的连锁前置仓，热销商品不用每次都从远方总仓调拨。',
      coreMechanisms: [
        { title: '树状层级解析与 TTL 缓存', desc: '本地 LocalDNS -> 根域 -> 顶级域 -> 权威 DNS，结合 TTL 逐级缓存极大减轻核心解析服务器压力。' },
        { title: 'BGP Anycast 任播路由', desc: '多个地理分散的 CDN 边缘服务器广播相同的 IP 地址，网络路由器自动引导流量走最短物理光纤路径。' },
        { title: '边缘动静分离与动态回源', desc: '静态 HTML/JS/图片 100% 边缘命中返回；动态 API 请求通过 CDN 优质内网专线加速回源至源站。' },
      ],
      architectureImpact: '大型系统抵御海量 DDoS 攻击与大促秒杀流量的第一道也是最坚固的防线；没有 CDN 静态化拦截，源站服务器集群瞬间就会被刷崩。',
      aiEraRelevance: '边缘 AI 计算（Edge AI）正在兴起，Cloudflare Workers / 边缘网关直接在离用户最近的 CDN 节点运行小尺寸嵌入模型与意图路由，显著降低大模型交互 TTFT。',
      tradeoffs: 'CDN 强缓存带来极低延迟与极小源站负载，但也引入了全局缓存刷新时延（Cache Invalidation）与静态资源版本号哈希管理成本。',
      relatedArchCases: ['flash-sale', 'short-url'],
      relatedLabId: 'arch',
    },
  },

  // 5. 编程语言生态与并发
  {
    id: 'language-ecosystem',
    title: '现代编程语言设计全景',
    category: '编程语言生态与并发',
    categoryId: 'languages',
    x: 58,
    y: 65,
    importance: 'core',
    summary: 'C++ 零成本抽象、Rust 所有权与生命周期、Go GMP 调度、Java JVM GC、Python/TS 原生定位',
    tag: '语言全景',
    doc: {
      overview: '不同编程语言在机器底层抽象度、内存安全性、运行时开销与工程开发效率之间的终极权衡取舍。',
      mentalModel: '没有最好的语言，只有最适合特定场景的工程权衡器。',
      coreMechanisms: [
        { title: 'Rust 编译期所有权模型', desc: '通过所有权（Ownership）、借用检查（Borrow Checker）与生命周期，在编译期根绝数据竞争与悬垂指针，兼具 C++ 的性能与 Java 的内存安全。' },
        { title: 'Go GMP 协程调度器', desc: '大道至简，内置轻量 GMP 调度器与微秒级协程并发，针对现代高并发云原生网络微服务量身定制。' },
        { title: 'Java JIT 编译与低延迟 GC', desc: '庞大稳固的企业级生态，经过二十年极致优化的 HotSpot JIT 编译器与 ZGC/Shenandoah 亚毫秒级低延迟垃圾收集器。' },
      ],
      architectureImpact: '现代复杂大厂系统通常采用多语言协同混合架构：高性能底层核心网关用 Go/Rust，业务复杂的交易/财务结算中心用 Java，AI 算法与编排层用 Python，交互界面与全栈全端用 TypeScript。',
      aiEraRelevance: '在 AI 时代，代码编写门槛被大模型极大降低，但掌握跨语言的底层内存模型与并发机制，能让你一眼看出 AI 生成的代码在并发高负载下是否存在死锁、内存泄漏或协程泄漏。',
      tradeoffs: '强类型静态语言（Rust/Java）开发前期耗时多但重构可控；动态语言（Python/TS）起步快但大型工程需要严格代码规范与测试约束。',
      relatedArchCases: ['flash-sale', 'million-im'],
      relatedLabId: 'languages',
    },
  },
  {
    id: 'memory-management',
    title: '内存管理：裸指针 / GC / 所有权',
    category: '编程语言生态与并发',
    categoryId: 'languages',
    x: 58,
    y: 88,
    importance: 'core',
    summary: '栈与堆的区别、C/C++ 手动管理与内存泄漏、Java/Go 分代标记清除 GC、Rust 零运行时成本所有权借用',
    tag: '内存本质',
    doc: {
      overview: '软件运行的物质基础：程序如何在有限物理内存中申请、使用并安全归还内存资源的三大核心流派。',
      mentalModel: '栈内存是叠盘子（用完顺手拿走，极快）；堆内存是租仓库，要么自己退租（C++），要么雇保洁阿姨定期清仓（Java GC），要么订立所有权契约（Rust）。',
      coreMechanisms: [
        { title: '栈内存分配 vs 堆内存分配', desc: '栈由 CPU SP 寄存器偏移分配，函数返回瞬间释放；堆由通用内存分配器（ptmalloc/jemalloc）维护动态链表，伴随内存碎片与分配开销。' },
        { title: '垃圾回收核心算法', desc: '三色标记法（黑白灰）、分代假说（绝大部分对象朝生夕灭）、写屏障（Write Barrier）与 STW（Stop-The-World）暂停优化。' },
        { title: 'RAII 与编译期所有权生命周期', desc: 'Rust 在语法 AST 阶段追踪每个变量的所有权归属与生命周期，离开作用域在编译期自动注入 drop 指令，达成 0 运行时开销。' },
      ],
      architectureImpact: '了解 GC 机制是解决线上“毛刺延迟（P99 Spikes）”的关键；高频交易与百万长连接服务通常采用对象池（Object Pool）或堆外内存（Off-Heap）来规避 GC 压力。',
      aiEraRelevance: '现代深度学习张量内存分配器（如 PyTorch Caching Allocator）自研堆管理，避免频繁向操作系统申请释放显存导致的 CUDA 驱动调用阻塞。',
      tradeoffs: '手动内存管理性能极致但极易滋生安全漏洞（占历史 CVE 70%）；GC 编程心智极低但消耗额外 20%~50% 内存；Rust 兼得两者但学习曲线陡峭。',
      relatedArchCases: ['million-im', 'distributed-logging'],
      relatedLabId: 'languages',
    },
  },

  // 6. 数据存储与缓存检索
  {
    id: 'mysql-innodb',
    title: 'MySQL InnoDB 核心引擎',
    category: '数据存储与缓存检索',
    categoryId: 'storage',
    x: 69,
    y: 15,
    importance: 'core',
    summary: 'B+ 树索引结构、ACID 事务实现、MVCC 多版本并发控制、Redo/Undo Log 与聚簇索引',
    tag: '关系型核心',
    doc: {
      overview: '现代企业级关系型数据库的压舱石：通过 B+ 树索引结构与 WAL 机制兼顾高效查询与事务 ACID 强一致性。',
      mentalModel: '内存读写极快但会丢数据，磁盘不丢数据但慢；InnoDB 的所有设计都在把随机磁盘 IO 巧妙转换为顺序追加写与内存脏页异步刷盘。',
      coreMechanisms: [
        { title: 'B+ 树聚簇索引', desc: '数据全部存储在叶子节点并按主键有序双向链表相连，非叶子节点只存索引键；3 层 B+ 树即可索引 2000 万条数据，单次主键查询仅需 2~3 次磁盘 IO！' },
        { title: 'WAL 与 Redo/Undo Log', desc: 'Write-Ahead Logging 机制。事务先写内存 Buffer Pool 并顺序追加记录 Redo Log（保证崩溃恢复 Crash-Safe），异步批量刷盘；Undo Log 支撑事务回滚与 MVCC。' },
        { title: 'MVCC 多版本并发控制', desc: '通过隐藏列（DB_TRX_ID、DB_ROLL_PTR）和 ReadView 机制，实现“读不加锁，读写不冲突”，实现高并发下的“可重复读（RR）”与“读已提交（RC）”。' },
      ],
      architectureImpact: '深刻理解聚簇索引（Clustered Index）与覆盖索引，杜绝在千万级大表上写出 SELECT * 导致的漫长回表；理解行锁与间隙锁（Next-Key Lock）防止线上出现死锁。',
      aiEraRelevance: '现代 AI Agent 在执行自主业务编排时，最终的资金变更、订单状态确认与状态机收敛，仍然需要下沉到具有严格 ACID 保证的关系型事务数据库中执行。',
      tradeoffs: '严格的 ACID 保证使得单机写性能存在物理瓶颈（通常单机每秒几千到一万写入），海量写场景需配合分库分表或消息队列异步削峰。',
      relatedArchCases: ['flash-sale', 'social-feed', 'distributed-trans'],
      relatedLabId: 'arch',
    },
  },
  {
    id: 'redis-cache',
    title: 'Redis 高性能内存数据库',
    category: '数据存储与缓存检索',
    categoryId: 'storage',
    x: 69,
    y: 38,
    importance: 'core',
    summary: '单线程高效模型、五大基础数据结构、缓存穿透/击穿/雪崩防御、分布式锁',
    tag: '极速缓存',
    doc: {
      overview: '基于内存的高性能 Key-Value 存储系统，单机轻松支撑 10 万+ QPS，现代高并发系统的加速器与减震器。',
      mentalModel: '如果 MySQL 是仓库深处的保险柜，Redis 就是柜台收银员桌面上的便签纸，伸手即得。',
      coreMechanisms: [
        { title: '单线程高性能原理', desc: '纯内存操作（纳秒级）+ Linux epoll 高效 IO 多路复用 + 规避了多线程频繁上下文切换与竞争死锁。' },
        { title: '跳表 (SkipList) 与 ZSet', desc: 'ZSet 底层采用跳表与哈希表双重索引，Score 排序检索与范围查找时间复杂度均为 O(log N)，是 Feed 流与排行榜的核心基石。' },
        { title: '三大缓存灾难防御', desc: '穿透用布隆过滤器拦截不存在 Key；击穿用互斥锁或逻辑永不过期；雪崩给 TTL 过期时间加随机打散因子（Jitter）。' },
      ],
      architectureImpact: '绝大多数互联网架构的性能提升秘诀：缓存旁路模式 (Cache-Aside Pattern)，95% 以上的读流量由 Redis 在内存中直接拦截返回。',
      aiEraRelevance: '在大模型推理中，语义缓存 (Semantic Cache) 往往基于 Redis 存储高频 Query 的语义向量和回复，让相同意图的问题无需反复消耗昂贵的 GPU Token 推理费用！',
      tradeoffs: '内存成本高昂；必须设计严格的缓存一致性策略（先更 DB，再删缓存，配合延迟双删或监听 Binlog 异步补偿）。',
      relatedArchCases: ['flash-sale', 'million-im', 'short-url', 'social-feed'],
      relatedLabId: 'arch',
    },
  },
  {
    id: 'vectordb-search',
    title: '向量数据库与倒排检索',
    category: '数据存储与缓存检索',
    categoryId: 'storage',
    x: 69,
    y: 60,
    importance: 'advanced',
    summary: 'Elasticsearch 倒排索引与分词、AI 时代 Milvus/Chroma 向量检索 (HNSW/IVF-PQ)',
    tag: 'AI 存储新范式',
    doc: {
      overview: '从传统标量精确匹配（Elasticsearch 倒排索引）向高维语义相似度计算（Milvus/Qdrant 向量检索）的历史性跃迁。',
      mentalModel: '传统搜索是在字典里根据拼音找完全相同的单词，向量数据库是在多维宇宙空间里找彼此距离最近的近邻星球。',
      coreMechanisms: [
        { title: '倒排索引 (Inverted Index)', desc: '记录“每个分词词项”对应出现在哪些文档 ID 列表中，支持全文精准关键词检索（BM25 算法打分）。' },
        { title: '近似最近邻检索 (HNSW/IVF-PQ)', desc: '利用分层可导航小世界图 (HNSW) 与倒排乘积量化 (IVF-PQ)，在几毫秒内于千万级高维向量库中找出余弦相似度最高的数据。' },
        { title: '混合检索 (Hybrid Search)', desc: '将 BM25 的关键词精确性与向量检索的语义泛化性加权融合（RRF 倒数排名融合算法），兼顾专业术语与语义理解。' },
      ],
      architectureImpact: '向量检索突破了传统基于关键词模糊查询的局限，让长文本语义搜索、商品相似推荐、以图搜图具备工业可用性。',
      aiEraRelevance: '向量数据库是大模型的外挂海量长期记忆（Long-term Memory）！RAG 系统的第一步就是从向量库中以语义相关度召回相关背景切片注入上下文，彻底消解大模型的知识时效性限制与幻觉。',
      tradeoffs: '高维向量构建索引消耗大量内存与 CPU；近似检索（ANN）存在极小概率的精度召回损耗，需通过加设 Rerank 模型精排弥补。',
      relatedArchCases: ['ai-agent-rag'],
      relatedLabId: 'nn',
    },
  },
  {
    id: 'sharding-lsm',
    title: '分库分表与 LSM-Tree 存储引擎',
    category: '数据存储与缓存检索',
    categoryId: 'storage',
    x: 69,
    y: 82,
    importance: 'important',
    summary: '水平拆分与分片键选择、分布式全局唯一 ID、LSM-Tree 追加写机制 (RocksDB/TiDB)',
    tag: '海量存储',
    doc: {
      overview: '关系型单机存储突破物理极限的扩展之道：从应用层分库分表走向基于 LSM-Tree 的原生分布式 NewSQL 架构。',
      mentalModel: '单张大表像装不下的超重货架，分库分表是把它分装到 100 个小货架上；LSM-Tree 是先在草稿纸上速记，攒够了再整齐抄录进档案柜。',
      coreMechanisms: [
        { title: '水平拆分与 Sharding Key', desc: '根据业务核心字段（如 user_id）进行哈希取模或范围切分，保证高频查询落在单个分片（路由击中）。' },
        { title: '全局唯一 ID 生成', desc: '雪花算法（Snowflake: 时间戳 + 工作机器 ID + 序列号）保证趋势递增且无单点冲突。' },
        { title: 'LSM-Tree 存储机制', desc: 'MemTable 内存排序 -> 顺序写 WAL -> 刷写生成 SSTable 磁盘文件 -> 后台异步执行 Compaction 压实合并。' },
      ],
      architectureImpact: '单表数据量破千万且索引效率急剧衰退时的标准解法；RocksDB/TiKV 的 LSM 引擎以极高顺序写吞吐成为现代分布式数据库的通用存储底座。',
      aiEraRelevance: '在大规模多智能体运行日志与知识切片存储中，高吞吐追加写存储引擎确保数百万 Agent 事件流毫秒级持久化归档。',
      tradeoffs: '分库分表引入了跨分片分布式事务、分页聚合困难以及数据迁移扩容重哈希等极高工程复杂度。',
      relatedArchCases: ['social-feed', 'distributed-trans'],
      relatedLabId: 'arch',
    },
  },

  // 7. 分布式系统与中间件
  {
    id: 'kafka-mq',
    title: 'Kafka 分布式消息队列',
    category: '分布式系统与中间件',
    categoryId: 'distributed',
    x: 81,
    y: 20,
    importance: 'core',
    summary: '顺序写磁盘 + PageCache + 零拷贝 (sendfile)、Partition 水平扩展与削峰填谷',
    tag: '解耦削峰',
    doc: {
      overview: '分布式流处理平台与高吞吐消息总线，承担高并发微服务体系中的异步解耦、流量削峰与事件驱动。',
      mentalModel: '消息队列就像水库的大坝泄洪闸，上游暴雨洪水来势汹汹，水库先蓄水，下游以平稳可控的速度安全放水。',
      coreMechanisms: [
        { title: '顺序写磁盘与零拷贝', desc: '顺序写磁盘（Sequential Write）避免随机寻道 + 充分利用 Linux 操作系统 PageCache + 零拷贝技术（sendfile 系统调用直接从内核缓冲区打入网卡）。' },
        { title: '分区 (Partition) 并发机制', desc: '单 Topic 拆分为多个 Partition 分散在不同 Broker 节点，每个 Consumer 组内的消费者并行消费各自 Partition，吞吐量线性扩展。' },
        { title: 'ISR 副本高可用机制', desc: 'In-Sync Replicas 机制，Leader 接收读写，Follower 实时同步；一旦 Leader 宕机，自动从 ISR 集合中选举新 Leader。' },
      ],
      architectureImpact: '秒杀瞬时 100 万 QPS 涌入时，直接打入 Kafka 暂存并给用户返回排队中，保护下游 MySQL 数据库只以平稳的 3000 QPS 慢慢落库，系统绝对不崩。',
      aiEraRelevance: '在大规模多智能体（Multi-Agent）和复杂异步工作流中，Kafka 是 Agent 之间事件总线（Event Bus）的不二之选，处理数万智能体的异步状态通知与审计日志。',
      tradeoffs: '引入消息队列增加了系统复杂度与链路延迟（数据非绝对实时），必须妥善处理消息堆积、重复消费与死信队列（DLQ）。',
      relatedArchCases: ['flash-sale', 'million-im', 'distributed-logging', 'social-feed', 'distributed-trans'],
      relatedLabId: 'arch',
    },
  },
  {
    id: 'distributed-consensus',
    title: '分布式一致性 (CAP & Raft)',
    category: '分布式系统与中间件',
    categoryId: 'distributed',
    x: 81,
    y: 45,
    importance: 'core',
    summary: 'CAP 定理取舍、BASE 理论、Raft Leader 选举与日志复制、分布式事务 (2PC/TCC)',
    tag: '分布式灵魂',
    doc: {
      overview: '在不可靠网络和多节点机器随时可能崩溃的分布式环境下，如何让整个集群就某一件事达成无可争辩的共识。',
      mentalModel: '一群互不信任且随时可能掉线的委员会成员，通过一套严格的投票和日志同步规则，保证大家始终认同一个最高领袖且账本完全一致。',
      coreMechanisms: [
        { title: 'CAP 定理与 BASE 理论', desc: '一致性 (C)、可用性 (A)、分区容错性 (P) 不可兼得；分布式系统通常选择 AP 或 CP，并通过 BASE 理论追求最终一致性（Eventual Consistency）。' },
        { title: 'Raft 共识算法', desc: 'Leader 选举（心跳超时触发竞选）、日志复制（过半数 ACK 即 Commit 提交）、安全性保证（Leader 只追加不修改）。' },
        { title: 'TCC 与 Saga 分布式事务', desc: 'TCC 通过资金预留（Try-Confirm-Cancel）解决核心链路原子性；Saga 通过正向操作与逆向补偿调用链解决跨微服务长事务一致性。' },
      ],
      architectureImpact: '保证分布式服务发现注册中心（Nacos/ZooKeeper/etcd）、分布式锁、分布式数据库（TiDB/OceanBase）在机器宕机切主时数据绝不丢失紊乱。',
      aiEraRelevance: '在未来自治型多智能体系统（Multi-Agent Swarm）中，多个自主决策的 Agent 如何协同决策分工、仲裁冲突，分布式共识协议正在被演进为智能体协同共识协议。',
      tradeoffs: '追求强一致性（CP）必然以牺牲响应延迟和网络分区下的局部可用性为代价；追求高可用（AP）则必须容忍脏读或最终一致性带来的短暂数据不一致。',
      relatedArchCases: ['distributed-trans', 'distributed-logging', 'social-feed'],
      relatedLabId: 'arch',
    },
  },
  {
    id: 'gateway-resilience',
    title: '微服务网关与限流熔断防线',
    category: '分布式系统与中间件',
    categoryId: 'distributed',
    x: 81,
    y: 70,
    importance: 'core',
    summary: '微服务动态路由与注册中心 (Nacos/etcd)、令牌桶/漏桶限流、Sentinel 断路器三态模型',
    tag: '系统防线',
    doc: {
      overview: '分布式微服务集群的“守门人”与“安全气囊”：统一路由鉴权，在下游依赖故障或流量超载时自愈与隔离。',
      mentalModel: '限流是景区入口的单向闸机，每分钟只放 1000 人；熔断是家里的空气开关，线路短路时自动跳闸，保护整栋大楼不被烧毁。',
      coreMechanisms: [
        { title: '令牌桶与漏桶限流算法', desc: '令牌桶以固定速率放入 Token，允许适度突发流量；漏桶以恒定速率流出请求，平滑流量尖峰。' },
        { title: '断路器三态转换机', desc: '关闭态（Closed，正常放行） -> 失败率超标跃迁为开启态（Open，快速失败拒绝） -> 冷却时间后进入半开态（Half-Open，少量试探恢复）。' },
        { title: '服务发现与健康检查心跳', desc: '客户端/服务端注册到动态注册中心（Nacos/etcd），长轮询或心跳监听实时摘除亚健康实例。' },
      ],
      architectureImpact: '彻底杜绝微服务架构中最致命的“雪崩效应（Cascading Failures）”，确保核心基础业务（如支付下单）在边缘系统宕机时依然坚挺可用。',
      aiEraRelevance: 'AI 接口具有极高的算力成本与严格的供应商速率限制（Rate Limits），必须通过智能网关进行动态排队、多模型供应商故障转移与优先级切流。',
      tradeoffs: '熔断降级保护了系统存活，但返回降级托底数据破坏了部分业务功能的完整性，需要产品体验侧的优雅对齐。',
      relatedArchCases: ['flash-sale', 'million-im'],
      relatedLabId: 'arch',
    },
  },

  // 8. 现代 AI 与智能体体系
  {
    id: 'llm-transformer',
    title: 'Transformer 与大模型推理',
    category: '现代 AI 与智能体体系',
    categoryId: 'ai',
    x: 92,
    y: 25,
    importance: 'core',
    summary: 'QKV 点积与注意力、Prefill (算力受限) vs Decode (显存带宽受限)、KV Cache 与 PagedAttention',
    tag: '智能基石',
    doc: {
      overview: '现代人工智能的通用世界模型底座：基于自注意力机制（Self-Attention）捕捉全域上下文关联，主导从文本到多模态的全领域智能革命。',
      mentalModel: '传统模型是戴着近视眼镜挨个词扫描，Transformer 是一眼纵览全局所有词，并根据每个词的语义需要把目光（注意力）聚焦在最关键的词上。',
      coreMechanisms: [
        { title: 'QKV 自注意力公式', desc: 'Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V，通过查询与键的点积计算相关性权重，对值向量加权聚合。' },
        { title: 'Prefill 算力受限 vs Decode 显存带宽受限', desc: '首字生成（Prefill）一次性并行计算，Compute-bound；后续逐字生成（Decode）每一步都依赖前一步，受限于 GPU 显存读取带宽（Memory-bound）。' },
        { title: 'PagedAttention 显存虚拟化', desc: '借鉴操作系统虚拟内存分页，以 Page 细粒度动态管理 KV Cache，彻底消除显存碎片，让单张显卡并发支持数千 token 吞吐。' },
      ],
      architectureImpact: '理解 LLM 架构才懂得为什么做 AI 系统开发必须关注首字延迟 (TTFT) 与每秒吐字数 (TPS)，以及如何通过模型量化和显存分页优化单次请求的云上成本。',
      aiEraRelevance: '这是未来整个智能时代的大脑引擎与基石；掌握其底层机制是每一位现代系统架构师从“调用 API 的调包侠”蜕变为“能够搭建高性能 AI 基础设施与推理集群专家”的核心飞跃。',
      tradeoffs: '上下文越长，理论注意力计算复杂度呈二次方增长（O(N^2)），长文本推理显存开销极大，催生了 FlashAttention、MQA/GQA 架构的诞生。',
      relatedArchCases: ['ai-agent-rag'],
      relatedLabId: 'attn',
    },
  },
  {
    id: 'model-quantization-engine',
    title: '大模型量化与推理加速引擎',
    category: '现代 AI 与智能体体系',
    categoryId: 'ai',
    x: 92,
    y: 55,
    importance: 'advanced',
    summary: 'FP16 -> INT8/INT4 (AWQ/GPTQ) 权重量化、Continuous Batching 连续批处理、FlashAttention 算子融合',
    tag: '推理基建',
    doc: {
      overview: '大模型从昂贵的实验室计算走向工业普惠的关键技术：压缩显存 footprint，打通内存带宽墙并榨干 GPU 算力。',
      mentalModel: '模型原本像用纯金雕刻的巨大雕像（FP32），量化就像将其用高密度合成轻质合金铸造（INT4），体型缩小 75%，但神态外观几乎毫无差别。',
      coreMechanisms: [
        { title: '后训练量化 (PTQ) 与激活感知', desc: 'AWQ / GPTQ 通过保护对精度影响关键的 1% 显著权重通道，将其余 99% 权重安全压缩为 4 位整数。' },
        { title: 'Continuous Batching (连续批处理)', desc: '打破传统静态 Batch 必须等待最长请求完成的等待浪费，实现 Token 级别的即到即入与即完即出。' },
        { title: 'FlashAttention 片上优化', desc: '重构注意力计算顺序，将中间矩阵计算保留在 GPU 极速 SRAM 缓存中完成，避免反复向高延迟 HBM 显存读写中间激活值。' },
      ],
      architectureImpact: '使单张消费级或入门企业级 GPU 支撑数十倍并发推理请求，将企业私有化部署大模型的硬件成本从数百万压低至数万元。',
      aiEraRelevance: '支撑现代 AI 智能体低延迟自主交互的动力引擎；端侧 AI（手机、车机、边缘设备）能够流畅离线运行智能助手的物理前提。',
      tradeoffs: '激进量化（如 INT3 / 1-bit）可能在长逻辑推理或数学题上出现轻微精度降级与语义漂移，需配合模型基准评测集严格验证。',
      relatedArchCases: ['ai-agent-rag'],
      relatedLabId: 'attn',
    },
  },
  {
    id: 'rag-and-agent',
    title: 'RAG 检索增强与 Agent 智能体',
    category: '现代 AI 与智能体体系',
    categoryId: 'ai',
    x: 92,
    y: 85,
    importance: 'core',
    summary: 'Embedding 向量语义召回、Rerank 重排、ReAct 规划推理循环、Memory 记忆管理与 MCP 协议',
    tag: '未来范式',
    doc: {
      overview: '大模型从“文本问答玩具”走向“落地真实业务系统”的完整架构范式：外挂知识库 (RAG) + 自主规划行动闭环 (Agent) + 标准工具协议 (MCP)。',
      mentalModel: 'LLM 是聪明但记忆有限、无法上网的超级大脑；RAG 是给它配了一个专业图书资料馆；Agent 是给它装上了双手、双眼和可以操作外部工具的控制台。',
      coreMechanisms: [
        { title: '企业级 RAG 黄金流水线', desc: '父子文档切块 -> 混合检索 (BM25 + 向量) -> Cross-Encoder Reranker 精准重打分 -> 上下文压缩 -> 送入大模型注入生成。' },
        { title: 'ReAct 智能体循环', desc: 'Thought（模型思考当前现状） -> Action（决定调用什么工具与参数） -> Observation（环境返回工具执行结果） -> Reflection（反思下一步，直到输出最终答案）。' },
        { title: 'MCP (Model Context Protocol) 标准', desc: '行业统一大模型外挂协议，彻底解耦了模型与数据源/工具服务的绑定，实现即插即用的通用工具调用。' },
      ],
      architectureImpact: '彻底重构了企业级软件开发逻辑：过去需要手写几万行 if-else 规则引擎的复杂业务流程，现在由 Agent 在特定安全护栏（Guardrails）与标准工具集规范下自主探索与执行。',
      aiEraRelevance: '未来开发者的核心生产力形态！未来的高级软件工程师不再是逐行敲代码的码农，而是“智能体编排架构师（Agent System Architect）”——设计 Agent 的工具协议、设计状态机与评估流（Eval）。',
      tradeoffs: 'Agent 具备自主性但也带来了不确定性与执行失控风险；必须设立严格的最大轮数硬性阈值、人工介入审核（Human-in-the-loop）与只读权限沙箱隔离。',
      relatedArchCases: ['ai-agent-rag'],
      relatedLabId: 'attn',
    },
  },
]

export const MAP_LINKS: MapLink[] = [
  // 硬件 -> CPU
  { from: 'mosfet-transistor', to: 'binary-logic', label: '半导体开关构建电平' },
  { from: 'binary-logic', to: 'logic-gates', label: '电平到门电路' },
  { from: 'logic-gates', to: 'isa-machine-code', label: '逻辑门实现指令译码' },
  { from: 'isa-machine-code', to: 'cpu-pipeline', label: '指令驱动四拍流水线' },
  { from: 'cpu-pipeline', to: 'memory-hierarchy', label: '访存与多级缓存' },

  // CPU/硬件 -> 操作系统
  { from: 'cpu-pipeline', to: 'process-thread-coroutine', label: '时间片与寄存器上下文' },
  { from: 'memory-hierarchy', to: 'virtual-memory', label: '虚拟地址到物理内存映射' },
  { from: 'process-thread-coroutine', to: 'kernel-syscall', label: '特权级隔离与系统调用' },
  { from: 'kernel-syscall', to: 'io-multiplexing', label: '内核事件通知机制' },

  // 操作系统 -> 网络
  { from: 'io-multiplexing', to: 'tcp-udp-protocol', label: 'Socket 缓冲区处理' },
  { from: 'tcp-udp-protocol', to: 'http-grpc', label: '传输层支撑应用层' },
  { from: 'http-grpc', to: 'dns-cdn-edge', label: 'DNS 分流与边缘缓存' },

  // 操作系统/网络 -> 编程语言
  { from: 'process-thread-coroutine', to: 'language-ecosystem', label: '线程/协程运行时实现' },
  { from: 'language-ecosystem', to: 'memory-management', label: '语言哲学决定内存模型' },
  { from: 'memory-hierarchy', to: 'memory-management', label: '栈与堆物理内存分配' },

  // 语言/系统 -> 存储
  { from: 'memory-hierarchy', to: 'mysql-innodb', label: 'Buffer Pool 与磁盘持久化' },
  { from: 'mysql-innodb', to: 'sharding-lsm', label: '单机到水平分库分表' },
  { from: 'io-multiplexing', to: 'redis-cache', label: 'epoll 驱动单线程极速读取' },
  { from: 'mysql-innodb', to: 'redis-cache', label: '缓存旁路架构' },
  { from: 'mysql-innodb', to: 'vectordb-search', label: '标量检索到向量检索' },

  // 存储/网络 -> 分布式
  { from: 'dns-cdn-edge', to: 'gateway-resilience', label: '流量回源至微服务网关' },
  { from: 'gateway-resilience', to: 'kafka-mq', label: '网关限流与异步削峰' },
  { from: 'http-grpc', to: 'kafka-mq', label: '异步解耦与削峰' },
  { from: 'redis-cache', to: 'distributed-consensus', label: 'Redlock 与强一致性权衡' },
  { from: 'kafka-mq', to: 'distributed-consensus', label: 'ISR 副本机制与分区一致性' },

  // 软硬件全栈 -> AI 与大模型
  { from: 'memory-hierarchy', to: 'llm-transformer', label: 'HBM 显存带宽墙与 KV Cache' },
  { from: 'virtual-memory', to: 'llm-transformer', label: '虚拟内存分页 ➔ PagedAttention' },
  { from: 'llm-transformer', to: 'model-quantization-engine', label: '自回归推理显存瓶颈' },
  { from: 'model-quantization-engine', to: 'rag-and-agent', label: '低延迟推理驱动智能体' },
  { from: 'vectordb-search', to: 'rag-and-agent', label: '外部长效记忆与知识检索' },
  { from: 'gateway-resilience', to: 'rag-and-agent', label: '多模型网关与限流熔断' },
  { from: 'distributed-consensus', to: 'rag-and-agent', label: '多智能体 Multi-Agent 协同' },
]
