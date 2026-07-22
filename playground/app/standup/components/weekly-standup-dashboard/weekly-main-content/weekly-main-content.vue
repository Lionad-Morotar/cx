<template>
  <cx-card-tabs v-model="curTab" :tabs="tabs" v-bind="$attrs">
    <div class="cx-weekly-card-tabs-contents">
      <cx-view-issues-statics-cards
        :issues-full="issuesUnFiltered"
        :issues="issues"
        :is-loading="isLoading"
        :mark-new-issue-from="markNewIssueFrom"
        :mark-due-date-from="markDueDateFrom"
        :hidden="
          curTab === 'next-week'
            ? [
                'done-count',
                'new-issue-count',
                'in-due-date',
                'check-count',
                'np-count',
                'average-spend-time',
                'average-wait-time',
              ]
            : []
        "
      />
      <cx-card class="issues-section is-cx-card" :name="'任务列表'" ref="issueTableWrapperRef">
        <template #action>
          <UInput
            class="filter-issue-input"
            v-model="tableFilterStr"
            placeholder="搜索任务列表"
            icon="i-lucide-search"
          />
          <cx-fullscreen-button
            ref="tableFullScreenButtonRef"
            icon
            :target="issueTableWrapperRef"
          />
          <UIcon name="i-lucide-copy" class="export-button" @click="exportData" />
        </template>
        <cx-view-issues-table
          ref="issueTableRef"
          v-model:issues="issues"
          :filter="tableFilter"
          :due-date="tableDueDate"
          :is-loading="isLoading"
          @highlight-todo="highlightTodo"
          @quick-link="quickLink"
        />
      </cx-card>
    </div>
  </cx-card-tabs>
</template>

<script lang="ts" setup>
import { ref, watch, computed, watchEffect } from 'vue'
import { useAsync } from '../../../hooks/use-async'
import { useMagicKeys } from '@vueuse/core'
// import { standupBus as cx } from "../../../utils/standup-bus";
import CxCardTabs from '../../card-tabs'
import { useStandupDetail, useLastStandup } from '../../../states/standups'
import { useIssueFilters } from '../../../states/issue-filter'
import { useCurrentUser } from '../../../states/users'
import { CxFullscreenButton, CxViewIssuesTable, CxViewIssuesStaticsCards } from '../..'
import { dayjs, isEmpty } from '../../../utils'
import { apiGetStandupRelatedIssues } from '../../../apis'
import { formatIssue } from '../../../utils/task'

import type { Ref } from 'vue'
import type { FormattedIssue, User } from '../../../apis'

// console.log("[debug] cx", cx);

const tabs = [
  { name: '本周任务', key: 'current-week', value: 'current-week' },
  { name: '下周计划', key: 'next-week', value: 'next-week' },
]

const user = useCurrentUser()
const curTab = ref<'current-week' | 'next-week'>('current-week')

const isLoading = computed(() => reload.isLoading)

/* --------------------------------- standup -------------------------------- */

const standup = useStandupDetail()
const lastStandup = useLastStandup()
const isCurStandupInProgress = computed(() => standup.value.state === 'IN_PROGRESS')

const lastMeetingDate = computed(() => {
  const date = lastStandup.value?.meetingDate
  const time = lastStandup.value?.startTime
  return date && time ? `${lastStandup.value!.meetingDate} ${lastStandup.value!.startTime}` : ''
})

watch(
  lastStandup,
  (x) => {
    console.log('lastStandupDetail', x)
  },
  { immediate: true },
)

const meetingDate = computed(() => {
  const date = standup.value.meetingDate
  const time = standup.value.startTime
  return date && time ? `${standup.value.meetingDate} ${standup.value.startTime}` : ''
})

const lastWeekDate = computed(() => {
  if (!standup.value) {
    return
  }
  console.log(
    '[info] lastMeetingDate',
    dayjs(lastMeetingDate.value).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
  )

  return lastMeetingDate.value
    ? dayjs(lastMeetingDate.value).endOf('day').format('YYYY-MM-DD HH:mm:ss')
    : dayjs(meetingDate.value).subtract(1, 'week')
})
const nextWeekDate = computed(() => {
  if (!standup.value) {
    return
  }
  return dayjs(meetingDate.value).add(1, 'week')
})

const markNewIssueFrom = computed(() => {
  return curTab.value === 'current-week'
    ? dayjs(lastWeekDate.value).format('YYYY-MM-DD HH:mm:ss')
    : dayjs(meetingDate.value).format('YYYY-MM-DD HH:mm:ss')
})
const markDueDateFrom = computed(() => {
  return curTab.value === 'current-week'
    ? dayjs(meetingDate.value).format('YYYY-MM-DD HH:mm:ss')
    : 'whatever'
})

/* --------------------------------- issues --------------------------------- */

const filterStates = useIssueFilters(user as Ref<User>)

const issues = computed(() => {
  if (curTab.value === 'current-week') {
    return filterCurrentWeekIssues.value
  } else {
    return filterNextWeekIssues.value
  }
})

const curUserRelatedIssusByDateReq = useAsync(async () => {
  if (!user.value) {
    return []
  }
  // 时间展示精度以日为粒度（时分秒已在数据层剔除）
  const date = dayjs(meetingDate.value).format('YYYY-MM-DD') + ' 00:00:00'
  if (date.includes('Invalid')) {
    return []
  }
  const res = await apiGetStandupRelatedIssues({
    date,
    assigneeUserName: filterStates.isTeamManager ? '' : user.value.username,
    allUser: filterStates.isTeamManager ? true : false,
    type: 'week',
    initData: isCurStandupInProgress.value ? true : false,
  })
  if (res.success) {
    const issues = await Promise.all((res.data || []).map(formatIssue))
    // console.info('[info] issues by date', issues, date)
    return issues
  }
  return []
})

const issuesUnFiltered = computed(() => curUserRelatedIssusByDateReq.result || [])

const filterCurrentWeekIssues = computed(() => {
  if (curTab.value === 'next-week') {
    return []
  }
  const hasStage = (x: FormattedIssue) => !isEmpty(x.issueStage)
  const res = issuesUnFiltered.value
    .filter(hasStage)
    .filter(filterStates.isTaskValid)
    .filter(filterStates.byRoleProject)
    .filter(filterStates.genByFocusDone(lastWeekDate.value))
    .filter((x: any) => !filterStates.isTaskIn(x, ['accepted']))
  return res
})

const filterNextWeekIssues = computed(() => {
  if (curTab.value === 'current-week') {
    return []
  }
  const hasStage = (x: FormattedIssue) => !isEmpty(x.issueStage)
  return (
    issuesUnFiltered.value
      .filter(hasStage)
      .filter(filterStates.isTaskValid)
      .filter(filterStates.byRoleProject)
      .filter(filterStates.genByFocusDoing(dayjs(meetingDate.value)))
      // 和站会不一样的是，今天完成的任务不需要算到下周，而是算到本周
      .filter((x: FormattedIssue) =>
        filterStates.isTaskUndone(x)
          ? true
          : filterStates.isTaskDoneAt(x, meetingDate.value)
            ? false
            : true,
      )
  )
})

const issueTableWrapperRef = ref()

const tableFilterStr = ref('')
const tableDueDate = computed(() => {
  if (curTab.value === 'current-week') {
    return meetingDate.value
  } else {
    return nextWeekDate.value?.format('YYYY-MM-DD')
  }
})
const tableFilter = (x: FormattedIssue) => {
  if (!tableFilterStr.value) {
    return true
  } else {
    return !![
      x.name.toLowerCase(),
      x.webUrl,
      x.assignee,
      x.userParticipants.map((z) => z.id).join(','),
      x.issueLabels.map((z) => z.id).join(','),
      x.userParticipants.map((z) => z.name).join(','),
      x.issueLabels.map((z) => z.name).join(','),
    ]
      .filter(Boolean)
      .find((y) => y.includes(tableFilterStr.value))
  }
}

// * check
const todoCardRef = ref()
const quickLink = (x: FormattedIssue) => {
  if (!todoCardRef.value) {
    return
  }
  const tag = '#' + String(x.gitlabIssueID)
  const isSelected = todoCardRef.value.inputTagValue === tag
  if (!isSelected) {
    todoCardRef.value.setInputTag(tag)
    todoCardRef.value.todoInputRef?.focus()
  }
}
const highlightTodo = (x: FormattedIssue) => {
  if (!todoCardRef.value) {
    return
  }
  const tag = '#' + String(x.gitlabIssueID)
  todoCardRef.value.highlight((x: any) => Boolean(x.mention?.find?.((y: any) => y?.text === tag)))
}

/* -------------------------------------------------------------------------- */
/*                                  handlers                                  */
/* -------------------------------------------------------------------------- */

const tableFullScreenButtonRef = ref()
const { Ctrl_Alt_Enter, Meta_Alt_Enter } = useMagicKeys()
watch([Ctrl_Alt_Enter, Meta_Alt_Enter], ([isPressed_ctrl, isPressed_meta]) => {
  const isPressed = isPressed_ctrl || isPressed_meta
  isPressed && tableFullScreenButtonRef.value?.enter?.()
})

const issueTableRef = ref()
watchEffect(() => {
  console.log('[info] issueTableRef', issueTableRef.value)
})
const exportData = () => {
  issueTableRef.value.exportJSONDatas()
}

/* -------------------------------------------------------------------------- */
/*                                   expose                                   */
/* -------------------------------------------------------------------------- */

watch(meetingDate, (n) => n && reload.exec())
watch(user, (n) => n && reload.exec())

const reload = useAsync(async () => {
  await curUserRelatedIssusByDateReq.exec()
  tableFilterStr.value = ''
  curTab.value = 'current-week'

  /**
   * todo move to weekly todo card
   */
  // todoCardWeekType.value = 'curWeek'
})

defineExpose({
  reload,
})
</script>

<style>
/* -------------------------------------------------------------------------- */
/*                                   layout                                   */
/* -------------------------------------------------------------------------- */
.cx-weekly-card-tabs-contents {
  display: grid;
  grid-template: auto minmax(50%, 1fr) / minmax(0, 1fr);
  grid-template-areas:
    'statics'
    'issues';
  gap: 18px 0;

  .issues-view-statics {
    grid-area: statics;
    max-height: 40vh;
  }

  .issues-section {
    grid-area: issues;
  }
}
/* -------------------------------------------------------------------------- */
/*                                   styles                                   */
/* -------------------------------------------------------------------------- */
.cx-weekly-card-tabs-contents {
  position: relative;
  box-sizing: border-box;
  padding: 18px;
  height: 100%;
  background: #f0f2fb;
  border-radius: 8px;
  box-shadow: 10px 10px 32px 0 rgba(121, 121, 121, 0.3);
  border-top-left-radius: 0;

  .issues-view-statics,
  .issues-section {
    background: white;
    box-shadow: unset;
    border-radius: 8px;
  }

  .is-cx-card {
    padding: 12px 26px;
    gap: 12px;

    .cx-card__header {
      .cx-card__name {
        font-size: 18px;
        color: #262626;
        font-weight: 600;
      }
    }
    .cx-card__action-con {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
    }
  }

  .is-card {
    display: grid;
    grid-template: 52px minmax(0, 1fr) / 1fr;
    gap: 8px;

    .card-header-section {
      display: flex;
      align-items: center;
      gap: 14px;
      box-sizing: border-box;
      padding: 0 26px;
      padding-top: 12px;
      height: 38px;
      width: 100%;

      .title {
        font-size: 18px;
        color: #262626;
        font-weight: 600;
      }

      .side-title {
        font-size: 13px;
        color: #838991;
        font-weight: 400;
      }
    }

    .card-content-section {
      padding: 0 21px 18px 21px;
    }
  }

  .card-header-section {
    position: relative;
  }

  .filter-issue-input {
    width: 300px;

    .el-input__wrapper {
      border-radius: 8px;
      box-shadow: none;
      border: solid 1px #e5e8ef;
    }
  }
}
</style>
