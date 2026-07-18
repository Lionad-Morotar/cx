<template>
  <figure :class="[ns.b()]">
    <template v-if="!src">
      <CxEmptyImage />
    </template>
    <template v-else>
      <img
        :src="src"
        :alt="enableCaption ? caption : ''"
        :class="isEditMode ? 'select-none' : ''"
      />
      <figcaption v-if="enableCaption" v-cx="{ text: 'content' }">
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
    cmpt: CxComponentRuntime
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
        props.cmpt.data.caption = '图标标题'
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
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('figure') {
    @apply relative min-h-6;

    figcaption {
      @apply text-center text-sm;
    }
  }
}
</style>
