# 001 — 脚手架 + MVP 五段路

## 目标

在空（或仅有文档）的 `tongyun-codeworld` 仓库里，用 Vite + React + TypeScript 搭好纯前端静态站，实现「连续探索之路」MVP：可滚动长卷上的前 5 段路，每段有路过短提示与路边实验台，进度写入 `localStorage`。

## 输入（先读）

按顺序阅读仓库内：

1. `README.md`
2. `AGENTS.md`
3. `docs/vision.md`（必须是连续探索，不是关卡岛）
4. `docs/mvp.md`（五段验收细则）
5. `docs/style.md`（暖奶茶 / 抹茶绿 / 蜜桃红）
6. `docs/roadmap.md`（只作背景，MVP 外路段不要实现）

工作目录：本仓库根目录。

## 完成标准（可检查）

1. `npm create vite`（或等价）生成 `react-ts` 项目后，`npm install`、`npm run build`、`npm run dev` 可成功。
2. 打开页面是**一条连续可滚动长卷**（横向或纵向均可，优先横向长路），能从第 1 段滚到第 5 段；不是分散关卡岛地图。
3. 五段齐全且顺序正确（见 `docs/mvp.md`）：
   - 电与开关
   - 逻辑门
   - 简单程序 / CPU 步进
   - 神经网络玩具
   - Transformer 注意力直觉
4. 每段：路过出现短提示；点路边实验台可动手；有明确「通过」反馈（可解锁视觉进度即可）。
5. 进度持久化到 `localStorage`（key 前缀 `tongyun-codeworld:`）；刷新后进度仍在；提供简单「重置进度」。
6. 视觉大致符合 `docs/style.md`（暖底色、圆角卡片、抹茶绿/蜜桃红点缀）。
7. 无后端、无登录、无外部付费 API 依赖；大模型段只做示意交互。
8. 中文用户可见文案；`README` 本地跑命令可用。

## 禁区

- 不要实现 roadmap 里 MVP 以外的时代路段。
- 不要加账号体系、数据库、服务端。
- 不要引入 Three.js / 重型 3D 引擎做 MVP。
- 不要擅自 `git push --force`、改远程、删历史；首次提交可用普通 commit + push（若已配置 remote）。
- 不要改写已定稿的愿景：禁止改成「关卡岛闯关」。
- 不要提交 `node_modules/`、`.env` 密钥。

## 建议实现顺序

1. Vite React-TS 脚手架 + 主题 CSS 变量  
2. 长卷容器 + 滚动进度条/路标  
3. 路段数据配置（标题、文案、组件名）  
4. 五个实验组件（可先简陋，但须可交互）  
5. localStorage 进度  
6. `npm run build` 确认静态可部署  

完成后在本文件末尾追加一小节「完成笔记」（日期、本地验证命令、已知粗糙点即可）。

## 完成笔记

- 日期：2026-10-13
- 做了什么：用 `npm create vite@latest`（模板 `react-ts`）在仓库根目录搭好 Vite + React + TypeScript。竖向连续长卷，顺序为电与开关、逻辑门、CPU 步进、神经网络玩具、注意力直觉。每段路过短提示（可关、约 8 秒淡出），点「打开实验台」才动手。通过后卡片出现「走过了」，进度写入 `localStorage` 键 `tongyun-codeworld:progress`，页脚可重置。晶体管、操作系统、网络、语言、机器学习只做淡色路牌，没有假实验。
- 本地验证：`npm install`、`npm run lint`、`npm run build` 通过。`npm run dev` 打开后，在浏览器里走完五段：开关调成 `101`、AND 且两把钥匙都开、单步到 HALT 且 R0 为 5、权重约 `1 / -1 / 0` 时准确率 100%、点两个 Token 再点「继续走」。刷新后「走过了」仍在，键为 `tongyun-codeworld:progress`。重置后回到走过 0/5。约 390px 窄屏可以竖着滚，控制台没有报错。
- 已知粗糙点：神经网络只是一条直线边界，不是多层网络；注意力权重是写死的示意表，没有真模型；动效只有气泡淡入和开关缩放；窄屏能往下滚，实验区会挤在一列里。
