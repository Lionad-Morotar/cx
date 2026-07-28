<template>
  <Suspense ref="cxRenderRef">
    <!-- 目前不能去掉 Suspense，因为计算样式依赖断点，断点来源于 $cxRenderParent 的宽高数据，去掉后 parent 可能是 Fragment -->
    <!-- todo render-component 根据组件 meta 和 data 缓存 ? -->
    <template #fallback> Loading </template>
    <template #default>
      <cx-render-component
        v-if="comps[0]"
        :key="`${comps[0].id}-${comps[0].key}-${renderKey}`"
        ref="cxRenderCompRef"
        :component="comps[0] as CxComponentRuntime"
      >
        <!-- @dblclick="logComp" -->
        <template v-for="(_, key) in $slots" #[key]="slotData">
          <slot :name="key as unknown as string" v-bind="slotData" />
        </template>
      </cx-render-component>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { useMarkRaw } from '@lionad/cx-vue'
import { unrefElement, useVModel, useMounted } from '@vueuse/core'
import { inject, ref, watchEffect, computed, provide, onMounted, unref } from 'vue'
import { cxTranslateFn, cxTranslator } from '@lionad/cx-definition'
import CxRenderComponent from './render-component.vue'
import CxTransparentRender from './transparent-render.vue'

import type { Component, MaybeRef, Ref } from 'vue'
import type {
  CxComponentRuntime,
  CxComponentStructured,
  CxLoaderInstance,
} from '@lionad/cx-definition'

defineOptions({ name: 'CxRender' })

type PropComp = CxComponentRuntime | CxComponentStructured

const emits = defineEmits(['data', 'update:components', 'update:component'])
const props = withDefaults(
  defineProps<{
    isLazy?: boolean
    components?: MaybeRef<PropComp[]>
    component?: MaybeRef<PropComp>
    cx?: CxLoaderInstance
    isDebug?: boolean
    isEdit?: boolean
    renderCompWrapper?: Component
    renderErrorCompWrapper?: Component
    renderCompsWrapper?: Component
  }>(),
  {
    isLazy: false,
    components: undefined,
    component: undefined,
    cx: undefined,
    isDebug: false,
    isEdit: false,
    renderCompWrapper: undefined,
    renderErrorCompWrapper: undefined,
    // renderCompWrapper: CxTransparentRender,
    renderCompsWrapper: CxTransparentRender,
  },
)
const cx = props.cx || inject<CxLoaderInstance>('cx')!

const renderKey = ref(1)
const reRender = async () => {
  renderKey.value += 1
  // SSR 守卫：仅在浏览器环境读全局调试标记
  if (typeof window !== 'undefined' && window._debug) {
    console.log('[debug] cx-render reRender, renderKey:', renderKey.value)
  }
}

watchEffect(async () => {
  if (cxTranslateFn.value) {
    try {
      await reRender()
    } finally {
      console.log(
        '[info] re-render change due to cxTranslateFn.value change',
        Boolean(cxTranslateFn.value),
      )
    }
  }
})

const cxRenderRef = ref()
const cxRenderCompRef = ref()
const $cxRenderParent = computed(() => {
  if (!cxRenderRef.value) {
    return null
  }
  // cxRenderRef 指向 Suspense 组件实例，unrefElement 取其 $el；
  // 组件实例类型与 MaybeElementRef 不直接重叠，断言对齐
  const $el = unrefElement(cxRenderRef as unknown as Parameters<typeof unrefElement>[0])
  return $el?.parentElement
})

provide('is-cx-edit', props.isEdit)
provide('is-cx-debug', props.isDebug)
provide('cx', cx)

// console.log('[debug] cx-context', props.context)

const renderCompWrapper = computed(() => useMarkRaw(props.renderCompWrapper))
const renderErrorCompWrapper = computed(() => useMarkRaw(props.renderErrorCompWrapper))
const renderCompsWrapper = computed(() => useMarkRaw(props.renderCompsWrapper))

provide('cx-render-ref', cxRenderRef)
provide('cx-render-parent', $cxRenderParent)
provide('cx-render-component-wrapper', renderCompWrapper)
provide('cx-render-transparent-wrapper', CxTransparentRender)
provide('cx-render-error-component-wrapper', renderErrorCompWrapper)
provide('cx-render-slot-wrapper', renderCompsWrapper)

// 三态来源统一断言为 Ref<PropComp[]>（useVModel 各分支与 ref 空数组的联合类型过宽）
const comps = (
  props.components
    ? useVModel(props, 'components', emits)
    : props.component
      ? useVModel(props, 'component', emits)
      : ref([])
) as Ref<PropComp[]>
// watchEffect(() => {
//   console.log('[info] props.comps', comps.value, comps.value[0]?.id, comps.value[0]?.key)
// })
// _ 前缀豁免 unused（调试函数，模板 @dblclick 绑定被临时注释，可随时启用）
const _logComp = () => console.log('[debug] cx-render', comps.value?.[0])

onMounted(() => {
  if (!props.components && !props.component) {
    watchEffect(() => {
      if (!cx?.id) {
        return
      }
      // console.trace('@@props', cx.datas, cx.datas.comps, cx.datas.comps.value?.length)
      // console.log('[info] cx.datas.renderCompList.value._cx_inited', cx.datas.renderCompList.value._cx_inited)
      if (unref(cx.datas.comps)._cx_inited) {
        if (comps.value[0] !== unref(cx.datas.root)) {
          comps.value = [unref(cx.datas.root)].filter(Boolean) as PropComp[]
        }
      }
    })
  }
})

const _isMounted = useMounted()
const isMounted = ref(false)
watchEffect(async () => {
  if (unref(cxRenderCompRef.value?.isMounted)) {
    // await useSleep(1000)
    isMounted.value = true
    // console.log('[info] cx-render-component isMounted', isMounted.value, comps.value[0].id, comps.value[0].key)
  }
})

defineExpose({
  isMounted,
  cxTranslator,
})
</script>

<style lang="scss">
@layer cx {
  .is-cx-component {
    box-sizing: border-box;
  }
}
</style>
