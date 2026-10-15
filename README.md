# 代码世界（tongyun-codeworld）

一条可滚动的连续探索之路：从电与开关走到 AI 大模型，路过短提示、点路边实验台动手玩。纯前端静态站，无账号。

## 当前阶段

**全景八大纪元已全面贯通**：
1. 电、开关与 8 位字节 ASCII 编码
2. 逻辑门与半加器动态电路（1+1=10 物理实现）
3. 冯·诺依曼微机时钟节拍与四拍流水线
4. 操作系统与虚拟内存 / MMU 页表隔离沙盘
5. 六大主流编程语言（C/Rust/Go/Java/Python/TS）架构大比拼与并发模拟
6. 分布式高并发系统架构沙盘（Redis 缓存 + Kafka 削峰 + Sentinel 熔断）
7. 神经网络 2D 决策边界拟合与梯度下降
8. Transformer 自注意力机制与 KV Cache 显存带宽墙沙盘

线上地址（推到 `master` 后由 GitHub Actions 发布）：https://dangzhuotong.github.io/tongyun-codeworld/

### 最近更新记录

- **第二批知识拓扑核心技术段落扩充**：对照架构演进设计规划与蓝图，为全部八大技术主题（底层硬件、CPU体系、操作系统、网络通信、编程语言、数据存储、分布式中间件、AI大模型）补充同格式的第二批深度知识节点（MOSFET 晶体管与开关物理、指令集架构与机器码 ISA、用户态/内核态与系统调用、DNS 解析与 CDN 边缘网络、内存管理裸指针/GC/所有权、分库分表与 LSM-Tree 存储引擎、微服务网关与限流熔断防线、大模型量化与推理加速引擎），核心拓扑节点扩充至 25 个，完善底层机制推导、架构取舍分析与全链路技术演进连线。
- **全站移动端响应式适配 (<=768px 与 <=420px)**：
  - 顶栏与核心模式导航在移动端自适应换行，<=420px 超窄屏自动收敛次要文字与角标，防止溢出挤压；
  - 全局代码块、数学公式与表格增加横向安全滚动与触摸支持；
  - 知识拓扑星图、分类工具栏、步骤指示器与架构步骤条支持原生平滑横向滚动与手势滑动；
  - 实验台与案例展示的多栏布局在移动端自动转换为单栏垂直流，字号与卡片间距自适应缩放；
  - 桌面端宽屏布局与交互体验保持完全一致。

详细见：

| 文档 | 内容 |
|------|------|
| [docs/architect-blueprint.md](docs/architect-blueprint.md) | **架构大拿终极演进体系设计蓝图**（理念、图解、多语言对比、实操规范） |
| [docs/vision.md](docs/vision.md) | 产品愿景与「连续探索」原则 |
| [docs/roadmap.md](docs/roadmap.md) | 完整八大纪元路段大纲 |
| [docs/style.md](docs/style.md) | 视觉与暖奶茶手帐风格 |
| [AGENTS.md](AGENTS.md) | AI / agy 开发规则 |
| [docs/tasks/001-scaffold-mvp.md](docs/tasks/001-scaffold-mvp.md) | 脚手架与核心路段任务书 |

## 本地跑（脚手架完成后）

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址。默认站点子路径是 `/tongyun-codeworld/`，和 Pages 一致；本地若要挂在根路径，可先设 `VITE_BASE=/`。构建与预览：

```bash
npm run build
npm run preview
```

构建产物在 `dist/`，可作静态站部署。

## 面试书架

主路仍是连续探索（电 → 大模型）。顶栏 **面试书架**，或打开 `#/bookshelf/system-design`，会另开阅读角，不替换这条路。

书架列出 Alex Xu《System Design Interview》公开笔记的 28 章（01. Scaling … 28. Stock Exchange）。正文和配图在你点开某一章时，才从 [`liquidslr/system-design-notes`](https://github.com/liquidslr/system-design-notes) 拉取，不放进本仓库。也可对照 [Pagefy 上的同系列阅读页](https://pagefy-blush.vercel.app/system-design/system-design-interview-by-alex-xu)。

线上先读 `raw.githubusercontent.com`（正文用 fetch，配图直接当图片地址）。失败再试 jsDelivr。配图若第一处打不开，会再试另一处。本地 `npm run dev` 若两处都读不到正文，会再走开发服务器上的 `/sdn-raw` 代理；GitHub Pages 没有这个代理。

## 推荐目录结构（实现后目标）

```
tongyun-codeworld/
├── README.md
├── AGENTS.md
├── docs/
│   ├── vision.md
│   ├── roadmap.md
│   ├── mvp.md
│   ├── style.md
│   └── tasks/
│       └── 001-scaffold-mvp.md
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig*.json
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/          # 全局主题、暖奶茶 tokens
    ├── journey/         # 长卷/长路：滚动容器、路段渲染
    ├── segments/        # 各时代路段配置与路边实验组件
    ├── progress/        # localStorage 进度读写
    ├── bookshelf/       # 面试书架：章节目录 + 运行时拉取公开笔记
    └── components/      # 通用 UI（提示气泡、实验台卡片等）
```

## 技术意向

- Vite + React + TypeScript
- 静态部署到 GitHub Pages：https://dangzhuotong.github.io/tongyun-codeworld/
- 进度仅存 `localStorage`，无后端、无账号

## 给谁用

- 阿橦自己循序渐进学「从计算机到大模型」的直觉
- 以后挂 Pages 给人逛：好玩、能走通，不追求百科全覆盖
