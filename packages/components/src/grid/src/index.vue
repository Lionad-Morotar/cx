<template>
  <div :class="ns.b()" :style="cssVars">
    <!-- todo perf -->
    <template v-for="(_row, rIdx) in row" :key="`row-${rIdx + 1}`">
      <template v-for="(_col, cIdx) in col" :key="`row-${rIdx + 1}-col-${cIdx + 1}`">
        <div
          :class="[`row-${rIdx + 1}-col-${cIdx + 1}`, ns.e('block')]"
          :style="getSlotArea(rIdx, cIdx)"
        >
          <slot :name="`row-${rIdx + 1}-col-${cIdx + 1}`" />
        </div>
      </template>
    </template>
    <slot name="default" />
  </div>
</template>

<script setup lang="ts">
import { useSlots, computed } from 'vue'

import { useCxBEM, useCmptSlots } from '@lionad/cx-vue'

import { defaultDatas } from '../config'
import { getPosByTurn } from '../utils'

defineOptions({ name: 'CxGrid' })

const cmptEmptySlots = useCmptSlots('empty')

const ns = useCxBEM('grid')
const slots = useSlots()
const props = withDefaults(
  defineProps<{
    colCount?: number
    rowCount?: number
    gap?: string
    turn?: 0 | 1 | 2 | 3
  }>(),
  {
    rowCount: defaultDatas.rowCount,
    colCount: defaultDatas.colCount,
    gap: '8px',
    turn: defaultDatas.turn,
  },
)

const _turn = computed(() => +props.turn || defaultDatas.turn)
const turn = computed(() => (Number.isNaN(_turn.value) ? 0 : _turn.value))
const isTurned = computed(() => turn.value === 1 || turn.value === 3)

const _row = computed(() => +props.rowCount || defaultDatas.rowCount)
const row = computed(() => (Number.isNaN(_row.value) ? 1 : _row.value))

const _col = computed(() => +props.colCount || defaultDatas.colCount)
const col = computed(() => (Number.isNaN(_col.value) ? 1 : _col.value))

const cols = computed(() => (isTurned.value ? row.value : col.value))
const rows = computed(() => (isTurned.value ? col.value : row.value))

const cssVars = computed(() => ({
  ['--cols']: String(cols.value),
  ['--rows']: String(rows.value),
  ['--gap']: String(props.gap),
}))
// watchEffect(() => {
//   console.log('[info] cssVars', cssVars.value)
// })

const getSlotArea = (rIdx: number, cIdx: number) => {
  const [r, c] = getPosByTurn(row.value, col.value, rIdx, cIdx, turn.value)
  // console.log('[debug] getSlotArea', turn.value, rIdx, cIdx, '->', r, c)
  return {
    'grid-area': `${r + 1} / ${c + 1} / ${r + 2} / ${c + 2}`,
  }
}
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('grid') {
    display: grid;
    grid-template: repeat(var(--rows, 1), auto) / repeat(var(--cols, 1), minmax(0, 1fr));
    gap: var(--gap, 0);
    @apply box-border p-0 w-full break-all;
    min-height: var(--gap, 4px);

    @include e('block') {
      @apply w-full h-full;
      z-index: 1;
    }
  }
}
</style>
