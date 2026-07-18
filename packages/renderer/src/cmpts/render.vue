<template>
  <Suspense ref="cxRenderRef">
    <!-- 目前不能去掉 Suspense，因为计算样式依赖断点，断点来源于 $cxRenderParent 的宽高数据，去掉后 parent 可能是 Fragment -->
    <!-- todo render-component 根据组件 meta 和 data 缓存 ? -->
    <template #fallback> Loading </template>
    <template #default>
      <cx-render-component
        v-if="cmpts[0]"
        :key="`${cmpts[0].id}-${cmpts[0].key}-${renderKey}`"
        ref="cxRenderCmptRef"
        :component="cmpts[0] as CxComponentRuntime"
      >
        <!-- @dblclick="logCmpt" -->
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

type PropCmpt = CxComponentRuntime | CxComponentStructured

const emits = defineEmits(['data', 'update:components', 'update:component'])
const props = withDefaults(
  defineProps<{
    isLazy?: boolean
    components?: MaybeRef<PropCmpt[]>
    component?: MaybeRef<PropCmpt>
    cx?: CxLoaderInstance
    isDebug?: boolean
    isEdit?: boolean
    renderCmptWrapper?: Component
    renderErrorCmptWrapper?: Component
    renderCmptsWrapper?: Component
  }>(),
  {
    isDebug: false,
    isEdit: false,
    // renderCmptWrapper: CxTransparentRender,
    renderCmptsWrapper: CxTransparentRender,
  },
)
const cx = props.cx || inject<CxLoaderInstance>('cx')!

const renderKey = ref(1)
const reRender = async () => {
  renderKey.value += 1
  // @ts-ignore
  if (window && window?._debug) {
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
const cxRenderCmptRef = ref()
const $cxRenderParent = computed(() => {
  if (!cxRenderRef.value) {
    return null
  }
  const $el = unrefElement(cxRenderRef as any)
  return $el?.parentElement
})

provide('is-cx-edit', props.isEdit)
provide('is-cx-debug', props.isDebug)
provide('cx', cx)

// console.log('[debug] cx-context', props.context)

const renderCmptWrapper = computed(() => useMarkRaw(props.renderCmptWrapper))
const renderErrorCmptWrapper = computed(() => useMarkRaw(props.renderErrorCmptWrapper))
const renderCmptsWrapper = computed(() => useMarkRaw(props.renderCmptsWrapper))

provide('cx-render-ref', cxRenderRef)
provide('cx-render-parent', $cxRenderParent)
provide('cx-render-component-wrapper', renderCmptWrapper)
provide('cx-render-transparent-wrapper', CxTransparentRender)
provide('cx-render-error-component-wrapper', renderErrorCmptWrapper)
provide('cx-render-slot-wrapper', renderCmptsWrapper)

// 三态来源统一断言为 Ref<PropCmpt[]>（useVModel 各分支与 ref 空数组的联合类型过宽）
const cmpts = (
  props.components
    ? useVModel(props, 'components', emits)
    : props.component
      ? useVModel(props, 'component', emits)
      : ref([])
) as Ref<PropCmpt[]>
// watchEffect(() => {
//   console.log('[info] props.cmpts', cmpts.value, cmpts.value[0]?.id, cmpts.value[0]?.key)
// })
const logCmpt = () => console.log('[debug] cx-render', cmpts.value?.[0])

onMounted(() => {
  if (!props.components && !props.component) {
    watchEffect(() => {
      if (!cx?.id) {
        return
      }
      // console.trace('@@props', cx.datas, cx.datas.cmpts, cx.datas.cmpts.value?.length)
      // console.log('[info] cx.datas.renderCmptList.value._cx_inited', cx.datas.renderCmptList.value._cx_inited)
      if (unref(cx.datas.cmpts)._cx_inited) {
        if (cmpts.value[0] !== unref(cx.datas.root)) {
          cmpts.value = [unref(cx.datas.root)].filter(Boolean) as PropCmpt[]
        }
      }
    })
  }
})

const _isMounted = useMounted()
const isMounted = ref(false)
watchEffect(async () => {
  if (unref(cxRenderCmptRef.value?.isMounted)) {
    // await useSleep(1000)
    isMounted.value = true
    // console.log('[info] cx-render-component isMounted', isMounted.value, cmpts.value[0].id, cmpts.value[0].key)
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
