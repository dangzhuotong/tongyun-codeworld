import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { HintBubble } from './HintBubble.tsx'

const render = (text: string) =>
  renderToStaticMarkup(<HintBubble text={text} onClose={() => {}} />)

describe('HintBubble', () => {
  it('renders as a status region carrying the hint text', () => {
    const html = render('拨动 8 个开关，拼出字符 A')
    expect(html).toContain('class="hint"')
    expect(html).toContain('role="status"')
    expect(html).toContain('拨动 8 个开关，拼出字符 A')
  })

  it('renders the decorative dot as hidden from assistive tech', () => {
    const html = render('路过提示')
    expect(html).toContain('class="hint-dot"')
    expect(html).toContain('aria-hidden="true"')
  })

  it('renders an accessible button to dismiss the hint', () => {
    const html = render('路过提示')
    expect(html).toContain('class="hint-close"')
    expect(html).toContain('aria-label="关闭提示"')
    expect(html).toContain('×')
  })

  it('escapes the hint text instead of emitting raw markup', () => {
    const html = render('<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
