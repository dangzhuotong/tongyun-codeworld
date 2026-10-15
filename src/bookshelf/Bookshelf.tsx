import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DESIGN_CHAPTERS,
  chapterNeighbors,
  findChapter,
  type DesignChapter,
} from './chapters.ts'
import { renderChapterMarkdown, type TocItem } from './render.ts'
import { navigateBookshelf } from './route.ts'
import { recallChapter, rememberChapter } from './storage.ts'
import {
  GITHUB_REPO_URL,
  PAGEFY_URL,
  alternateAssetUrl,
  chapterGithubUrl,
  clearCachedRepoFile,
  fetchRepoFile,
  imageAssetBase,
} from './source.ts'
import './bookshelf.css'

type Phase =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; html: string; toc: TocItem[] }

function pad(index: number): string {
  return String(index).padStart(2, '0')
}

function Attribution() {
  return (
    <p className="shelf-credit">
      来源{' '}
      <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
        liquidslr/system-design-notes
        <span className="sr-only">（新窗口打开）</span>
      </a>
      ，Alex Xu《System Design Interview》的笔记。打开章节时才拉取正文和配图。
      <a href={PAGEFY_URL} target="_blank" rel="noopener noreferrer">
        Pagefy 对照阅读
        <span className="sr-only">（新窗口打开）</span>
      </a>
    </p>
  )
}

function TocList({
  toc,
  activeId,
  onPick,
}: {
  toc: TocItem[]
  activeId: string
  onPick: (id: string) => void
}) {
  if (toc.length === 0) {
    return <p className="toc-empty">这一章没有小节标题。</p>
  }
  return (
    <ul className="toc-list">
      {toc.map((item) => (
        <li key={item.id} className={item.depth === 3 ? 'toc-item depth-3' : 'toc-item'}>
          <button
            type="button"
            className="toc-link"
            aria-current={item.id === activeId ? 'location' : undefined}
            onClick={() => onPick(item.id)}
          >
            {item.text}
          </button>
        </li>
      ))}
    </ul>
  )
}

export function Bookshelf({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const chapter = findChapter(slug)
  const unknownSlug = Boolean(slug) && !chapter
  const neighbors = chapter ? chapterNeighbors(chapter.slug) : { prev: null, next: null }
  const [query, setQuery] = useState('')
  const [attempt, setAttempt] = useState(0)
  const chapterKey = chapter ? `${chapter.slug}:${attempt}` : 'index'
  const [requestKey, setRequestKey] = useState(chapterKey)
  const [phase, setPhase] = useState<Phase>(chapter ? { status: 'loading' } : { status: 'idle' })
  const [activeId, setActiveId] = useState('')
  const [lastSlug, setLastSlug] = useState<string | null>(() => recallChapter())
  const [listSlug, setListSlug] = useState(slug)
  const [listOpen, setListOpen] = useState(false)
  if (listSlug !== slug) {
    setListSlug(slug)
    setListOpen(false)
  }
  if (requestKey !== chapterKey) {
    setRequestKey(chapterKey)
    setPhase(chapter ? { status: 'loading' } : { status: 'idle' })
    setActiveId('')
  }
  const scrollRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const tocDetailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    const nextTitle = chapter ? `${chapter.titleZh} · 面试书架` : '面试书架 · 代码世界'
    document.title = nextTitle
    return () => {
      document.title = previousTitle
    }
  }, [chapter])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (listOpen) {
        setListOpen(false)
        return
      }
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [listOpen, onClose])

  useEffect(() => {
    if (!chapter) return
    const repoPath = `${chapter.folder}/${chapter.file}`
    const ctrl = new AbortController()
    let alive = true
    fetchRepoFile(repoPath, ctrl.signal)
      .then((loaded) => {
        if (!alive) return
        const rendered = renderChapterMarkdown(loaded.text, imageAssetBase(chapter.folder))
        rememberChapter(chapter.slug)
        setLastSlug(chapter.slug)
        setActiveId(rendered.toc[0]?.id ?? '')
        setPhase({ status: 'ready', html: rendered.html, toc: rendered.toc })
      })
      .catch((err: unknown) => {
        if (!alive || ctrl.signal.aborted) return
        if (typeof err === 'object' && err !== null && 'name' in err && err.name === 'AbortError') return
        clearCachedRepoFile(repoPath)
        setPhase({ status: 'error' })
      })
    return () => {
      alive = false
      ctrl.abort()
    }
  }, [chapter, attempt])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [slug])

  useEffect(() => {
    const root = scrollRef.current
    if (!root || phase.status !== 'ready') return
    const onError = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLImageElement)) return
      if (target.dataset.retried === '1') return
      const next = alternateAssetUrl(target.src)
      if (!next || next === target.src) return
      target.dataset.retried = '1'
      target.src = next
    }
    root.addEventListener('error', onError, true)
    return () => root.removeEventListener('error', onError, true)
  }, [phase])

  const toc = phase.status === 'ready' ? phase.toc : []

  useEffect(() => {
    const root = scrollRef.current
    if (!root || phase.status !== 'ready') return
    const onScroll = () => {
      const mark = root.getBoundingClientRect().top + 28
      let current = ''
      for (const item of phase.toc) {
        const heading = root.querySelector<HTMLElement>(`#${CSS.escape(item.id)}`)
        if (!heading) continue
        if (heading.getBoundingClientRect().top <= mark) current = item.id
      }
      setActiveId(current)
    }
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [phase])

  const visibleChapters = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return DESIGN_CHAPTERS
    return DESIGN_CHAPTERS.filter((item) => {
      return (
        item.title.toLowerCase().includes(needle) ||
        item.titleZh.toLowerCase().includes(needle) ||
        item.slug.includes(needle) ||
        String(item.index).includes(needle) ||
        pad(item.index).includes(needle)
      )
    })
  }, [query])

  const scrollToHeading = (id: string) => {
    const root = scrollRef.current
    const heading = root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
    if (!root || !heading) return
    const top = heading.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 12
    root.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
    tocDetailsRef.current?.removeAttribute('open')
  }

  const openChapter = (next: DesignChapter) => {
    navigateBookshelf(next.slug)
    setListOpen(false)
  }

  const shellClass = [
    'bookshelf',
    chapter ? 'shelf--reading' : 'shelf--index',
    listOpen ? 'shelf--list-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass}>
      <header className="shelf-header">
        <div className="shelf-header-row">
          <div className="shelf-brand">
            <span className="shelf-mark" aria-hidden="true">
              📚
            </span>
            <div>
              <p className="shelf-kicker">面试书架</p>
              <h1 ref={headingRef} tabIndex={-1} className="shelf-title">
                系统设计笔记
              </h1>
            </div>
          </div>
          <div className="shelf-header-actions">
            {chapter ? (
              <button type="button" className="shelf-text-btn" onClick={() => navigateBookshelf(null)}>
                目录
              </button>
            ) : null}
            <button
              type="button"
              className="shelf-text-btn shelf-chapters-toggle"
              aria-expanded={listOpen}
              onClick={() => setListOpen((open) => !open)}
            >
              章节
            </button>
            <button type="button" className="shelf-close" onClick={onClose}>
              回到主路
            </button>
          </div>
        </div>
        <Attribution />
      </header>

      {listOpen && chapter ? (
        <button type="button" className="shelf-backdrop" aria-label="关闭章节列表" onClick={() => setListOpen(false)} />
      ) : null}

      <div className="shelf-body">
        <nav className="chapter-nav" aria-label="章节">
          <div className="chapter-nav-tools">
            <p className="chapter-nav-lead">28 章公开笔记。点开一章，再读正文和配图。</p>
            {listOpen ? (
              <button type="button" className="shelf-text-btn shelf-drawer-close" onClick={() => setListOpen(false)}>
                关闭
              </button>
            ) : null}
          </div>
          {unknownSlug ? <p className="reader-missing">没有这一章，从下面重新选。</p> : null}
          <label className="chapter-filter">
            <span className="sr-only">筛选章节</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="筛选，例如限流、chat"
              autoComplete="off"
            />
          </label>
          {visibleChapters.length === 0 ? (
            <p className="chapter-empty">没有对上的章节。</p>
          ) : (
            <ol className="chapter-list">
              {visibleChapters.map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    className="chapter-item"
                    aria-current={item.slug === slug ? 'page' : undefined}
                    onClick={() => openChapter(item)}
                  >
                    <span className="chapter-index">{pad(item.index)}</span>
                    <span className="chapter-labels">
                      <span className="chapter-zh">{item.titleZh}</span>
                      <span className="chapter-en">{item.title}</span>
                    </span>
                    {lastSlug === item.slug ? <span className="chapter-last">上次</span> : null}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </nav>

        <div className="reader-scroll" ref={scrollRef}>
          {!chapter ? (
            <div className="reader-welcome">
              <h2>选一章开始读</h2>
              <p>从 Scaling 到 Stock Exchange。主路的实验停在原来的滚动位置，读完从右上角回到主路。</p>
              {unknownSlug ? <p className="reader-missing">没有这一章，换左边目录里的一篇。</p> : null}
            </div>
          ) : (
            <article className="reader-sheet" lang="en">
              <header className="reader-chapter-head">
                <p className="reader-kicker">
                  {pad(chapter.index)} / {pad(DESIGN_CHAPTERS.length)}
                </p>
                <h2 className="reader-chapter-title">{chapter.titleZh}</h2>
                <p className="reader-chapter-en">{chapter.title}</p>
              </header>

              {phase.status === 'ready' ? (
                <details className="toc-mobile" ref={tocDetailsRef}>
                  <summary>本页目录</summary>
                  <TocList toc={toc} activeId={activeId} onPick={scrollToHeading} />
                </details>
              ) : null}

              {phase.status === 'loading' ? <p className="reader-status" role="status">正在取这一章…</p> : null}

              {phase.status === 'error' ? (
                <div className="reader-error" role="alert">
                  <p>这一章没有加载出来。多半是网络或源站暂时不可用。</p>
                  <p className="reader-error-actions">
                    <button
                      type="button"
                      className="shelf-close"
                      onClick={() => {
                        clearCachedRepoFile(`${chapter.folder}/${chapter.file}`)
                        setAttempt((value) => value + 1)
                      }}
                    >
                      再试一次
                    </button>
                    <a href={chapterGithubUrl(chapter.folder, chapter.file)} target="_blank" rel="noopener noreferrer">
                      在 GitHub 打开原文
                    </a>
                  </p>
                </div>
              ) : null}

              {phase.status === 'ready' ? (
                <div className="reader-prose" dangerouslySetInnerHTML={{ __html: phase.html }} />
              ) : null}
            </article>
          )}
        </div>

        <aside className="toc-desktop" aria-label="本页目录">
          <p className="toc-label">本页目录</p>
          {chapter && phase.status === 'ready' ? (
            <TocList toc={toc} activeId={activeId} onPick={scrollToHeading} />
          ) : (
            <p className="toc-empty">{chapter ? '目录会在正文加载后出现。' : '打开一章后，这里列出小节。'}</p>
          )}
        </aside>
      </div>

      {chapter ? (
        <footer className="shelf-pager">
          {neighbors.prev ? (
            <button type="button" className="pager-btn" onClick={() => navigateBookshelf(neighbors.prev?.slug)}>
              <span>上一章</span>
              <strong>
                {pad(neighbors.prev.index)} {neighbors.prev.titleZh}
              </strong>
            </button>
          ) : (
            <span className="pager-end">第一章</span>
          )}
          <span className="pager-pos">
            {chapter.index} / {DESIGN_CHAPTERS.length}
          </span>
          {neighbors.next ? (
            <button type="button" className="pager-btn pager-next" onClick={() => navigateBookshelf(neighbors.next?.slug)}>
              <span>下一章</span>
              <strong>
                {pad(neighbors.next.index)} {neighbors.next.titleZh}
              </strong>
            </button>
          ) : (
            <span className="pager-end">最后一章</span>
          )}
        </footer>
      ) : null}
    </div>
  )
}
