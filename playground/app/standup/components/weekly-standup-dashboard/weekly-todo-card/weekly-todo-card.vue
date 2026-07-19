<template>
  <cx-dashboard-card
    class="cmpt-weekly-todo-card"
    :title="todoCardWeekType === 'curWeek' ? '问题' : '上周问题'"
    :side-title="dayStr()"
    full-content
    theme-color="#ff4c4f"
    v-bind="$attrs"
  >
    <template #after-title v-if="isEnableSwitchTodoDataType">
      <img class="switch-icon" :src="IconSwitch" @click="switchTodoDataType" />
    </template>
    <template #icons v-if="isCurStandupInProgress">
      <el-icon class="switch-edit-type" @click="switchTodoCardEditType">
        <Switch />
      </el-icon>
    </template>
    <cx-todo-card
      ref="todoCardRef"
      :use="content"
      :disabled="isTodoDisabled"
      :type="todoCardEditType"
    />
  </cx-dashboard-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Switch } from '@element-plus/icons-vue'
import CxDashboardCard from '../../dashboard-card'
import CxTodoCard from '../../todo-card'
import { useStandupDetail, useLastStandup } from '../../../states/standups'
import { useCurrentUser } from '../../../states/users'
import { useStandupContents } from '../../todo-card/contents'
import IconSwitch from '../../../assets/switch.svg'
import { dayStr } from '../../../utils'

import type { User } from '../../../apis'
import type { Content } from '../../todo-card/types'

const props = defineProps<{
  user?: User | null
}>()
const user = props.user ? computed(() => props.user) : useCurrentUser()
const userID = computed(() => user.value?.id || '')
const standupDetail = useStandupDetail()
const lastStandupDetail = useLastStandup(standupDetail)
const isCurStandupInProgress = computed(() => standupDetail.value.state === 'IN_PROGRESS')

// can switch to last week if last week is available
const isEnableSwitchTodoDataType = computed(() => Boolean(lastStandupDetail.value?.id))

const todoCardWeekType = ref<'curWeek' | 'lastWeek'>('curWeek')
const todoCardStandupID = computed(() => {
  return todoCardWeekType.value === 'curWeek' ? standupDetail.value.id : lastStandupDetail.value!.id
})
const switchTodoDataType = () => {
  todoCardWeekType.value = todoCardWeekType.value === 'curWeek' ? 'lastWeek' : 'curWeek'
}

const todoCardEditType = ref<'text' | 'todo'>('todo')
const isTodoList = computed(() => todoCardEditType.value === 'todo')
const switchTodoCardEditType = () =>
  (todoCardEditType.value = todoCardEditType.value === 'text' ? 'todo' : 'text')

const isTodoDisabled = computed(() => !isCurStandupInProgress.value)

const content = useStandupContents(todoCardStandupID, userID, isTodoDisabled, (x: Content) => {
  // 问题列表形式下，不需要展示空行
  if (isTodoList.value) {
    return x.content.replace(/\s|\r|\n/g, '').length > 0
  }
  return true
})
</script>

<style lang="scss">
.cmpt-weekly-todo-card {
  width: 100%;
  height: 100%;

  .todo-list-item-order {
    padding-right: 0px !important;
  }

  .switch-icon {
    box-sizing: content-box;
    margin-left: 4px;
    padding: 1px;
    width: 22px;
    height: 22px;
    border: solid 1px rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    cursor: pointer;
    opacity: 0.65;

    &:hover {
      opacity: 0.45;
    }
    &:active {
      opacity: 0.4;
    }
  }

  .dashboard {
    width: 100%;
    height: 100%;
  }
  .contents {
    .c-v-cx-skeleton {
      padding: inherit;
      background: inherit;
      --el-skeleton-color: #e4e8f4;
      --el-skeleton-to-color: #d7e2f4;
    }
  }
}
</style>
