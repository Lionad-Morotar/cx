<template>
  <slot />
</template>

<script setup lang="ts">
import { useSleep } from '@lionad/cx-definition'

import { useElementSize } from '@vueuse/core'
import type { MaybeComputedElementRef, MaybeElement } from '@vueuse/core'

import { inject, ref, computed, provide, onMounted, watch } from 'vue'

import type { CxComponentRuntime, CxLoaderInstance } from '@lionad/cx-definition'

defineOptions({ name: 'CxDatas' })

const cx = inject<CxLoaderInstance>('cx')!
const props = defineProps<{
  comp: CxComponentRuntime
}>()

// const datasMeta = [
//   { key: 'width', name: '组件宽度', type: 'number' },
//   { key: 'height', name: '组件高度', type: 'number' },
//   { key: 'block-size', name: '格子大小', type: 'number' },
// ]

const grid = ref<any[]>([])
const rows = ref(0)
const cols = ref(0)

const datas = computed(() => {
  return {
    grid: grid.value,
    rows: rows.value,
    cols: cols.value,
  }
})
provide('cx-datas', datas)

onMounted(async () => {
  await useSleep(500)

  const parent = props.comp.parents[0]
  if (!parent) {
    throw new Error('[test] CxDatas must have a parent component in this testcase')
  }
  // cx.refs.get 的 ref 字段为 unknown（loader 实例类型未收窄）；
  // 此处父物料即测试容器，其 ref 即元素引用，断言显式化
  const { width, height } = useElementSize(
    cx.refs.get(parent)!.ref as MaybeComputedElementRef<MaybeElement>,
  )

  function createGrid() {
    grid.value = []
    for (let i = 0; i <= rows.value; i++) {
      grid.value.push(new Array(cols.value).fill(null) as any)
    }
  }

  function calcGrid() {
    const base = Math.ceil(width.value / 60)
    const cell = width.value / base

    rows.value = Math.ceil(height.value / cell)
    cols.value = width.value / cell

    createGrid()
  }

  watch(width, calcGrid)
})

// function useDatas(meta: any) {
//   const datas = reactive({} as any)
//   meta.forEach((item: any) => {
//     datas[item.key] = item.type === 'number' ? 0 : ''
//   })
//   return datas
// }
</script>
