<template>
  <el-form :model="value" label-position="top">
    <el-form-item
      v-for="(tab, idx) in value"
      :key="`${idx}-${tab.value}`"
      :rules="tabRule"
      :prop="`${idx}`"
      class="tab-item"
    >
      <template #label>
        <div class="label">
          <span>{{ `${'项目'} ${idx + 1}` }}</span>
          <span class="delete-text" @click="() => remove(idx)" v-text="'删除'" />
        </div>
      </template>
      <el-input v-model="tab.label" />
    </el-form-item>

    <el-button class="mt-4 w-full text-center" type="primary" @click="add"> 添加项目 </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createItem } from '../utils'
import type { Item } from '../types'

const { emits, props, value } = useCxPanel<Item[]>([])

const tabRule = [
  {
    trigger: ['blur', 'change'],
    validator(rule: any, item: any, cb: any) {
      const { label } = item || {}
      if (label.length <= 0) return cb(new Error('请输入项目名称'))
      if (label.length >= 25) return cb(new Error('项目名称不能超过 25 个字符'))
      return cb()
    },
  },
]

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
