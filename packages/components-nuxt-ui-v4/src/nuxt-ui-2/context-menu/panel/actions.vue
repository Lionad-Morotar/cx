<template>
  <el-form :model="value" label-position="top">
    <template v-for="(group, gIDX) in value">
      <el-form-item class="item">
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
      </el-form-item>

      <div class="sub-form">
        <template v-for="(item, iIDX) in group" :key="`${gIDX}-${iIDX}-${item.id}`">
          <el-form-item :rules="itemLabelRule" :prop="`${gIDX}.${iIDX}`" class="item">
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
            <el-input v-model="item.label" />
          </el-form-item>
        </template>
        <el-button class="mt-2 w-full text-center" @click="() => addActionItem(gIDX)">
          添加菜单项
        </el-button>
      </div>
    </template>

    <el-button class="mt-4 w-full text-center" type="primary" @click="addGroup">
      添加菜单分组
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createItem } from '../utils'
import type { ActionItem } from '../types'

const { emits, props, value } = useCxPanel<ActionItem[][]>([])
value.value = value.value || []

const itemLabelRule = [
  {
    trigger: ['blur', 'change'],
    validator(rule: any, item: any, cb: any) {
      const { label } = item || {}
      if (label.length <= 0) return cb(new Error('请输入项目标题'))
      if (label.length >= 20) return cb(new Error('项目标题不能超过 20 个字符'))
      return cb()
    },
  },
]

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

  :deep(.el-form-item) {
    @apply mb-1;
  }
  :deep(.el-form-item__label) {
    @apply mb-1;
  }
}

.item {
  @apply w-full;

  &:has(.el-form-item__content:empty) {
    @apply mb-0;
  }

  :deep(.el-form-item__label) {
    @apply w-full;
  }

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
