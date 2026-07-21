# 领域文档（Domain Docs）

工程技能（如 diagnose、tdd、improve-codebase-architecture）在探索 cx 代码库时，应如何消费本仓库的领域文档。

## 探索前先读

- **`CONTEXT.md`**（仓库根）—— 领域语言词汇表（glossary），定义 schema、catalog、renderer 等核心术语的准确含义与边界
- **`docs/adr/`** —— 架构决策记录（Architecture Decision Records），阅读与你即将工作区域相关的 ADR

cx 采用 **single-context（单上下文）** 布局：6 个子包（definition → vue → renderer → components → components-nuxt-ui-v2 → nuxt）是同一套 schema 驱动渲染系统的分层，共享统一领域语言，故只需一份根 `CONTEXT.md`，而非 multi-context 的每包一份。

若上述文件尚未创建，**静默继续**——不要提示缺失，也不要主动创建。生产者技能（`/grill-with-docs`）会在术语或决策真正落定时惰性创建它们。

## 文件结构

```
/
├── CONTEXT.md                ← 领域词汇表
├── docs/
│   ├── adr/                  ← 架构决策记录
│   │   ├── 0001-<decision>.md
│   │   └── ...
│   ├── agents/               ← 本文件所在（工程技能配置）
│   ├── plans/
│   ├── reports/
│   ├── reviews/
│   └── thoughts/
├── packages/                 ← 6 子包，各自有 README.md
└── playground/               ← 开发沙箱（站会管理 demo）
```

## 使用词汇表的术语

当你的产出（issue 标题、重构提案、假设、测试名）命名领域概念时，使用 `CONTEXT.md` 中定义的术语，不要漂移到词汇表明确规避的同义词。

若所需概念不在词汇表中——这是一个信号：要么你在发明项目不使用的语言（重新考虑），要么存在真实空白（记下来交给 `/grill-with-docs` 补全）。

## 标记 ADR 冲突

若你的产出与既有 ADR 矛盾，显式提出而非静默覆盖：

> _与 ADR-0007（xxx）冲突——但值得重新讨论，因为……_
