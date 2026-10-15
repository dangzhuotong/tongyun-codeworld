/**
 * 公开仓库 liquidslr/system-design-notes 的章节目录。
 * 只记录文件夹名和文件名；正文与配图在打开章节时再拉取。
 */

export interface DesignChapter {
  index: number
  slug: string
  /** 仓库里的文件夹名，含编号与空格，须原样请求。 */
  folder: string
  file: 'Readme.md' | 'README.md'
  /** 文件夹标题，供英文对照。 */
  title: string
  titleZh: string
}

function chapter(
  index: number,
  folder: string,
  file: 'Readme.md' | 'README.md',
  slugTail: string,
  titleZh: string,
): DesignChapter {
  const title = folder.replace(/^\d+\.\s+/, '').replace(/\s+/g, ' ').trim()
  return {
    index,
    slug: `${String(index).padStart(2, '0')}-${slugTail}`,
    folder,
    file,
    title,
    titleZh,
  }
}

export const DESIGN_CHAPTERS: readonly DesignChapter[] = [
  chapter(1, '01. Scaling', 'Readme.md', 'scaling', '扩容'),
  chapter(2, '02. Back Of the Envelope Estimation', 'Readme.md', 'back-of-the-envelope', '信封估算'),
  chapter(3, '03. System Design Framework', 'Readme.md', 'framework', '设计框架'),
  chapter(4, '04. Rate Limiter', 'Readme.md', 'rate-limiter', '限流器'),
  chapter(5, '05. Consistent Hashing', 'Readme.md', 'consistent-hashing', '一致性哈希'),
  chapter(6, '06. Key-Value Store', 'Readme.md', 'key-value-store', '键值存储'),
  chapter(7, '07. Unique-Id Generator', 'Readme.md', 'unique-id', '唯一 ID'),
  chapter(8, '08. URL Shortener', 'Readme.md', 'url-shortener', '短链接'),
  chapter(9, '09. Web Crawler', 'Readme.md', 'web-crawler', '网络爬虫'),
  chapter(10, '10. Notification System', 'Readme.md', 'notification', '通知系统'),
  chapter(11, '11. News Feed System', 'Readme.md', 'news-feed', '信息流'),
  chapter(12, '12. Chat System', 'Readme.md', 'chat', '聊天系统'),
  chapter(13, '13. Search Autocomplete', 'Readme.md', 'search-autocomplete', '搜索补全'),
  chapter(14, '14. Youtube', 'Readme.md', 'youtube', '视频网站'),
  chapter(15, '15. Google Drive', 'Readme.md', 'google-drive', '网盘同步'),
  chapter(16, '16. Proximity Service', 'Readme.md', 'proximity', '附近地点'),
  chapter(17, '17. Nearby Friends', 'README.md', 'nearby-friends', '附近的人'),
  chapter(18, '18. Google Maps', 'README.md', 'google-maps', '地图导航'),
  chapter(19, '19. Distributed Message Queue', 'README.md', 'message-queue', '消息队列'),
  chapter(20, '20. Metrics Monitoring and Alerting System', 'README.md', 'metrics', '监控告警'),
  chapter(21, '21. Ad Click Event Aggregation', 'README.md', 'ad-click', '广告点击'),
  chapter(22, '22. Hotel Reservation System', 'README.md', 'hotel-reservation', '酒店预订'),
  chapter(23, '23. Distributed Email Service', 'README.md', 'email', '分布式邮件'),
  chapter(24, '24. S3-like Object Storage', 'README.md', 'object-storage', '对象存储'),
  chapter(25, '25. Real-time Gaming Leaderboard', 'README.md', 'leaderboard', '实时排行榜'),
  chapter(26, '26. Payment System', 'README.md', 'payment', '支付系统'),
  chapter(27, '27.  Digital Wallet', 'README.md', 'digital-wallet', '数字钱包'),
  chapter(28, '28. Stock Exchange', 'README.md', 'stock-exchange', '证券交易所'),
]

export function findChapter(slug: string | null | undefined): DesignChapter | null {
  if (!slug) return null
  return DESIGN_CHAPTERS.find((item) => item.slug === slug) ?? null
}

export function chapterNeighbors(slug: string): {
  prev: DesignChapter | null
  next: DesignChapter | null
} {
  const index = DESIGN_CHAPTERS.findIndex((item) => item.slug === slug)
  if (index < 0) return { prev: null, next: null }
  return {
    prev: DESIGN_CHAPTERS[index - 1] ?? null,
    next: DESIGN_CHAPTERS[index + 1] ?? null,
  }
}
