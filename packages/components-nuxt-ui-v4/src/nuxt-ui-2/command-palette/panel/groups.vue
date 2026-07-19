<template>
  <el-form
    :model="value"
    label-position="top"
  >
    <template
      v-for="(group, gIDX) in value"
      :key="`${gIDX}-${group.key}`"
    >
      <el-form-item
        :rules="groupKeyRule"
        :prop="`${gIDX}`"
        class="item"
      >
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
        <el-input v-model="group.key" />
      </el-form-item>
      <el-form-item
        :rule="groupLabelRule"
        :prop="`${gIDX}`"
        class="item"
      >
        <template #label>
          <span>分组标题</span>
        </template>
        <el-input v-model="group.label" />
      </el-form-item>

      <div class="sub-form">
        <template
          v-for="(item, iIDX) in group.commands"
          :key="`${gIDX}-${iIDX}-${item.id}`"
        >
          <el-form-item
            :rules="itemIDRule"
            :prop="`${gIDX}.commands.${iIDX}`"
            class="item"
          >
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
            <el-input v-model="item.id" />
          </el-form-item>
          <el-form-item
            :rules="itemLabelRule"
            :prop="`${gIDX}.commands.${iIDX}`"
            class="item"
          >
            <template #label>
              <span>项目标题</span>
            </template>
            <el-input v-model="item.label" />
          </el-form-item>
        </template>
        <el-button
          class="mt-2 w-full text-center"
          @click="() => addItem(gIDX)"
        >
          添加一项
        </el-button>
      </div>
    </template>

    <el-button
      class="mt-4 w-full text-center"
      type="primary"
      @click="addGroupItem"
    >
      添加分组
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createItem, createGroupItem } from '../utils'
import type { Item, GroupItem } from '../types'

const { emits, props, value } = useCxPanel<GroupItem[]>([])
value.value = value.value || []

const groupKeyRule = [
  {
    trigger: ['blur', 'change'],
    validator(rule: any, item: any, cb: any) {
      const { key } = item || {}
      if (key.length <= 0) return cb(new Error(('请输入分组标识')))
      if (key.length >= 32) return cb(new Error(('分组标识不能超过 32 个字符')))
      return cb()
    }
  }
]
const groupLabelRule = [
  {
    trigger: ['blur', 'change'],
    validator(rule: any, item: any, cb: any) {
      const { label } = item || {}
      if (label.length <= 0) return cb(new Error(('请输入分组标题')))
      if (label.length >= 50) return cb(new Error(('分组标题不能超过 50 个字符')))
      return cb()
    }
  }
]
const itemIDRule = [
  {
    trigger: ['blur', 'change'],
    validator(rule: any, item: any, cb: any) {
      const { id } = item || {}
      if (id.length <= 0) return cb(new Error(('请输入标题')))
      if (id.length >= 32) return cb(new Error(('标题不能超过 32 个字符')))
      return cb()
    }
  }
]
const itemLabelRule = [
  {
    trigger: ['blur', 'change'],
    validator(rule: any, item: any, cb: any) {
      const { label } = item || {}
      if (label.length <= 0) return cb(new Error(('请输入项目标题')))
      if (label.length >= 50) return cb(new Error(('项目标题不能超过 50 个字符')))
      return cb()
    }
  }
]

const addGroupItem = () => {
  const newItemName = `group-${((value.value as any[])?.length || 0) + 1}`
  const newItem = createGroupItem({
    key: newItemName,
    label: '新分组',
    commands: [
      createItem({
        id: 'item-1',
        label: '新项目'
      })
    ]
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
    label: '新项目'
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

  :deep(.el-form-item) {
    @apply mb-1;
  }
  :deep(.el-form-item__label) {
    @apply mb-1;
  }
}

.item {
  @apply w-full;

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
