<template>
  <h5 class="cx-grids-form" v-text="`更改行列（${col} x ${row}）`" />
  <div
    class="mt-2"
    :class="[
      'container',
      showRemoveColWarn && 'is-hover-remove-col',
      showRemoveRowWarn && 'is-hover-remove-row',
    ]"
  >
    <div
      class="add-row"
      :class="isDisabledAddRow && 'is-disabled'"
      @click="!isDisabledAddRow && addRow()"
    >
      <u-tooltip v-if="isDisabledAddRow" :text="disabledAddRowTip">
        <div>{{ '+' }}</div>
      </u-tooltip>
      <div v-else>
        {{ '+' }}
      </div>
    </div>

    <div
      class="add-col"
      :class="isDisabledAddCol && 'is-disabled'"
      @click="!isDisabledAddCol && addCol()"
    >
      <u-tooltip v-if="isDisabledAddCol" :text="disabledAddColTip">
        <div>{{ '+' }}</div>
      </u-tooltip>
      <div v-else>
        {{ '+' }}
      </div>
    </div>

    <define-remove-rows-button v-slot="{ handleClick }" name="define-remove-rows-button">
      <div
        ref="removeRowRef"
        class="remove-row"
        :class="isDisabledRemoveRow && 'is-disabled'"
        @click="!isDisabledRemoveRow && handleClick()"
      >
        <u-tooltip v-if="isDisabledRemoveRow" :text="disabledRemoveRowTip">
          <div>{{ '-' }}</div>
        </u-tooltip>
        <div v-else>
          {{ '-' }}
        </div>
      </div>
    </define-remove-rows-button>

    <reuse-remove-rows-button
      name="reuse-remove-rows-button"
      v-bind="{ handleClick: confirmRemoveLastRow }"
    />

    <define-remove-cols-button v-slot="{ handleClick }" name="define-remove-cols-button">
      <div
        ref="removeColRef"
        class="remove-col"
        :class="isDisabledRemoveCol && 'is-disabled'"
        @click="!isDisabledRemoveCol && handleClick()"
      >
        <u-tooltip v-if="isDisabledRemoveCol" :text="disabledRemoveColTip">
          <div>{{ '-' }}</div>
        </u-tooltip>
        <div v-else>
          {{ '-' }}
        </div>
      </div>
    </define-remove-cols-button>

    <reuse-remove-cols-button
      name="reuse-remove-cols-button"
      v-bind="{ handleClick: confirmRemoveLastCol }"
    />

    <!-- todo: hover on add buttons show virtual blocks to add -->

    <div class="rotate-grids-br" title="逆时针旋转" @click="rotateGrids('anticlockwise')">
      <CxIcon name="i-hugeicons-rotate-bottom-left" />
    </div>

    <div class="rotate-grids-tl" title="顺时针旋转" @click="rotateGrids('clockwise')">
      <CxIcon name="i-hugeicons-rotate-top-right" />
    </div>

    <div class="rotate-grids-bl" title="顺时针旋转" @click="rotateGrids('clockwise')">
      <CxIcon name="i-hugeicons-rotate-bottom-right" />
    </div>

    <div class="rotate-grids-tr" title="逆时针旋转" @click="rotateGrids('anticlockwise')">
      <CxIcon name="i-hugeicons-rotate-top-left" />
    </div>

    <div class="blocks" :style="{ ['--col']: col, ['--row']: row }">
      <template v-for="r in _row" :key="r">
        <template v-for="c in _col" :key="c">
          <div
            class="block"
            :class="[`has-${getChildsLen(r, c)}-child`, markSpecialIdx(r, c)]"
            :style="getBlockStyle(r, c)"
          >
            <span v-if="getChildsLen(r, c)" v-text="getChildsLen(r, c)" />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createReusableTemplate, useElementHover } from '@vueuse/core'

import { useTemplateRef, computed } from 'vue'

import { CxIcon, CxEmptyImage } from '@lionad/cx-vue'
import { useCxPanel } from '@lionad/cx-vue'
import type { CxComponentRuntime } from '@lionad/cx-definition'
import { defaultDatas } from '../config'
import { getPosByTurn } from '../utils'

defineOptions({ name: 'CxGridsForm' })

const [DefineRemoveColsButton, ReuseRemoveColsButton] = createReusableTemplate()
const [DefineRemoveRowsButton, ReuseRemoveRowsButton] = createReusableTemplate()

const { emits, props } = useCxPanel()

const removeRowRef = useTemplateRef('removeRowRef')
const removeColRef = useTemplateRef('removeColRef')
const isRemoveRowButtonHover = useElementHover(removeRowRef)
const isRemoveColButtonHover = useElementHover(removeColRef)
const showRemoveRowWarn = computed(() => isRemoveRowButtonHover.value && !isDisabledRemoveRow.value)
const showRemoveColWarn = computed(() => isRemoveColButtonHover.value && !isDisabledRemoveCol.value)

const _col = computed(() => (props.data?.colCount || defaultDatas.colCount) as number)
const _row = computed(() => (props.data?.rowCount || defaultDatas.rowCount) as number)
// watchEffect(() => {
//   console.log('[debug] _row, _col', _row.value, _col.value)
// })

const turn = computed(() => props.data.turn as number)
const isTurned = computed(() => turn.value === 1 || turn.value === 3)

const col = computed({
  get: () => (isTurned.value ? _row.value : _col.value),
  set: (val: number) => {
    if (isTurned.value) {
      props.data.rowCount = val
    } else {
      props.data.colCount = val
    }
  },
})
const row = computed({
  get: () => (isTurned.value ? _col.value : _row.value),
  set: (val: number) => {
    if (isTurned.value) {
      props.data.colCount = val
    } else {
      props.data.rowCount = val
    }
  },
})
// watchEffect(() => {
//   console.log('[debug] row col', row.value, col.value)
// })

const [rowMax, colMax] = [6, 6]
const [rowMin, colMin] = [1, 1]

const isDisabledAddRow = computed(() => {
  return row.value >= rowMax || [2, 3].includes(turn.value)
})
const disabledAddRowTip = computed(() => {
  return row.value >= rowMax ? '已达到最大行数' : '目前版本，旋转至特定角度后，无法添加行'
})
const isDisabledAddCol = computed(() => {
  return col.value >= colMax || [1, 2].includes(turn.value)
})
const disabledAddColTip = computed(() => {
  return col.value >= colMax ? '已达到最大列数' : '目前版本，旋转至特定角度后，无法添加列'
})
const isDisabledRemoveRow = computed(() => {
  return row.value <= rowMin || [2, 3].includes(turn.value)
})
const disabledRemoveRowTip = computed(() => {
  return row.value <= rowMin ? '已达到最小行数' : '目前版本，旋转至特定角度后，无法删除行'
})
const isDisabledRemoveCol = computed(() => {
  return col.value <= colMin || [1, 2].includes(turn.value)
})
const disabledRemoveColTip = computed(() => {
  return col.value <= colMin ? '已达到最小列数' : '目前版本，旋转至特定角度后，无法删除列'
})

const childs = computed(() => {
  return (props.comp?.components || {}) as Record<string, CxComponentRuntime[]>
})
const getChildsLen = (r: number, c: number) => {
  const comps = childs.value[`row-${r}-col-${c}`] || []
  let count = 0
  comps.map((comp) => props.cx.touch(comp, () => count++))
  return count
}
const getBlockStyle = (r: number, c: number) => {
  const [_rCount, _cCount] = getPosByTurn(_row.value, _col.value, r - 1, c - 1, turn.value)
  const [rCount, cCount] = [_rCount + 1, _cCount + 1]
  // console.log('[info] getBlockStyle', 'turn', _row.value, _col.value, turn.value, 'pos', r, c, '->', rCount, cCount)
  return {
    'grid-area': `${rCount} / ${cCount} / ${rCount + 1} / ${cCount + 1}`,
  }
}
const markSpecialIdx = (r: number, c: number) => {
  const [_rCount, _cCount] = getPosByTurn(_row.value, _col.value, r - 1, c - 1, turn.value)
  const [rCount, cCount] = [_rCount + 1, _cCount + 1]
  return [
    rCount === 1 && 'is-first-row',
    cCount === 1 && 'is-first-col',
    rCount === row.value && 'is-last-row',
    cCount === col.value && 'is-last-col',
  ]
}

const lastRowsSlots = computed(() => {
  if (turn.value === 0) {
    return Array.from({ length: _col.value }, (_, i) => i).map(
      (i) => `row-${_row.value}-col-${i + 1}`,
    )
  } else if (turn.value === 1) {
    return Array.from({ length: _row.value }, (_, i) => i).map(
      (i) => `row-${i + 1}-col-${_col.value}`,
    )
  } else if (turn.value === 2) {
    return Array.from({ length: _col.value }, (_, i) => i).map((i) => `row-1-col-${i + 1}`)
  } else if (turn.value === 3) {
    return Array.from({ length: _row.value }, (_, i) => i).map((i) => `row-${i + 1}-col-1`)
  } else {
    // console.log('turn.value', turn.value)
    return []
  }
})
const lastColsSlots = computed(() => {
  if (turn.value === 0) {
    return Array.from({ length: _row.value }, (_, i) => i).map(
      (i) => `row-${i + 1}-col-${_col.value}`,
    )
  } else if (turn.value === 1) {
    return Array.from({ length: _col.value }, (_, i) => i).map((i) => `row-1-col-${i + 1}`)
  } else if (turn.value === 2) {
    return Array.from({ length: _row.value }, (_, i) => i).map((i) => `row-${i + 1}-col-1`)
  } else if (turn.value === 3) {
    return Array.from({ length: _col.value }, (_, i) => i).map(
      (i) => `row-${_row.value}-col-${i + 1}`,
    )
  } else {
    // console.log('turn.value', turn.value)
    return []
  }
})

// const lastRowDirectComps = computed(() => {
//   return lastRowsSlots.value.map(slot => (childs.value[slot] || [])).flat()
// })
const lastRowComps = computed(() => {
  const comps = [] as CxComponentRuntime[]
  lastRowsSlots.value.map((slot) => {
    ;(childs.value[slot] || []).map((comp) => {
      props.cx.touch(comp, (c) => comps.push(c))
    })
  })
  // console.log('[debug] lastRowComps', lastRowsSlots.value, comps.flat(Infinity))
  return comps.flat(Infinity)
})
// const lastColDirectComps = computed(() => {
//   return lastColsSlots.value.map(slot => (childs.value[slot] || [])).flat()
// })
const lastColComps = computed(() => {
  const comps = [] as CxComponentRuntime[]
  lastColsSlots.value.map((slot) => {
    ;(childs.value[slot] || []).map((comp) => {
      props.cx.touch(comp, (c) => comps.push(c))
    })
  })
  return comps.flat(Infinity)
})

const addRow = () => (row.value += 1)
const addCol = () => (col.value += 1)

const removeLastRow = () => {
  lastRowsSlots.value.map((slot) => {
    ;(childs.value[slot] || []).map((comp) => {
      props.cx.removeComponent({
        from: props.comp,
        slotKey: slot,
        remove: comp,
      })
    })
  })
  row.value -= 1
}

const removeLastCol = () => {
  lastColsSlots.value.map((slot) => {
    ;(childs.value[slot] || []).map((comp) => {
      props.cx.removeComponent({
        from: props.comp,
        slotKey: slot,
        remove: comp,
      })
    })
  })
  col.value -= 1
}

// 删除最后一行/列时若会移除组件，用原生 confirm 做二次确认（替代原 el-popconfirm）
const confirmRemoveLastRow = () => {
  if (lastRowComps.value.length) {
    if (!window.confirm(`将删除${lastRowComps.value.length}个组件`)) return
  }
  removeLastRow()
}
const confirmRemoveLastCol = () => {
  if (lastColComps.value.length) {
    if (!window.confirm(`将删除${lastColComps.value.length}个组件`)) return
  }
  removeLastCol()
}

/**
 * rotateGrids
 * 旋转网格，以达到类似 flex 布局中类似改变 flex-direction:
 * row | column | row-reverse | column-reverse 的效果
 */
const rotateGrids = (turn: 'anticlockwise' | 'clockwise') => {
  const turns = [0, 1, 2, 3]
  // @ts-ignore
  const turnIndex = turns.indexOf(props.data.turn || 0)
  const nextTurnIndex = turn === 'clockwise' ? (turnIndex + 1) % 4 : (turnIndex + 3) % 4
  props.data.turn = turns[nextTurnIndex]
}
</script>

<style lang="scss">
@reference "tailwindcss";
.container {
  display: grid;
  place-items: center;
  gap: 4px;
  grid-template: auto minmax(0, 1fr) auto / auto minmax(0, 1fr) auto;
  grid-template-areas:
    'rotate-grids-tl remove-row rotate-grids-tr'
    'remove-col blocks add-col'
    'rotate-grids-bl add-row rotate-grids-br';

  .blocks {
    grid-area: blocks;
  }
  .add-row {
    grid-area: add-row;
  }
  .add-col {
    grid-area: add-col;
  }
  .remove-row {
    grid-area: remove-row;
  }
  .remove-col {
    grid-area: remove-col;
  }
  .rotate-grids-tl {
    grid-area: rotate-grids-tl;
  }
  .rotate-grids-tr {
    grid-area: rotate-grids-tr;
  }
  .rotate-grids-bl {
    grid-area: rotate-grids-bl;
  }
  .rotate-grids-br {
    grid-area: rotate-grids-br;
  }
}
.container {
  width: 100%;
  height: auto;

  &.is-hover-remove-col {
    .blocks .block.is-last-col {
      background: #ff4d4f55;
      border-color: #ff4d4f22;
      color: #ff4d4f;
    }
  }
  &.is-hover-remove-row {
    .blocks .block.is-last-row {
      background: #ff4d4f55;
      border-color: #ff4d4f22;
      color: #ff4d4f;
    }
  }

  .add-row,
  .add-col,
  .remove-col,
  .remove-row,
  .rotate-grids-tl,
  .rotate-grids-tr,
  .rotate-grids-bl,
  .rotate-grids-br {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
    @apply bg-sky-400 dark:bg-sky-600 text-white dark:text-white;
    user-select: none;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      opacity: 0.9;
    }
    &:active {
      opacity: 0.8;
    }

    &.is-disabled {
      @apply bg-sky-300 dark:bg-sky-700;

      > div {
        @apply flex justify-center items-center w-full h-full;
      }
    }
  }
  .add-row,
  .remove-row {
    width: 100%;
    height: 24px;
  }
  .add-col,
  .remove-col {
    width: 24px;
    height: 100%;
  }
  .rotate-grids-tl,
  .rotate-grids-tr,
  .rotate-grids-bl,
  .rotate-grids-br {
    width: 24px;
    height: 24px;
    @apply bg-transparent text-neutral-800 dark:text-neutral-200;
  }

  .blocks {
    width: 100%;
    height: 100%;
    display: grid;
    gap: 4px;
    grid-template: repeat(var(--row), 1fr) / repeat(var(--col), 1fr);

    .block {
      @apply flex justify-center items-center;
      @apply text-xs;
      color: #0958d9;
      min-height: 24px;
      border: solid 1px #0958d9cc;
      background: #ecf5ff;
      user-select: none;

      &.has-0-child {
        border: solid 1px #0958d943;
        background: #ecf5ff32;
      }
    }
  }
}
</style>
