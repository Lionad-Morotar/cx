<template>
  <div :class="[ns.b(), ns.is('fold', states.isFold), ns.is('unfold', !states.isFold)]">
    <div :class="ns.e('header')">
      <slot name="header" :isFold="states.isFold" :fn="cmptExpose" :toggle="toggle" />
      <slot
        v-if="showDefaultIcons"
        name="icon"
        :isFold="states.isFold"
        :fn="cmptExpose"
        :toggle="toggle"
      >
        <template v-if="props.defaultIconPreset === 'default'">
          <el-icon v-if="states.isFold" class="icon-preset icon-plus" @click.stop="toggle">
            <Plus />
          </el-icon>
          <el-icon v-else class="icon-preset icon-minus" @click.stop="toggle">
            <Minus />
          </el-icon>
        </template>
        <template v-if="props.defaultIconPreset === 'arrow'">
          <el-icon
            class="icon-preset icon-arrow"
            :class="ns.is('rotate', !states.isFold)"
            @click.stop="toggle"
          >
            <ArrowRight />
          </el-icon>
        </template>
      </slot>
      <slot name="header-right" :isFold="states.isFold" :fn="cmptExpose" :toggle="toggle" />
    </div>
    <div ref="contentWrapperRef" :class="ns.e('content-wrapper')" :style="styles">
      <slot name="default" :isFold="states.isFold" :fn="cmptExpose" :toggle="toggle" />
      <slot name="content" :isFold="states.isFold" :fn="cmptExpose" :toggle="toggle" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, provide, reactive, ref, useSlots, watch } from 'vue'
import { Minus, Plus, ArrowRight } from '@element-plus/icons-vue'
import { until, useElementSize } from '@vueuse/core'
import { useCxNamespace } from '../../../utils/namespace'
import { FolderContainerCtxKey } from '../../standup-context/keys'
import type { WatchStopHandle } from 'vue'

const ns = useCxNamespace('folder-container')
const slots = useSlots()
const emits = defineEmits(['inited'])
const props = withDefaults(
  defineProps<{
    timeWaitUILoaded?: number
    customizedIcon?: boolean
    enableDefaultIcon?: boolean
    defaultIconPreset?: 'default' | 'arrow'
    enableOpacityChange?: boolean
  }>(),
  {
    timeWaitUILoaded: 200 + 17 * 2,
    customizedIcon: false,
    enableDefaultIcon: true,
    defaultIconPreset: 'default',
    enableOpacityChange: true,
  },
)

const states = reactive({
  isFold: false,
  height: null as number | null,
  isInit: false,
})
const contentWrapperRef = ref()
const showDefaultIcons = computed(
  () => !props.customizedIcon && props.enableDefaultIcon && hasContentSlots.value,
)
const { height } = useElementSize(contentWrapperRef)

const idleFn = window.requestIdleCallback || window.setTimeout

let stop: WatchStopHandle
const initHeight = async () => {
  return new Promise((resolve) => {
    let heightChangeTick = 0
    let lastTime = Date.now()
    if (stop) {
      stop()
    }
    stop = watch(height, (n) => {
      if (!states.isInit) {
        const now = Date.now()
        console.info(
          '[verbose] component unInited but height changed to',
          n,
          'px in',
          now - lastTime,
          'ms',
        )
        lastTime = now

        if (heightChangeTick) {
          window.clearTimeout(heightChangeTick)
        }
        idleFn(() => {
          heightChangeTick = window.setTimeout(() => {
            states.height = n
            states.isInit = true
            emits('inited')
            resolve(true)
          }, props.timeWaitUILoaded)
        })
      }
    })
  })
}
onMounted(async () => {
  await initHeight()
})

const update = () => {
  states.isFold = false
  states.height = null
  states.isInit = false
  initHeight()
}

const hasContentSlots = computed(() => {
  const contentSlotsRes = [slots?.default?.(), slots?.content?.()].filter((v) => v)
  // console.info("[info] folder contents changed", contentSlotsRes);
  return contentSlotsRes.length > 0
})

const calcStyles = ref({})
const closeAnimationStyles = ref({})
const styles = computed(() => ({
  ...calcStyles.value,
  ...closeAnimationStyles.value,
}))
watch(
  [() => states.isFold, () => states.height],
  ([nf, nh], [of, oh]) => {
    // console.log("[debug] n-fold n-height of oh", nf, nh, of, oh);
    const toFold = nf && !of
    if (toFold) {
      closeAnimationStyles.value = {}
      states.height = height.value
      calcStyles.value = {
        opacity: 1,
        height: `${String(states.height)}px`,
      }
      setTimeout(() => {
        calcStyles.value = {
          opacity: props.enableOpacityChange ? 0 : 1,
          height: '0px',
        }
      }, 0)
    }
    const toOpen = !nf && of
    if (toOpen || (nh && !oh)) {
      closeAnimationStyles.value = {}
      calcStyles.value = {
        opacity: 1,
        height: `${String(states.height)}px`,
      }
      setTimeout(() => {
        closeAnimationStyles.value = {
          height: 'auto',
        }
      }, props.timeWaitUILoaded)
    }
  },
  { immediate: true },
)
watch(
  () => states.isInit,
  (nv, ov) => {
    if (!nv && ov) {
      calcStyles.value = {}
    }
  },
)

const isInited = computed(() => states.isInit)

const toggle = async () => {
  await until(isInited).toBe(true)
  nextTick(() => (states.isFold = !states.isFold))
}
const fold = async () => {
  await until(isInited).toBe(true)
  if (!states.isFold) {
    await toggle()
  }
}
const unFold = async () => {
  await until(isInited).toBe(true)
  if (states.isFold) {
    await toggle()
  }
}

const cmptExpose = {
  update,
  toggle,
  fold,
  unFold,
}

// schema 子节点（如 header slot 里的分组头部）拿不到 slot scope 传出的 toggle，
// 因此同时把折叠上下文 provide 出去，供其 inject 消费
provide(FolderContainerCtxKey, {
  toggle,
  fold,
  unFold,
  isFold: computed(() => states.isFold),
})

defineExpose(cmptExpose)
</script>

<style lang="scss">
@import '../../../styles/mixins/index.scss';

@include b('folder-container') {
  position: relative;

  // 没有内容时隐藏缩放的 icon
  &:has(> .c-folder-container__content-wrapper:empty) {
    @include e('header') {
      .icon-preset {
        display: none;
      }
    }
  }

  @include e('header') {
    display: flex;
    justify-content: space-between;
    align-items: center;
    white-space: nowrap;

    .icon-preset {
      // * width height 23x23
      padding: 5px;
      border-radius: 2px;
      cursor: pointer;
      transition: 0.2s;
      user-select: none;
      cursor: pointer;

      &:hover {
        opacity: 0.92;
      }
      &:active {
        opacity: 0.8;
      }
    }
    .icon-arrow {
      transition: 0.2s;
      transform: rotate(0deg);

      &.is-rotate {
        transform: rotate(90deg);
      }
    }
  }

  @include e('content-wrapper') {
    height: unset;
    overflow: hidden;
    transition:
      height 0.2s cubic-bezier(0.42, 0, 0.24, 1.35),
      opacity 0.2s linear;

    .empty-tip {
      display: block;
      padding: 8px 8px;
      font-size: 12px;
    }
  }
}
</style>
