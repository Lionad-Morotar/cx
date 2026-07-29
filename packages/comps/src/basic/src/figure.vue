<template>
  <figure :class="ns.b()" class="relative min-h-6">
    <template v-if="!src">
      <CxEmptyImage />
    </template>
    <template v-else>
      <img
        :src="src"
        :alt="enableCaption ? caption : ''"
        :class="isEditMode ? 'select-none' : ''"
      />
      <figcaption v-if="enableCaption" class="text-center text-sm">
        {{ caption }}
      </figcaption>
    </template>
  </figure>
</template>

<script setup lang="ts">
import { watch, toRef, computed } from 'vue'

import { CxIcon, CxEmptyImage, useCxBEM } from '@lionad/cx-vue'
import { useCxEditMode, useCxMedia } from '@lionad/cx-vue'

import type { CxImageUploadPropValue, CxComponentRuntime } from '@lionad/cx-definition'

defineOptions({ name: 'CxFigure' })

const ns = useCxBEM('figure')
const props = withDefaults(
  defineProps<{
    comp: CxComponentRuntime
    image?: CxImageUploadPropValue
    enableCaption?: boolean
    caption?: string
  }>(),
  {
    image: () => ({}),
    enableCaption: false,
    caption: '',
  },
)

const { isEditMode } = useCxEditMode(() => {
  watch(
    () => props.enableCaption,
    () => {
      if (!props.caption) {
        props.comp.data.caption = '图标标题'
      }
    },
  )
})

const media = useCxMedia()
const src = media.getPreviewURL(props.image?.url)

const enableCaption = computed(() => props.enableCaption)
const caption = computed(() => {
  // empty space for better mouse interaction
  return props.caption || ' '
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('figure') {
    /* 静态样式已上提至模板 class */
  }
}
</style>
