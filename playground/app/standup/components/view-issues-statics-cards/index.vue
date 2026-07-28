<template>
  <cx-folder-container class="cx-view-issues-statics-cards issues-view-statics is-card" customized-icon>
    <template #header="{ isFold, toggle }">
      <div class="card-header-section">
        <div class="fold-icon-con" @click="toggle()">
          <img class="fold-icon" :class="isFold ? 'is-close' : 'is-open'" :src="IconArrow" />
        </div>
        <div class="title">指标汇总统计</div>
        <div class="side-title" v-if="issueSyncTime">统计截止时间：{{ issueSyncTime }}</div>
      </div>
    </template>
    <template #content>
      <CxScrollbar>
        <div class="card-content-section">
          <div
            v-for="item in userMetrics"
            :key="item.key"
            class="static-item"
            :class="`is-${item.key}`"
          >
            <div class="icon-con">
              <CxSvgIcon class="icon" :icon-class="item.icon" />
            </div>
            <div class="text-con" :class="isLoading && 'is-loading'">
              <div class="title">{{ item.name }}</div>
              <div class="value">
                {{ item.value }}<span class="meter" v-if="item.meter" v-text="item.meter()" />
              </div>
            </div>
          </div>
        </div>
      </CxScrollbar>
    </template>
  </cx-folder-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import CxFolderContainer from '../folder-container'
import { useIssueSyncTime } from '../../states/issues'
import { useIssueFilters } from '../../states/issue-filter'
import { useCurrentUser } from '../../states/users'
import { dayjs, secondToManString, isEmpty } from '../../utils'
import { getTaskSpendTime, getTaskWaitTime } from '../../utils/label'
import { isTaskIn } from '../../utils/label'
import { getAllMetrics } from './configs'

import IconArrow from '../../assets/arrow.svg'

import type { User } from '../../apis'
import type { FormattedIssue } from '../../utils/task'

defineOptions({ name: 'CxViewIssuesStaticsCards' })

const props = withDefaults(
  defineProps<{
    user?: User | null
    issuesFull?: FormattedIssue[]
    issues?: FormattedIssue[]
    isLoading?: boolean
    hidden?: string[]
    markNewIssueFrom?: string
    markDueDateFrom: string
  }>(),
  {
    issuesFull: () => [],
    issues: () => [],
    isLoading: false,
    hidden: () => [],
    markNewIssueFrom: () => dayjs().format('YYYY-MM-DD') + ' 00:00:00',
  },
)
const isLoading = computed(() => props.isLoading)
const user = props.user ? computed(() => props.user) : useCurrentUser()
const issues = computed(() => props.issues)
const markNewIssueFrom = computed(() => props.markNewIssueFrom)
const markDueDateFrom = computed(() => props.markDueDateFrom)
const issuesUnFiltered = computed(() => props.issuesFull)

const issueSyncTime = useIssueSyncTime()

const issueFilter = useIssueFilters(user)

const userMetrics = computed(() => {
  const metrics = getAllMetrics()

  const touch = (key: string, cb?: (x: (typeof metrics)[0]) => void) => {
    const res = metrics.find((x) => x.key === key)!
    res && cb?.(res)
    return res
  }
  const remove = (key: string) => {
    const index = metrics.findIndex((x) => x.key === key)
    if (index > -1) {
      metrics.splice(index, 1)
    }
  }

  props.hidden.forEach(remove)

  if (!issueFilter.isTeamManager) {
    remove('in-design')
    remove('in-dev')
    remove('in-test')
  }

  touch('total-issue-count', (x) => {
    x.value = issues.value.length || 0
  })
  touch('done-count', (x) => {
    x.value = issues.value.filter((x) => !issueFilter.isTaskUndone(x)).length || 0
  })
  touch('effort-point', (x) => {
    x.value =
      issues.value.reduce((acc, cur) => {
        const effortLabel = cur.issueLabels.find((y) => y.name?.includes('effort'))
        // if (cur.webUrl?.includes('301')) {
        //   console.log(cur, cur.issueLabels)
        // }
        // console.log('effortLabel', effortLabel)
        const effortStr = effortLabel?.name?.split('-')?.[1] || ''
        const effort = isNaN(effortStr as any) ? 0 : +effortStr
        return acc + effort
      }, 0) || 0
  })
  touch('new-issue-count', (x) => {
    x.value =
      issuesUnFiltered.value
        .filter(issueFilter.byRoleProject)
        .filter(
          (x) => !isEmpty(x.createdAt) && dayjs(x.createdAt).isSameOrAfter(markNewIssueFrom.value),
        ).length || 0
  })
  touch('in-design', (x) => {
    x.value =
      issues.value.filter((x) => isTaskIn(x, ['func-designing', 'func-designed', 'ui-designing']))
        .length || 0
  })
  touch('in-dev', (x) => {
    x.value =
      issues.value.filter((x) => isTaskIn(x, ['wip', 'np', 'pm-np', 'ui-np', 'review-np']))
        .length || 0
  })
  touch('in-test', (x) => {
    x.value = issues.value.filter((x) => isTaskIn(x, ['testing'])).length || 0
  })
  touch('in-due-date', (x) => {
    const inDueDate = issues.value.filter(
      (x) =>
        !isEmpty(x.dueDate) &&
        issueFilter.isTaskUndone(x) &&
        dayjs(x.dueDate).endOf('day').isBefore(markDueDateFrom.value),
    )
    x.value = inDueDate.length || 0
  })
  touch('check-count', (x) => {
    x.value = issues.value.filter((x) => isTaskIn(x, ['ui-checking', 'pm-checking'])).length || 0
  })
  touch('np-count', (x) => {
    x.value =
      issues.value.filter((x) => isTaskIn(x, ['np', 'ui-np', 'pm-np', 'review-np'])).length || 0
  })
  touch('pending-count', (x) => {
    // 指标项的 touch 注册式初始化
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    x.value =
      issues.value.filter((x) => x?.issueLabels?.find((x) => x?.name?.includes('waiting')))
        .length || 0
  })
  touch('average-spend-time', (x) => {
    const doneIssues = issues.value.filter((x) => !issueFilter.isTaskUndone(x)) || []
    const totalDoneCount = doneIssues.length
    const totalSpentTime = doneIssues.reduce((acc, cur) => {
      return acc + getTaskSpendTime(cur)
    }, 0)

    const result = !totalDoneCount ? '0m' : secondToManString(totalSpentTime / totalDoneCount, 1, 1)
    const [time, meter] = [result.slice(0, -1), result.slice(-1)]
    x.value = time
    x.meter = () => meter
  })
  touch('average-wait-time', (x) => {
    const doneIssues = issues.value.filter((x) => !issueFilter.isTaskUndone(x)) || []
    const totalDoneCount = doneIssues.length
    const totalWaitTime = doneIssues.reduce((acc, cur) => {
      return acc + getTaskWaitTime(cur)
    }, 0)

    const result = !totalDoneCount ? '0m' : secondToManString(totalWaitTime / totalDoneCount, 1, 1)
    const [time, meter] = [result.slice(0, -1), result.slice(-1)]
    x.value = time
    x.meter = () => meter
  })

  return metrics
})
</script>

<style>
.issues-view-statics {
  background: white;

  .card-content-section {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;

    @media (max-width: 1688px) {
      & {
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;

        .static-item.static-item.static-item {
          gap: 12px;
          padding: 10px 12px;
        }
      }
    }
    @media (max-width: 1440px) {
      & {
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;

        .static-item.static-item.static-item {
          gap: 12px;
          padding: 8px 12px;
        }
      }
    }
    @media (max-width: 1366px) {
      & {
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;

        .static-item.static-item.static-item {
          gap: 8px;
        }
      }
    }
    @media (max-width: 1280px) {
      & {
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;

        .static-item.static-item.static-item {
          gap: 8px;

          .icon-con {
            display: none;
          }
        }
      }
    }
    @media (max-width: 1024px) {
      & {
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;

        .static-item.static-item.static-item {
          gap: 8px;

          .icon-con {
            display: none;
          }
        }
      }
    }
  }
}

.issues-view-statics {
  .fold-icon-con {
    width: auto;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;

    .fold-icon {
      width: 22px;
      height: 22px;
      transition: transform 0.2s cubic-bezier(0.42, 0, 0.24, 1.35);

      &.is-open {
        transform: rotate(0deg);
      }
      &.is-close {
        transform: rotate(-90deg);
      }
    }
  }

  .static-item {
    &.is-total-issue-count,
    &.is-total-issue-count {
      --color-1: #5496f7;
      --color-2: #cee2fc;
    }

    &.is-done-count {
      --color-1: #826dc6;
      --color-2: #e4def6;
    }

    &.is-effort-point {
      --color-1: #5fbcdf;
      --color-2: #d0eefd;
    }

    &.is-new-issue-count {
      --color-1: #5dc9b0;
      --color-2: #d8f7f7;
    }

    &.is-in-design {
      --color-1: #edb24b;
      --color-2: #fcefd3;
    }

    &.is-in-dev {
      --color-1: #6dca85;
      --color-2: #dff9e9;
    }

    &.is-in-test,
    &.is-in-test {
      --color-1: #f1ae5e;
      --color-2: #fcefe0;
    }

    &.is-in-due-date {
      --color-1: #eb534b;
      --color-2: #fae1e3;
    }

    &.is-check-count {
      --color-1: #7c95ef;
      --color-2: #e4e9f9;
    }

    &.is-np-count {
      --color-1: #eb4f6a;
      --color-2: #fbeaec;
    }

    &.is-pending-count {
      --color-1: #9eadcc;
      --color-2: #e6edf5;
    }

    &.is-average-spend-time {
      --color-1: #cd6fe3;
      --color-2: #f3dff6;
    }

    &.is-average-wait-time {
      --color-1: #abc670;
      --color-2: #eaf4d4;
    }
  }

  .static-item {
    display: flex;
    gap: 14px;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    padding: 12px 14px;
    width: auto;
    height: auto;
    border: solid 1px #e4e7f4;
    background: white;
    border-radius: 8px;

    .icon-con {
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--color-2, #eee);
      border-radius: 8px;
      aspect-ratio: 1;
      max-width: clamp(30px, 35%, 60px);

      .icon {
        aspect-ratio: 1;
        width: 82%;
        height: 82%;
        color: var(--color-1, #888);
      }
    }

    .text-con {
      display: flex;
      flex-direction: column;
      padding: 2px 0 1px 0;

      &.is-loading {
        .value {
          color: #bbb;
        }
      }

      .title {
        font-size: 13px;
        color: #838991;
        font-weight: 500;
        white-space: nowrap;
      }

      .value {
        position: relative;
        font-size: 22px;
        color: #333333;
        font-weight: 600;

        .meter {
          margin-left: 4px;
          font-size: 12px;
          color: #bbb;
        }
      }
    }
  }
}
</style>
