---
name: bem-refactor
description: |
  将 Vue 组件重构为 cx 项目的 BEM（Block-Element-Modifier）命名规范。

  使用场景：
  - 用户说"用 BEM 改造这个组件"
  - 用户说"给这个组件加上 BEM 类名"
  - 用户要求重构组件以符合项目 BEM 规范
  - 新组件需要接入 cx BEM 体系

  触发关键词：useCxBEM、BEM、重构组件、BEM 改造、bem-refactor
argument-hint: <file or component>
disable-model-invocation: true
---

# cx BEM 组件重构指南

## 体系概览

cx 的 BEM 由 JS 与 SCSS 两侧共享同一命名空间 `cx`，生成 `cx-<block>__<element>--<modifier>` 格式的类名，状态类为 `is-<state>`。

- **JS 侧**：`useCxBEM('block')` — `packages/vue/src/bem/index.ts`
- **SCSS 侧**：`@include b/e/m/when` mixins — `packages/vue/src/styles/mixins/bem/index.scss`
- 两侧命名空间 `cx` 是硬契约，改名须同步

## 工作流程

### 1. 分析现有代码

读取目标文件，了解：
- 组件结构和层级关系
- 现有 class 命名方式
- 所属包（`components` 基础组件 vs `components-nuxt-ui-v2` 薄包装层）

### 2. 确定 Block 名称

直接使用组件语义词作为 block 名，**不加前缀**：

| 组件 | block 名 | 生成类名 |
|------|---------|---------|
| CxBlock | `block` | `cx-block` |
| CxText | `text` | `cx-text` |
| CxBadge | `badge` | `cx-badge` |

### 3. 重构 Script

```ts
import { useCxBEM } from '@lionad/cx-vue'

const ns = useCxBEM('block-name')
```

JS 侧 API：

| 方法 | 用途 | 输出示例 |
|------|------|---------|
| `ns.b()` | block 类名 | `cx-block` |
| `ns.b('suffix')` | block + 后缀 | `cx-block-suffix` |
| `ns.e('el')` | element | `cx-block__el` |
| `ns.m('mod')` | modifier | `cx-block--mod` |
| `ns.is('state', cond)` | 条件状态类 | `is-active` 或 `''` |
| `ns.be('suffix', 'el')` | block 后缀 + element | `cx-block-suffix__el` |
| `ns.em('el', 'mod')` | element + modifier | `cx-block__el--mod` |
| `ns.cssVar({ k: v })` | CSS 变量 | `--cx-k: v` |
| `ns.cssVarBlock({ k: v })` | block 级 CSS 变量 | `--cx-block-k: v` |

### 4. 重构 Template

根元素绑定 `ns.b()`，子元素按需绑定 `ns.e()`，状态用 `ns.is()`：

```vue
<!-- 基础组件模式 -->
<template>
  <component :is="tag" :class="[ns.b(), ns.e('content'), ns.is('truncate', props.truncate)]">
    {{ text }}
  </component>
</template>

<!-- Nuxt UI 薄包装模式：仅根元素挂 block -->
<template>
  <UBadge :class="ns.b()" v-bind="attrs">
    <slot />
  </UBadge>
</template>
```

### 5. 重构 Style（分层策略）

样式分三层放置，原则是 **能用模板 `class` 就不用 SCSS**：

| 层 | 放哪 | 内容 |
|---|------|------|
| 静态工具类 | 模板 `class` | 布局、间距、颜色等不依赖状态的样式 |
| BEM 语义类 | 模板 `:class` | `ns.b()` / `ns.e()` / `ns.is()` — 作为钩子 |
| 结构性 CSS | `<style>` SCSS | 状态组合、伪类、动画、CSS 变量、第三方覆盖 |

`class` 与 `:class` 共存是正常模式——Vue 会自动合并两者。

SCSS 仅在模板做不到时使用 `@apply`（状态组合、伪类等）：

```vue
<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('block-name') {
    /* 静态样式已上提至模板 class */

    @include when('active') {
      @apply text-primary; /* 状态组合：模板做不到 */
    }
  }
}
</style>
```

SCSS 侧 mixin：

| mixin | 用途 | 生成选择器 |
|-------|------|-----------|
| `@include b('name')` | block | `.cx-name` |
| `@include e('el')` | element | `.cx-name__el` |
| `@include m('mod')` | modifier | `.cx-name--mod` |
| `@include when('state')` | 状态 | `.cx-name.is-state` |
| `@include not('state')` | 非状态 | `.cx-name:not(.is-state)` |
| `@include pseudo('hover')` | 伪类 | `.cx-name:hover` |

> 薄包装组件 style block 通常为空占位，样式依赖上游 Nuxt UI。

## 完整示例

**重构前：**

```vue
<template>
  <div class="w-full">
    <div class="px-6 py-4 bg-white rounded-sm">
      <h2 class="text-lg font-semibold">{{ title }}</h2>
    </div>
    <div class="main bg-white rounded-sm">
      <slot />
    </div>
  </div>
</template>
```

**重构后：**

```vue
<script setup lang="ts">
import { useCxBEM } from '@lionad/cx-vue'

defineOptions({ name: 'CxPage' })

const ns = useCxBEM('page')

defineProps<{
  title?: string
  active?: boolean
}>()
</script>

<template>
  <!-- 静态工具类在 class，BEM 语义类在 :class，Vue 自动合并 -->
  <div class="w-full" :class="ns.b()">
    <div class="px-6 py-4 bg-white rounded-sm" :class="ns.e('header')">
      <h2 class="text-lg font-semibold" :class="[ns.e('title'), ns.is('active', active)]">
        {{ title }}
      </h2>
    </div>
    <div class="bg-white rounded-sm" :class="ns.e('main')">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('page') {
    /* 静态样式已在模板 class 中，此处仅保留结构性规则 */

    @include e('title') {
      @include when('active') {
        @apply text-primary; /* 状态组合需要 CSS 选择器 */
      }
    }
  }
}
</style>
```

## 注意事项

1. **两种组件模式**：`packages/components` 基础组件有完整样式；`packages/components-nuxt-ui-v2` 是薄包装层，仅 `ns.b()` 挂根元素，style 留空占位
2. **分层放置**：静态工具类写模板 `class`，BEM 语义类写 `:class`，SCSS 仅放状态组合（`when`）、伪类、动画、第三方覆盖等模板做不到的规则；`class` 与 `:class` 共存是正常模式
3. **`@layer cx`**：所有组件样式包在 `@layer cx` 内，确保级联优先级可控
4. **`@use` 而非 `@import`**：`@use '@lionad/cx-vue/styles' as *;` 是唯一入口
5. **命名空间契约**：JS 侧 `useCxBEM` 与 SCSS 侧 `$ns: 'cx'` 共享 `cx` 前缀，改一侧必须改另一侧
