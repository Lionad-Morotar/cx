<template>
  <div class="form">
    <template v-for="(group, gIDX) in value" :key="`${gIDX}-${group.key}`">
      <UFormGroup class="item">
        <template #label>
          <div class="label">
            <span>分组标识</span>
            <span
              v-if="value.length > 1"
              class="delete-text"
              @click="() => deleteGroupItem(gIDX)"
              v-text="'删除分组'"
            />
            <span v-else />
          </div>
        </template>
        <UInput v-model="group.key" />
      </UFormGroup>
      <UFormGroup class="item">
        <template #label>
          <span>分组标题</span>
        </template>
        <UInput v-model="group.label" />
      </UFormGroup>

      <div class="sub-form">
        <template v-for="(item, iIDX) in group.commands" :key="`${gIDX}-${iIDX}-${item.id}`">
          <UFormGroup class="item">
            <template #label>
              <div class="label">
                <span>项目标识</span>
                <span
                  class="delete-text"
                  @click="() => deleteItem(gIDX, iIDX)"
                  v-text="'删除项目'"
                />
              </div>
            </template>
            <UInput v-model="item.id" />
          </UFormGroup>
          <UFormGroup class="item">
            <template #label>
              <span>项目标题</span>
            </template>
            <UInput v-model="item.label" />
          </UFormGroup>
        </template>
        <UButton class="mt-2 w-full text-center" variant="outline" @click="() => addItem(gIDX)">
          添加一项
        </UButton>
      </div>
    </template>

    <UButton class="mt-4 w-full text-center" color="primary" @click="addGroupItem">
      添加分组
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createItem, createGroupItem } from '../utils'
import type { Item, GroupItem } from '../types'

import { UButton, UFormGroup, UInput } from '../../../../vendor/bridge'

const { emits, props, value } = useCxPanel<GroupItem[]>([])
value.value = value.value || []

const addGroupItem = () => {
  const newItemName = `group-${((value.value as any[])?.length || 0) + 1}`
  const newItem = createGroupItem({
    key: newItemName,
    label: '新分组',
    commands: [
      createItem({
        id: 'item-1',
        label: '新项目',
      }),
    ],
  })
  value.value.push(newItem)
}
const deleteGroupItem = (idx: number) => {
  if (value.value.length <= 1) return
  value.value.splice(idx, 1)
}

const addItem = (gIDX: number) => {
  const newItem = createItem({
    id: `item-${((value.value[gIDX]!.commands as any[])?.length || 0) + 1}`,
    label: '新项目',
  })
  value.value[gIDX]!.commands.push(newItem)
}

const deleteItem = (gIDX: number, iIDX: number) => {
  value.value[gIDX]!.commands.splice(iIDX, 1)
}
</script>

<style lang="scss">
@reference "tailwindcss";
.sub-form {
  @apply mb-2 p-2 ring-1 ring-neutral-200 dark:ring-neutral-700 rounded-md;

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
