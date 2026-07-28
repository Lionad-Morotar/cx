<template>
  <div class="cx-items form">
    <UFormGroup v-for="(tab, idx) in value" :key="`${idx}-${tab.value}`" class="tab-item">
      <template #label>
        <div class="label">
          <span>{{ `${'项目'} ${idx + 1}` }}</span>
          <span class="delete-text" @click="() => remove(idx)" v-text="'删除'" />
        </div>
      </template>
      <UInput v-model="tab.label" />
    </UFormGroup>

    <UButton class="mt-4 w-full text-center" color="primary" @click="add"> 添加项目 </UButton>
  </div>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createItem } from '../utils'
import type { Item } from '../types'

import { UButton, UFormGroup, UInput } from '../../../vendor/bridge'

defineOptions({ name: 'CxItems' })

const { emits, props, value } = useCxPanel<Item[]>([])

const add = () => {
  const newTabName = `${'项目'}${((value.value as any[])?.length || 0) + 1}`
  const newTab = createItem(newTabName)
  value.value.push(newTab)
}
const remove = (idx: number) => {
  value.value.splice(idx, 1)
}
</script>

<style lang="scss">
@reference "tailwindcss";
.tab-item {
  @apply w-full;

  &:hover {
    .delete-text {
      @apply block;
    }
  }
}

.label {
  @apply flex justify-between items-center w-full;

  .delete-text {
    @apply hidden h-4 text-xs cursor-pointer text-red-500 dark:text-red-400;

    &:hover {
      @apply opacity-80;
    }
    &:active {
      @apply opacity-70;
    }
  }
}
</style>
