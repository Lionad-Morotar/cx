<template>
  <div :class="ns.b()" ref="compRef">
    <div
      v-for="filter in filters"
      :key="filter.name"
      :class="[ns.e('button'), selectedFilterItem.name === filter.name ? 'is-active' : '']"
      @click="() => changeFilter(filter)"
    >
      <img :src="AddIcon" />{{ filter.name }}
    </div>
  </div>
</template>

<script lang="ts" setup>
/* Import NPM Depends */
import { isWorkday, isHoliday, getFestival } from '../../../utils/workday'
import { ref, reactive, computed, onMounted } from 'vue'
/* Import Project Depends */
import { useAsync } from '../../../hooks/use-async'
import { useCxNamespace } from '../../../utils/namespace'
/* Import Components */
/* Import States */
import { useStandupDetail } from '../../../states/standups'
import { useCurrentUser } from '../../../states/users'
import { useIssueFilters } from '../../../states/issue-filter'
/* Import Utils */
import { dayjs, isEmpty } from '../../../utils'
/* Import APIs */
/* Import Config */
/* Import Assets (CSS、Images) */
import AddIcon from '../../../assets/add.svg'
/* Import Types */
import type { Ref } from 'vue'
import type { User, FormattedIssue } from '../../../apis'

/* -------------------------------------------------------------------------- */
/*                                 types & env                                */
/* -------------------------------------------------------------------------- */

type Filter = {
  name: string
  filter: (x: FormattedIssue, board?: 'today' | 'yesterday') => FormattedIssue
  id: string
  class: string
}
type Filters = Filter[]

defineOptions({ name: 'daily-standup-filter' })

const ns = useCxNamespace('daily-standup-filter')
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
const filterStates = useIssueFilters(currentUser as Ref<User>)

const filters = computed(
  () =>
    [
      {
        // 后端返回的数据默认是“已参与的”
        name: '我参与的',
        filter: (x) => x,
        id: 'related',
        class: 'relation',
      },
      {
        name: '我负责的',
        filter: (x: FormattedIssue) => x.userAssignee.id === currentUser.value?.id,
        id: 'assignee',
        class: 'relation',
      },
      {
        name: '临期逾期',
        id: 'due-date',
        class: 'due-date',
        filter: (x, board) => {
          const dueDate = board === 'today' ? today.value : yesterday.value
          // 有 dueDate 且已临期/逾期的才命中；无 dueDate 不命中（原版分支写反）
          return !isEmpty(x.dueDate)
            ? dayjs(x.dueDate).isSameOrBefore(dayjs(dueDate).add(-1, 'day'))
            : false
        },
      },
      {
        name: '需求',
        filter: (x) => filterStates.isTaskInPMProject(x),
        id: 'project-requirement',
        class: 'project',
      },
      {
        name: '设计',
        filter: (x) => filterStates.isTaskInDEProject(x),
        id: 'project-design',
        class: 'project',
      },
      {
        name: '前端',
        filter: (x) => filterStates.isTaskInFEProject(x),
        id: 'project-fe',
        class: 'project',
      },
      {
        name: '后端',
        filter: (x) => filterStates.isTaskInBEProject(x),
        id: 'project-be',
        class: 'project',
      },
    ] as Filters,
)

const selectedFilterItem = ref(filters.value[0]!)
const changeFilter = (filter: Filter) => (selectedFilterItem.value = filter)

const selectedFilter = computed(() => {
  return (x: FormattedIssue, board?: 'today' | 'yesterday') =>
    selectedFilterItem.value.filter(x, board)
})
// 默认按照角色过滤各自项目里的 issue
const byRoleProject = computed(() => (x: FormattedIssue) => {
  if (selectedFilterItem.value.class === 'project') {
    return true
  }
  return filterStates.byRoleProject(x) || false
})

filterStates.registry('selectedFilter', selectedFilter as any)
filterStates.registry('byRoleProject', byRoleProject)

/* -------------------------------------------------------------------------- */
/*                                 interaction                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                   exposed                                  */
/* -------------------------------------------------------------------------- */

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
.cx-daily-standup-filter {
  display: grid;
  place-items: center;
  place-content: center;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;

  &__button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    box-sizing: border-box;
    width: 90px;
    height: 30px;
    background: #f5f6fa;
    border-radius: 15px;
    font-size: 12px;
    color: #1f1f1f;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      background: #1890ff16;
    }
    &.is-active {
      background: #1890ff;
      color: white;
    }
  }
}
</style>
