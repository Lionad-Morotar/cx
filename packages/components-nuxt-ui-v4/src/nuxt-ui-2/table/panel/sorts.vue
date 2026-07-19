<template>
  <!-- 排序配置编辑（原为 p-ray 数据域 popper 的 cx 原生最小实现） -->
  <UFormGroup :help="helpText">
    <div class="cx-panel-sorts">
      <div
        v-for="(item, idx) in value"
        :key="item.id"
        class="cx-panel-sorts__row"
      >
        <span class="cx-panel-sorts__label">{{ item.label }}</span>
        <button
          type="button"
          class="cx-panel-sorts__toggle"
          @click="toggleDirection(item)"
        >
          {{ item.direction === 'desc' ? '降序' : '升序' }}
        </button>
        <button
          type="button"
          class="cx-panel-sorts__remove"
          @click="value.splice(idx, 1)"
        >
          ✕
        </button>
      </div>
      <p
        v-if="!value.length"
        class="cx-panel-sorts__empty"
      >
        未选择排序字段
      </p>
    </div>
  </UFormGroup>
</template>

<script setup lang="ts">
import { UFormGroup } from '../../../../vendor/bridge'

import { computed } from 'vue'

import { useCxPanel } from '@lionad/cx-vue'

import type { Data } from '../types'

type SortItem = Data & { direction?: 'asc' | 'desc' }

const helpText = computed(() => typeof props.help === 'function' ? props.help({} as any) : props.help)

const { props, value } = useCxPanel<SortItem[]>([])

const toggleDirection = (item: SortItem) => {
  item.direction = item.direction === 'desc' ? 'asc' : 'desc'
}
</script>

<style scoped>
.cx-panel-sorts__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}
.cx-panel-sorts__label {
  flex: 1;
  font-size: 12px;
}
.cx-panel-sorts__toggle,
.cx-panel-sorts__remove {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0 6px;
  font-size: 12px;
  cursor: pointer;
}
.cx-panel-sorts__empty {
  color: #9ca3af;
  font-size: 12px;
}
</style>
