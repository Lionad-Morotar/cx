<template>
  <template v-if="isReRendering">
    <div :class="ns.e('placeholder-box')" :style="size" />
  </template>
  <UCarousel
    v-else
    ref="cmpt"
    :class="ns.b()"
    :ui="ui"
    v-bind="{ ...arrowProps, ...indicatorProps }"
    @prev="$emit('prev')"
    @next="$emit('next')"
    @select="onSelect"
  >
    <template #default="{ item, index }">
      <template v-if="item" :key="item?.id || item?.content">
        <div :class="ns.e('item')" draggable="false">
          <slot v-if="showSlot('default')" name="default" v-bind="{ item, index }" />
          <CxEmptyImage v-else class="w-full h-40" />
        </div>
      </template>
    </template>
    <template #prev="{ onClick, disabled }">
      <slot v-if="showSlot('prev')" name="prev" v-bind="{ onClick, disabled }" />
      <button
        v-else-if="has(props.arrow)"
        color="gray"
        icon="i-heroicons-arrow-left-20-solid"
        class="-start-12"
        :disabled="disabled"
        @click="onClick"
      />
    </template>
    <template #next="{ onClick, disabled }">
      <slot v-if="showSlot('next')" name="next" v-bind="{ onClick, disabled }" />
      <button
        v-else-if="has(props.arrow)"
        color="gray"
        icon="i-heroicons-arrow-right-20-solid"
        class="-end-12"
        :disabled="disabled"
        @click="onClick"
      />
    </template>
    <template #indicator="{ onClick, page, active }">
      <slot v-if="showSlot('indicator')" name="indicator" v-bind="{ onClick, page, active }" />
      <UButton
        v-else-if="has(props.indicators)"
        :label="String(page)"
        :variant="active ? 'solid' : 'soft'"
        size="2xs"
        class="rounded-full min-w-6 justify-center"
        @click="onClick(page)"
      />
    </template>
  </UCarousel>
</template>

<script setup lang="ts">
import { CxEmptyImage, CxEmpty } from '@lionad/cx-vue'
import { twMerge as tm } from 'tailwind-merge'

import { has } from '@lionad/cx-definition'

import { useElementHover, useIntervalFn } from '@vueuse/core'

import { useAttrs, useTemplateRef, computed, onBeforeUnmount } from 'vue'

import { UButton, UCarousel } from '../../../vendor/bridge'

import { useCxSlot, useCxReRender, useCxBEM, useMountedWatchImmediate } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxCarousel' })

type UCarouselProps = ComponentProps<typeof UCarousel>

const ns = useCxBEM('carousel')
const emits = defineEmits(['prev', 'next', 'select'])
const inner = defineProps<{}>()
const props = useAttrs() as UCarouselProps & {
  cmpt: CxComponentRuntime
  snap?: 'l' | 'c' | 'r'
  size?: '1' | '1/2' | '1/3' | '1/4'
  single?: boolean
  arrow?: boolean
  indicators?: boolean
  autoplay?: boolean
  autoplayTime?: number
}
const { showSlot } = useCxSlot(props.cmpt)

const cmptRef: any = useTemplateRef('cmpt')
// const $cmpt = computed(() => unrefElement(cmptRef))
const isHover = useElementHover(cmptRef)

const ui = computed(() => {
  return {
    wrapper: tm([props.single ? 'w-64 mx-auto rounded-lg' : '']),
    item: tm([
      props.snap === 'l' ? 'snap-start' : props.snap === 'r' ? 'snap-end' : 'snap-center',
      props.size ? (props.size === '1' ? 'basis-full' : `basis-${props.size}`) : 'basis-full',
    ]),
  }
})

const arrowProps = computed(() => {
  return {
    arrows: has(props.arrow),
  }
})

const indicatorProps = computed(() => {
  return {
    indicators: has(props.indicators),
  }
})

const interval = useIntervalFn(() => {
  if (!cmptRef.value) return
  if (cmptRef.value.page === cmptRef.value.pages) {
    return cmptRef.value.select(0)
  }
  // console.log('[debug] carousel autoplay')
  cmptRef.value.next()
}, props.autoplayTime || 3000)

useMountedWatchImmediate(
  () => [props.autoplay, isHover.value],
  () => {
    interval.pause()
    // console.log('[debug] carousel pause', props.autoplay, isHover.value)
    if (!props.autoplay || isHover.value) {
      return
    }
    interval.resume()
  },
)
onBeforeUnmount(interval.pause)

const onSelect = (page: number) => {
  // todo: reset interval when user select page
  // interval.pause()
  emits('select', page)
}

const { isReRendering, size } = useCxReRender(cmptRef, () => props.autoplayTime)

defineExpose({
  pages: computed(() => cmptRef.value?.pages),
  page: computed(() => cmptRef.value?.page),
  prev: () => cmptRef.value?.prev(),
  next: () => cmptRef.value?.next(),
  select: (page: number) => cmptRef.value?.select(page),
})
</script>

<style lang="scss">
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('carousel') {
    @include e('item') {
      @apply flex items-center w-full;
    }
  }
}
</style>
