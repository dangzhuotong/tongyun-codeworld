export interface ArchStep {
  step: number
  title: string
  action: string
  component: string
  detail: string
}

export interface TechnicalChallenge {
  problem: string
  badApproach: string
  architectSolution: string
}

export interface ArchitectureCase {
  id: string
  title: string
  subtitle: string
  icon: string
  category: string
  trafficScale: string
  latencyGoal: string
  businessScenario: string
  relatedNodeIds: string[]
  coreFlow: ArchStep[]
  challenges: TechnicalChallenge[]
  layers: {
    name: string
    tech: string
    responsibility: string
  }[]
  interviewInsight: string
}

export const ARCHITECTURE_CASES: ArchitectureCase[] = [
  // 1. 秒杀系统
  {
    id: 'flash-sale',
    title: '亿级流量高并发秒杀系统架构',
    subtitle: '百万 QPS 瞬时洪峰下如何保证 0 超卖、高可用与数据库不崩溃',
    icon: '⚡',
    category: '高并发高可用',
    trafficScale: '峰值 1,000,000+ QPS',
    latencyGoal: '端到端 < 50ms',
    businessScenario: '电商大促零点秒杀、演唱会门票抢购、限量神券争抢。瞬时流量暴增成千上万倍，热点商品库存极度有限。',
    relatedNodeIds: ['redis-cache', 'kafka-mq', 'mysql-innodb', 'http-grpc', 'io-multiplexing'],
    layers: [
      { name: '客户端防御层', tech: 'App / Web SDK', responsibility: '动态秒杀 URL、防刷验证码、点击后按钮置灰防重复提交' },
      { name: 'CDN 边缘加速层', tech: 'Cloudflare / 阿里云 CDN', responsibility: '商品详情页全静态化、活动倒计时服务器对齐，阻断 90% 只看不买流量' },
      { name: 'API 网关与限流层', tech: 'Nginx + OpenResty (Lua) + Sentinel', responsibility: '黑名单拦截、用户维度令牌桶限流、熔断降级只放行等于库存量 2-3 倍的请求' },
      { name: '极速缓存预扣减层', tech: 'Redis Cluster + Lua 脚本', responsibility: '活动前热点库存预热、Lua 脚本保证扣减原子性、JVM 内存布尔标记阻断' },
      { name: '异步削峰排队层', tech: 'Kafka / RocketMQ', responsibility: '秒杀成功请求快速推入消息队列，立即给前端返回“排队中”，解耦落库' },
      { name: '数据库持久化层', tech: 'MySQL + 乐观锁', responsibility: '消费者微服务批量消费队列，执行带版本号/库存条件更新，最终生成真实订单' },
    ],
    coreFlow: [
      { step: 1, title: '动静分离与限流', component: 'CDN & Gateway', action: '用户点击秒杀', detail: '静态页面走 CDN 缓存，动态请求进入 OpenResty 进行 Token 防刷校验与令牌桶限流。' },
      { step: 2, title: '内存布尔标记过滤', component: 'Gateway / Service', action: '快速失败拦截', detail: '本地 JVM 内存若标记该商品已售罄（soldOut=true），直接在进程内返回“已抢光”，不走任何远程网络调用。' },
      { step: 3, title: 'Redis Lua 原子扣减', component: 'Redis Cluster', action: '原子性预扣库存', detail: '执行一段嵌入的 Lua 脚本：先判断库存是否大于 0，大于则 decr 并将用户 uid 写入已购集合，单次网络 IO 彻底杜绝超卖。' },
      { step: 4, title: 'Kafka 异步削峰', component: 'Message Queue', action: '投递订单消息', detail: 'Redis 扣减成功的极少请求包装为订单事件推入 Kafka，向用户直接响应“抢购排队中，请稍候”。' },
      { step: 5, title: '异步落库与订单生成', component: 'Order Consumer & MySQL', action: '最终事务落库', detail: '后端订单服务以平稳速率（如 3000 QPS）消费 Kafka，执行 `UPDATE stock SET stock=stock-1 WHERE id=? AND stock>0`，事务落库完成支付前准备。' },
    ],
    challenges: [
      {
        problem: '高并发超卖（10 个商品被扣了 15 次）',
        badApproach: '在 Java 里查出库存 `select stock`，代码里判断 `if (stock > 0)`，再更新数据库。多线程并发下读取到相同库存导致多卖。',
        architectSolution: '防线前移至 Redis Lua 脚本原子判定扣减；数据库层兜底增加约束 `UPDATE stock = stock - 1 WHERE id = ? AND stock > 0`，利用 MySQL 行锁原子判断。',
      },
      {
        problem: '缓存击穿与单 Key 热点打爆 Redis 单分片',
        badApproach: '直接访问单个 `item_stock_1001` Key，百万 QPS 集中砸向单台 Redis 节点，CPU 100% 瘫痪。',
        architectSolution: '热点分片（Key 散列）：将 100 个库存拆分为 `item_stock_1001_1` 到 `item_stock_1001_10` 各 10 个库存，分摊到集群 10 个主节点；配合本地内存 Caffeine 缓存。',
      },
      {
        problem: '黑灰产机器外挂脚本刷单',
        badApproach: '固定的 API 接口，黑客直接抓包写 Python 脚本并发狂刷接口抢先提交。',
        architectSolution: '秒杀接口地址动态化（加盐哈希），秒杀开始前 1 秒才通过专属接口下发带时效的动态 Token；必须通过滑块验证码通过后才生成。',
      },
    ],
    interviewInsight: '面试回答秒杀核心话术：“秒杀的本质就是【漏斗模型】。100 万人涌进来，CDN 挡掉 80%，网关和风控挡掉 15%，只有 5% 打到 Redis 扣库存，最后只有等于库存数量的几十条消息打到 MQ 和 MySQL。核心是动静分离、本地内存标记快速失败、Redis Lua 原子扣减与消息队列异步削峰。”',
  },

  // 2. AI Agent + RAG 架构
  {
    id: 'ai-agent-rag',
    title: '现代企业级 AI Agent + RAG 知识库问答架构',
    subtitle: '多路召回、上下文压缩、ReAct 智能体规划与 MCP 工具协议深度集成',
    icon: '🤖',
    category: '前沿 AI 原生体系',
    trafficScale: '千级并发智能体交互',
    latencyGoal: '首字响应 TTFT < 800ms',
    businessScenario: '企业内部私有代码库问答、金融研报深度推理助手、跨系统自主调度 Agent（自动查库、调接口、发邮件闭环）。',
    relatedNodeIds: ['llm-transformer', 'rag-and-agent', 'vectordb-search', 'virtual-memory', 'memory-hierarchy'],
    layers: [
      { name: '用户交互与流式网关', tech: 'WebSocket / SSE 网关', responsibility: '长连接双向通信、打字机流式输出、Prompt 防注入与输入安全护栏 (Guardrails)' },
      { name: '意图识别与 Query 改写', tech: 'Query Rewriter / HyDE', responsibility: '指代消解（“它上周的表现”还原为主语）、生成假设性文档 (HyDE)、拆分多跳子问题' },
      { name: '混合多路召回引擎', tech: 'BM25 + Milvus / Qdrant 向量检索', responsibility: '稠密向量语义检索与稀疏关键词精准匹配结合，兼顾专业术语与抽象语义' },
      { name: '深度重排序与上下文精炼', tech: 'BGE-Reranker / Cohere Rerank', responsibility: '交叉编码打分，过滤掉低分噪点，提取最相关的 Top-K 切片并做上下文压缩，防止大模型迷失' },
      { name: 'Agent 智能体核心引擎', tech: 'ReAct 规划器 + MCP 协议客户端', responsibility: '模型思考 (Thought) -> 决定调用工具 (Action) -> 获取环境观测 (Observation) -> 反思决策' },
      { name: '推理部署与高速缓存', tech: 'vLLM / SGLang + Semantic Cache', responsibility: 'PagedAttention 显存管理、语义缓存（相似问题直接返回，0 模型消耗）、投机采样加速' },
    ],
    coreFlow: [
      { step: 1, title: '多轮对话改写 (Query Rewrite)', component: 'Query Engine', action: '消除代词与歧义', detail: '结合前 3 轮会话，把“那这家公司去年营收多少？”改写为完整独立的“阿里巴巴 2023 年财年总营收是多少？”。' },
      { step: 2, title: '混合检索 (Hybrid Search)', component: 'VectorDB & BM25', action: '双路并发召回', detail: '并行发起 Milvus 稠密语义检索（找含义相近）与 ElasticSearch 倒排检索（找特定型号/专有名词），各自召回 Top-50 片段。' },
      { step: 3, title: '交叉编码重排 (Reranking)', component: 'Cross-Encoder Reranker', action: '精准语义打分', detail: '将召回的 100 个文档片段逐一与问题送入 Rerank 模型精算匹配度，剔除相似但不相关的噪音，只保留前 5 个最核心片段。' },
      { step: 4, title: 'ReAct 规划与 MCP 工具调用', component: 'Agent Core & MCP Server', action: '模型决定外挂执行', detail: 'LLM 发现知识库无最新数据，自主触发工具调用：通过标准 MCP 协议调用企业内部只读 SQL 服务查询实时数据。' },
      { step: 5, title: '流式输出与反馈评估', component: 'LLM Engine & Evaluator', action: '流式吐字并记录评估', detail: '基于注入的真实上下文生成回答，通过 SSE 逐 Token 推送给用户；后台异步将问答对推入 Ragas 框架计算忠实度与相关度得分。' },
    ],
    challenges: [
      {
        problem: '朴素 RAG 召回精度差，模型经常“胡说八道”（大模型幻觉）',
        badApproach: '直接拿文本分块切片（Chunking 500字）做 Embedding 暴力存入向量库，余弦相似度前 3 条直接丢给大模型。',
        architectSolution: '1. 引入父子文档切片（小块检索，大块送入模型保持上下文完整）；2. 混合检索（BM25 抓关键字 + 向量抓语义）；3. 必须加 Reranker 重排序模型！',
      },
      {
        problem: '长文本长上下文（128k）显存爆炸，高并发下 GPU 瞬间 OOM',
        badApproach: '盲目把十几万字文档全部塞入 Prompt，导致显存被庞大的 KV Cache 占满，并发直接卡死。',
        architectSolution: '引入 vLLM PagedAttention 技术进行显存分页管理；在发送给模型前使用语义压缩（Selective Context），剔除无用标点与虚词；搭建语义缓存（Semantic Cache），高频问题直接命中 Redis 缓存。',
      },
      {
        problem: 'Agent 多步骤工具调用陷入无限死循环',
        badApproach: '放任大模型在 ReAct 循环里自由调用，模型返回格式微小解析错误导致无限重试。',
        architectSolution: '设置硬性最大迭代步数（如 MaxSteps = 5）；引入严格的 JSON Schema / TypeChat 结构化输出校验；给每个工具增加超时间隔与降级方案。',
      },
    ],
    interviewInsight: '面试回答 AI 原生架构核心话术：“传统软件开发是 Code 调用 API，而 AI Agent 是让 Model 来规划编排 Code。落地高可用 RAG 的三板斧是：混合检索（BM25 + 向量）、Reranker 精排重打分、父子切块上下文保留；在工程基础设施上，我们通过 MCP 协议解耦工具生态，通过 vLLM PagedAttention 显存虚拟化支撑百倍并发吞吐。”',
  },

  // 3. 百万并发 IM 即时通讯
  {
    id: 'million-im',
    title: '百万级在线即时通讯 (IM) 分布式架构',
    subtitle: 'Netty 长连接集群、分布式会话路由与读写扩散消息风暴防御',
    icon: '💬',
    category: '高并发网络通信',
    trafficScale: '5,000,000+ 在线长连接',
    latencyGoal: '消息端到端延迟 < 100ms',
    businessScenario: '微信/飞书级即时聊天、大型网络直播间弹幕系统、多玩家实时在线游戏房间同步。',
    relatedNodeIds: ['io-multiplexing', 'tcp-udp-protocol', 'redis-cache', 'process-thread-coroutine', 'kafka-mq'],
    layers: [
      { name: '客户端网络 SDK', tech: 'WebSocket / TCP Socket SDK', responsibility: '心跳探活 (Heartbeat)、断网指数退避重连、本地 SQLite 消息未读持久化' },
      { name: '长连接接入层 (Connector)', tech: 'Netty + Epoll 集群', responsibility: '仅负责维护几十万 TCP/WS 物理连接，无业务状态，支持水平扩容' },
      { name: '会话路由层 (Router)', tech: 'Redis Cluster / Go 路由微服务', responsibility: '维护用户 UID 到具体 Connector 机器 IP 的分布式路由注册表' },
      { name: '业务逻辑层 (Logic)', tech: 'gRPC 业务集群', responsibility: '消息格式校验、敏感词风控过滤、撤回/已读回执、单聊与群聊业务处理' },
      { name: '异步消息总线', tech: 'Kafka 分区队列', responsibility: '消息解耦缓冲、离线消息推送触发、海量群消息分发' },
      { name: '海量存储层', tech: 'Redis (最近会话) + HBase / Cassandra', responsibility: 'Redis 暂存最近 100 条会话加速首页渲染；列族数据库归档千亿级历史聊天记录' },
    ],
    coreFlow: [
      { step: 1, title: '建立长连接与会话登记', component: 'Client & Connector', action: '用户登录认证', detail: '用户连接至 Connector 节点，鉴权成功后，Connector 向 Redis 路由中心登记：`UID_1001 ➔ IP:192.168.1.10:8080`。' },
      { step: 2, title: '客户端发送聊天消息', component: 'Client -> Connector -> Logic', action: '上行消息传递', detail: '用户 A 发送一条消息给用户 B，Connector 接收后通过 gRPC 投递给 Logic 服务进行鉴权和敏感词过滤。' },
      { step: 3, title: '路由寻址 (Router Lookup)', component: 'Logic -> Redis Router', action: '查找接收方物理位置', detail: 'Logic 询问 Redis 路由表：用户 B 当前在哪个 Connector 机器上？查得位于 `IP:192.168.1.20:8080`。' },
      { step: 4, title: '定向推送 (Downlink Push)', component: 'Connector -> Client B', action: '长连接下发', detail: 'Logic 通过 RPC 将消息转发给 192.168.1.20 机器，该 Connector 从内存持有的 Socket 管道中精准推给用户 B。' },
      { step: 5, title: 'ACK 确认与离线兜底', component: 'Client B -> ACK -> DB', action: '消息可靠性闭环', detail: '用户 B 客户端收到后返回 ACK。若未收到 ACK 或用户 B 离线，消息转入离线队列并唤醒 APNs/FCM 手机厂商系统离线推送。' },
    ],
    challenges: [
      {
        problem: '5000 人大群一条消息引发“写扩散”风暴，服务器瞬间被写爆',
        badApproach: '写扩散（为群里每个成员单独复制写入一份消息），发一条群消息产生 5000 次数据库写入，万人大群直接击穿存储。',
        architectSolution: '大群采用【读扩散】模型：群消息只在数据库写 1 份，每个成员维护自己的“已读游标（LastReadSeq）”，拉取时增量同步；小群或单聊采用【写扩散】保证简单快速。',
      },
      {
        problem: '弱网环境下消息重复发送与乱序',
        badApproach: '依赖操作系统发送时间戳做排序，客户端时间不准或网络重发导致“后发先到”。',
        architectSolution: '服务端生成单调递增的全局序列号（Sequence ID，如基于 Redis 的自增或单会话序列号）；客户端收到后依据 SeqID 排序去重，保证严格时序一致性。',
      },
      {
        problem: '几百万客户端同时发起心跳，造成“心跳雪崩”',
        badApproach: '所有客户端每整点 30 秒准时发送心跳包，网络 IO 在特定秒点出现尖峰。',
        architectSolution: '客户端心跳引入随机抖动（Jitter），在 25-35 秒区间随机分布；采用 TCP Keepalive 辅以应用层轻量级双向 Ping-Pong 空帧探测。',
      },
    ],
    interviewInsight: '面试回答 IM 架构核心话术：“IM 系统的三大命门是：长连接的高并发支撑、消息的百分百可靠投达（不丢不重不乱序）、以及群聊的扩散模型选型。我们接入层通过 Netty 将有状态的 TCP 连接与无状态的业务逻辑层剥离，利用 Redis 维护分布式路由表；消息排序基于会话自增 SeqID，群聊采用读写扩散混合架构。”',
  },

  // 4. 高并发海量短链系统
  {
    id: 'short-url',
    title: '高并发海量短链生成与重定向系统 (URL Shortener)',
    subtitle: '百亿级 URL 映射、Base62 压缩算法、布隆过滤器与 302 临时重定向选型',
    icon: '🔗',
    category: '高可用高扩展',
    trafficScale: '百亿存储 / 200,000 QPS 读',
    latencyGoal: '跳转时延 < 15ms',
    businessScenario: '短信营销链接、微博 140 字限制压缩链接、二维码缩短编码、渠道转化埋点统计。',
    relatedNodeIds: ['redis-cache', 'mysql-innodb', 'http-grpc', 'binary-logic'],
    layers: [
      { name: '接入网关与重定向层', tech: 'Nginx + OpenResty', responsibility: '解析短链 Key、302 临时重定向跳转、执行防抓取与频率限制' },
      { name: '极速缓存读取层', tech: 'Redis Cluster (LRU 淘汰)', responsibility: '缓存高频热点短链（80% 访问集中在 20% 短链），内存直接返回目标长链' },
      { name: '穿透防御层', tech: '布隆过滤器 (Bloom Filter)', responsibility: '快速判定非法短链 Key 是否存在，阻断黑客随机 Key 暴力刺探打垮数据库' },
      { name: '短链生成服务', tech: '分布式发号器 (Snowflake) + Base62 转换', responsibility: '62 进制压缩算法，将 64 位整数转化为 6-7 位短字符串（如 `https://t.cn/Xy7z1Q`）' },
      { name: '持久化存储层', tech: 'MySQL 分库分表 / MongoDB', responsibility: '根据短链哈希分片存储长短链接对应关系、创建时间、过期时间' },
      { name: '离线分析层', tech: 'Kafka + ClickHouse', responsibility: '异步统计每次跳转的 IP、地域、User-Agent、渠道来源，做转化率报表' },
    ],
    coreFlow: [
      { step: 1, title: '接收短链请求', component: 'Gateway', action: '访问短链', detail: '用户点击 `https://t.cn/Xy7z1Q`，网关提取出短码 Key `Xy7z1Q`。' },
      { step: 2, title: '布隆过滤器初筛', component: 'Bloom Filter', action: '防缓存穿透', detail: '布隆过滤器检测该 Key 是否可能存在，若断定“一定不存在”，直接返回 404，绝不下沉查询数据库。' },
      { step: 3, title: 'Redis 缓存查询', component: 'Redis Cluster', action: '内存读取长 URL', detail: '在 Redis 中读取 `key: Xy7z1Q`，命中则直接获取长链接 `https://item.jd.com/100012.html`。' },
      { step: 4, title: '302 临时重定向响应', component: 'Gateway', action: '返回 HTTP 302', detail: '向浏览器下发 HTTP 302 Found，设置 `Location: https://item.jd.com/...`，浏览器立即跳转至原网站。' },
      { step: 5, title: '异步埋点数据分析', component: 'Kafka & ClickHouse', action: '记录访问日志', detail: '网关异步向 Kafka 投递一条包含 IP、时间、渠道的点击日志，ClickHouse 实时摄入用于营销漏斗分析。' },
    ],
    challenges: [
      {
        problem: '重定向该选 301 永久重定向还是 302 临时重定向？',
        badApproach: '误选 301 永久重定向以追求极速。',
        architectSolution: '必须选 302（或 307）！如果选 301，浏览器会在本地磁盘强缓存目标长链，下次用户点击不会再向短链服务器发请求，导致无法统计点击量、UV、渠道转化率！',
      },
      {
        problem: 'Hash 碰撞问题（如使用 MurmurHash 生成短链）',
        badApproach: '发现 Hash 冲突后直接报错或覆盖原有映射。',
        architectSolution: '若用 Hash 算法，检测到冲突时在长链末尾拼接特定 Salt 重新哈希；更工业化的方案是采用【分布式自增 ID ➔ Base62 转换】，天然绝对全局唯一，零碰撞！',
      },
      {
        problem: '短码被恶意爬虫穷举遍历遍历',
        badApproach: '直接按 1, 2, 3 顺序生成自增短码，黑客写脚本按顺序全量抓取所有公司机密活动链接。',
        architectSolution: '使用步长随机跳跃自增，或者在自增 ID 生成后通过 Feistel 密码结构进行可逆置换打乱，使生成的字符串肉眼看似完全随机。',
      },
    ],
    interviewInsight: '面试回答短链架构核心话术：“短链系统是一个极端的【读多写少】系统（读写比 100:1 以上）。核心选型有三点：1. 重定向采用 302 保证数据分析埋点上报；2. 生成算法推荐分布式自增 ID + 62 进制编码，消除 Hash 碰撞；3. 架构上通过布隆过滤器拦截非法探测，通过 Redis 集群承载 99% 的 302 跳转流量。”',
  },

  // 5. 分布式海量日志与可观测性系统
  {
    id: 'distributed-logging',
    title: '分布式海量日志检索与全链路可观测性系统 (Observability)',
    subtitle: '日处理数百 TB 日志、TraceId 全链路穿透、ClickHouse 列式压缩与监控告警',
    icon: '📊',
    category: '基础设施与可观测',
    trafficScale: '日处理 100 亿+ 条日志 (500,000+ EPS)',
    latencyGoal: '日志写入到可搜 < 3秒',
    businessScenario: '跨数百个微服务排查分布式线上 Bug、慢 SQL 定位、实时安全风控审计、系统性能 APM 瓶颈分析。',
    relatedNodeIds: ['kafka-mq', 'io-multiplexing', 'distributed-consensus', 'process-thread-coroutine'],
    layers: [
      { name: '边车日志采集层 (Agent)', tech: 'OpenTelemetry / Filebeat / Vector', responsibility: '以 DaemonSet 或 Sidecar 形式无侵入采集容器标准输出，内存零拷贝读取日志文件' },
      { name: '全链路上下文透传', tech: 'SkyWalking / OpenTelemetry SDK', responsibility: 'RPC/HTTP/MQ 跨服务调用时，在 Header 中自动注入并透传统一全局 TraceId' },
      { name: '消息缓冲与解耦层', tech: 'Kafka 多分区集群', responsibility: '应对业务流量高峰导致的日志暴增，提供数十 TB 硬盘消息暂存，保护下游分析器不被冲垮' },
      { name: '实时流处理与清洗 (ETL)', tech: 'Flink / Logstash', responsibility: '解析 JSON/正则提取字段（Timestamp、Level、TraceId、ServiceName），脱敏手机号与密码' },
      { name: '高性能列式存储引擎', tech: 'ClickHouse / Elasticsearch', responsibility: 'ClickHouse 列式存储与极高数据压缩比（1:5），支持海量日志秒级聚合分析' },
      { name: '统一可视化与告警看板', tech: 'Grafana / 自研可观测平台', responsibility: '根据 TraceId 一键还原整个分布式调用的调用树时序图，配置错误率突增飞书/钉钉告警' },
    ],
    coreFlow: [
      { step: 1, title: 'TraceId 注入与标准日志输出', component: 'Microservice App', action: '业务打日志', detail: '请求进入系统时网关生成全局唯一 TraceId，微服务通过 MDC 上下文将 TraceId 自动注入到每一行日志中。' },
      { step: 2, title: '容器内高速采集', component: 'Vector / Filebeat', action: '日志收集与打包', detail: '以本地轻量进程读取容器 stdout 日志流，进行极小内存缓冲后打包批量推入 Kafka 集群。' },
      { step: 3, title: 'Flink 实时流清洗', component: 'Apache Flink', action: '结构化与脱敏', detail: '实时消费 Kafka，解析出错误码、服务名、耗时等维度指标，对身份证、密钥做星号脱敏。' },
      { step: 4, title: 'ClickHouse 批量追加写入', component: 'ClickHouse Cluster', action: '列式压缩落盘', detail: '以每批 10,000 条的大块（Bulk Insert）写入 ClickHouse 对应分区，利用 MergeTree 引擎高速合并压缩。' },
      { step: 5, title: 'Grafana 关联全链路追溯', component: 'Grafana UI', action: '故障排查与告警', detail: '线上出现 500 报错时，研发人员输入 TraceId，页面瞬间展示横跨 8 个微服务的完整调用链路与具体报错代码行号！' },
    ],
    challenges: [
      {
        problem: '传统 Elasticsearch 成本极其高昂，硬盘被日益庞大的索引撑爆',
        badApproach: '全字段开启正排和倒排索引，硬件机器成本随日志量呈线性膨胀，集群经常 GC 卡死。',
        architectSolution: '存储架构向 ClickHouse 迁移：ClickHouse 列式存储配合 ZSTD 压缩比达 5-10 倍，硬件服务器成本直接直降 60%~70%！',
      },
      {
        problem: '全量日志采集导致业务系统网络和 CPU 负载过重',
        badApproach: '每个请求都 100% 记录超详细的 Debug 级全量日志。',
        architectSolution: '实施【动态尾部采样（Tail-based Sampling）】：成功且响应快的正常请求仅按 1% 比例采样存储；一旦发生异常（HTTP 500）或慢调用（>1s），自动 100% 全量保留该 Trace 的所有日志！',
      },
      {
        problem: '跨异步线程、跨消息队列导致 TraceId 丢失中断',
        badApproach: '仅在主线程使用 ThreadLocal 保存 TraceId，一旦放入线程池异步执行上下文立即丢失。',
        architectSolution: '接入层使用阿里开源的 TransmittableThreadLocal (TTL)；跨 Kafka 消息时，将 TraceId 编码写入 Kafka Header 并在消费者端还原。',
      },
    ],
    interviewInsight: '面试回答日志与可观测性架构核心话术：“现代可观测性体系（Observability）包含三大支柱：Metrics（指标监控）、Logging（日志记录）、Tracing（全链路追踪）。我们采用 OpenTelemetry 作为统一标准规范，通过 W3C TraceContext 在分布式链路中透传全局 TraceId。日志存储选型基于 Kafka + ClickHouse，利用列式存储和高压缩比大幅削减硬件成本，辅以尾部动态采样兼顾成本与排障精度。”',
  },

  // 6. 千万级社交 Feed 流与关注关系系统
  {
    id: 'social-feed',
    title: '千万级社交 Feed 流与关注关系架构 (Timeline)',
    subtitle: '推拉结合混合扩散、Redis ZSet 滚动分页游标与大 V 粉丝发帖雪崩防御',
    icon: '📱',
    category: '高并发高可用',
    trafficScale: '日活 50,000,000+ / 峰值 300,000 QPS',
    latencyGoal: '刷新首屏 < 40ms',
    businessScenario: '微博、小红书、Twitter 动态广场、朋友圈个人主页。涉及粉丝海量关注、动态聚合排序与未读红点同步。',
    relatedNodeIds: ['redis-cache', 'kafka-mq', 'mysql-innodb', 'distributed-consensus'],
    layers: [
      { name: '网关聚合层', tech: 'Nginx + Go BFF 网关', responsibility: '游标参数解析（Cursor-based Pagination）、动态降级与未读红点计数器' },
      { name: 'Feed 流编排层', tech: 'Feed Core 微服务集群', responsibility: '执行推拉结合策略、根据用户粉丝量动态路由至 Push 队列或 Pull 合并引擎' },
      { name: '内存缓存排序列', tech: 'Redis Cluster (ZSet)', responsibility: '每个活跃用户收件箱维护一个 ZSet（Score 为发帖时间戳，Member 为帖子 PostId），保留最新 800 条' },
      { name: '异步粉丝扩散队列', tech: 'Kafka 粉丝分发多分区', responsibility: '针对普通用户发帖，异步拉取其粉丝列表并批量将 PostId 写入每个粉丝的 Redis 收件箱' },
      { name: '发件箱持久化存储', tech: 'MySQL 分库分表 / TiDB', responsibility: '帖子原始正文内容、多图视频元数据、评论点赞数存储与持久化归档' },
      { name: '智能推荐精排引擎', tech: '推荐模型 + 规则过滤', responsibility: '结合用户协同过滤、热门度权重，对时间线候选集进行实时混排与去重' },
    ],
    coreFlow: [
      { step: 1, title: '发帖并写入发件箱 (Outbox)', component: 'Post Service & MySQL', action: '用户发布动态', detail: '作者发表新笔记/动态，先事务性写入自己的发件箱（Outbox），生成唯一 PostId。' },
      { step: 2, title: '推拉路由判定 (Push vs Pull)', component: 'Feed Router', action: '粉丝量分流', detail: '判断作者粉丝量：若粉丝数 < 10,000（普通用户），触发推模式（Push）；若粉丝数 >= 10,000（明星大 V），走拉模式（Pull）。' },
      { step: 3, title: '普通发帖异步推扩散', component: 'Kafka & Redis Worker', action: '写入粉丝收件箱', detail: '推模式将 PostId 投递至 Kafka，并发 Worker 批量写入该用户所有粉丝的 Redis ZSet 收件箱。' },
      { step: 4, title: '粉丝拉取动态流 (Timeline Fetch)', component: 'Feed Service & Redis', action: '用户刷新首页', detail: '用户打开 App 刷新：先读取自己 Redis 收件箱的 ZSet；同时查出其关注的活跃大 V 列表，拉取大 V 最近发帖，在内存按时间戳做多路归并排序！' },
      { step: 5, title: '帖子详情批量填充 (Hydration)', component: 'Cache & Post DB', action: '批量组装内容', detail: '拿到排序后的 Top-10 PostId 列表后，通过 Redis MGET 批量拉取帖子文字、图片、作者头像，秒级返回前端。' },
    ],
    challenges: [
      {
        problem: '拥有 5000 万粉丝的明星发微博，服务器瞬间瘫痪（Fan-out 风暴）',
        badApproach: '纯写扩散（Push 模式）：发一条微博要写 5000 万个粉丝的收件箱，写入放大 5000 万倍，几小时都写不完。',
        architectSolution: '【推拉结合（Hybrid Push/Pull）】：大 V 发帖绝对不推，只写大 V 自己的发件箱；普通粉丝刷新时，才去动态拉取（Pull）所关注大 V 的帖子并做归并！',
      },
      {
        problem: '深分页（第 10,000 页）性能悬崖与滑动列表重复数据',
        badApproach: '使用数据库传统 `LIMIT 10000, 10` 分页，扫描越来越慢；用户边滑边有人发帖，导致翻页看见重复内容。',
        architectSolution: '采用【游标分页（Cursor-based Pagination）】：以最后一条帖子的 `PostId + Timestamp` 作为游标，使用 Redis `ZREVRANGEBYSCORE max_timestamp -inf LIMIT 0 10`，时间复杂度永远是 $O(\\log N + M)$，永不重复！',
      },
      {
        problem: '僵尸粉长期不上线占用庞大内存资源',
        badApproach: '给每一个注册用户都维护一个完整的 Redis 收件箱。',
        architectSolution: '【冷热隔离】：超过 7 天未打开 App 的非活跃用户直接剔除 Redis 收件箱，不为其推送；当其重新登录时，才一次性触发【全量拉取初始化】重建收件箱。',
      },
    ],
    interviewInsight: '面试回答 Feed 流架构核心话术：“Feed 流设计的灵魂在于【推拉结合模型】：对低粉普通用户用推（写扩散），保证粉丝刷新极速；对高粉大 V 强制用拉（读扩散），彻底杜绝千万级 Fan-out 写入放大。分页必须废弃 Offset，全面采用基于时间戳和自增 ID 的 Cursor 游标分页；同时针对非活跃用户做冷热隔离，有效节省 70% 的 Redis 内存占用。”',
  },

  // 7. 金融级分布式事务与支付结算系统
  {
    id: 'distributed-trans',
    title: '金融级高可用分布式事务与支付结算架构',
    subtitle: '跨银行账户转账 0 资损、Saga 编排器、TCC 预留机制与对账补偿系统',
    icon: '💳',
    category: '高可用高扩展',
    trafficScale: '日处理交易量 500 亿+ 元',
    latencyGoal: '结算事务耗时 < 300ms',
    businessScenario: '支付宝/微信支付买单、跨银行实时转账、电商跨分库多账户扣款、退款原路退回。严禁资金超扣、单边账、少算漏算。',
    relatedNodeIds: ['distributed-consensus', 'mysql-innodb', 'kafka-mq', 'http-grpc'],
    layers: [
      { name: '支付收银台网关', tech: 'API Gateway + 防重 Token', responsibility: '全局交易单号防重校验、幂等防重复点击、防重放攻击' },
      { name: '分布式事务编排引擎', tech: 'Seata / 自研 Saga 状态机', responsibility: '管理长事务生命周期、驱动正向操作与逆向补偿调用、记录事务执行状态日志' },
      { name: '核心账户与资产中心', tech: 'Account Service (TCC 模型)', responsibility: '支持 Try(冻结资金) -> Confirm(扣除冻结) -> Cancel(解冻) 两阶段原子操作' },
      { name: '渠道支付路由网关', tech: 'Bank Channel Gateway', responsibility: '对接银联/网联/第三方支付接口，处理网络超时未知状态与轮询探查' },
      { name: '可靠消息投递系统', tech: 'RocketMQ / 本地消息表', responsibility: '解决跨系统最终一致性，保证“扣款成功”与“发货通知”百分之百投达' },
      { name: '离线资金对账与补偿中心', tech: 'Flink + 批量定时对账引擎', responsibility: '每日凌晨拉取银行官方清算流水对账单，平账核对差错账，自动发起差错冲正补偿' },
    ],
    coreFlow: [
      { step: 1, title: '幂等校验与单据创建', component: 'Pay Gateway & DB', action: '接收转账指令', detail: '网关生成全局唯一幂等键 `Tx_20261013_8899`，校验请求是否重复，落库保存初始状态【处理中】。' },
      { step: 2, title: '账户资金冻结 (Try 阶段)', component: 'Account Service', action: '预留资金', detail: '调用转出账户服务执行 Try 操作：`UPDATE account SET balance=balance-100, frozen=frozen+100 WHERE balance>=100`，只冻结资金，不真正划出。' },
      { step: 3, title: '远程银行通道调用', component: 'Bank Channel', action: '发起银行划扣', detail: '向央行超级网银或外部银行发起代收指令。若银行响应网络超时，标记为【结果未知】，启动后台轮询查单线程。' },
      { step: 4, title: '事务提交 (Confirm 阶段)', component: 'Saga Coordinator', action: '资金真正划转', detail: '银行返回成功后，编排器驱动转出账户执行 Confirm：清空 frozen 冻结资金；转入账户执行 Confirm 增加可用余额。' },
      { step: 5, title: '逆向补偿 (Cancel 阶段兜底)', component: 'Compensator', action: '失败冲正回滚', detail: '若转入方卡号注销失败，编排器立即驱动转出方执行 Cancel 补偿操作：将 100 元解冻归还到可用余额，保证资产分文不少！' },
    ],
    challenges: [
      {
        problem: '网络抖动超时，不知道银行到底扣款成功了还是失败了？',
        badApproach: '超时后盲目认为失败直接给用户退款，结果银行扣款成功，导致公司严重资损单边账。',
        architectSolution: '【超时不回滚原则】：网络超时统一当作【未知中】状态；由定时任务以指数退避策略反查银行查单接口；若多次反查仍无结果，交由人工或对账系统平账，严禁自动盲目冲正！',
      },
      {
        problem: '用户网络卡顿连击支付按钮导致重复扣款',
        badApproach: '在前端禁用按钮防连击（黑客直接抓包重放接口绕过前端）。',
        architectSolution: '后端【唯一幂等性防重】：以业务商户单号建立数据库唯一索引 `UNIQUE KEY (biz_order_no)`；在 Redis 中执行 `SETNX pay_lock:order_id 1 EX 30` 加分布式锁，并发请求直接报“请求正在处理中”。',
      },
      {
        problem: '跨微服务由于网络延迟出现“空回滚”与“防悬挂”',
        badApproach: 'Try 还没到达，Cancel 补偿请求先到了，导致后续 Try 到达后资金被无端扣减冻结。',
        architectSolution: '【防悬挂设计】：在事务分支表记录事务状态。如果分支还没执行 Try 就收到了 Cancel，记录一条“已空回滚”记录；当真正的 Try 迟到到达时，检查该记录直接拒绝执行 Try！',
      },
    ],
    interviewInsight: '面试回答分布式事务核心话术：“金融级核心链路讲究【零资损高于一切】。我们绝不在高并发下使用性能低下的强一致 2PC XA。对于转账等核心账户采用 TCC（Try-Confirm-Cancel）模型，通过资金冻结实现预留，避免长事务锁行；跨系统通知采用可靠消息最终一致性（本地消息表/事务消息）；核心接口必须严格实现幂等性、空回滚防御与防悬挂，辅以 T+1 离线对账作为最终安全网兜底。”',
  },
]

