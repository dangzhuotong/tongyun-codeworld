import { useEffect, useRef, useState } from 'react'

const PROGRAM = [
  'LOAD R0, 0',
  'LOAD R1, 1',
  'ADD R0, R1',
  'ADD R0, R1',
  'ADD R0, R1',
  'ADD R0, R1',
  'ADD R0, R1',
  'HALT',
] as const

const EXPECTED = 5

interface CpuState {
  pc: number
  r0: number
  r1: number
  halted: boolean
  note: string
}

const START: CpuState = {
  pc: 0,
  r0: 0,
  r1: 0,
  halted: false,
  note: '还没开始。点单步，取出第一条。',
}

interface CpuLabProps {
  completed: boolean
  onComplete: () => void
}

function step(state: CpuState): CpuState {
  if (state.halted) return state
  const text = PROGRAM[state.pc]
  if (text === 'LOAD R0, 0') {
    return { ...state, r0: 0, pc: state.pc + 1, note: '取出这条：把 0 放进 R0。' }
  }
  if (text === 'LOAD R1, 1') {
    return { ...state, r1: 1, pc: state.pc + 1, note: '取出这条：把 1 放进 R1。' }
  }
  if (text === 'ADD R0, R1') {
    const r0 = state.r0 + state.r1
    return { ...state, r0, pc: state.pc + 1, note: `执行加法：R0 加上 R1，变成 ${r0}。` }
  }
  return { ...state, halted: true, note: 'HALT。这一轮取指、执行做完了。' }
}

export function CpuLab({ completed, onComplete }: CpuLabProps) {
  const [cpu, setCpu] = useState<CpuState>(START)
  const passed = cpu.halted && cpu.r0 === EXPECTED
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    if (passed) onCompleteRef.current()
  }, [passed])

  return (
    <div className="cpu-lab">
      <ol className="program">
        {PROGRAM.map((text, index) => (
          <li key={`${text}-${index}`} className={index === cpu.pc ? 'current' : undefined}>
            <span className="mono pc">{index === cpu.pc ? 'PC' : index}</span>
            <span className="mono">{text}</span>
          </li>
        ))}
      </ol>
      <div className="regs">
        <p>
          R0 <strong className="mono">{cpu.r0}</strong>
        </p>
        <p>
          R1 <strong className="mono">{cpu.r1}</strong>
        </p>
      </div>
      <p className="lab-note" role="status">
        {cpu.note}
      </p>
      <div className="lab-actions">
        <button
          type="button"
          className="btn"
          disabled={cpu.halted}
          onClick={() => setCpu((state) => step(state))}
        >
          单步
        </button>
        <button type="button" className="btn secondary" onClick={() => setCpu(START)}>
          从头再走
        </button>
      </div>
      {passed ? (
        <p className="pass" role="status">
          通过了。程序停住时 R0 是 {EXPECTED}：一条条加出来的，不是一下子变出来的。
        </p>
      ) : completed ? (
        <p className="pass" role="status">
          这段已经走过了。可以再单步看一遍。
        </p>
      ) : (
        <p className="lab-note">期望：跑到 HALT 时 R0 = {EXPECTED}。</p>
      )}
    </div>
  )
}
