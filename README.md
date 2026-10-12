# 代码世界（tongyun-codeworld）

一条可滚动的连续探索之路：从电与开关走到 AI 大模型，路过短提示、点路边实验台动手玩。纯前端静态站，无账号。

## 当前阶段

**MVP 文档与任务书已就绪**，业务代码尚未脚手架。请按 `docs/tasks/001-scaffold-mvp.md` 用 Vite + React + TypeScript 起项目，再实现前 5 段路。

详细见：

| 文档 | 内容 |
|------|------|
| [docs/vision.md](docs/vision.md) | 产品愿景与「连续探索」原则 |
| [docs/roadmap.md](docs/roadmap.md) | 完整时代路段大纲 |
| [docs/mvp.md](docs/mvp.md) | MVP 5 段验收标准 |
| [docs/style.md](docs/style.md) | 视觉与手帐风格 |
| [AGENTS.md](AGENTS.md) | AI / agy 开发规则 |
| [docs/tasks/001-scaffold-mvp.md](docs/tasks/001-scaffold-mvp.md) | 第一份可执行任务书 |

## 本地跑（脚手架完成后）

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址。构建与预览：

```bash
npm run build
npm run preview
```

（以上命令由 `001` 任务里 `npm create vite` 生成后生效；当前仓库只有文档。）

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
- 静态部署友好（GitHub Pages）
- 进度仅存 `localStorage`，无后端、无账号

## 给谁用

- 阿橦自己循序渐进学「从计算机到大模型」的直觉
- 以后挂 Pages 给人逛：好玩、能走通，不追求百科全覆盖
