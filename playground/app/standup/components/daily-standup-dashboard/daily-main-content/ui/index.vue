<template>
  <div ref="compRef" :class="ns.b()">
    <!-- 昨天 -->
    <cx-dashboard-card
      data-focus-id="yesterday-dashboard-card"
      data-focus-sub="yesterday-dashboard-card-issue"
      title="昨天"
      :time="dayStr(yesterday)"
      :is-loading="curUserRelatedIssusByDateReq.isLoading"
      theme-color="var(--su-state-narrative)"
    >
      <cx-view-issues-board
        v-for="issue in filteredYesterdayList"
        :key="`yesterday-${issue.id}`"
        data-focus-id="yesterday-dashboard-card-issue"
        :due-date="yesterday"
        :issue="issue"
      />
    </cx-dashboard-card>

    <!-- 今天 -->
    <cx-dashboard-card
      ref="todayBoardRef"
      data-focus-id="today-dashboard-card"
      data-focus-sub="today-dashboard-card-issue"
      title="今天"
      :time="dayStr(today)"
      :is-loading="curUserRelatedIssusByDateReq.isLoading"
      theme-color="var(--su-state-now)"
    >
      <cx-view-issues-board
        v-for="issue in filteredTodayList"
        :key="`today-${issue.id}`"
        data-focus-id="today-dashboard-card-issue"
        :due-date="today"
        :issue="issue"
      />
    </cx-dashboard-card>

    <!-- 代办事项 -->
    <cx-dashboard-card
      class="todo-section"
      data-focus-id="todo-board"
      :title="todoCardWeekType === 'curWeek' ? '问题' : '昨日问题'"
      :side-title="dayStr()"
      full-content
      :is-loading="curUserRelatedIssusByDateReq.isLoading"
      theme-color="var(--su-state-alert)"
    >
      <template v-if="enableSwitchTodoDataType" #after-title>
        <img class="switch-icon" :src="IconSwitch" @click="switchTodoDataType" />
      </template>
      <template v-if="isCurStandupInProgress" #icons>
        <span class="switch-edit-type" @click="toggle()">切换</span>
      </template>
      <cx-todo-card ref="todoCardRef" :use="content" :disabled="isTodoDisabled" :type="editType" />
    </cx-dashboard-card>
  </div>
</template>

<script lang="ts" setup>
/* Import NPM Depends */
import { isWorkday, isHoliday, getFestival } from '../../../../utils/workday'
import { watch, ref, reactive, computed, onMounted } from 'vue'
/* Import Project Depends */
import { useAsync } from '../../../../hooks/use-async'
import { useCxNamespace } from '../../../../utils/namespace'
/* Import Components */
import { CxTodoCard, CxDashboardCard, CxViewIssuesBoard } from '../../..'
/* Import States */
import { useStandupType, useStandupDetail, useLastStandup } from '../../../../states/standups'
import { useCurrentUser } from '../../../../states/users'
import { useIssueFilters } from '../../../../states/issue-filter'
import { useStandupContents } from '../../../todo-card/contents'
/* Import Utils */
import { isEmpty, dayjs, dayStr } from '../../../../utils'
import { formatIssue } from '../../../../utils/task'
/* Import APIs */
import { apiGetStandupRelatedIssues } from '../../../../apis'
/* Import Config */
/* Import Assets (CSS、Images) */
import IconSwitch from '../../../../assets/switch.svg'
/* Import Types */
import type { Ref } from 'vue'
import type { User, FormattedIssue } from '../../../../apis'
import type { Content } from '../../../todo-card/types'

/* -------------------------------------------------------------------------- */
/*                                 types & env                                */
/* -------------------------------------------------------------------------- */

defineOptions({ name: 'CxDailyMainContent' })

const ns = useCxNamespace('daily-main-content')
const emits = defineEmits([])
const props = withDefaults(
  defineProps<{
    // ...

  }>(),
  {
    // ...

  },
)

/* -------------------------------------------------------------------------- */
/*                                   states                                   */
/* -------------------------------------------------------------------------- */

const compRef = ref()
const states = reactive({})

const standupDetail = useStandupDetail()
const lastStandupDetail = useLastStandup()

const isCurStandupInProgress = computed(() => standupDetail.value.state === 'IN_PROGRESS')

const meetingType = useStandupType()
const meetingDate = computed(() =>
  dayjs(`${standupDetail.value.meetingDate} ${standupDetail.value.startTime}`).format(
    'YYYY-MM-DD HH:mm:ss',
  ),
)
const today = computed(() => dayjs(meetingDate.value).format('YYYY-MM-DD'))
const yesterday = computed(() => {
  if (!standupDetail.value) {
    return
  }
  let day = ''
  for (let offset = 1; offset <= 14; offset++) {
    day = dayjs(meetingDate.value).subtract(offset, 'day').format('YYYY-MM-DD')
    if (isWorkday(day)) {
      break
    }
  }
  return day
})

const currentUser = useCurrentUser()
const userID = computed(() => currentUser.value?.id || '')

const filterStates = useIssueFilters(currentUser as Ref<User>)

const unFilteredIssues = computed(() => [...(curUserRelatedIssusByDateReq?.result || [])])

// 昨天的列表
const filteredYesterdayList = computed(() => {
  const raw = unFilteredIssues.value

  // * for debug
  // const find = (xs: any[]) => xs.find(x => x.webUrl?.includes('product-design/-/issues/301'))
  // console.info('[debug] 1', find(raw))
  // console.info('[debug] 2', find(raw.filter(byRoleProject)))
  // console.info('[debug] 3', find(raw.filter(byRoleProject).filter(filterStates.genByFocusDone(yesterday.value))))
  // console.info('[debug] 4', find(raw.filter(byRoleProject).filter(filterStates.genByFocusDone(yesterday.value)).filter(x => selectedFilter.value(x, 'yesterday'))))
  // console.info('[debug] 5', find(raw.filter(byRoleProject).filter(filterStates.genByFocusDone(yesterday.value)).filter(x => selectedFilter.value(x, 'yesterday')).sort(filterStates.sortByStage)))
  // console.info('[debug] 6', find(raw.filter(byRoleProject).filter(filterStates.genByFocusDone(yesterday.value)).filter(x => selectedFilter.value(x, 'yesterday')).sort(filterStates.sortByStage).sort(filterStates.sortByDueDate)))
  // console.info('[debug] res', raw.filter(byRoleProject).filter(filterStates.genByFocusDone(yesterday.value)).filter(x => selectedFilter.value(x, 'yesterday')).sort(filterStates.sortByStage).sort(filterStates.sortByDueDate))

  // debugger

  const hasStage = (x: FormattedIssue) => !isEmpty(x.issueStage)
  const res = raw
    .filter(hasStage)
    .filter(filterStates.isTaskValid)
    .filter(filterStates.get('byRoleProject'))
    .filter(filterStates.genByFocusDone(yesterday.value))
    .filter((x) => !filterStates.isTaskIn(x, ['accepted', 'planed']))
    .filter((x) => filterStates.get('selectedFilter', x, 'yesterday'))
    .sort(filterStates.sortByStage)
    .sort(filterStates.sortByDueDate)

  return res
})

// 今天的列表
const filteredTodayList = computed(() => {
  const raw = unFilteredIssues.value

  // const find = (xs: any[]) => xs.find(x => x.webUrl?.includes('819'))
  // console.info('[debug] 1', find(raw))
  // console.info('[debug] 2', find(raw.filter(byRoleProject)))
  // console.info('[debug] 3', find(raw.filter(byRoleProject).filter(filterStates.genByFocusDoing(today.value))))
  // console.info('[debug] 4', find(raw.filter(byRoleProject).filter(filterStates.genByFocusDoing(today.value)).filter(x => selectedFilter.value(x, 'today'))))

  const hasStage = (x: FormattedIssue) => !isEmpty(x.issueStage)
  const res = raw
    .filter(hasStage)
    .filter(filterStates.isTaskValid)
    .filter(filterStates.get('byRoleProject'))
    .filter(filterStates.genByFocusDoing(today.value))
    .filter((x) => filterStates.get('selectedFilter', x, 'today'))
    .sort(filterStates.sortByStage)
    .sort(filterStates.sortByDueDate)

  // console.log('[info] yesterday list', raw.length, res)

  return res
})

const todoCardWeekType = ref<'curWeek' | 'lastWeek'>('curWeek')
const isTodoList = computed(() => editType.value === 'todo')
const isTodoDisabled = computed(() => !isCurStandupInProgress.value)

const enableSwitchTodoDataType = computed(() => Boolean(lastStandupDetail.value?.id))
const todoCardStandupID = computed(() => {
  return todoCardWeekType.value === 'curWeek' ? standupDetail.value.id : lastStandupDetail.value!.id
})
const switchTodoDataType = () => {
  todoCardWeekType.value = todoCardWeekType.value === 'curWeek' ? 'lastWeek' : 'curWeek'
}

const content = useStandupContents(todoCardStandupID, userID, isTodoDisabled, (x: Content) => {
  // 问题列表形式下，不需要展示空行
  if (isTodoList.value) {
    return x.content.replace(/\s|\r|\n/g, '').length > 0
  }
  return true
})

/* -------------------------------------------------------------------------- */
/*                                 interaction                                */
/* -------------------------------------------------------------------------- */

const { editType, toggle } = CxTodoCard.useTodoCardEditType()

// #数字 tag 点击 → issue 卡片闪烁定位（linkThenHighlight）
// const linkThenHighlight = (x: FormattedIssue) => {
//   if (!todoCardRef.value) {
//     return;
//   }
//   const tag = "#" + String(x.gitlabIssueID);
//   const isSelected = todoCardRef.value.inputTagValue === tag;
//   if (isSelected) {
//     todoCardRef.value.highlight((x: any) =>
//       Boolean(x.mention?.find?.((y: any) => y?.text === tag))
//     );
//     // console.log('todoCardRef.value', todoCardRef.value.sourceValue)
//   } else {
//     todoCardRef.value.setInputTag(tag);
//     todoCardRef.value.todoInputRef?.focus();
//   }
// };

/* -------------------------------------------------------------------------- */
/*                          comp lifecycle & exposed                          */
/* -------------------------------------------------------------------------- */

const curUserRelatedIssusByDateReq = useAsync(async (user: User = currentUser.value!) => {
  if (!user) {
    return []
  }
  // console.log('@@@@@@@@ standupDetail', standupDetail.value)
  // console.log('@@@@@@@ meetingDate', meetingDate.value)
  const date = dayjs(meetingDate.value).format('YYYY-MM-DD') + ' 00:00:00'
  if (date.includes('Invalid')) {
    return []
  }
  const res = await apiGetStandupRelatedIssues({
    date,
    assigneeUserName: user.username,
    type: meetingType.value,
    initData: isCurStandupInProgress.value ? true : false,
  })
  if (res.success) {
    const issues = await Promise.all((res.data || []).map(formatIssue))
    // console.info('[info] issues by date', issues, date)
    return issues
  }
  return []
})

watch(meetingDate, (n) => n && curUserRelatedIssusByDateReq.exec())
watch(currentUser, (n) => n && curUserRelatedIssusByDateReq.exec())

const resetReq = useAsync(async () => {
  await Promise.all([])
})
const reloadReq = useAsync(async () => {
  await resetReq.exec()
  await Promise.all([])
})
onMounted(reloadReq.exec)

defineExpose({
  reload: reloadReq.exec,
  isLoading: computed(() => reloadReq.isLoading),
})
</script>

<style>
.cx-daily-main-content {
  display: flex;
  justify-content: center;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 600px;

  .todo-section {
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
  }
}
</style>
