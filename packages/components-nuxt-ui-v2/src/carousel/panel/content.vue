<template>
  <div class="form">
    <template v-for="(tab, idx) in value" :key="`${idx}-${tab.id}`">
      <UFormGroup class="accordion-item">
        <template #label>
          <div class="content">
            <span>{{ `${'内容'} ${idx + 1}` }}</span>
            <span
              v-if="value.length > 1"
              class="delete-text"
              @click="() => deleteTab(idx)"
              v-text="'删除'"
            />
            <span v-else />
          </div>
        </template>
        <UInput v-model="tab.content" />
      </UFormGroup>
    </template>

    <UButton class="mt-4 w-full text-center" color="primary" @click="addTab"> 添加项目 </UButton>
  </div>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createItem } from '../utils'
import type { Item } from '../types'

import { UButton, UFormGroup, UInput } from '../../../vendor/bridge'

const { emits, props, value } = useCxPanel<Item[]>([])

const addTab = () => {
  const newTabName = `${'内容'}${((value.value as any[])?.length || 0) + 1}`
  const newTab = createItem({
    content: newTabName,
  })
  value.value.push(newTab)
}
const deleteTab = (idx: number) => {
  if (value.value.length <= 1) return
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

.content {
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
