import { useState } from 'react'

interface SystemArchLabProps {
  completed: boolean
  onComplete: () => void
}

export function SystemArchLab({ completed, onComplete }: SystemArchLabProps) {
  const [subTab, setSubTab] = useState<'traffic' | 'cache' | 'raft'>('traffic')

  // 流量沙盘状态
  const [qps, setQps] = useState(500)
  const [enableRedis, setEnableRedis] = useState(false)
  const [enableKafka, setEnableKafka] = useState(false)
  const [enableSentinel, setEnableSentinel] = useState(false)

  // 缓存灾难模式
  const [cacheDisaster, setCacheDisaster] = useState<'normal' | 'penetration' | 'breakdown' | 'avalanche'>('normal')

  // Raft 共识模拟
  const [raftLeader, setRaftLeader] = useState<number>(1)
  const [raftTerm, setRaftTerm] = useState<number>(1)

  const dbLoadMultiplier = enableRedis ? 0.15 : 1.0
  const kafkaBuffer = enableKafka ? 0.3 : 1.0
  const sentinelCap = enableSentinel && qps > 20000 ? 20000 / qps : 1.0

  const effectiveTraffic = qps * sentinelCap
  const dbStress = Math.min(100, Math.round(((effectiveTraffic * dbLoadMultiplier * kafkaBuffer) / 2500) * 100))
  const redisStress = enableRedis ? Math.min(100, Math.round((effectiveTraffic / 60000) * 100)) : 0
  const isDbCrashed = dbStress >= 95
  const isHealthy = !isDbCrashed && (qps >= 15000 ? enableRedis && enableKafka && enableSentinel : true)

  const handleRescueSuccess = () => {
    if (qps >= 15000 && isHealthy) {
      onComplete()
    }
  }

  const triggerElection = () => {
    setRaftTerm((t) => t + 1)
    const nextLeader = raftLeader === 1 ? 2 : raftLeader === 2 ? 3 : 1
    setRaftLeader(nextLeader)
  }

  return (
    <div className="system-arch-lab">
      {/* 顶部实操模式子标签 */}
      <div className="lab-sub-tabs">
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'traffic' ? 'active' : ''}`}
          onClick={() => setSubTab('traffic')}
        >
          🌊 50,000 QPS 流量洪峰中控沙盘
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'cache' ? 'active' : ''}`}
          onClick={() => setSubTab('cache')}
        >
          💥 缓存三大灾难实战（穿透/击穿/雪崩）
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'raft' ? 'active' : ''}`}
          onClick={() => setSubTab('raft')}
        >
          🗳️ 分布式共识 Raft 算法集群选举
        </button>
      </div>

      {subTab === 'traffic' && (
        <div className="tab-pane-content">
          <div className="arch-concept-banner">
            <h4>高并发三板斧与防御纵深</h4>
            <p>
              单机再快也有物理极限。当成千上万请求涌入，架构师必须构建多级防御：
              <strong>缓存分流（Redis）</strong>拦截读、<strong>消息队列（Kafka）</strong>削平写峰值、<strong>熔断限流（Sentinel）</strong>在极端时刻弃车保帅！
            </p>
          </div>

          {/* 流量控制中控台 */}
          <div className="traffic-control-panel">
            <div className="qps-slider-row">
              <label htmlFor="qps-range" className="qps-label">
                🌊 客户端瞬时流量洪峰：<strong className="mono qps-val">{qps.toLocaleString()} QPS</strong> (请求/秒)
              </label>
              <input
                id="qps-range"
                type="range"
                min="200"
                max="50000"
                step="500"
                value={qps}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setQps(val)
                  if (val >= 15000 && enableRedis && enableKafka && enableSentinel && !completed) {
                    onComplete()
                  }
                }}
                className="slider"
              />
            </div>

            <div className="weapons-switches-bar">
              <button
                type="button"
                className={`weapon-toggle-btn ${enableRedis ? 'active' : ''}`}
                onClick={() => setEnableRedis(!enableRedis)}
              >
                {enableRedis ? '✅ Redis 缓存集群 (已启用)' : '➕ 部署 Redis 缓存集群'}
              </button>

              <button
                type="button"
                className={`weapon-toggle-btn ${enableKafka ? 'active' : ''}`}
                onClick={() => setEnableKafka(!enableKafka)}
              >
                {enableKafka ? '✅ Kafka 削峰消息队列 (已启用)' : '➕ 部署 Kafka 异步削峰'}
              </button>

              <button
                type="button"
                className={`weapon-toggle-btn ${enableSentinel ? 'active' : ''}`}
                onClick={() => setEnableSentinel(!enableSentinel)}
              >
                {enableSentinel ? '✅ Sentinel 熔断限流守护 (已启用)' : '➕ 部署 Sentinel 熔断限流'}
              </button>
            </div>
          </div>

          {/* 分布式架构动态拓扑图 SVG */}
          <div className="arch-topology-view">
            <svg viewBox="0 0 560 210" className="topology-svg">
              {/* 客户端 */}
              <rect x="15" y="80" width="75" height="50" rx="8" fill="#fcf4ec" stroke="#4a3f35" strokeWidth="2" />
              <text x="52" y="105" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#4a3f35">Client</text>
              <text x="52" y="120" textAnchor="middle" fontSize="9" fill="#8a7e72">海量请求</text>

              <line x1="90" y1="105" x2="135" y2="105" stroke="#7a9e7e" strokeWidth="3" />

              {/* 负载均衡网关 */}
              <rect x="135" y="70" width="85" height="70" rx="8" fill="#fffaf5" stroke="#7a9e7e" strokeWidth="2" />
              <text x="177" y="98" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#7a9e7e">Nginx/网关</text>
              <text x="177" y="118" textAnchor="middle" fontSize="9" fill={enableSentinel ? '#7a9e7e' : '#8a7e72'}>
                {enableSentinel ? '已开启限流' : '未限流'}
              </text>

              <line x1="220" y1="95" x2="270" y2="50" stroke={enableRedis ? '#7a9e7e' : '#d5c4b0'} strokeWidth="2.5" />
              <line x1="220" y1="115" x2="270" y2="160" stroke={enableKafka ? '#7a9e7e' : '#d5c4b0'} strokeWidth="2.5" />
              <line x1="220" y1="105" x2="415" y2="105" stroke={isDbCrashed ? '#e8918a' : '#7a9e7e'} strokeWidth="2" strokeDasharray="3 3" />

              {/* Redis */}
              <rect
                x="270"
                y="25"
                width="100"
                height="50"
                rx="8"
                fill={enableRedis ? '#f4fbf5' : '#f5ede3'}
                stroke={enableRedis ? '#7a9e7e' : '#d5c4b0'}
                strokeWidth="2"
              />
              <text x="320" y="47" textAnchor="middle" fontSize="11" fontWeight="bold" fill={enableRedis ? '#4a3f35' : '#8a7e72'}>
                Redis 缓存
              </text>
              <text x="320" y="63" textAnchor="middle" fontSize="9" fill={enableRedis ? '#7a9e7e' : '#8a7e72'}>
                {enableRedis ? `负载 ${redisStress}% (命中85%)` : '未部署'}
              </text>

              {/* Kafka */}
              <rect
                x="270"
                y="135"
                width="100"
                height="50"
                rx="8"
                fill={enableKafka ? '#f4fbf5' : '#f5ede3'}
                stroke={enableKafka ? '#7a9e7e' : '#d5c4b0'}
                strokeWidth="2"
              />
              <text x="320" y="157" textAnchor="middle" fontSize="11" fontWeight="bold" fill={enableKafka ? '#4a3f35' : '#8a7e72'}>
                Kafka 消息队列
              </text>
              <text x="320" y="173" textAnchor="middle" fontSize="9" fill={enableKafka ? '#7a9e7e' : '#8a7e72'}>
                {enableKafka ? '异步削峰缓冲' : '未部署'}
              </text>

              <line x1="370" y1="50" x2="415" y2="95" stroke={enableRedis ? '#7a9e7e' : '#d5c4b0'} strokeWidth="2" />
              <line x1="370" y1="160" x2="415" y2="115" stroke={enableKafka ? '#7a9e7e' : '#d5c4b0'} strokeWidth="2" />

              {/* MySQL */}
              <rect
                x="415"
                y="65"
                width="130"
                height="80"
                rx="10"
                fill={isDbCrashed ? '#fdeeed' : '#fffaf5'}
                stroke={isDbCrashed ? '#e8918a' : '#7a9e7e'}
                strokeWidth="2.5"
              />
              <text x="480" y="93" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isDbCrashed ? '#c94a4a' : '#4a3f35'}>
                MySQL 核心数据库
              </text>
              <text x="480" y="112" textAnchor="middle" fontSize="11" fontWeight="bold" fill={isDbCrashed ? '#c94a4a' : '#7a9e7e'}>
                CPU 压力: {dbStress}%
              </text>
              <text x="480" y="130" textAnchor="middle" fontSize="9" fill={isDbCrashed ? '#c94a4a' : '#8a7e72'}>
                {isDbCrashed ? '💥 数据库死锁/连接池耗尽!' : '稳定提供 ACID 事务'}
              </text>
            </svg>
          </div>

          <div className="system-health-banner">
            {isDbCrashed ? (
              <div className="status-box alert-danger">
                <span className="status-title">🚨 生产事故：数据库崩溃（HTTP 504 熔断）！</span>
                <p>
                  当前流量达 <strong>{qps} QPS</strong>，未被拦截的并发读写请求直接把 MySQL 连接池打满！
                  <strong>请立即部署 Redis 缓存分担读流量，或启动 Kafka 与 Sentinel 限流进行防御！</strong>
                </p>
              </div>
            ) : (
              <div className="status-box alert-success">
                <span className="status-title">✅ 系统运行稳健：架构防御生效</span>
                <p>
                  在 <strong>{qps} QPS</strong> 压力下，通过组合防御，MySQL 负载稳定在 <strong>{dbStress}%</strong>！
                </p>
              </div>
            )}
          </div>

          {qps >= 15000 && isHealthy && !completed && (
            <div className="pass-row">
              <button type="button" className="btn" onClick={handleRescueSuccess}>
                🎉 我已成功在 15,000+ QPS 洪峰下守住系统！点击通过
              </button>
            </div>
          )}
        </div>
      )}

      {subTab === 'cache' && (
        <div className="tab-pane-content cache-disaster-content">
          <h4>💥 缓存三大灾难：大厂高频面试经典场景拆解</h4>
          <div className="disaster-toggle-row">
            <button
              type="button"
              className={`btn-tiny ${cacheDisaster === 'penetration' ? 'active' : ''}`}
              onClick={() => setCacheDisaster('penetration')}
            >
              1. 缓存穿透 (Penetration)
            </button>
            <button
              type="button"
              className={`btn-tiny ${cacheDisaster === 'breakdown' ? 'active' : ''}`}
              onClick={() => setCacheDisaster('breakdown')}
            >
              2. 缓存击穿 (Breakdown)
            </button>
            <button
              type="button"
              className={`btn-tiny ${cacheDisaster === 'avalanche' ? 'active' : ''}`}
              onClick={() => setCacheDisaster('avalanche')}
            >
              3. 缓存雪崩 (Avalanche)
            </button>
          </div>

          <div className="disaster-detail-card">
            {cacheDisaster === 'penetration' && (
              <div>
                <h5>🕳️ 缓存穿透：黑客恶意构造“根本不存在的数据”</h5>
                <p><strong>现象：</strong>查询 ID = -1 的商品，缓存没有，直接打到数据库；数据库也没有，没法写缓存。于是每一次请求都直刺数据库！</p>
                <div className="solution-box">
                  <strong>💡 架构师标准解决方案：</strong>
                  <ul>
                    <li><strong>布隆过滤器（Bloom Filter）：</strong>在缓存前面加一层位图布隆过滤器，不存在的数据在网关层秒杀拦截！</li>
                    <li><strong>缓存空值（Cache Null）：</strong>即使数据库查不到，也在 Redis 存一个 <code>null</code> 并设极短 TTL（如 30 秒）。</li>
                  </ul>
                </div>
              </div>
            )}

            {cacheDisaster === 'breakdown' && (
              <div>
                <h5>⚡ 缓存击穿：单个天王级超热点 Key 突然过期</h5>
                <p><strong>现象：</strong>微博突发爆料新闻，单 Key 每秒几十万请求。该 Key 刚好在这一秒过期，数十万并发瞬间全部穿透打到数据库，数据库瞬间被击穿！</p>
                <div className="solution-box">
                  <strong>💡 架构师标准解决方案：</strong>
                  <ul>
                    <li><strong>分布式互斥锁（Mutex Lock）：</strong>查不到缓存时，只有一个请求能拿到锁去查库写缓存，其余几万个请求排队等待。</li>
                    <li><strong>逻辑不过期（Logical Expiration）：</strong>Key 不设物理 TTL，后台异步起守护线程定期自动刷新热点数据。</li>
                  </ul>
                </div>
              </div>
            )}

            {cacheDisaster === 'avalanche' && (
              <div>
                <h5>🏔️ 缓存雪崩：大量 Key 在同一时刻集体过期，或 Redis 集群宕机</h5>
                <p><strong>现象：</strong>批量上架的一批商品设了相同的过期时间（如半小时），到期时刻成千上万个 Key 同时失效，或者 Redis 节点断电，全部流量瞬间砸死 DB！</p>
                <div className="solution-box">
                  <strong>💡 架构师标准解决方案：</strong>
                  <ul>
                    <li><strong>TTL 加随机抖动（Jitter）：</strong>每个 Key 的过期时间在基准值上加上 1~5 分钟的随机偏差，错峰失效。</li>
                    <li><strong>多可用区双活集群：</strong>Redis Sentinel / Cluster 主从容灾部署，结合本地 Caffeine 多级缓存防护。</li>
                  </ul>
                </div>
              </div>
            )}
            {cacheDisaster === 'normal' && (
              <p>请点击上方三个灾难按钮，查看大厂实战事故重演与标答解决方案！</p>
            )}
          </div>
        </div>
      )}

      {subTab === 'raft' && (
        <div className="tab-pane-content raft-content">
          <h4>🗳️ 分布式共识 Raft 算法三节点集群模拟</h4>
          <p className="sub-note">
            分布式系统为了高可用，不能依赖单点。Raft 通过“任期（Term）”与“心跳机制”，保证即使某个节点宕机，剩余节点依然能自动选出新 Leader 保证系统运转！
          </p>

          <div className="raft-nodes-grid">
            {[1, 2, 3].map((nodeId) => {
              const isLeader = raftLeader === nodeId
              return (
                <div key={nodeId} className={`raft-node-card ${isLeader ? 'is-leader' : ''}`}>
                  <span className="node-id">节点 Node #{nodeId}</span>
                  <span className="node-role font-bold">{isLeader ? '👑 当前 Leader (主控)' : '🤝 Follower (追随者)'}</span>
                  <span className="node-term mono">当前任期 Term: {raftTerm}</span>
                  <span className="node-status">{isLeader ? '持续广播心跳包 ping' : '正常接收 Leader 心跳'}</span>
                </div>
              )
            })}
          </div>

          <div className="raft-action-row">
            <button type="button" className="btn" onClick={triggerElection}>
              💥 模拟当前 Leader 宕机 ➔ 触发心跳超时与自动选举新 Leader！
            </button>
          </div>
        </div>
      )}

      {completed && (
        <div className="pass-banner">
          <strong>系统架构师认证达成！</strong> 你掌握了分布式高并发体系的核心精髓：<strong>用空间换时间（缓存）、用时间换平稳（消息队列削峰）、弃局部保整体（熔断限流）与 Raft 共识！</strong>
        </div>
      )}
    </div>
  )
}
