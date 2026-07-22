<!-- CxNuxtUIV4Sidebar: 包装 Nuxt UI v4 USidebar，物料层 open 单向映射 v-model:open。
     内收见下方 CONTAINED_UI（定位，函数式 ui replacer）与 injectContainmentStyle
     （演示高度，运行时注入纯 CSS）：USidebar 的 collapsible 分支把 container 渲染成
     `fixed inset-y-0 h-svh`（视口级固定布局），物料作为自包含渲染单元时会逃逸出
     预览卡片 / 低代码画布并覆盖整页，故把定位内收到自身盒内。 -->
<template>
  <USidebar
    :open="props.open"
    :collapsible="props.collapsible"
    :rail="props.rail"
    :side="props.side"
    :ui="CONTAINED_UI"
  >
    <template #header><slot name="header" /></template>
    <template #default><slot /></template>
    <template #footer><slot name="footer" /></template>
  </USidebar>
</template>

<script setup lang="ts">
import { onBeforeMount, useAttrs } from 'vue'
import { USidebar } from '#components'

defineOptions({ name: 'CxNuxtUIV4Sidebar' })

const props = useAttrs() as {
  open?: boolean
  collapsible?: 'offcanvas' | 'icon' | 'none'
  rail?: boolean
  side?: 'left' | 'right'
}

// USidebar 的 collapsible(icon/offcanvas) 分支把 container 渲染为视口级固定布局
// `fixed inset-y-0 z-10 h-svh lg:flex`、root 为 `hidden lg:block`，并用 gap 占位给
// 固定层让位。物料是低代码画布里的自包含渲染单元：固定定位会无视预览卡片 / 画布边界
// 钉死在视口、撑满视口高度并覆盖整页（与 cx-skeleton 遮罩泄漏同类，但样式来自 Nuxt UI
// 组件语义而非 cx 自有 SFC，无法用 scoped 隔离）。这里经 ui 把布局内收到自身盒内。
//
// 关键点：Nuxt UI 的 tv 对 `:ui` 的 slot 值，字符串形式会被其内部 directives 默认值顶替
// （字符串遭忽略），只有「函数形式 replacer」才会真正替换默认类串（见 tv.js applyReplacer）。
// 故三个 slot 都用 replacer：用正则从默认串里精确剥离视口级工具类，避免依赖 tailwind-merge
// 是否认识 `h-svh` 这类任意单位类（实测它不认，导致字符串追加时 h-svh 残留）。
//   root      去 `hidden`（含 lg:hidden 等变体）、补 block → 预览常显
//   gap       占位仅对固定层有意义，内收后清空以免与容器并排把宽度翻倍
//   container 去 fixed/inset-y-0/h-svh（及 lg: 前缀变体）、补 relative inset-auto flex
const CONTAINED_UI = {
  root: (defaults: string) => `${defaults.replace(/\blg:hidden\b|\bhidden\b/g, '').trim()} block`,
  gap: () => '',
  container: (defaults: string) =>
    `${defaults
      .replace(/\b(?:lg:)?fixed\b/g, '')
      .replace(/\b(?:lg:)?inset-y-0\b/g, '')
      .replace(/\b(?:lg:)?h-svh\b/g, '')
      .trim()} relative inset-auto flex`,
}

// 内收后的预览高度：container 原生 h-svh 是视口高，replacer 剥掉后无显式高度会塌缩成内容高。
// 这里给一个稳定演示高度。不能用 <style scoped>：本包在宿主 dev 下被解析为构建后 dist，scoped
// 样式被抽成未被加载的 style.css，Vue 运行时见不到 <style> 便不把 data-v 作用域属性渲染到
// USidebar 的 container 上，scoped 选择器命中失败。也不能用 h-48 等 Tailwind 类：包 dist 不在
// 宿主 Tailwind 内容扫描范围，包独有尺寸类不会被生成。故运行时注入一条纯 CSS——选择器用渲染器
// 必加的 data-cx-cmpt-key（稳定、不依赖 Tailwind 生成、不依赖 data-v），由组件 JS 自带样式，
// 与构建管线无关，物料在任意宿主自包含。模块级标志保证多实例只注入一次。
let containmentStyleInjected = false
const injectContainmentStyle = () => {
  if (containmentStyleInjected || typeof document === 'undefined') return
  containmentStyleInjected = true
  const style = document.createElement('style')
  style.setAttribute('data-cx-sidebar-containment', '')
  style.textContent =
    '[data-cx-cmpt-key="cx-nuxt-ui-v4-sidebar"] [data-slot="container"]{min-height:12rem}'
  document.head.appendChild(style)
}
onBeforeMount(injectContainmentStyle)
</script>
