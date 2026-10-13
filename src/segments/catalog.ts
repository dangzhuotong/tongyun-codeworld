import type { SegmentId } from '../progress/types.ts'

export interface SegmentDef {
  id: SegmentId
  index: number
  title: string
  hint: string
  goal: string
}

export const SEGMENTS: SegmentDef[] = [
  {
    id: 'switch',
    index: 1,
    title: '电与开关',
    hint: '计算机最底层会的一件事：电路通，或断。我们把这两种状态叫做 0 和 1。',
    goal: '点开三盏灯，把比特调成 101。',
  },
  {
    id: 'gates',
    index: 2,
    title: '逻辑门',
    hint: '单个开关不够用。把通断组合成规则，就有了逻辑：都开才亮，或有一个开就亮。',
    goal: '只有钥匙 A 和 B 都打开时，锁才应该开。选出对应的门。',
  },
  {
    id: 'cpu',
    index: 3,
    title: '简单程序 / CPU 步进',
    hint: '程序不是魔法，是一条条很笨的指令。CPU 取出下一条，执行，再改寄存器。',
    goal: '单步跑完这段程序，让 R0 变成 5。',
  },
  {
    id: 'nn',
    index: 4,
    title: '神经网络玩具',
    hint: '规则写不全时，可以让机器从例子里调权重。拧一拧，分类边界就会动。',
    goal: '拖动权重和偏置，让准确率到 80% 以上。',
  },
  {
    id: 'attn',
    index: 5,
    title: 'Transformer 注意力直觉',
    hint: '大模型把文字切成 Token，一个一个往后想。生成某个位置时，它会更盯着上文的某些词。',
    goal: '点两个不同的 Token，看高亮跟着谁变，再确认继续走。',
  },
]

export interface RoadSign {
  id: string
  after: SegmentId
  title: string
  text: string
}

export const ROAD_SIGNS: RoadSign[] = [
  {
    id: 'transistor',
    after: 'switch',
    title: '路牌 · 晶体管',
    text: '以后会经过这里：用一个小开关去控制另一个开关。这段还没铺实验，先往下走。',
  },
  {
    id: 'later',
    after: 'cpu',
    title: '路牌 · 还没铺的路',
    text: '操作系统、网络、编程语言、机器学习入门都还在后面。主路先跳到能拧的玩具。',
  },
]
