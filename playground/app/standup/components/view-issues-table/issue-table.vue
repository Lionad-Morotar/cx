<template>
  <div class="standup-issue-table">
    <div class="table-header">
      <div class="columns">
        <div class="column-item" v-for="column in columns" :key="column.key">
          {{ column.name }}
          <column-sorter :column="column" v-model:selected="selectedSort" />
        </div>
      </div>
    </div>
    <CxScrollbar
      class="table-content"
      v-cx-skeleton="props.isLoading"
      cx-skeleton-delay="150"
    >
      <template v-if="!displayIssues?.length">
        <div class="empty-con" ref="emptyFirstRef">
          <img class="image" :src="EmptyStrImage" />
          <div class="title">{{ props.isLoading ? '载入中...' : '暂时没有内容哦~' }}</div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="issue in displayIssues"
          :key="issue.id"
          class="line"
          :ref="(ref: any) => refsMan?.set(issue.id, { ref, issue })"
        >
          <div
            class="line-item"
            v-for="column in columns"
            :key="column.key"
            :class="[column?.kls?.(issue), `is-${column.key}`]"
            :title="column?.title?.(issue)"
          >
            <template v-if="column.key === 'id'">
              <div class="gitlab-id" @click="handleIDClick(issue)">#{{ issue.gitlabIssueID }}</div>
            </template>

            <template v-if="column.key === 'link'">
              <img :src="CommentIon" @click="emits('quick-link', issue)" />
            </template>

            <template v-if="column.key === 'name'">
              <template v-if="titleEditState.target === issue.id">
                <UInput
                  v-model="titleEditState.value"
                  :autofocus="true"
                  :disabled="titleEditState.isLoading"
                  @blur="titleEditState.cancel"
                  @keydown.esc="titleEditState.cancel"
                  @keydown.enter="titleEditState.commit"
                />
              </template>
              <template v-else>
                <a :href="issue.webUrl" target="_blank" rel="noopener noreferrer">{{
                  issue.name
                }}</a>
                <UIcon
                  name="i-lucide-pencil"
                  class="edit-icon"
                  @click="titleEditState.edit(issue, column)"
                />
              </template>
            </template>

            <template v-if="column.key === 'stage'">
              <span class="tag is-pending" v-if="isPending(issue)">已挂起</span>
              <span class="tag is-due-date" v-else-if="isOverDueDate(issue)">已延期</span>
              <span class="tag is-un-label" v-else-if="isUnLabel(issue)">-</span>
              <span class="tag is-plan" v-else-if="isInPlan(issue)">计划中</span>
              <span class="tag is-undone" v-else-if="isUndone(issue)">进行中</span>
              <span class="tag is-done" v-else>已完成</span>
            </template>

            <template v-if="column.key === 'label'">
              <span class="tag">{{ formattedStage(issue) }}</span>
            </template>

            <template v-if="column.key === 'participants'">
              <div class="participants">
                <template v-for="user in getRelatedUsers(issue)" :key="user?.id">
                  <img
                    class="participant"
                    :title="getUserSpentTime(user, issue)"
                    :src="user.avatarUrl"
                  />
                </template>
              </div>
            </template>

            <template v-if="column.key === 'time'">
              {{ displayTotalSpentTime(issue) }}
            </template>
            <slot />
          </div>
        </div>
      </template>
    </CxScrollbar>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, computed, ref, onMounted, nextTick } from 'vue'
import { standupBus as cx } from '../../utils/standup-bus'
import { unrefElement } from '@vueuse/core'
import { isNil } from 'lodash-es'
import { useRefs } from '../../hooks'
import { useCurrentUser } from '../../states/users'
import { apiChangeIssueTitle } from '../../apis'
import { dayjs, secondToManStringCN, isEmpty } from '../../utils'
import { getTaskSpendTime, getTaskStepsSpendSeconds } from '../../utils/label'
import { standupBus as emitter } from '../../utils/standup-bus'
import { useIssueFilters } from '../../states/issue-filter'
import EmptyStrImage from '../../assets/empty.svg'
import { useEditing } from './hooks'
import CommentIon from './comment.svg'

import ColumnSorter from './column-sorter.vue'

import type { User, FormattedIssue } from '../../apis'
import type { SelectedSort, Columns } from './type'

const instance = getCurrentInstance()!
cx.emit('pass:instance:CxViewIssuesTable', instance)

const emits = defineEmits(['quick-link', 'highlight-todo', 'update:issues'])
const props = withDefaults(
  defineProps<{
    user?: User
    filterStates?: any
    /**
     * 任务列表
     */
    issues: FormattedIssue[]
    /**
     * 任务在什么时间后算过期
     */
    dueDate?: string
    /**
     * 是否正在加载
     */
    isLoading?: boolean
    /**
     * 额外的过滤器
     */
    filter?: (x: FormattedIssue) => boolean
  }>(),
  {
    isLoading: false,
    filter: () => () => true,
  },
)
const user = props.user ? computed(() => props.user!) : useCurrentUser()

const issueFilter = props.filterStates || useIssueFilters(user)

const refsMan = useRefs<any>()
const columns = ref<Columns>([
  {
    key: 'id',
    name: 'ID',
    sort: ['asc', 'desc'],
  },
  {
    key: 'link',
    name: '',
  },
  {
    key: 'name',
    name: '任务标题',
    kls: ({ name }: FormattedIssue) => startWithMark(name),
    title: ({ name }: FormattedIssue) => name,
    sort: ['asc', 'desc'],
  },
  {
    key: 'stage',
    name: '状态',
    title: ({ issueStage }: FormattedIssue) => issueStage,
    sort: ['asc', 'desc'],
  },
  {
    key: 'label',
    name: '标签',
    title: ({ issueStage }: FormattedIssue) => issueStage,
    sort: ['asc', 'desc'],
  },
  {
    key: 'participants',
    name: '参与人',
    sort: ['asc', 'desc'],
  },
  {
    key: 'time',
    name: '总花费时间',
    sort: ['asc', 'desc'],
  },
])
const selectedSort = ref<SelectedSort>(null)
onMounted(() => {
  selectedSort.value = {
    column: columns.value[3]!,
    sort: 'asc',
  }
})

const getRelatedUsers = (x: FormattedIssue) => {
  const res = new Map()
  if (x.userParticipants?.length) {
    x.userParticipants.map((y) => res.set(+y.id, y))
  }
  if (!isEmpty(x.userAssignee?.name)) {
    res.set(+x.userAssignee.id, x.userAssignee)
  }
  return [...res.values()].reverse() as User[]
}
const getUserSpentTime = (user: User, task: FormattedIssue) => {
  // console.log(props.dataState)
  const {
    isUserTeamManager,
    isUserProductManager,
    isUserFEDeveloper,
    isUserBEDeveloper,
    isUserDesigner,
    isUserTester,
  } = issueFilter
  const spendTime = isUserTeamManager(user)
    ? getTaskSpendTime(task)
    : isUserProductManager(user)
      ? getTaskStepsSpendSeconds(0, task) + getTaskStepsSpendSeconds(5, task)
      : isUserFEDeveloper(user)
        ? getTaskStepsSpendSeconds(2, task)
        : isUserBEDeveloper(user)
          ? getTaskStepsSpendSeconds(2, task)
          : isUserDesigner(user)
            ? getTaskStepsSpendSeconds(1, task) + getTaskStepsSpendSeconds(4, task)
            : isUserTester(user)
              ? getTaskStepsSpendSeconds(3, task)
              : 0
  return `${user.name} - ${secondToManStringCN(spendTime)}`
}
const formattedStage = (x: FormattedIssue) => {
  const name = x.issueStage || '-'
  const nameWithoutPrefix = name.split('stage: ')[1]
  return nameWithoutPrefix || '-'
}

const getIssueSpentTime = (x: FormattedIssue) => {
  const total = getTaskSpendTime(x)
  return +total === 0 ? 0 : total
}
const displayTotalSpentTime = (x: FormattedIssue) => {
  return secondToManStringCN(getIssueSpentTime(x))
}

const isPending = (x: FormattedIssue) => {
  return x?.issueLabels?.find((x) => x?.name?.includes('waiting'))
}
const isOverDueDate = (x: FormattedIssue) => {
  if (isNil(props.dueDate)) {
    return false
  }
  return (
    isUndone(x) &&
    !isEmpty(x.dueDate) &&
    dayjs(x.dueDate).endOf('day').isBefore(dayjs(props.dueDate))
  )
}
const isUndone = (x: FormattedIssue) => {
  // * for debug
  // if (x?.webUrl?.includes('158')) {
  //   console.log(x, props.dataState.isTaskUndone(x))
  // }
  return issueFilter.isTaskUndone(x)
}
const isInPlan = (x: FormattedIssue) => {
  return issueFilter.isTaskIn(x, ['planed'])
}
const isUnLabel = (x: FormattedIssue) => {
  return isEmpty(x.issueStage)
}

const startWithMark = (name: string) => {
  const markShouldIndent = /^[『【「]/
  return markShouldIndent.test(name) ? 'is-first-mark' : ''
}

const displayIssues = computed(() => {
  if (props.isLoading) {
    return []
  }
  if (!issueFilter) {
    return []
  }

  const filtered = props.issues.filter(props.filter)

  const bySelectedSorter = (ta: FormattedIssue, tb: FormattedIssue) => {
    if (!selectedSort.value) {
      return 0
    }

    const [a, b] = selectedSort.value?.sort === 'asc' ? [ta, tb] : [tb, ta]

    if (['id'].includes(selectedSort.value?.column.key)) {
      return +a.gitlabIssueID - +b.gitlabIssueID
    }
    if (['name'].includes(selectedSort.value?.column.key)) {
      return a.name.localeCompare(b.name)
    }
    if (['stage', 'label'].includes(selectedSort.value?.column.key)) {
      return issueFilter.sortByStage(a, b)
    }
    if (['participants'].includes(selectedSort.value?.column.key)) {
      return getRelatedUsers(a).length - getRelatedUsers(b).length
    }
    if (['time'].includes(selectedSort.value?.column.key)) {
      return getIssueSpentTime(a) - getIssueSpentTime(b)
    }

    return 0
  }

  const sorted = filtered.sort(bySelectedSorter)

  return sorted
})

/********************************************************************************** blink  */

const blinkTick = ref(0)
const findBlinkTarget = (gitlabID: string) => {
  const issue = displayIssues.value.find((x) => String(x.gitlabIssueID) === String(gitlabID))
  if (!issue) {
    return
  }
  const ref = refsMan.get(issue.id)
  if (!ref) {
    return
  }

  const $elm = unrefElement(ref.ref)
  $elm?.scrollIntoViewIfNeeded({ behavior: 'smooth' })
  setTimeout(
    () => {
      $elm?.scrollIntoViewIfNeeded({ behavior: 'smooth' })
    },
    (Math.random() * 10 + 1) * 17,
  )

  $elm?.classList?.add?.('anim-blink')
  // console.log('unrefElement(cardRef.value)', $elm)

  if (blinkTick.value) {
    clearTimeout(blinkTick.value)
    blinkTick.value = 0
    $elm?.classList?.remove?.('anim-blink')
  }
  blinkTick.value = setTimeout(() => {
    blinkTick.value = 0
    $elm?.classList?.remove?.('anim-blink')
  }, 1700) as unknown as number
}
emitter.on('highlight-issue-by-gitlab-id', findBlinkTarget as any)

const handleIDClick = (issue: FormattedIssue) => {
  console.log('[debug] issue', issue)
  emits('highlight-todo', issue)
}

/********************************************************************************** Inline Title Editing  */

const titleEditState = useEditing({
  makeQuery: (val, states) => ({
    id: states.target,
    title: val,
  }),
  apiChange: async (query) => {
    await apiChangeIssueTitle(query)
    const index = props.issues.findIndex((x) => x.id === query.id)
    if (index >= 0) {
      // 仅修改一个标题，不重新拉数据，所以直接改 props
      // eslint-disable-next-line vue/no-mutating-props
      const target = props.issues[index]
      if (target) target.name = query.title
    }
    // * hack re-render
    nextTick(() => {
      titleEditState.target = query.id
      nextTick(() => {
        titleEditState.target = ''
      })
    })
  },
})

/********************************************************************************** Exposes  */

const exportJSONDatas = () => {
  console.log('[debug] to export', displayIssues.value)
}

defineExpose({
  exportJSONDatas,
})
</script>

<style>
.standup-issue-table {
  display: grid;
  grid-template: minmax(min-content, max-content) minmax(0, 1fr) / minmax(0, 1fr);
  width: 100%;
  height: 100%;
  background: white;

  .table-header {
    display: flex;
    background: #faf9fe;
    border-radius: 8px;
    width: 100%;
  }
  .table-content {
    padding-right: 16px;
    width: 100%;
  }

  .table-header .columns,
  .table-content .line {
    display: grid;
    grid-template-columns:
      60px 40px minmax(min-content, 6fr) minmax(90px, 1.5fr)
      minmax(120px, 1.5fr) minmax(170px, 2fr) minmax(110px, 1.5fr);
    height: 40px;
    line-height: 40px;
    width: 100%;
    transition: 0.15s;

    &:hover {
      background: #faf9febb;
      border-radius: 4px;
    }

    &.anim-blink {
      animation: blink 1.3s cubic-bezier(0, 0.99, 0.97, 0.82);
    }

    .column-item,
    .line-item {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex: 1;
      flex-shrink: 0;
      padding: 0 12px;
    }

    .column-item {
      color: #8b8995;
      white-space: nowrap;
    }
  }

  .line-item {
    &.is-id {
      .gitlab-id {
        padding: 2px 4px;
        width: auto;
        height: 22px;
        line-height: 22px;
        border-radius: 4px;
        font-size: 13px;
        color: #8b8995;
        cursor: pointer;

        &:hover {
          background: #eeeff4;
        }
      }
    }

    &.is-label {
      .tag {
        overflow: hidden;
        word-break: normal;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
      }
    }

    &.is-link {
      img {
        width: 18px;
        height: 18px;
        padding: 3px;
        cursor: pointer;
        border-radius: 3px;
        transition: 0.1s;

        &:hover {
          background: #eeeff4;
        }
      }
    }
    &.is-first-mark {
      text-indent: -0.35em;
    }
    &.is-name {
      font-size: 13px;
      color: #337cfb;

      a {
        text-decoration: none;
        /* display: inline-block; */
        /* overflow: hidden; */
        /* text-overflow: ellipsis; */
        /* white-space: nowrap; */
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-break: break-all;
      }
    }
    &.is-stage {
      font-size: 13px;

      .tag {
        display: flex;
        justify-content: center;
        align-items: center;
        width: fit-content;
        height: 26px;
        color: #363636;
        border-radius: 13px;
        white-space: nowrap;
        padding: 4px 12px;
        box-sizing: border-box;
      }
      .is-pending {
        background: #ffc7ce;
      }
      .is-due-date {
        background: #fbcfce;
      }
      .is-plan {
        background: #fcefd3;
      }
      .is-undone {
        background: #dff9e9;
      }
      .is-done {
        background: #e4def6;
      }
    }
    &.is-participants {
      .participants {
        display: flex;
        flex-wrap: nowrap;
        flex-shrink: 0;
      }
      .participant {
        width: 20px;
        height: 20px;
        border: solid 2px white;
        border-radius: 50%;
        background: #f2f2f2;

        & + .participant {
          margin-left: -5px;
        }
      }
    }
    &.is-time {
      font-size: 13px;
      color: #333333;
    }
  }
}

.edit-icon {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  padding: 3px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.empty-con {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 27px;
  width: 100%;
  height: 100%;
  min-height: 330px;
  text-align: center;

  .image {
    width: 200px;
  }
  .title {
    font-size: 18px;
    color: #373737;
  }
}

@keyframes blink {
  0% {
    background: white;
    border-radius: 4px;
    z-index: 2;
  }
  20% {
    background: #fae08f;
  }
  99% {
    background: white;
    border-radius: 4px;
  }
  100% {
    background: white;
    border-radius: 0;
  }
}
</style>
