<template>
  <div class="form">
    <UFormGroup
      v-for="(tab, idx) in value"
      :key="`${idx}-${tab.value}`"
      class="tab-item"
    >
      <template #label>
        <div class="label">
          <span>{{ `${'标签页'} ${idx + 1}` }}</span>
          <span class="delete-text" @click="() => deleteTab(idx)" v-text="'删除'" />
        </div>
      </template>
      <UInput v-model="tab.name" />
    </UFormGroup>

    <UButton class="mt-4 w-full text-center" color="primary" @click="addTab">
      添加标签页
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createTab } from '../utils'
import type { Tab } from '../types'

import { UButton, UFormGroup, UInput } from '../../../vendor/bridge'

const { emits, props, value } = useCxPanel<Tab[]>([])

const addTab = () => {
  const newTabName = `${'标签页'}${((value.value as any[])?.length || 0) + 1}`
  const newTab = createTab(newTabName)
  value.value.push(newTab)
}
const deleteTab = (idx: number) => {
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
