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
    └── components/      # 通用 UI（提示气泡、实验台卡片等）
```

## 技术意向

- Vite + React + TypeScript
- 静态部署到 GitHub Pages：https://dangzhuotong.github.io/tongyun-codeworld/
- 进度仅存 `localStorage`，无后端、无账号

## 给谁用

- 阿橦自己循序渐进学「从计算机到大模型」的直觉
- 以后挂 Pages 给人逛：好玩、能走通，不追求百科全覆盖
