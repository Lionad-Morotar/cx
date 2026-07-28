<template>
  <div class="cx-actions form">
    <template v-for="(group, gIDX) in value" :key="gIDX">
      <UFormGroup class="item">
        <template #label>
          <div class="label">
            <span>菜单分组</span>
            <span
              v-if="value.length > 1"
              class="delete-text"
              @click="() => removeGroup(gIDX)"
              v-text="'删除菜单分组'"
            />
            <span v-else />
          </div>
        </template>
      </UFormGroup>

      <div class="sub-form">
        <template v-for="(item, iIDX) in group" :key="`${gIDX}-${iIDX}-${item.id}`">
          <UFormGroup class="item">
            <template #label>
              <div class="label">
                <span>菜单名称</span>
                <span
                  class="delete-text"
                  @click="() => removeActionItem(gIDX, iIDX)"
                  v-text="'删除项目'"
                />
              </div>
            </template>
            <UInput v-model="item.label" />
          </UFormGroup>
        </template>
        <UButton
          class="mt-2 w-full text-center"
          variant="outline"
          @click="() => addActionItem(gIDX)"
        >
          添加菜单项
        </UButton>
      </div>
    </template>

    <UButton class="mt-4 w-full text-center" color="primary" @click="addGroup">
      添加菜单分组
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createItem } from '../utils'
import type { ActionItem } from '../types'

import { UButton, UFormGroup, UInput } from '../../../vendor/bridge'

defineOptions({ name: 'CxActions' })

const { emits, props, value } = useCxPanel<ActionItem[][]>([])
value.value = value.value || []

const addGroup = () => {
  value.value.push([])
}
const removeGroup = (gIDX: number) => {
  value.value.splice(gIDX, 1)
}

const addActionItem = (gIDX: number) => {
  const newItemName = `item-${((value.value as any[])?.length || 0) + 1}`
  const newItem = createItem({
    label: '新菜单项',
    icon: 'i-tabler-menu',
  })
  value.value[gIDX]!.push(newItem)
}
const removeActionItem = (gIDX: number, iIDX: number) => {
  value.value[gIDX]!.splice(iIDX, 1)
}
</script>

<style lang="scss">
@reference "tailwindcss";
.sub-form {
  @apply mb-2 p-2 ring-1 ring-neutral-200 dark:ring-neutral-700 rounded-md bg-white dark:bg-neutral-800;

  .item {
    @apply mb-1;
  }
}

.item {
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
