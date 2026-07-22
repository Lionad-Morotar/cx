<template>
  <div class="list-con">
    <span v-if="!groups.length" class="empty-group-tip">没有找到{{ meetingTypeName }}记录</span>
    <template v-for="group in groups" :key="group.startDay">
      <StandupContextProvider :group="group">
        <slot name="group-item" />
      </StandupContextProvider>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { StandupContextProvider } from '../../standup-context'
import { useStandupGroups } from '../states/use-standup-groups'
import { useStandupType } from '../../../states/standups'

import type { GroupOfStandup } from '../../../apis'

/**
 * groups 优先取 prop 注入（测试缝隙：schema 静态，测试经 data.groups 注入受控数据）；
 * 生产环境 schema 不填该字段，回退到 store 计算的分组（响应式，数据更新自动重算）。
 */
const props = defineProps<{
  groups?: GroupOfStandup[]
}>()

const storeGroups = useStandupGroups()
const groups = computed<GroupOfStandup[]>(() =>
  props.groups?.length ? props.groups : storeGroups.value,
)

const meetingType = useStandupType()
const meetingTypeName = computed(
  () => ({ day: '站会', week: '周会', month: '月会' })[meetingType.value] as string,
)
</script>

<style scoped>
.list-con {
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  padding: 0 2em 0 0 !important;
  min-height: 130px;
  width: 100%;

  .empty-group-tip {
    font-size: 16px;
    color: #666;
  }

  /* 折叠/展开态样式：is-fold/is-unfold 在 folder-container 根上，
     其视觉（背景、卡片与图标显隐）经 :deep 跨物料作用到后代 */
  :deep(.cx-folder-container) {
    display: flex;
    flex-direction: column;
    min-width: 500px;
    border-radius: 4px;
    transition: 0.2s;
    cursor: pointer;

    &.is-fold {
      background-color: #f5f5f5;

      .days-con {
        display: none;
      }
      .icon-close {
        display: none;
      }
    }
    &.is-unfold {
      background-color: #eff2fb;
      cursor: revert;

      .group-header {
        cursor: pointer;
      }
      .icon-open {
        display: none;
      }
    }
  }
}
</style>
