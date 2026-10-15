import DOMPurify from 'dompurify'
import { Marked } from 'marked'
import { isAllowedAssetUrl, rewriteRelativeAssets } from './source.ts'

export interface TocItem {
  id: string
  depth: 2 | 3
  text: string
}

export interface RenderedChapter {
  html: string
  toc: TocItem[]
}

let purifier: ReturnType<typeof DOMPurify> | null = null

function getPurifier(): ReturnType<typeof DOMPurify> {
  if (!purifier) {
    purifier = DOMPurify(window)
    purifier.addHook('afterSanitizeAttributes', (node) => {
      if (!(node instanceof Element)) return
      if (node.tagName === 'A') {
        const href = node.getAttribute('href') ?? ''
        if (!/^https?:\/\//i.test(href)) {
          node.removeAttribute('href')
          return
        }
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
        return
      }
      if (node.tagName === 'IMG') {
        const src = node.getAttribute('src') ?? ''
        if (!isAllowedAssetUrl(src)) node.removeAttribute('src')
        else {
          node.setAttribute('loading', 'lazy')
          node.setAttribute('decoding', 'async')
        }
        if (!node.getAttribute('alt')) node.setAttribute('alt', '笔记插图')
      }
    })
  }
  return purifier
}

function hardenHtml(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/\sjavascript:/gi, '')
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&amp;/g, ' ')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'section'
}

function uniqueSlug(text: string, seen: Map<string, number>): string {
  const base = slugify(text)
  const count = seen.get(base) ?? 0
  seen.set(base, count + 1)
  return count === 0 ? base : `${base}-${count + 1}`
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function renderChapterMarkdown(markdown: string, assetBase: string): RenderedChapter {
  const toc: TocItem[] = []
  const seen = new Map<string, number>()
  const parser = new Marked({ gfm: true, breaks: false })
  parser.use({
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens)
        const level = Math.min(6, Math.max(1, depth))
        const text = stripTags(inner)
        const id = `note-${uniqueSlug(text, seen)}`
        if (level === 2 || level === 3) toc.push({ id, depth: level, text })
        return `<h${level} id="${escapeAttr(id)}">${inner}</h${level}>\n`
      },
    },
  })

  const rewritten = rewriteRelativeAssets(markdown, assetBase)
  const parsed = parser.parse(rewritten)
  if (typeof parsed !== 'string') {
    throw new Error('markdown parse did not return a string')
  }
  const clean = getPurifier().sanitize(parsed, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel', 'loading', 'decoding'],
  })
  const html = hardenHtml(typeof clean === 'string' ? clean : String(clean))
  return { html, toc }
}
