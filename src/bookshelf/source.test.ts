import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  alternateAssetUrl,
  chapterGithubUrl,
  clearRepoFileCache,
  contentHosts,
  encodeRepoPath,
  fetchRepoFile,
  imageAssetBase,
  resolveAssetUrl,
  rewriteRelativeAssets,
} from './source.ts'

const ASSET_BASE = 'https://cdn.jsdelivr.net/gh/liquidslr/system-design-notes@main/01.%20Scaling/'

describe('note source urls', () => {
  beforeEach(() => {
    clearRepoFileCache()
    vi.unstubAllGlobals()
  })

  it('encodes folder names segment by segment', () => {
    expect(encodeRepoPath('27.  Digital Wallet/README.md')).toBe('27.%20%20Digital%20Wallet/README.md')
    expect(encodeRepoPath('01. Scaling/Readme.md')).toBe('01.%20Scaling/Readme.md')
  })

  it('points chapter links at the public github blob', () => {
    expect(chapterGithubUrl('04. Rate Limiter', 'Readme.md')).toBe(
      'https://github.com/liquidslr/system-design-notes/blob/main/04.%20Rate%20Limiter/Readme.md',
    )
  })

  it('rewrites relative images onto the cdn and leaves fenced samples alone', () => {
    const markdown = [
      '<img src="./images/single-server.png" width="400" />',
      '![diagram](images/cache.png)',
      '<img src="javascript:alert(1)" />',
      '```',
      '<img src="./images/keep.png" />',
      '```',
    ].join('\n')
    const rewritten = rewriteRelativeAssets(markdown, ASSET_BASE)
    expect(rewritten).toContain(
      'src="https://cdn.jsdelivr.net/gh/liquidslr/system-design-notes@main/01.%20Scaling/images/single-server.png"',
    )
    expect(rewritten).toContain(
      'https://cdn.jsdelivr.net/gh/liquidslr/system-design-notes@main/01.%20Scaling/images/cache.png',
    )
    expect(rewritten).toContain('src=""')
    expect(rewritten).toContain('<img src="./images/keep.png" />')
  })

  it('points pictures at raw github and can swap to jsdelivr', () => {
    const base = imageAssetBase('01. Scaling')
    expect(base).toBe('https://raw.githubusercontent.com/liquidslr/system-design-notes/main/01.%20Scaling/')
    expect(alternateAssetUrl(`${base}images/single-server.png`)).toBe(
      'https://cdn.jsdelivr.net/gh/liquidslr/system-design-notes@main/01.%20Scaling/images/single-server.png',
    )
  })

  it('resolves dev-proxy paths without leaving the proxy prefix', () => {
    expect(resolveAssetUrl('/tongyun-codeworld/sdn-raw/01.%20Scaling/', './images/a.png')).toBe(
      '/tongyun-codeworld/sdn-raw/01.%20Scaling/images/a.png',
    )
    expect(resolveAssetUrl(ASSET_BASE, 'https://evil.example/a.png')).toBeNull()
  })

  it('falls through hosts and then caches the chapter', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const href = String(url)
      if (href.includes('raw.githubusercontent.com')) return new Response('missing', { status: 404 })
      if (href.includes('cdn.jsdelivr.net')) return new Response('# Hello', { status: 200 })
      return new Response('proxy', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const first = await fetchRepoFile('01. Scaling/Readme.md')
    expect(first.text).toBe('# Hello')
    expect(first.assetBase).toBe(
      'https://cdn.jsdelivr.net/gh/liquidslr/system-design-notes@main/01.%20Scaling/',
    )
    const second = await fetchRepoFile('01. Scaling/Readme.md')
    expect(second).toEqual(first)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(contentHosts().map((host) => host.id)).toEqual(['github-raw', 'jsdelivr', 'dev-proxy'])
  })
})
