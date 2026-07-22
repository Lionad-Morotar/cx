<template>
  <UButton
    class="fullscreen-button"
    :class="props.icon ? 'is-type-icon' : 'is-type-text'"
    variant="outline"
    ref="fullscreenButtonRef"
    :icon="!props.icon ? undefined : isFullscreen ? 'i-lucide-minimize-2' : 'i-lucide-maximize'"
    @click="toggle"
  >
    <span v-if="!props.icon">{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
  </UButton>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { unrefElement, useFullscreen, eagerComputed } from '@vueuse/core'

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

<style scoped>
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
.fullscreen-button [class*='icon'] + span,
.fullscreen-button svg + span {
  margin-left: 0 !important;
}
</style>
