# 验收脚本形态

S 页面验收用 Playwright headless 脚本（落 zRefs/，不入库），1920×1080 视口。断言清单按序执行，任一环断裂即定位到对应契约（见 schema-contracts.md）。

## 前置：会话注入

- token 优先读 zRefs 新鲜 token 文件，回落 curl.sh 正则提取；经 add_init_script 注入 localStorage 三件套（account/token/tenant）
- 禁止调 api 绕过测试（数据已由预录剧本固化，页面只读 /dev/*.json）

## 断言清单

1. **播完直出终态**：click finish → detector status === 'success'，chunks 进度满（如 4552/4552）
2. **双视图锚点等量**：增量视图锚点数 === 终态视图锚点数（finish 直跳后增量回落终态树的直接证据；不等即回落失效）
3. **BEM 锚点分件计数**：按物料 BEM block class 逐件计数（.cx-chain-section/.cx-chain-node/.cx-tabs/.cx-company-card/...），与剧本节点数核对。禁用 .is-cx-component 全量计数——inheritAttrs:false 物料被吞标识后漏计，误报为「渲染不全」
4. **伪联动闭环**：点击链节点 → link-hint 出现「已选「xxx」→ ...」文案 + tabs 激活面板切到目标（.cx-tabs__tab.is-active 文案断言）+ 节点选中态可视（滚动虚线框）
5. **console/page error 清零**：全程监听 console error 与 pageerror，收尾打印前 10 条——「功能正常但有 emitter TypeError」类噪音也算失败（见 schema-contracts.md 事件契约）
6. **full_page 截图**：布局排查留证（链区稀疏、列宽失衡、面板空白一眼可辨）；关键物料再截 viewport 近景

## 时序要点

- goto 后 wait_for_load_state('networkidle') 再操作（动态应用等 JS 执行）
- finish 前留 1-2 秒自动播放窗口：中间帧渲染期是 transient 错误的唯一暴露窗口（finish 直跳会压缩掉）
- 点击节点后 wait 1 秒以上再读 hint（hooks 广播 → 覆盖层重算 → 重渲染链路）

## 单测与全量收尾

- 生成器/trigger 单测（vitest node 环境）随切片持续绿；spec fixture 内联不依赖 zRefs 抓数产物（可提交、可重复）
- 切片完成与提交前跑全量 vitest（含既有套件），超时给足
- fixture 口径以真实数据为准：前缀字符串等先 jq + cat -A 实证原始字节再写断言
