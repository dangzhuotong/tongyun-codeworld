import type { SegmentId } from '../progress/types.ts'

export interface InterviewQnA {
  question: string
  answer: string
  focus: string
}

export interface SegmentDef {
  id: SegmentId
  index: number
  title: string
  subtitle: string
  hint: string
  goal: string
  aiMapping: string
  interviews: InterviewQnA[]
}

export const SEGMENTS: SegmentDef[] = [
  {
    id: 'switch',
    index: 1,
    title: '电、开关与比特编码',
    subtitle: '从物理电平到信息符号',
    hint: '计算机底层只认识电平高低。把高电平记作 1，低电平记作 0，8个开关就能拼出人类世界的所有数字与字符。',
    goal: '拨动开关观察二进制与十进制/ASCII字符的实时变换，拼出目标字符即可通过。',
    aiMapping:
      '【未来 AI 范式映射：权重量化 Quantization】大模型从 FP32（32位浮点电平）量化到 INT8、INT4 乃至 1.58-bit，本质就是用更少的物理开关来表示一组神经元权重，大幅降低显存占用并成倍提升计算吞吐！',
    interviews: [
      {
        question: '为什么计算机必须使用二进制，而不是十进制或三进制？',
        answer:
          '在硬件制造上，制造一个只有“通/断”（高低电平）两个稳定状态的晶体管成本极低且抗干扰容错率极高；如果区分 10 级不同电压阶跃，微小的电磁噪声就会造成极高误码率。',
        focus: '硬件第一性原理 · 容错与噪声容限',
      },
      {
        question: '为什么在大部分编程语言里 0.1 + 0.2 != 0.3？底层发生了什么？',
        answer:
          '计算机采用 IEEE 754 浮点数二进制标准。十进制的 0.1 和 0.2 转换为二进制是无限循环小数，有限位数截断产生了精度损失，因此二进制浮点运算存在微小误差。涉及金融交易系统必须使用定点数或字符串 BigDecimal。',
        focus: '数据类型底层编码 · 精度损失防范',
      },
    ],
  },
  {
    id: 'gates',
    index: 2,
    title: '逻辑门与加法器电路',
    subtitle: '机器究竟如何用电线做算术？',
    hint: '晶体管串联是与（AND），并联是或（OR）。把异或门与与门结合，电线就能亲手算出一加一等于二！',
    goal: '操作加法器电路，输入 A 和 B，观察 Sum（本位）与 Carry（进位）的电平流动并计算。',
    aiMapping:
      '【未来 AI 范式映射：GPU 张量核心 Tensor Core】大模型训练与推理的万亿次矩阵运算，底层正是由数十亿个全加器与乘法器组成的 MAC（乘加单元），以纳秒级速度并行吞吐 0 与 1 的算术！',
    interviews: [
      {
        question: '异或门（XOR）在计算机体系结构和密码学中为什么有核心地位？',
        answer:
          '① 算术层面：异或是不带进位的二进制本位加法（1⊕1=0, 1⊕0=1）。② 算法与密码学：异或具备完美的自反性（A ⊕ B ⊕ B = A），是无额外内存变量交换、对称流加密算法与 RAID5 磁盘校验的核心基石。',
        focus: '位运算与密码学基石',
      },
    ],
  },
  {
    id: 'cpu',
    index: 3,
    title: '冯·诺依曼微机与指令节拍',
    subtitle: '代码如何变成一条条单步执行的硬件信号？',
    hint: '时钟晶振是计算机的心跳。CPU 在每个节拍里循环：取指令 → 译码 → ALU计算 → 写回寄存器。',
    goal: '观察时钟波形，单步步进程序指令，观察 PC、ALU 与寄存器的真实跳动。',
    aiMapping:
      '【未来 AI 范式映射：LLM 自回归 Decoding 循环】大模型逐词吐字与 CPU 指令周期如出一辙：抓取历史KV Cache ➔ 自注意力向量投影 ➔ 采样得到下一个Token ➔ 刷新KV Cache，形成确定性的自回归流水线！',
    interviews: [
      {
        question: '什么是 CPU 的缓存伪共享（False Sharing）？高性能并发编程如何避免？',
        answer:
          'CPU 缓存以 Cache Line（通常 64 字节）为单位加载。若不同核心的多线程各自修改同一缓存行内的独立变量，MESI 协议会导致该缓存行频繁失效颠簸。解决方案是在变量间做内存填充（Padding，如 Java 的 @Contended），确保独占缓存行。',
        focus: 'CPU 缓存行与并发性能极致调优',
      },
      {
        question: '为什么需要内存屏障（Memory Barrier）？指令重排会带来什么隐患？',
        answer:
          'CPU 和编译器为了跑满流水线吞吐，会在单线程语义不变的前提下乱序执行指令。但在多线程并发场景下，指令重排会导致其他线程读取到未完全初始化的半成品对象（如单例模式的 DCL 失效），必须通过内存屏障禁止跨屏障重排。',
        focus: 'CPU 乱序执行与并发内存可见性',
      },
    ],
  },
  {
    id: 'os',
    index: 4,
    title: '操作系统与虚拟内存',
    subtitle: '进程隔离与“给程序画大饼”的艺术',
    hint: '多个程序跑在一颗 CPU 上为什么不打架？因为操作系统通过 MMU 页表给每个程序伪造了独占全部内存的幻觉。',
    goal: '在虚拟内存沙盘中分配进程内存块，体验 MMU 页表转换以及跨进程越界时的安全拦截（Page Fault）。',
    aiMapping:
      '【未来 AI 范式映射：大模型显存虚拟化 PagedAttention】vLLM 轰动开源界的创新，就是将操作系统的虚拟内存分页机制原样搬到了大模型 KV Cache 管理上，通过显存页块（Page Block）彻底消除了显存碎片化，使吞吐量暴涨数倍！',
    interviews: [
      {
        question: '进程与线程的本质区别是什么？进程切换为什么比线程切换慢得多？',
        answer:
          '进程是资源分配的最小单位，拥有独立的虚拟地址空间与页表；线程是 CPU 调度的最小单位，同进程内线程共享地址空间。进程切换需要切换 CR3 页表寄存器，导致 CPU TLB 快表完全失效刷新；而同进程线程切换无需切换页表，代价极小。',
        focus: '操作系统资源模型与上下文切换代价',
      },
      {
        question: '为什么 Linux 的 epoll 比传统 select/poll 性能高千百倍？',
        answer:
          'select 每次调用都需要将全量 fd 从用户态拷贝到内核态并做 O(N) 轮询；epoll 在内核中利用红黑树长期维护 fd，网卡中断来临时将就绪事件直接推入双向就绪链表，用户态只需 O(1) 读取就绪事件，彻底解决了 C10K 瓶颈。',
        focus: 'I/O 多路复用与高并发事件驱动内核机制',
      },
    ],
  },
  {
    id: 'languages',
    index: 5,
    title: '六大编程语言架构大比拼',
    subtitle: 'C/C++、Rust、Go、Java、Python、TypeScript 的架构抉择',
    hint: '没有最好的语言，只有最适合架构场景的妥协。内存管理（手动/GC/所有权）与并发模型（线程/协程/事件循环）决定了一切。',
    goal: '自由切换体验 6 种语言的架构雷达、内存机制图解与并发模拟，完成架构选型测试。',
    aiMapping:
      '【未来 AI 范式映射：AI 原生系统的多语言分工】CUDA/C++/Rust 构筑高性能推理引擎内核（vLLM、llama.cpp）；Go 构筑微服务 API 网关与高并发调度器；Python 做模型算法实验与数据管道；TypeScript 构筑前端 Copilot 交互与 MCP 智能体协议。',
    interviews: [
      {
        question: 'Go 的 Goroutine 为什么能轻松支持百万并发，而传统 Java 线程容易 OOM？',
        answer:
          '传统 Java 线程直接映射 OS 内核线程，每个栈默认占用 1MB；Go 采用用户态 M:N 协程调度，每个 Goroutine 初始栈仅 2KB，按需伸缩，且协程切换仅保存少量用户态寄存器，无需内核态陷阱切换，开销低一个数量级。',
        focus: '并发调度模型：内核线程 vs 用户态协程',
      },
      {
        question: 'Rust 是如何在没有 GC 的前提下实现 100% 内存安全的？',
        answer:
          '依靠编译期所有权三原则（唯一 Owner，离开作用域自动 Drop）和借用检查器规则（同一时刻要么多个只读引用 &T，要么一个独占写引用 &mut T），在编译期直接排除了野指针、悬垂指针与数据竞争。',
        focus: '内存安全哲学：垃圾回收 vs 编译期所有权借用',
      },
    ],
  },
  {
    id: 'arch',
    index: 6,
    title: '分布式与高并发架构沙盘',
    subtitle: '系统架构师的流量防线与高可用实操',
    hint: '单机扛不住流量洪峰时，架构师必须打出组合拳：Nginx负载均衡、Redis缓存拦截、Kafka异步削峰、熔断降级保底。',
    goal: '遭遇 10,000+ QPS 流量洪峰时，手动开启 Redis 缓存、Kafka 削峰与 Sentinel 熔断降级拯救数据库。',
    aiMapping:
      '【未来 AI 范式映射：AI API 网关与语义缓存治理】面对昂贵的大模型推理，现代 AI 架构师必须在网关层部署 Semantic Cache（语义向量缓存，相似意图直接返回缓存结果）、批处理排队削峰与动态限流熔断。',
    interviews: [
      {
        question: '什么是缓存穿透、击穿、雪崩？生产环境的标准解决方案分别是什么？',
        answer:
          '① 穿透：查不存在的数据（布隆过滤器拦截 + 空值缓存）。② 击穿：单一大热点 key 过期洪峰直刺 DB（互斥锁 Mutex + 逻辑不过期后台异步刷新）。③ 雪崩：大量 key 同一秒过期或 Redis 宕机（过期时间加随机抖动 TTL Jitter + 多可用区高可用集群）。',
        focus: '高并发高可用缓存架构经典三险',
      },
      {
        question: 'CAP 定理中，为什么网络分区 P 发生时只能在 CP 和 AP 间二选一？',
        answer:
          '物理网络不可靠必然存在网络割裂（P）。若此时发生割裂，要保证数据强一致 C 就必须拒绝更新直到网络恢复，从而牺牲可用性（CP，如 Raft/ZooKeeper）；若要允许更新保证可用 A 两边必然数据不一致，从而牺牲强一致（AP，如 Eureka/Dynamo）。',
        focus: '分布式系统核心理论权衡',
      },
    ],
  },
  {
    id: 'nn',
    index: 7,
    title: '神经网络与梯度下降',
    subtitle: '当规则写不全时，让机器从例子里调权重',
    hint: '现实世界太多规则无法手写。神经网络通过大量乘加运算与梯度下降，自动扭曲超平面把复杂数据切分开。',
    goal: '拖动权重与偏置，亲眼观察 2D 决策分界线动态形变，将准确率调至 80% 以上。',
    aiMapping:
      '【未来 AI 范式映射：LoRA 低秩微调的本质】在大模型数千亿冻结参数旁，并联一个极小维度的低秩矩阵（小旋钮），用梯度下降以极低显存代价微调出专精领域大模型！',
    interviews: [
      {
        question: '神经网络为什么必须引入非线性激活函数（ReLU、GELU 等）？不加会怎样？',
        answer:
          '多层线性变换复合后仍然只是一个单一线性变换（W2(W1x + b1) + b2 = W\'x + b\'），无论叠多少层都无法拟合非线性边界（如异或 XOR）。激活函数赋予了网络逼近任意复杂非线性函数的能力。',
        focus: '深度学习数学基础 · 万能逼近定理',
      },
      {
        question: '什么是梯度消失与梯度爆炸？深度残差网络（ResNet）是如何解决的？',
        answer:
          '反向传播链式求导连乘，层数很深且导数小于 1 时梯度指数级衰减至 0（梯度消失），大于 1 时指数发散（梯度爆炸）。ResNet 引入残差连接 y = F(x) + x，求导多出常数项 +1，保证梯度可以无损跨层回传至浅层。',
        focus: '反向传播链式法则与深层网络结构设计',
      },
    ],
  },
  {
    id: 'attn',
    index: 8,
    title: '大模型 Transformer 与推理架构',
    subtitle: '自注意力机制与现代 LLM 推理瓶颈（KV Cache）',
    hint: '大模型逐词自回归生成时，自注意力在计算词与词的相关度；而长文本生成的最大物理瓶颈是显存带宽墙（KV Cache）。',
    goal: '探索自注意力热力图投影，并观察生成过程中 KV Cache 显存占用与显存带宽瓶颈。',
    aiMapping:
      '【未来 AI 范式映射：AI Agent 范式与 MCP 协议】Agent 通过 ReAct（思考-行动-观察）循环使用 Tools；Anthropic 推出的 MCP（Model Context Protocol）协议正成为大模型连接外部真实世界的通用标准驱动！',
    interviews: [
      {
        question: '为什么自注意力机制（Self-Attention）的计算复杂度是序列长度 N 的平方 O(N^2)？',
        answer:
          '计算 Attention 矩阵时，序列中的每一个 Token 都要和所有上下文中的 Token 计算一次点积相似度（Q × K^T，矩阵大小为 N × N）。长文本会导致计算与显存暴增，催生了 FlashAttention 等利用 GPU SRAM 高速片上缓存的算子优化。',
        focus: 'Transformer 复杂度分析与显存优化',
      },
      {
        question: '大模型推理的 Prefill 与 Decode 阶段有何区别？各自的性能瓶颈是什么？',
        answer:
          '① Prefill 阶段（输入 Prompt 处理）：所有 Token 并行计算，是典型的计算密集型（Compute-Bound），吃满 Tensor Core 算力。② Decode 阶段（自回归逐词生成）：每次只产生一个新词，需要把所有历史 Token 的巨大 KV Cache 重新从显存搬入计算核心，是典型的显存带宽密集型（Memory-Bound）。',
        focus: '大模型推理服务架构底层物理瓶颈剖析',
      },
    ],
  },
]

export interface RoadSign {
  id: string
  after: SegmentId
  title: string
  text: string
}

export const ROAD_SIGNS: RoadSign[] = [
  {
    id: 'sign-transistor',
    after: 'switch',
    title: '路牌 · 晶体管的奇迹',
    text: '从机械开关到微型硅晶体管：人类学会了用一根微弱的控制电压，去切断或放通另一股电流，数十亿个开关从此被刻在指甲盖大小的芯片上。',
  },
  {
    id: 'sign-software',
    after: 'cpu',
    title: '路牌 · 从硬件到软件的飞跃',
    text: '纯靠硬件接线做计算太累了！把指令当作数据存在内存里，只要改写内存里的数字，机器就能瞬间变成另一个工具，软件时代正式开启。',
  },
  {
    id: 'sign-cloud',
    after: 'languages',
    title: '路牌 · 单机到集群的跨越',
    text: '无论单个进程把代码优化到多极致，单台物理机的 CPU、内存和网卡终究有物理极限。架构师的思考维度必须从“编写单机代码”跃迁至“编排成千上万台机器的网络协作”。',
  },
]
