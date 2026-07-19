<template>
  <el-form :model="value" label-position="top">
    <template v-for="(tab, idx) in value" :key="`${idx}-${tab.id}`">
      <el-form-item :rules="labelRule" :prop="`${idx}`" class="accordion-item">
        <template #label>
          <div class="label">
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
        <el-input v-model="tab.label" />
      </el-form-item>
    </template>

    <el-button class="mt-4 w-full text-center" type="primary" @click="addTab"> 添加项目 </el-button>
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
      if (label.length <= 0) return cb(new Error('请输入标题'))
      if (label.length >= 50) return cb(new Error('标题不能超过 50 个字符'))
      return cb()
    },
  },
]

const addTab = () => {
  const newTabName = `${'项目'}${((value.value as any[])?.length || 0) + 1}`
  const newTab = createItem({
    label: newTabName,
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
