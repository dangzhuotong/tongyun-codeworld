import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LabCard } from './LabCard.tsx'

function render(props: {
  index: number
  title: string
  subtitle?: string
  goal: string
  completed: boolean
}) {
  return renderToStaticMarkup(
    <LabCard {...props}>
      <p>实验内容</p>
    </LabCard>,
  )
}

describe('LabCard', () => {
  it('renders the zero-padded section index and title', () => {
    const html = render({
      index: 1,
      title: '电、开关与比特编码',
      goal: '拼出字符 A',
      completed: false,
    })
    expect(html).toContain('class="lab-stage"')
    expect(html).toContain('第 01 节 · 核心通关实践')
    expect(html).toContain('电、开关与比特编码')
  })

  it('renders the subtitle only when it is provided', () => {
    const withSubtitle = render({
      index: 3,
      title: '冯·诺依曼微机与指令节拍',
      subtitle: '代码如何变成硬件信号？',
      goal: '单步执行',
      completed: false,
    })
    expect(withSubtitle).toContain('class="lab-subtitle"')
    expect(withSubtitle).toContain('代码如何变成硬件信号？')

    const withoutSubtitle = render({
      index: 3,
      title: '冯·诺依曼微机与指令节拍',
      goal: '单步执行',
      completed: false,
    })
    expect(withoutSubtitle).not.toContain('class="lab-subtitle"')
  })

  it('always shows the goal banner and renders children', () => {
    const html = render({
      index: 6,
      title: '分布式与高并发架构沙盘',
      goal: '扛住 10,000 QPS',
      completed: false,
    })
    expect(html).toContain('通关目标：')
    expect(html).toContain('扛住 10,000 QPS')
    expect(html).toContain('实验内容')
  })

  it('shows the mastered stamp when the section is completed', () => {
    const html = render({
      index: 2,
      title: '逻辑门与加法器电路',
      goal: '算出 1+1=10',
      completed: true,
    })
    expect(html).toContain('done-stamp')
    expect(html).toContain('已掌握 ✓')
    expect(html).not.toContain('learning-stamp')
  })

  it('shows the learning stamp while the section is incomplete', () => {
    const html = render({
      index: 2,
      title: '逻辑门与加法器电路',
      goal: '算出 1+1=10',
      completed: false,
    })
    expect(html).toContain('learning-stamp')
    expect(html).toContain('正在学习')
    expect(html).not.toContain('done-stamp')
  })
})
