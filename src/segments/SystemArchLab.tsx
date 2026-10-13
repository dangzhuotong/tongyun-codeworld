import { useState } from 'react'

interface SystemArchLabProps {
  completed: boolean
  onComplete: () => void
}

export function SystemArchLab({ completed, onComplete }: SystemArchLabProps) {
  const [qps, setQps] = useState(500)
  const [enableRedis, setEnableRedis] = useState(false)
  const [enableKafka, setEnableKafka] = useState(false)
  const [enableSentinel, setEnableSentinel] = useState(false)

  // 计算系统各组件负载
  // Redis 吸收 85% 读流量
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

  return (
    <div className="system-arch-lab">
      {/* 架构师思维概述 */}
      <div className="arch-concept-banner">
        <h4>从写代码到掌舵全局：高并发三板斧与防御纵深</h4>
        <p>
          单机再快也有物理上限。当成千上万请求涌入，架构师必须构建多级纵深防线：
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

        {/* 架构师武器库开关 */}
        <div className="weapons-switches-bar">
          <button
            type="button"
            className={`weapon-toggle-btn ${enableRedis ? 'active' : ''}`}
            onClick={() => {
              setEnableRedis(!enableRedis)
              if (qps >= 15000 && !enableRedis && enableKafka && enableSentinel && !completed) {
                onComplete()
              }
            }}
          >
            {enableRedis ? '✅ Redis 缓存集群 (已启用)' : '➕ 部署 Redis 缓存集群'}
          </button>

          <button
            type="button"
            className={`weapon-toggle-btn ${enableKafka ? 'active' : ''}`}
            onClick={() => {
              setEnableKafka(!enableKafka)
              if (qps >= 15000 && enableRedis && !enableKafka && enableSentinel && !completed) {
                onComplete()
              }
            }}
          >
            {enableKafka ? '✅ Kafka 削峰消息队列 (已启用)' : '➕ 部署 Kafka 异步削峰'}
          </button>

          <button
            type="button"
            className={`weapon-toggle-btn ${enableSentinel ? 'active' : ''}`}
            onClick={() => {
              setEnableSentinel(!enableSentinel)
              if (qps >= 15000 && enableRedis && enableKafka && !enableSentinel && !completed) {
                onComplete()
              }
            }}
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

          {/* 连线 1 */}
          <line x1="90" y1="105" x2="135" y2="105" stroke="#7a9e7e" strokeWidth="3" />

          {/* 负载均衡网关 */}
          <rect x="135" y="70" width="85" height="70" rx="8" fill="#fffaf5" stroke="#7a9e7e" strokeWidth="2" />
          <text x="177" y="98" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#7a9e7e">Nginx/网关</text>
          <text x="177" y="118" textAnchor="middle" fontSize="9" fill={enableSentinel ? '#7a9e7e' : '#8a7e72'}>
            {enableSentinel ? '已开启限流' : '未限流'}
          </text>

          {/* 连线到缓存与消息队列 */}
          <line x1="220" y1="95" x2="270" y2="50" stroke={enableRedis ? '#7a9e7e' : '#d5c4b0'} strokeWidth="2.5" />
          <line x1="220" y1="115" x2="270" y2="160" stroke={enableKafka ? '#7a9e7e' : '#d5c4b0'} strokeWidth="2.5" />
          <line x1="220" y1="105" x2="415" y2="105" stroke={isDbCrashed ? '#e8918a' : '#7a9e7e'} strokeWidth="2" strokeDasharray="3 3" />

          {/* Redis 节点 */}
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

          {/* Kafka 节点 */}
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

          {/* 连线汇聚到数据库 */}
          <line x1="370" y1="50" x2="415" y2="95" stroke={enableRedis ? '#7a9e7e' : '#d5c4b0'} strokeWidth="2" />
          <line x1="370" y1="160" x2="415" y2="115" stroke={enableKafka ? '#7a9e7e' : '#d5c4b0'} strokeWidth="2" />

          {/* 关系型数据库 MySQL 核心 */}
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

      {/* 实时状态告示与实操反馈 */}
      <div className="system-health-banner">
        {isDbCrashed ? (
          <div className="status-box alert-danger">
            <span className="status-title">🚨 严重生产事故：数据库崩溃（HTTP 504 熔断）！</span>
            <p>
              当前流量达 <strong>{qps} QPS</strong>，未被拦截的并发读写请求直接把 MySQL 物理连接池打满！
              <strong>请立即部署 Redis 缓存分担读流量，或启动 Kafka 与 Sentinel 限流进行防御！</strong>
            </p>
          </div>
        ) : (
          <div className="status-box alert-success">
            <span className="status-title">✅ 系统运行稳健：架构防御生效</span>
            <p>
              在 <strong>{qps} QPS</strong> 压力下，通过【
              {enableRedis ? 'Redis 缓存拦截' : ''}
              {enableKafka ? ' + Kafka 削峰' : ''}
              {enableSentinel ? ' + Sentinel 限流保护' : ''}
              {!enableRedis && !enableKafka && !enableSentinel ? '单机裸奔' : ''}
              】，MySQL 负载稳定在 <strong>{dbStress}%</strong>！
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

      {completed && (
        <div className="pass-banner">
          <strong>系统架构师认证达成！</strong> 你掌握了分布式高并发体系的核心精髓：<strong>用空间换时间（缓存）、用时间换平稳（消息队列削峰）、弃局部保整体（熔断限流）！</strong>
        </div>
      )}
    </div>
  )
}
