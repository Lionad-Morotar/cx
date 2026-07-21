<template>
  <UForm label-position="top" :model="modelValue" label-width="110px">
    <UFormField
      v-for="(tab, idx) in modelValue"
      :key="`${idx}-${tab.value}`"
      :rules="tabRule"
      :prop="`${idx}`"
    >
      <template #label>
        <div class="label">
          <span>{{ `${'标签页'} ${idx + 1}` }}</span>
          <span v-if="modelValue.length > 1" class="delete-text" @click="() => deleteTab(idx)">{{
            '删除'
          }}</span>
          <span v-else />
        </div>
      </template>
      <UInput v-model="tab.name" />
    </UFormField>
    <UButton color="primary" @click="addTab">{{ '添加标签' }}</UButton>
  </UForm>
</template>

<script setup lang="ts">
import { useCxPanel } from '@lionad/cx-vue'
import type { Tab } from '../types'

const { value: modelValue } = useCxPanel<Tab[]>()

const tabRule = [
  {
    trigger: ['blur', 'change'],
    validator(rule: any, item: any, cb: any) {
      const { name } = item
      if (name.length <= 0) {
        return cb(new Error('请输入标签页名称'))
      }
      if (name.length >= 25) {
        return cb(new Error('标签页名称不能超过 25 个字符'))
      }
      return cb()
    },
  },
]

const addTab = () => {
  const newTab = {
    name: `${'标签页'}${modelValue.value.length + 1}`,
    key: `tab-${modelValue.value.length + 1}`,
    value: `${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
  }
  modelValue.value.push(newTab)
}
const deleteTab = (idx: number) => {
  modelValue.value.splice(idx, 1)
}
</script>

<style lang="scss" scoped>
.label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .delete-text {
    height: 16px;
    font-size: 12px;
    color: rgb(245, 108, 108);
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
    &:active {
      opacity: 0.7;
    }
  }
}
</style>
