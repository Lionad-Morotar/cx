<template>
  <!-- /dev/components* 验收页共享的两区骨架：左侧 sidebar（关键词过滤 + group + 组件 item）
       + 右侧 main（选中物料的多 variant 并列块）。五个物料验收页经本组件装配，
       布局、选中、URL 持久化与过滤交互单一来源。 -->
  <div class="dev-showcase" data-testid="dev-showcase">
    <!-- 侧边栏：独立滚动；过滤仅收敛列表渲染，不影响主区选中态 -->
    <aside class="showcase-sidebar">
      <input
        v-model="filterQuery"
        class="sidebar-filter"
        data-testid="sidebar-filter"
        type="text"
        placeholder="过滤物料…"
        aria-label="过滤物料"
      />
      <nav class="sidebar-nav">
        <section
          v-for="(group, gi) in filteredGroups"
          :key="group.name"
          class="sidebar-group"
          :data-testid="`sidebar-group-${gi}`"
        >
          <h3 class="group-title">
            {{ group.name }}
            <span class="group-count">{{ group.items.length }}</span>
          </h3>
          <ul class="group-items">
            <li v-for="item in group.items" :key="item.meta.key">
              <button
                type="button"
                class="sidebar-item"
                :class="{ 'sidebar-item--active': item.meta.key === selectedKey }"
                :data-testid="`sidebar-item-${item.meta.key}`"
                :aria-current="item.meta.key === selectedKey ? 'true' : undefined"
                @click="select(item.meta.key)"
              >
                <span class="item-name">{{ item.meta.name }}</span>
                <!-- 流式支持标记：仅当传入 replay 且该物料注册了增量 trigger 时显示；
                     不显眼的小圆点（hover/聚焦经 title 说明），靠左文本溢出省略让位 -->
                <span
                  v-if="streamSupports(item.meta.key)"
                  class="stream-tag"
                  :data-testid="`stream-tag-${item.meta.key}`"
                  title="支持流式增量渲染"
                  aria-label="支持流式增量渲染"
                />
              </button>
            </li>
          </ul>
        </section>
      </nav>
    </aside>

    <!-- 主内容区：独立滚动；仅渲染选中物料的 variant 序列 -->
    <main class="showcase-main">
      <header class="main-head">
        <h2 class="main-title">{{ selected?.meta.name }}</h2>
        <code class="main-key">{{ selected?.meta.key }}</code>
      </header>
      <p v-if="selected?.meta.description" class="main-desc">
        {{ selected.meta.description }}
      </p>
      <section v-if="selected && !selected.meta.headless" class="variant-list">
        <article
          v-for="(variant, vi) in selectedVariants"
          :key="variant.node.id"
          class="variant-block"
          :data-testid="`variant-${selected.meta.key}-${vi}`"
        >
          <header class="variant-head">
            <h4 class="variant-label">{{ variant.label }}</h4>
            <!-- 流式回放：仅当传入 replay 且该 variant 节点有增量 trigger 时渲染按钮 -->
            <template v-if="replay && replayOf(variant.node).hasTrigger">
              <span
                v-if="replayOf(variant.node).partialCount.value !== null"
                class="badge badge--replay"
                >{{ replayOf(variant.node).partialCount.value }} 项</span
              >
              <button
                type="button"
                class="replay-btn"
                :data-testid="`replay-${selected.meta.key}-${vi}`"
                :title="replayTitle(replayOf(variant.node))"
                @click="replayOf(variant.node).toggle()"
              >
                {{ replayIcon(replayOf(variant.node)) }}
              </button>
            </template>
          </header>
          <div class="variant-preview">
            <!-- 有 replay 走 DevCardPreview（含增量/终态三态切换）；无 replay 直渲 CxRender -->
            <DevCardPreview
              v-if="replay"
              :node="variant.node"
              :replay="replayOf(variant.node)"
            />
            <CxRender v-else :components="[variant.node]" />
          </div>
        </article>
      </section>
      <div v-else class="variant-empty">
        <span class="muted">无可见 UI（逻辑型物料）</span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
// 显式 import 使 CxRender 在 vitest 中可经 vi.mock 拦截（Nuxt 全局注册的同名组件去重，生产行为不变）
import { CxRender } from '@lionad/cx-render'
import {
  replayIcon,
  replayTitle,
  useCardReplay,
  type CardReplay,
} from '~/dev/use-card-replay'
import { variantsOf, type VariantRegistry } from '~/dev/variants-utils'
import type { DevItem, ShowcaseGroup } from '~/dev/material-utils'
import type { CxSpec, TriggerRegistry } from '@lionad/cx-stream'

defineOptions({ name: 'DevShowcase' })

const props = defineProps<{
  groups: ShowcaseGroup[]
  variants?: VariantRegistry
  /** 流式回放装配：传入则对含增量 trigger 的 variant 渲染回放按钮；缺席时不渲染（向后兼容） */
  replay?: {
    registry: TriggerRegistry<CxSpec>
    countOf?: (node: { key: string; data?: Record<string, unknown> }) => number | null
  }
}>()

// 每 variant 节点懒建一个回放实例并按 node.id 缓存：同物料多 variant 各自独立，
// 切换选中项不卸载 DevShowcase 故实例跨选择复用（与旧卡片页整页建全同寿命语义）
const replayCache = new Map<string, CardReplay>()
function replayOf(node: { id: string; key: string; data?: Record<string, unknown> }): CardReplay {
  let r = replayCache.get(node.id)
  if (!r) {
    r = useCardReplay(node, {
      registry: props.replay!.registry,
      countOf: props.replay!.countOf,
    })
    replayCache.set(node.id, r)
  }
  return r
}
// replayOf 在 render 期调用，此时 getCurrentInstance() 为 null，useCardReplay 内部的
// onUnmounted(reset) 静默不注册——故由持有者在本组件 setup 期统一清理缓存内 timer，
// 避免曾播放的 variant 在切选中/离页后空转到剧本自然结束
onBeforeUnmount(() => {
  replayCache.forEach((r) => r.reset())
})

// useRoute/useRouter 为 Nuxt 自动导入（生产经 unimport 注入；vitest 经 globalThis 覆盖）
const route = useRoute()
const router = useRouter()

const filterQuery = ref('')

// 选中态唯一来源是 URL query：点击写 ?c=，刷新/前进/后退均从 URL 恢复；
// 未知 key 回退首组首 item，保证主区永不空白
const firstKey = computed(() => props.groups[0]?.items[0]?.meta.key ?? null)

const allItems = computed(() => props.groups.flatMap((g) => g.items))

const selectedKey = computed(() => {
  const c = route.query.c
  const key = Array.isArray(c) ? c[0] : c
  if (key && allItems.value.some((i) => i.meta.key === key)) {
    return key
  }
  return firstKey.value
})

const selected = computed<DevItem | null>(
  () => allItems.value.find((i) => i.meta.key === selectedKey.value) ?? null,
)

const selectedVariants = computed(() =>
  selected.value ? variantsOf(selected.value.meta, props.variants ?? {}) : [],
)

// 流式支持判定：仅当传入 replay 且该物料在注册表内有增量 trigger 时为真——
// 驱动 sidebar 右侧 stream 标记与主区回放按钮两处门控同源
function streamSupports(key: string): boolean {
  return !!props.replay && props.replay.registry.has(key)
}

// 大小写不敏感的 name/key 子串过滤；匹配为空的组整组隐藏
const filteredGroups = computed<ShowcaseGroup[]>(() => {
  const q = filterQuery.value.trim().toLowerCase()
  if (!q) {
    return props.groups
  }
  return props.groups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) => i.meta.name.toLowerCase().includes(q) || i.meta.key.toLowerCase().includes(q),
      ),
    }))
    .filter((g) => g.items.length > 0)
})

// push（非 replace）使每次切换进历史记录，浏览器前进/后退可回看选中序列
function select(key: string) {
  if (key === selectedKey.value) {
    return
  }
  router.push({ query: { ...route.query, c: key } })
}
</script>

<style scoped>
.dev-showcase {
  display: flex;
  height: 100%;
  min-height: 0;
}
.showcase-sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  background: #fafafa;
}
.sidebar-filter {
  margin: 12px;
  padding: 6px 10px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  outline: none;
}
.sidebar-filter:focus {
  border-color: #2563eb;
}
.sidebar-nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 12px 16px;
}
.sidebar-group {
  margin-top: 16px;
}
.group-title {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.group-count {
  font-size: 10px;
  font-weight: 400;
  color: #bbb;
}
.group-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sidebar-item {
  width: 100%;
  text-align: left;
  font-size: 13px;
  color: #374151;
  padding: 5px 8px;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  /* 选中态只换颜色不换尺寸：两态等宽透明边框占位，切换无 layout shift */
  border: 1px solid transparent;
  /* 名称 + 流式标记横排：名称弹性收缩省略，标记固定不被挤压 */
  display: flex;
  align-items: center;
  gap: 6px;
}
.sidebar-item:hover {
  background: #f3f4f6;
}
.sidebar-item--active {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}
.item-name {
  flex: 1 1 auto;
  min-width: 0;
  /* 显式字号（继承自 .sidebar-item 同值），使三级排版层级 group<item<variant 自描述可断言 */
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stream-tag {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}
.sidebar-item--active .stream-tag {
  background: #60a5fa;
}
.showcase-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 24px 28px;
}
.main-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.main-title {
  font-size: 18px;
  font-weight: 600;
}
.main-key {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 1px 6px;
  border-radius: 4px;
}
.main-desc {
  font-size: 13px;
  color: #888;
  margin-top: 6px;
}
.variant-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.variant-block {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}
.variant-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
}
.variant-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
.badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
}
.badge--replay {
  color: #1d4ed8;
  background: #eff6ff;
}
.replay-btn {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #2563eb;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
}
.replay-btn:hover {
  border-color: #2563eb;
  background: #eff6ff;
}
.variant-preview {
  padding: 20px 14px;
  min-height: 64px;
  display: flex;
  /* safe center：变体短于容器时居中，高于容器时回退 flex-start，
     避免普通 center 把表格等高变体的顶部行裁切到滚动原点之上而不可达 */
  align-items: safe center;
  justify-content: center;
  overflow: auto;
  max-height: 360px;
}
.variant-empty {
  margin-top: 20px;
  padding: 32px;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
  text-align: center;
}
.muted {
  font-size: 12px;
  color: #bbb;
}
</style>
