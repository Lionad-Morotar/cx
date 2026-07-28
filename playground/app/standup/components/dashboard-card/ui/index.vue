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
              name="i-lucide-loader-circle"
              class="is-loading animate-spin"
              v-if="props.isLoading"
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
          class="contents is-full-content"
          v-if="props.isLoading"
          v-cx-skeleton
          cx-skeleton-delay="150"
        />
      </slot>
    </template>
    <template v-else>
      <slot name="content">
        <div class="contents is-full-content" v-if="props.fullContent">
          <slot name="default">
            <div class="empty-con" ref="emptyFirstRef">
              <img class="image" :src="EmptyStrImage" />
              <div class="title">暂时没有内容哦~</div>
            </div>
          </slot>
        </div>
        <CxScrollbar class="contents-wrapper" v-else>
          <div class="contents">
            <slot name="default">
              <div class="empty-con" ref="emptySecondRef">
                <img class="image" :src="EmptyStrImage" />
                <div class="title">暂时没有内容哦~</div>
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
.cx-dashboard-card {
  position: relative;
  display: grid;
  grid-template: 70px minmax(0, 1fr) / minmax(0, 1fr);
  box-sizing: border-box;
  border-radius: 8px;
  background-color: #eff2fb;
  box-shadow: 10px 10px 32px rgba(121, 121, 121, 0.3);
  width: clamp(451px, 33%, 500px);
  max-width: 100%;

  .header {
    display: grid;
    grid-template: auto / auto minmax(max-content, 1fr) auto;
    align-items: center;
    gap: 1em;
    padding: 0 24px;
    padding-top: 12px;

    .title-con {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .title {
      font-size: 22px;
      color: #373737;
      font-weight: 600;
    }

    .side-title-con {
      display: flex;
      align-items: center;
      gap: 6px;

      :deep(.el-icon) {
        color: var(--color, #031d5b55);
      }

      .side-title {
        color: #031d5b;
        opacity: 0.4;
      }
    }
    .icon-quote {
      display: flex;
      gap: 8px;

      .single-quote {
        display: block;
        width: 12px;
        height: 30px;
        background: var(--color, #031d5b);
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
        font-size: 18px;
        color: #373737;
      }
    }
  }
}
</style>
