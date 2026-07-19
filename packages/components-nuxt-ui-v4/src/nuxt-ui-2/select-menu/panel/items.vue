<template>
  <el-form
    :model="value"
    label-position="top"
  >
    <template
      v-for="(tab, idx) in value"
      :key="`${idx}-${tab.id}`"
    >
      <el-form-item
        :rules="labelRule"
        :prop="`${idx}`"
        class="accordion-item"
      >
        <template #label>
          <div class="label">
            <span>{{ `${('选项')} ${idx + 1}` }}</span>
            <span
              class="delete-text"
              @click="() => remove(idx)"
              v-text="'删除'"
            />
          </div>
        </template>
        <el-input v-model="tab.label" />
      </el-form-item>
      <el-form-item
        :rules="labelRule"
        :prop="`${idx}`"
        class="accordion-item -mt-2"
      >
        <el-input v-model="tab.value" />
      </el-form-item>
    </template>

    <el-button
      class="mt-4 w-full text-center"
      type="primary"
      @click="add"
    >
      添加选项
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import { createItem } from '../utils'
import type { Item } from '../types'

const { emits, props, value } = useCxPanel<Item[]>([])

const labelRule = [
  {
    trigger: ['blur', 'change'],
    validator(rule: any, item: any, cb: any) {
      const { label } = item || {}
      if (label.length <= 0) return cb(new Error(('请输入选项标题')))
      if (label.length >= 30) return cb(new Error(('选项标题不能超过 30 个字符')))
      return cb()
    }
  }
]
const valueRule = [
  {
    trigger: ['blur', 'change'],
    validator(rule: any, item: any, cb: any) {
      const { value } = item || {}
      if (value.length <= 0) return cb(new Error(('请输入选项值')))
      if (value.length >= 30) return cb(new Error(('选项值不能超过 30 个字符')))
      return cb()
    }
  }
]

const add = () => {
  const order = ((value.value as any[])?.length || 0) + 1
  const newTabName = `${('项目')}${order}`
  const newTab = createItem({
    label: newTabName,
    value: String(order)
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
