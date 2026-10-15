import { describe, expect, it } from 'vitest'
import { DESIGN_CHAPTERS, chapterNeighbors, findChapter } from './chapters.ts'

const FOLDERS = [
  '01. Scaling',
  '02. Back Of the Envelope Estimation',
  '03. System Design Framework',
  '04. Rate Limiter',
  '05. Consistent Hashing',
  '06. Key-Value Store',
  '07. Unique-Id Generator',
  '08. URL Shortener',
  '09. Web Crawler',
  '10. Notification System',
  '11. News Feed System',
  '12. Chat System',
  '13. Search Autocomplete',
  '14. Youtube',
  '15. Google Drive',
  '16. Proximity Service',
  '17. Nearby Friends',
  '18. Google Maps',
  '19. Distributed Message Queue',
  '20. Metrics Monitoring and Alerting System',
  '21. Ad Click Event Aggregation',
  '22. Hotel Reservation System',
  '23. Distributed Email Service',
  '24. S3-like Object Storage',
  '25. Real-time Gaming Leaderboard',
  '26. Payment System',
  '27.  Digital Wallet',
  '28. Stock Exchange',
]

describe('design chapter index', () => {
  it('lists the 28 public folders and nothing else', () => {
    expect(DESIGN_CHAPTERS.map((chapter) => chapter.folder)).toEqual(FOLDERS)
  })

  it('keeps readme filenames and short labels only', () => {
    for (const chapter of DESIGN_CHAPTERS) {
      expect(chapter.index).toBe(DESIGN_CHAPTERS.indexOf(chapter) + 1)
      expect(chapter.file).toBe(chapter.index <= 16 ? 'Readme.md' : 'README.md')
      expect(chapter.folder.startsWith(`${String(chapter.index).padStart(2, '0')}.`)).toBe(true)
      expect(chapter.slug).toMatch(/^\d{2}-[a-z0-9-]+$/)
      expect(chapter.title.length).toBeGreaterThan(0)
      expect(chapter.title.length).toBeLessThan(80)
      expect(chapter.titleZh.length).toBeGreaterThan(0)
      expect(chapter.titleZh.length).toBeLessThan(20)
      expect(chapter.folder.includes('\n')).toBe(false)
    }
  })

  it('preserves the double space in the digital wallet folder', () => {
    const wallet = findChapter('27-digital-wallet')
    expect(wallet?.folder).toBe('27.  Digital Wallet')
    expect(wallet?.title).toBe('Digital Wallet')
    expect(wallet?.file).toBe('README.md')
  })

  it('links neighbors without wrapping past the ends', () => {
    expect(chapterNeighbors('01-scaling').prev).toBeNull()
    expect(chapterNeighbors('01-scaling').next?.slug).toBe('02-back-of-the-envelope')
    expect(chapterNeighbors('28-stock-exchange').next).toBeNull()
    expect(chapterNeighbors('missing')).toEqual({ prev: null, next: null })
  })
})
