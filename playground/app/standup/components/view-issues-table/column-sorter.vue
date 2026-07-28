<template>
  <span class="cx-column-sorter sorter" v-if="sorts.length">
    <template v-for="sort in sorts" :key="sort">
      <div :class="[sort, isActive(sort) && 'is-active']" @click="active(sort)" />
    </template>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { Column, SelectedSort } from './type'

defineOptions({ name: 'CxColumnSorter' })

const emits = defineEmits(['update:selected'])
const props = withDefaults(
  defineProps<{
    column?: Column
    selected?: SelectedSort
  }>(),
  {},
)

const sorts = computed(() => props?.column?.sort || [])

const isActive = (name: string) => {
  const isSameColumn = props.selected?.column.key === props.column?.key
  const isSameSort = props.selected?.sort === name
  // console.log(props.selected, props.column, name)
  return isSameColumn && isSameSort
}

const active = (sort: string) => {
  if (isActive(sort)) {
    return emits('update:selected', null)
  } else {
    return emits('update:selected', {
      column: props.column,
      sort,
    })
  }
}
</script>

<style scoped>
.sorter {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-left: 4px;

  .asc,
  .desc {
    width: 0;
    height: 0;
    cursor: pointer;
    --color: #999;

    &.is-active {
      --color: #1890ff;
    }
  }

  .asc {
    padding: 5px 0px 0px 0px;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid var(--color);
  }
  .desc {
    padding: 0px 0px 5px 0px;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid var(--color);
  }
}
</style>
