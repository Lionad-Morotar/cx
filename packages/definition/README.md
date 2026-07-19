# @lionad/cx-definition

schema 层：组件 meta 类型系统、normalize、loader、事件总线

cx 是 schema 驱动的 Vue 渲染系统。详见[根 README](https://github.com/Lionad-Morotar/cx#readme)。

## ⚠️ 信任边界（loader 远程物料加载）

`loader/script-manager.ts` 提供远程物料能力：**从任意 URL 拉取 JS 并在页面上下文执行**（ESM 模式为 fetch + `<script>` 内联注入，UMD 模式为 `<script src>`）。这是低代码远程物料的 by-design 能力，同时也意味着：

- 物料服务器与传输链路是你的**完全信任边界**——被注入的脚本拥有页面全部权限
- 消费方必须自行缓解：
  - 仅使用 **HTTPS** 可信源
  - 以 **CSP**（Content-Security-Policy）限定脚本源白名单
  - 自托管物料时建议自行加签并在加载层校验（本包当前未内置 SRI/allowlist）
- 加载器目前：不强制 HTTPS、不校验 SRI、不维护 allowlist、`window[url]` 全局键不清理（原始设计如此，行为冻结自 p-ray）

若你的应用不需要远程物料，可以不调用 `CxLoader.init(url, ...)` 的远程路径，仅使用 `installComponent` 注册本地物料。

## License

MIT
