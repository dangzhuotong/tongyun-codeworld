// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderChapterMarkdown } from './render.ts'

const ASSET_BASE = 'https://cdn.jsdelivr.net/gh/liquidslr/system-design-notes@main/04.%20Rate%20Limiter/'

describe('chapter markdown render', () => {
  it('builds a heading toc, keeps gfm tables, and drops active content', () => {
    const markdown = [
      '# Rate limiter',
      '',
      'Use a `map<user_id, balance>` in memory.',
      '',
      '## Cache',
      '',
      'See [the notes](https://github.com/liquidslr/system-design-notes).',
      '',
      '| A | B |',
      '| --- | --- |',
      '| 1 | 2 |',
      '',
      '<div><img src="./images/token-bucket.png" width="400" /></div>',
      '',
      '<script>alert(1)</script>',
      '<img src="javascript:alert(1)" />',
      '',
      '## Cache',
      '',
      '```',
      '<img src="./images/keep.png" />',
      '```',
    ].join('\n')

    const rendered = renderChapterMarkdown(markdown, ASSET_BASE)
    expect(rendered.toc.map((item) => item.text)).toEqual(['Cache', 'Cache'])
    expect(rendered.toc[0]?.id).toBe('note-cache')
    expect(rendered.toc[1]?.id).toBe('note-cache-2')
    expect(rendered.html).toContain('id="note-cache"')
    expect(rendered.html).toContain('id="note-cache-2"')
    expect(rendered.html).toContain('user_id')
    expect(rendered.html).toContain('<table')
    expect(rendered.html).toContain('token-bucket.png')
    expect(rendered.html).toContain('cdn.jsdelivr.net')
    expect(rendered.html).toContain('noopener')
    expect(rendered.html).toContain('./images/keep.png')
    expect(rendered.html.toLowerCase()).not.toContain('<script')
    expect(rendered.html).not.toContain('javascript:')
  })
})
