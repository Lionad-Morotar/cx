<template>
  <!-- 列可见性配置编辑（原为 p-ray 数据域 popper 的 cx 原生最小实现） -->
  <UFormGroup :help="helpText">
    <div class="cx-panel-columns">
      <label
        v-for="item in value"
        :key="item.id"
        class="cx-panel-columns__row"
      >
        <input
          type="checkbox"
          :checked="!item.disabledExpand"
          @change="item.disabledExpand = !item.disabledExpand"
        >
        <span class="cx-panel-columns__label">{{ item.label }}</span>
      </label>
      <p
        v-if="!value.length"
        class="cx-panel-columns__empty"
      >
        暂无可配置列
      </p>
    </div>
  </UFormGroup>
</template>

<script setup lang="ts">
import { UFormGroup } from '../../../../vendor/bridge'

import { computed } from 'vue'

import { useCxPanel } from '@lionad/cx-vue'

import type { Data } from '../types'

const helpText = computed(() => typeof props.help === 'function' ? props.help({} as any) : props.help)

const { props, value } = useCxPanel<Data[]>([])
</script>

<style scoped>
.cx-panel-columns__row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  font-size: 12px;
  cursor: pointer;
}
.cx-panel-columns__empty {
  color: #9ca3af;
  font-size: 12px;
}
</style>
