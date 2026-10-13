import type { SegmentId } from '../progress/types.ts'

export interface SegmentDef {
  id: SegmentId
  index: number
  title: string
  subtitle: string
  hint: string
  goal: string
}

export const SEGMENTS: SegmentDef[] = [
  {
    id: 'switch',
    index: 1,
    title: '电、开关与比特编码',
    subtitle: '从物理电平到信息符号',
    hint: '计算机底层只认识电平高低。把高电平记作 1，低电平记作 0，8个开关就能拼出人类世界的所有数字与字符。',
    goal: '拨动开关观察二进制与十进制/ASCII字符的实时变换，拼出目标字符即可通过。',
  },
  {
    id: 'gates',
    index: 2,
    title: '逻辑门与加法器电路',
    subtitle: '机器究竟如何用电线做算术？',
    hint: '晶体管串联是与（AND），并联是或（OR）。把异或门与与门结合，电线就能亲手算出一加一等于二！',
    goal: '操作加法器电路，输入 A 和 B，观察 Sum（本位）与 Carry（进位）的电平流动并计算。',
  },
  {
    id: 'cpu',
    index: 3,
    title: '冯·诺依曼微机与指令节拍',
    subtitle: '代码如何变成一条条单步执行的硬件信号？',
    hint: '时钟晶振是计算机的心跳。CPU 在每个节拍里循环：取指令 → 译码 → ALU计算 → 写回寄存器。',
    goal: '观察时钟波形，单步步进程序指令，观察 PC、ALU 与寄存器的真实跳动。',
  },
  {
    id: 'os',
    index: 4,
    title: '操作系统与虚拟内存',
    subtitle: '进程隔离与“给程序画大饼”的艺术',
    hint: '多个程序跑在一颗 CPU 上为什么不打架？因为操作系统通过 MMU 页表给每个程序伪造了独占全部内存的幻觉。',
    goal: '在虚拟内存沙盘中分配进程内存块，体验 MMU 页表转换以及跨进程越界时的安全拦截（Page Fault）。',
  },
  {
    id: 'languages',
    index: 5,
    title: '六大编程语言架构大比拼',
    subtitle: 'C/C++、Rust、Go、Java、Python、TypeScript 的架构抉择',
    hint: '没有最好的语言，只有最适合架构场景的妥协。内存管理（手动/GC/所有权）与并发模型（线程/协程/事件循环）决定了一切。',
    goal: '自由切换体验 6 种语言的架构雷达、内存机制图解与并发模拟，完成架构选型测试。',
  },
  {
    id: 'arch',
    index: 6,
    title: '分布式与高并发架构沙盘',
    subtitle: '系统架构师的流量防线与高可用实操',
    hint: '单机扛不住流量洪峰时，架构师必须打出组合拳：Nginx负载均衡、Redis缓存拦截、Kafka异步削峰、熔断降级保底。',
    goal: '遭遇 10,000+ QPS 流量洪峰时，手动开启 Redis 缓存、Kafka 削峰与 Sentinel 熔断降级拯救数据库。',
  },
  {
    id: 'nn',
    index: 7,
    title: '神经网络与梯度下降',
    subtitle: '当规则写不全时，让机器从例子里调权重',
    hint: '现实世界太多规则无法手写。神经网络通过大量乘加运算与梯度下降，自动扭曲超平面把复杂数据切分开。',
    goal: '拖动权重与偏置，亲眼观察 2D 决策分界线动态形变，将准确率调至 80% 以上。',
  },
  {
    id: 'attn',
    index: 8,
    title: '大模型 Transformer 与推理架构',
    subtitle: '自注意力机制与现代 LLM 推理瓶颈（KV Cache）',
    hint: '大模型逐词自回归生成时，自注意力在计算词与词的相关度；而长文本生成的最大物理瓶颈是显存带宽墙（KV Cache）。',
    goal: '探索自注意力热力图投影，并观察生成过程中 KV Cache 显存占用与显存带宽瓶颈。',
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
    id: 'sign-transistor',
    after: 'switch',
    title: '路牌 · 晶体管的奇迹',
    text: '从机械开关到微型硅晶体管：人类学会了用一根微弱的控制电压，去切断或放通另一股电流，数十亿个开关从此被刻在指甲盖大小的芯片上。',
  },
  {
    id: 'sign-software',
    after: 'cpu',
    title: '路牌 · 从硬件到软件的飞跃',
    text: '纯靠硬件接线做计算太累了！把指令当作数据存在内存里，只要改写内存里的数字，机器就能瞬间变成另一个工具，软件时代正式开启。',
  },
  {
    id: 'sign-cloud',
    after: 'languages',
    title: '路牌 · 单机到集群的跨越',
    text: '无论单个进程把代码优化到多极致，单台物理机的 CPU、内存和网卡终究有物理极限。架构师的思考维度必须从“编写单机代码”跃迁至“编排成千上万台机器的网络协作”。',
  },
]
