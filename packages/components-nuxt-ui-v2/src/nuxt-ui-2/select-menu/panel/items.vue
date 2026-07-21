<template>
  <div class="form">
    <template v-for="(tab, idx) in value" :key="`${idx}-${tab.id}`">
      <UFormGroup class="accordion-item">
        <template #label>
          <div class="label">
            <span>{{ `${'选项'} ${idx + 1}` }}</span>
            <span class="delete-text" @click="() => remove(idx)" v-text="'删除'" />
          </div>
        </template>
        <UInput v-model="tab.label" />
      </UFormGroup>
      <UFormGroup class="accordion-item -mt-2">
        <UInput v-model="tab.value" />
      </UFormGroup>
    </template>

    <UButton class="mt-4 w-full text-center" color="primary" @click="add"> 添加选项 </UButton>
  </div>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createItem } from '../utils'
import type { Item } from '../types'

import { UButton, UFormGroup, UInput } from '../../../../vendor/bridge'

const { emits, props, value } = useCxPanel<Item[]>([])

const add = () => {
  const order = ((value.value as any[])?.length || 0) + 1
  const newTabName = `${'项目'}${order}`
  const newTab = createItem({
    label: newTabName,
    value: String(order),
  })
  value.value.push(newTab)
}
const remove = (idx: number) => {
  value.value.splice(idx, 1)
}
</script>

<style lang="scss">
@reference "tailwindcss";
.accordion-item {
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
