# 增量 trigger 形态决策

为每件物料写 StreamTriggerConfig 的判定表，注册为树级 registry（compileTreeTrigger + createTriggerRegistry，rootKey 取剧本根容器 key）。

## 形态决策树

按物料 data 的增长形态逐件判定：

```
data 内有流式增长的主数组？
├─ 是 → array 形态（arrayKey 指向该数组）
│   └─ 空数组是合法终态吗（如未配置 AI 分析）？
│       ├─ 是 → 加 stateBranch.emptyPassthrough（物料空态分支接管）
│       └─ 否 → 纯 array（空数组期无帧，终帧兜底）
└─ 否 → 内容区域 slot 可独立揭示吗（容器型物料）？
    ├─ 是 → region 形态（slots 列插槽名；slot key 存在 ⟺ 已开始传输，空数组合法终态保留）
    ├─ 兼有主数组 → 组合形态（至多 1 array + 至多 1 region，任一形态有产出即保留）
    └─ 否 → scalar 形态（fallbackData ??= 语义，key 闭合即空壳早挂载）
```

无声明（树级 prune 语义兜底）适用于：增长的是槽内 components 树的容器（如 cx-grid）——key 闭合即保留，后代按自身 config 判定，天然给出逐行生长。

## region 叶子误剔规避

region 的产出判据是「声明 slots 至少一个已揭示」——**没有该 slot 的叶子节点会被误判为无产出而剔除**。先例：chain-node 递归嵌套 nodes slot，中间节点适合 region，但叶子节点无 nodes slot 会被误剔，故 chain-node 整体不声明（prune 语义已给出理想的递归逐行生长）。判定口诀：声明 region 前先问「该 key 的所有实例都恒有此 slot 吗」，有反例就不声明。

## skeletonFields 判据

只列**必填长字段**（该字段未传输时物料必须显骨架的字段）：

- 可选字段列入会让 _cx_streaming 标记终态常亮（骨架永不消退）
- props 有默认值兜底的物料全部不设 skeletonFields，空壳期由物料自身空态分支接管（整卡不渲染、字段空串、图表区不渲染）

## array 形态注意

- 截断只认 arrayKey 主数组；尾随标量/尾随对象不进增量帧，随完整 JSON 终帧兜底——不要把关键渲染字段放在主数组之后的尾随位置（chart 对象先例：stats 数组进增量、chart 尾随终帧兜底，可接受因图表本就最后渲染）
- 空数组 + 无 emptyPassthrough = 全程无帧、终态 null（节点消失），务必与物料空态语义对齐后二选一

## 注册与断言

- registry.register(rootKey, compileTreeTrigger(configs))；rootKey 必须等于剧本根容器 key（单根契约）
- 管线测试判据（vitest node 环境直驱生成器现构剧本）：
  - 50% 前缀出帧非 null，节点 id:key 序列为终态前缀子集（证伪假骨架）
  - 多百分比前缀出帧无 key 未传完的部分节点（buildPartial 修剪契约）
  - 完整文本出帧节点集合与源 schema 全量一致（含尾随标量终帧兜底）
  - region 物料在 slot 未揭示时无产出剔除；emptyPassthrough 空数组透传
  - scalar 物料 key 闭合即空壳且带 fallback 兜底字段
