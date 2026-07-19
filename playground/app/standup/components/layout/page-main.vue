<template>
  <main class="layout-content-main">
    <slot />
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onErrorCaptured, onMounted, useSlots, watchEffect } from 'vue'
import { useIdleOnce } from '../../hooks'
import { isFunction } from 'lodash-es'

const slots = useSlots()

const isIdle = useIdleOnce()

const cleanups = [] as any

onMounted(() => {
  watchEffect(() => {
    if (isIdle.value) {
      try {
        const preloadSlots = slots.preload?.()
        if (!preloadSlots?.length) {
          return
        }
        preloadSlots.forEach((slot) => {
          const { type } = slot as any
          const preload = type?.preload
          if (isFunction(preload)) {
            const tick = setTimeout(async () => {
              console.info(`[preload] ${type?.name || 'untitled'} preload`)
              cleanups.push(await preload(slot))
            }, 0)
            cleanups.push(() => clearTimeout(tick))
          }
        })
      } catch (err) {
        // preload wont crash current page
        console.error('[ERR]', err)
      }
    }
  })
})
onBeforeUnmount(() => {
  cleanups.filter(isFunction).map((x: any) => x())
})
onErrorCaptured(() => {
  cleanups.filter(isFunction).map((x: any) => x())
})
</script>

<style lang="scss">
.layout-content-main {
  width: 100%;
  height: 100%;
}
</style>
