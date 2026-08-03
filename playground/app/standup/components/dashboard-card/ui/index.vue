<template>
  <div :class="[ns.b(), ns.is('empty', isEmpty)]" :style="styles">
    <div class="header">
      <slot name="header">
        <div class="icon-quote">
          <div class="single-quote" />
          <div class="single-quote" />
        </div>
        <div class="title-con">
          <slot name="title-start" />
          <slot name="title">
            <div class="title">{{ title }}</div>
          </slot>
          <slot name="title-end" />
        </div>
        <div class="side-title-con">
          <transition name="el-fade-in">
            <UIcon
              v-if="props.isLoading"
              name="i-lucide-loader-circle"
              class="is-loading animate-spin"
            />
          </transition>
          <slot name="icons" />
          <slot name="side-title">
            <div class="side-title">{{ sideTitle }}</div>
          </slot>
        </div>
      </slot>
    </div>
    <template v-if="props.isLoading">
      <slot name="loading">
        <div
          v-if="props.isLoading"
          v-cx-skeleton
          class="contents is-full-content"
          cx-skeleton-delay="150"
        />
      </slot>
    </template>
    <template v-else>
      <slot name="content">
        <div v-if="props.fullContent" class="contents is-full-content">
          <slot name="default">
            <div ref="emptyFirstRef" class="empty-con">
              <img class="image" :src="EmptyStrImage" />
              <div class="title">暂无内容</div>
            </div>
          </slot>
        </div>
        <CxScrollbar v-else class="contents-wrapper">
          <div class="contents">
            <slot name="default">
              <div ref="emptySecondRef" class="empty-con">
                <img class="image" :src="EmptyStrImage" />
                <div class="title">暂无内容</div>
              </div>
            </slot>
          </div>
        </CxScrollbar>
      </slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useCxNamespace } from '../../../utils/namespace'
import EmptyStrImage from '../../../assets/empty.svg'
import { useDashboardCard } from '../states'

import type { CSSProperties } from 'vue'
import { watchEffect } from 'vue'

defineOptions({ name: 'CxDashboardCard' })

const ns = useCxNamespace('dashboard-card')
// 类型内联声明：跨文件 import type 会触发 SFC 编译器的 fs 类型解析（rolldown 环境不可用）
const emits = defineEmits([])
const props = withDefaults(
  defineProps<{
    use?: any
    title?: string
    sideTitle?: string
    themeColor?: string
    fullContent?: boolean
    isLoading?: boolean
  }>(),
  {
    title: '看板',
    themeColor: '#000',
    fullContent: false,
    isLoading: false,
  },
)

const { isEmpty } = useDashboardCard(props, emits)

const emptyFirstRef = ref<any>()
const emptySecondRef = ref<any>()

watchEffect(() => {
  if (emptyFirstRef.value || emptySecondRef.value) {
    isEmpty.value = true
  } else {
    isEmpty.value = false
  }
})

const styles = computed(() => {
  const x = {} as CSSProperties
  if (props.themeColor) {
    x['--color'] = props.themeColor
  }
  return x
})
</script>

<style>
/* 看板卡：主题色经 props 注入 --color，顶部色带 + 同色辉光构成叙事，
   色带为顶缘绝对定位层，不参与几何（非侧条） */
.cx-dashboard-card {
  position: relative;
  display: grid;
  grid-template: 64px minmax(0, 1fr) / minmax(0, 1fr);
  box-sizing: border-box;
  border-radius: var(--su-radius-card);
  border: 1px solid var(--su-border);
  background-color: var(--su-bg-surface);
  box-shadow: var(--su-shadow-card);
  width: clamp(451px, 33%, 500px);
  max-width: 100%;
  overflow: hidden;
  transition: box-shadow var(--su-dur) var(--su-ease), border-color var(--su-dur) var(--su-ease);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--color, var(--su-accent));
  }

  &:hover {
    box-shadow: 0 8px 28px color-mix(in oklab, var(--color, var(--su-accent)) 22%, transparent);
    border-color: color-mix(in oklab, var(--color, var(--su-accent)) 35%, var(--su-border));
  }

  .header {
    display: grid;
    grid-template: auto / auto minmax(max-content, 1fr) auto;
    align-items: center;
    gap: 1em;
    padding: 0 24px;
    padding-top: 14px;

    .title-con {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .title {
      font-size: 20px;
      color: var(--su-ink);
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .side-title-con {
      display: flex;
      align-items: center;
      gap: 6px;

      :deep(.el-icon) {
        color: color-mix(in oklab, var(--color, var(--su-accent)) 60%, var(--su-ink-3));
      }

      .side-title {
        color: var(--su-ink-2);
        font-variant-numeric: tabular-nums;
      }
    }
    .icon-quote {
      display: flex;
      gap: 8px;

      .single-quote {
        display: block;
        width: 12px;
        height: 30px;
        background: var(--color, var(--su-accent));
        clip-path: polygon(0 0, 100% 0, 100% 50%, 0% 100%);
      }
    }
  }
  .contents {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-sizing: border-box;
    padding: 4px 20px 30px 20px;
    width: 100%;
    height: 100%;

    &.is-full-content {
      display: grid;
      grid-template: minmax(0, 1fr) / minmax(0, 1fr);
    }
  }

  &.is-empty {
    .contents {
      display: grid;
      place-items: center;
    }
    .empty-con {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 27px;
      text-align: center;
      user-select: none;
      pointer-events: none;

      .image {
        width: 200px;
      }
      .title {
        font-size: 16px;
        color: var(--su-ink-2);
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .cx-dashboard-card {
    transition: none;
  }
}
</style>
