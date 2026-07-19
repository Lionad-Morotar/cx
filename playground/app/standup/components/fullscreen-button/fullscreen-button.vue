<template>
  <el-button
    class="fullscreen-button"
    :class="props.icon ? 'is-type-icon' : 'is-type-text'"
    plain
    ref="fullscreenButtonRef"
    :icon="!props.icon ? undefined : isFullscreen ? BottomLeft : FullScreen"
    @click="toggle"
  >
    <span v-if="!props.icon">{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
  </el-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { unrefElement, useFullscreen, eagerComputed } from '@vueuse/core'
import { FullScreen, BottomLeft } from '@element-plus/icons-vue'

import type { MaybeElementRef } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    target?: MaybeElementRef
    icon?: boolean
  }>(),
  {
    target: () => document.querySelector('#__nuxt') as any,
    icon: false,
  },
)

const isFullscreenAlready = ref(false)
const toFullScreenTarget = eagerComputed(() => {
  // console.info('[info] fullscreen target', props.target || subApp)
  const target = unrefElement(props.target)
  if (target && document.fullscreenElement === target) {
    isFullscreenAlready.value = true
  }
  return target
})

const fullscreenButtonRef = ref()
const { isFullscreen, toggle, exit, enter } = useFullscreen(toFullScreenTarget as MaybeElementRef)

// 这是 vueuse 的一个 bug，如果页面已经全屏，需要手动改一下状态
if (isFullscreenAlready.value) {
  isFullscreen.value = true
}

defineExpose({
  toggle,
  isFullscreen,
  enter,
  exit,
})
</script>

<style lang="less" scoped>
.fullscreen-button.is-type-icon {
  flex-shrink: 0;
  gap: 0;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
}
</style>

<style>
.el-button.fullscreen-button [class*='el-icon'] + span {
  margin-left: 0 !important;
}
</style>
