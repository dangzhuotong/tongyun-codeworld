/**
 * 运行时从公开地址读取笔记。生产环境不经过本站后端。
 * 正文顺序：raw.githubusercontent.com → jsDelivr →（仅 vite dev）本地代理。
 * 配图默认用 raw（img 不依赖 CORS）；加载失败再换到另一面。
 */

export const SOURCE_REPO = 'liquidslr/system-design-notes'
export const SOURCE_REF = 'main'
export const GITHUB_REPO_URL = `https://github.com/${SOURCE_REPO}`
export const PAGEFY_URL =
  'https://pagefy-blush.vercel.app/system-design/system-design-interview-by-alex-xu'

const JSDELIVR_PREFIX = `https://cdn.jsdelivr.net/gh/${SOURCE_REPO}@${SOURCE_REF}/`
const GITHUB_RAW_PREFIX = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_REF}/`

export const PUBLIC_ASSET_PREFIXES = [JSDELIVR_PREFIX, GITHUB_RAW_PREFIX] as const

export interface ContentHost {
  id: 'jsdelivr' | 'github-raw' | 'dev-proxy'
  prefix: string
}

export interface FetchedRepoFile {
  text: string
  assetBase: string
}

const memory = new Map<string, FetchedRepoFile>()

export function contentHosts(): ContentHost[] {
  const hosts: ContentHost[] = [
    { id: 'github-raw', prefix: GITHUB_RAW_PREFIX },
    { id: 'jsdelivr', prefix: JSDELIVR_PREFIX },
  ]
  if (import.meta.env.DEV) {
    const base = import.meta.env.BASE_URL || '/'
    hosts.push({ id: 'dev-proxy', prefix: `${base}sdn-raw/` })
  }
  return hosts
}

export function encodeRepoPath(repoPath: string): string {
  return repoPath
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function chapterAssetBase(prefix: string, folder: string): string {
  if (!folder) return prefix
  return `${prefix}${encodeRepoPath(folder)}/`
}

export function imageAssetBase(folder: string): string {
  return chapterAssetBase(GITHUB_RAW_PREFIX, folder)
}

export function alternateAssetUrl(url: string): string | null {
  let absolute = url
  try {
    absolute = new URL(url, 'https://assets.invalid').href
  } catch {
    return null
  }
  if (absolute.startsWith(GITHUB_RAW_PREFIX)) {
    return `${JSDELIVR_PREFIX}${absolute.slice(GITHUB_RAW_PREFIX.length)}`
  }
  if (absolute.startsWith(JSDELIVR_PREFIX)) {
    return `${GITHUB_RAW_PREFIX}${absolute.slice(JSDELIVR_PREFIX.length)}`
  }
  return null
}

export function chapterGithubUrl(folder: string, file: string): string {
  return `${GITHUB_REPO_URL}/blob/${SOURCE_REF}/${encodeRepoPath(`${folder}/${file}`)}`
}

export function isAllowedAssetUrl(url: string): boolean {
  if (PUBLIC_ASSET_PREFIXES.some((prefix) => url.startsWith(prefix))) return true
  if (!url.startsWith('/')) return false
  try {
    const path = new URL(url, 'https://assets.invalid').pathname
    return path.includes('/sdn-raw/')
  } catch {
    return false
  }
}

const PLACEHOLDER_ORIGIN = 'https://assets.invalid'

function hasControlChar(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 31 || code === 127) return true
  }
  return false
}

export function resolveAssetUrl(assetBase: string, src: string): string | null {
  const trimmed = src.trim()
  if (!trimmed) return null
  if (hasControlChar(trimmed)) return null
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:/i.test(trimmed)) return null

  const base = /^https?:\/\//i.test(assetBase)
    ? assetBase
    : `${PLACEHOLDER_ORIGIN}${assetBase.startsWith('/') ? '' : '/'}${assetBase}`

  let absolute: URL
  try {
    absolute = new URL(trimmed, base.endsWith('/') ? base : `${base}/`)
  } catch {
    return null
  }

  if (absolute.origin === PLACEHOLDER_ORIGIN) {
    const relative = `${absolute.pathname}${absolute.search}`
    return isAllowedAssetUrl(relative) ? relative : null
  }
  return isAllowedAssetUrl(absolute.href) ? absolute.href : null
}

export function rewriteRelativeAssets(markdown: string, assetBase: string): string {
  const fenceSplit = /(```[\s\S]*?```)/g
  return markdown
    .split(fenceSplit)
    .map((chunk, index) => (index % 2 === 1 ? chunk : rewriteOutsideFence(chunk, assetBase)))
    .join('')
}

function rewriteOutsideFence(markdown: string, assetBase: string): string {
  const srcAttr = /\bsrc(\s*=\s*)(["'])(.*?)\2/gi
  const mdImage = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g
  const html = markdown.replace(srcAttr, (_full, eq: string, quote: string, src: string) => {
    const next = resolveAssetUrl(assetBase, src)
    return `src${eq}${quote}${next ?? ''}${quote}`
  })
  return html.replace(mdImage, (_full, alt: string, src: string) => {
    const next = resolveAssetUrl(assetBase, src)
    return next ? `![${alt}](${next})` : alt
  })
}

function isAbort(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'name' in err && err.name === 'AbortError'
}

export function clearCachedRepoFile(repoPath: string): void {
  memory.delete(repoPath)
}

export function clearRepoFileCache(): void {
  memory.clear()
}

export async function fetchRepoFile(repoPath: string, signal?: AbortSignal): Promise<FetchedRepoFile> {
  const cached = memory.get(repoPath)
  if (cached) return cached

  const encoded = encodeRepoPath(repoPath)
  const folder = repoPath.includes('/') ? repoPath.slice(0, repoPath.lastIndexOf('/')) : ''
  let lastStatus = ''

  for (const host of contentHosts()) {
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError')
    const url = `${host.prefix}${encoded}`
    try {
      const response = await fetch(url, {
        signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      })
      if (!response.ok) {
        lastStatus = `${host.id} ${response.status}`
        continue
      }
      const text = await response.text()
      if (signal?.aborted) throw new DOMException('aborted', 'AbortError')
      const fetched = { text, assetBase: chapterAssetBase(host.prefix, folder) }
      memory.set(repoPath, fetched)
      return fetched
    } catch (err) {
      if (isAbort(err) || signal?.aborted) throw err
      lastStatus = `${host.id} failed`
    }
  }

  throw new Error(lastStatus || 'chapter fetch failed')
}
