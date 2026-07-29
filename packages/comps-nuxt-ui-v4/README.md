# @lionad/cx-comps-nuxt-ui-v4

cx 物料组件库，基于 Nuxt UI v4。对齐 `@lionad/cx-comps-nuxt-ui-v2` 的物料概念，采用 v4 组件 API。

## 架构：Nuxt 宿主依赖型 library

区别于 v2 包的自包含 vendor 模式，v4 包假设消费方是已注册 `@nuxt/ui` module 的 Nuxt app：

- `peerDependencies` 声明 `@nuxt/ui ^4`，不 vendor v4 源码
- 物料组件裸用 `<UButton>` 等，由宿主 Nuxt app 的 @nuxt/ui module auto-import 解析
- `vp pack` 把 `U*` 组件与 Nuxt 虚拟模块（`#imports` / `#app` / `#build/app.config` / `#components`）外置，dist 不内联 v4 源码

## 物料 key

key 形如 `cx-nuxt-ui-v4-<comp>`，与 v2 物料（`cx-<comp>`）共存于同一 cx 实例（注册到全局 vueApp 时靠版本化 key 避免冲突）。

## 非 Nuxt 消费

v4 包是 Nuxt 宿主依赖型，非 Nuxt 消费需自行提供 `U*` 组件与 Nuxt 虚拟模块。
